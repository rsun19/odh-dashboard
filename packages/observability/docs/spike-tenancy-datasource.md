# Spike: Perses Tenancy Datasource via Thanos Port 9092

**Ticket:** [RHOAIENG-60861](https://redhat.atlassian.net/browse/RHOAIENG-60861)
**Date:** 2026-05-14

## Objective

Investigate how to add a tenancy-aware Prometheus datasource for Perses dashboards so that non-admin users can query namespace-scoped metrics through the Thanos Querier tenancy port (9092).

## Background

### Thanos Querier Architecture

The `thanos-querier` service in `openshift-monitoring` exposes four ports, each fronted by a different sidecar:

| Port | Name | Sidecar | Access Model | Required Role |
|------|------|---------|-------------- |---------------|
| 9091 | `web` | `kube-rbac-proxy-web` | Cluster-wide (all endpoints) | `cluster-monitoring-view` |
| 9092 | `tenancy` | `kube-rbac-proxy` + `prom-label-proxy` | Project-scoped (query, query_range, labels, label values, series) | `view` in the target namespace |
| 9093 | `tenancy-rules` | `kube-rbac-proxy-rules` | Project-scoped (alerts, rules) | `monitoring-rules-edit` / `monitoring-rules-view` |
| 9094 | `metrics` | `kube-rbac-proxy-metrics` | Internal only (`/metrics`) | Internal use |

For port 9092, requests pass through two proxies before reaching Thanos:

```
Request → kube-rbac-proxy (RBAC: caller has `view` in namespace?)
        → prom-label-proxy (injects namespace= matcher into PromQL)
        → Thanos Querier
```

### Existing Setup

The existing `PersesDatasource` CR (`thanos-querier-datasource`) targets port 9091 and requires `cluster-monitoring-view`. All dashboard panels resolve to this datasource as the default.

### Data Science Monitoring Stack

A separate Thanos Querier (`data-science-thanos-querier` in `redhat-ods-monitoring`) is managed by the Observability Operator. It federates the RHOAI `MonitoringStack` Prometheus instances on a single port (10902) with no RBAC proxy. This is distinct from the platform querier and was not used for this spike.

## Changes Made

### 1. Perses Plugin Upgrade

Upgraded `@perses-dev/prometheus-plugin` from `0.57.1` to `0.58.0-beta.0` to gain the `queryParams` interpolation feature ([perses/plugins#638](https://github.com/perses/plugins/pull/638)). This required bumping four Perses core packages to `0.54.0-beta.1`:

| Package | Old | New |
|---------|-----|-----|
| `@perses-dev/prometheus-plugin` | `^0.57.1` | `^0.58.0-beta.0` |
| `@perses-dev/components` | `^0.53.1` | `^0.54.0-beta.1` |
| `@perses-dev/dashboards` | `^0.53.1` | `^0.54.0-beta.1` |
| `@perses-dev/explore` | `^0.53.1` | `^0.54.0-beta.1` |
| `@perses-dev/plugin-system` | `^0.53.1` | `^0.54.0-beta.1` |

Root `package.json` overrides were added to force resolution past the chart plugins' stricter peer dep ranges. The chart plugins (bar-chart, loki, etc.) have not released versions compatible with the 0.54.x core yet.

**Breaking change from upgrade:** The `0.54.0-beta.1` dashboards package introduced `PanelFocusProvider` which must wrap the dashboard content. Without it, panels fail with: `Panel focus hooks must be used within a PanelFocusProvider`. Fixed in `PersesWrapper.tsx`.

### 2. Tenancy PersesDatasource CR

Created `packages/observability/setup/prometheus-tenancy-data-source.yaml`:

```yaml
apiVersion: perses.dev/v1alpha1
kind: PersesDatasource
metadata:
  name: thanos-querier-tenancy-datasource
spec:
  config:
    display:
      name: "Thanos Querier Tenancy Datasource"
    default: false
    plugin:
      kind: "PrometheusDatasource"
      spec:
        proxy:
          kind: HTTPProxy
          spec:
            url: https://thanos-querier.openshift-monitoring.svc.cluster.local:9092
            secret: thanos-querier-tenancy-datasource-secret
        queryParams:
          namespace: "${namespace:raw}"
  client:
    tls:
      enable: true
      caCert:
        type: file
        certPath: /ca/service-ca.crt
```

Key design decisions:

- **`default: false`** -- we do not own the datasource defaults. All dashboards should explicitly reference their datasource by name rather than relying on a default. This avoids conflicts with other datasources managed by the Observability Operator (e.g., `accelerators-thanos-querier-datasource`).
- **`queryParams.namespace: "${namespace:raw}"`** -- injects the `&namespace=` URL parameter required by port 9092. Uses `${namespace:raw}` format (not `$namespace`) to avoid the parentheses wrapping that `allowMultiple` variables produce with the default `prometheus` format.
- The existing non-tenancy datasource keeps its original `default` setting -- we don't change it.

### 3. Dashboard Manifest Updates

The existing cluster and model dashboards are **unchanged** -- they continue using the implicit default datasource (no `name` field), which resolves to `thanos-querier-datasource` (port 9091). Since we are not changing the default, no modifications to the existing dashboards are needed.

Future tenancy dashboards must explicitly reference the tenancy datasource by name:

```yaml
datasource:
  kind: PrometheusDatasource
  name: thanos-querier-tenancy-datasource
```

## Key Findings

### 1. Port 9092 Requires Three Things

| Requirement | What | Error Without It |
|-------------|------|-----------------|
| `&namespace=` URL parameter | Thanos tenancy port requires it on every request | `Bad Request. The request or configuration is malformed.` |
| `view` role for the calling identity in the target namespace | `kube-rbac-proxy` checks RBAC | `Forbidden` |
| No `namespace=` in PromQL query | `prom-label-proxy` injects the matcher automatically; duplicates cause a conflict | `conflicting label matcher` |

### 2. Variable Interpolation Format Matters

The `$namespace` variable has `allowMultiple: true`, which causes Perses to format array values using the `prometheus` format: `(value1|value2)`. This is correct for PromQL regex matchers (`namespace=~"$namespace"`), but wrong for URL parameters where Thanos expects a plain namespace name.

**Solution:** Use `${namespace:raw}` in `queryParams` to get the raw value without parens.

### 3. Service Account vs. User Token

The Perses server proxies to Thanos using its own service account token (`perses-sa`). This means:

- All users get the same access level (whatever the SA has)
- The SA needs `view` granted per-namespace for tenancy queries
- This defeats the purpose of per-user tenancy

**Recommended production approach:** Forward the end-user's bearer token through the proxy chain so Thanos checks the user's own namespace permissions. This requires changes to how the ODH proxy passes auth headers to Perses, and how Perses forwards them to Thanos.

### 4. Tenancy Dashboards Need Different Query Patterns

Tenancy dashboards **must not** include `namespace=` label matchers in their PromQL queries. The `prom-label-proxy` on port 9092 injects `namespace="<value>"` into every query automatically based on the `&namespace=` URL parameter (sent via `queryParams` in the datasource CR). Including `namespace=` in the PromQL causes a `conflicting label matcher` error because `prom-label-proxy` sees a duplicate.

This means **every existing query** that currently uses `namespace=~"$namespace"` or `namespace="$namespace"` in its PromQL would need to have that matcher **removed** when targeting the tenancy datasource. The namespace scoping is handled entirely by the datasource's `queryParams` config and `prom-label-proxy` -- the PromQL should be namespace-agnostic.

This is a key authoring constraint for tenancy dashboards: queries should focus on *what* to measure, not *where*. The "where" (namespace) is controlled by the datasource layer.

Additionally:

- **Cluster-wide metrics** (node status, total CPU/memory) have no `namespace` label. When `prom-label-proxy` injects `namespace="X"`, nothing matches. These metrics are not available through tenancy and must use the non-tenancy datasource (port 9091).
- **Namespace-scoped workload metrics** (container metrics, vLLM metrics) have a `namespace` label and work through tenancy (port 9092).

### 5. npm Peer Dependency Challenges

#### Why we needed the upgrade

The `queryParams` feature on `PrometheusDatasourceSpec` -- which allows injecting URL parameters like `&namespace=` into proxied Prometheus requests -- only exists in `@perses-dev/prometheus-plugin@0.58.0-beta.0`. The previous version (`0.57.1`) has no way to append query parameters to the upstream request. Without this feature, there is no way to pass the `namespace` parameter that the Thanos tenancy port (9092) requires.

This single feature is what enables the entire tenancy datasource flow. The PR that introduced it ([perses/plugins#638](https://github.com/perses/plugins/pull/638)) was merged on 2026-05-01 and released as `0.58.0-beta.0` on 2026-05-05.

#### The dependency chain

Perses is split across two repositories:

- **`perses/perses`** (core): publishes `@perses-dev/components`, `@perses-dev/core`, `@perses-dev/dashboards`, `@perses-dev/explore`, `@perses-dev/plugin-system`
- **`perses/plugins`** (plugins): publishes `@perses-dev/prometheus-plugin`, `@perses-dev/bar-chart-plugin`, `@perses-dev/loki-plugin`, `@perses-dev/tempo-plugin`, and ~15 other chart/viz plugins

The `prometheus-plugin@0.58.0-beta.0` was built against `perses/perses@0.54.0-beta.1` and declares these peer dependencies:

```
@perses-dev/components: ^0.54.0-beta.1
@perses-dev/dashboards: ^0.54.0-beta.1
@perses-dev/explore:    ^0.54.0-beta.1
@perses-dev/plugin-system: ^0.54.0-beta.1
@perses-dev/core:       ^0.53.0  (unchanged)
```

So upgrading `prometheus-plugin` forced upgrading four core packages from `0.53.1` to `0.54.0-beta.1`.

#### The conflict

All other chart/viz plugins (`bar-chart-plugin@0.11.1`, `loki-plugin@0.5.1`, `tempo-plugin@0.57.1`, etc.) are still built against the **previous** core (`0.53.x`). They declare peer dependencies like:

```
@perses-dev/components: ^0.53.1
@perses-dev/plugin-system: ^0.53.1
```

The `^0.53.1` semver range does **not** include `0.54.0-beta.1` (npm treats prereleases as outside the caret range of a different minor version). This creates an unresolvable conflict: `prometheus-plugin` needs `0.54.x`, but 15+ chart plugins need `0.53.x`.

npm's strict peer dependency checking (the default since npm v7) refuses to install because it cannot find a single version of `@perses-dev/components` that satisfies both `^0.53.1` and `^0.54.0-beta.1`.

#### How we worked around it

Three layers of workarounds were needed:

**1. Root `package.json` overrides**

```json
"overrides": {
  "@perses-dev/components": "0.54.0-beta.1",
  "@perses-dev/dashboards": "0.54.0-beta.1",
  "@perses-dev/explore": "0.54.0-beta.1",
  "@perses-dev/plugin-system": "0.54.0-beta.1",
  "@perses-dev/prometheus-plugin": "0.58.0-beta.0"
}
```

npm overrides tell the resolver: "regardless of what any package asks for, use this version." This resolved the initial `npm install` failure, but required `--force` on the first install because the lockfile had the old versions pinned.

**2. `--force` on initial install**

The lockfile (`package-lock.json`) had `prometheus-plugin@0.57.1` locked. npm refused to update it even with overrides because of the existing lockfile entries. Running `npm i --force` bypassed the lockfile check and regenerated it with the new versions.

**3. Manual `node_modules` replacement for `@perses-dev/components`**

Even with overrides, npm resolved `@perses-dev/components@0.53.1` inside `packages/observability/node_modules/` because the 15+ chart plugins have peer deps on `^0.53.1`, and npm deduped to the version that satisfies the most consumers. The override only took effect at the root `node_modules/` level, not the workspace's nested `node_modules/`.

The `interpolateQueryParams` function (needed for the `queryParams` feature) only exists in `components@0.54.0-beta.1`. With `0.53.1` in place, the browser threw: `interpolateQueryParams is not a function`.

The fix was to manually replace the package:

```bash
rm -rf packages/observability/node_modules/@perses-dev/components
npm pack @perses-dev/components@0.54.0-beta.1
tar -xzf perses-dev-components-0.54.0-beta.1.tgz \
  -C packages/observability/node_modules/@perses-dev/
mv packages/observability/node_modules/@perses-dev/package \
   packages/observability/node_modules/@perses-dev/components
```

**This is fragile** -- running `npm install` again will revert `components` back to `0.53.1`.

#### When this resolves

Once the other Perses plugins (bar-chart, loki, tempo, etc.) release stable versions that declare peer deps on `^0.54.x`, the overrides and manual workarounds can be removed. All packages will resolve cleanly to the same core version. The `perses/plugins` repo typically releases all plugins together, so a new stable release cycle should unblock this.

## Files Changed

| File | Change |
|------|--------|
| `packages/observability/package.json` | Bumped 5 Perses deps to beta versions |
| `package.json` | Added 5 npm overrides for Perses packages |
| `packages/observability/setup/prometheus-tenancy-data-source.yaml` | **New** -- tenancy datasource CR (port 9092, `default: false`) |
| `packages/observability/setup/prometheus-data-source.yaml` | Unchanged |
| `packages/observability/src/perses/PersesWrapper.tsx` | Added `PanelFocusProvider` wrapper (required by 0.54.x) |
| `manifests/observability/odh/perses-dashboard-cluster.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/odh/perses-dashboard-model.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/rhoai/perses-dashboard-cluster.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/rhoai/perses-dashboard-model.yaml` | Unchanged (uses default datasource) |
| `packages/observability/setup/README.md` | Added tenancy datasource setup instructions |

## Cluster-Side Changes (Manual)

These changes were applied manually during testing and are not tracked in code:

```bash
# Grant Perses SA view role in target namespaces
oc adm policy add-role-to-user view \
  system:serviceaccount:openshift-cluster-observability-operator:perses-sa \
  -n redhat-ods-monitoring

oc adm policy add-role-to-user view \
  system:serviceaccount:openshift-cluster-observability-operator:perses-sa \
  -n redhat-ods-operator
```

## Open Items for Implementation

1. **User token forwarding** -- Replace SA-based auth with user token pass-through so tenancy respects per-user namespace permissions without manual role grants.
2. **Stable Perses plugin releases** -- Wait for chart/viz plugins to release versions compatible with 0.54.x core to remove npm overrides and manual `node_modules` workarounds.
3. **Tenancy dashboard creation** -- Create new dashboards targeting the tenancy datasource with namespace-agnostic PromQL queries (no `namespace=` in the query; let `prom-label-proxy` handle scoping).
4. **Namespace variable population** -- The current namespace variable queries `kserve_vllm:num_requests_running` for its label list, which only returns namespaces with model deployments. Tenancy dashboards may need a different variable source to show all accessible namespaces.
5. **Multi-namespace support** -- The tenancy port accepts a single `namespace` parameter. Multi-namespace queries (e.g., `namespace=~"ns1|ns2"`) are not supported through this path. Dashboards should enforce single namespace selection when using the tenancy datasource.
