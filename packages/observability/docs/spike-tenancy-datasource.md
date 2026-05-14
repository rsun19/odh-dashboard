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
| 9092 | `tenancy` | `kube-rbac-proxy` + `prom-label-proxy` | Project-scoped (query, query_range, labels, label values, series) | See [RBAC section](#6-rbac-requirements-for-tenancy) |
| 9093 | `tenancy-rules` | `kube-rbac-proxy-rules` | Project-scoped (alerts, rules) | `monitoring-rules-edit` / `monitoring-rules-view` |
| 9094 | `metrics` | `kube-rbac-proxy-metrics` | Internal only (`/metrics`) | Internal use |

For port 9092, requests pass through two proxies before reaching Thanos:

```
Request → kube-rbac-proxy (RBAC: caller has access to metrics.k8s.io/pods in namespace?)
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
| Correct RBAC for the calling identity (see [section 6](#6-rbac-requirements-for-tenancy)) | `kube-rbac-proxy` checks permissions on `metrics.k8s.io/pods` | `Forbidden` |
| No `namespace=` in PromQL query | `prom-label-proxy` injects the matcher automatically; duplicates cause a conflict | `conflicting label matcher` |

### 2. Variable Interpolation Format Matters

The `$namespace` variable has `allowMultiple: true`, which causes Perses to format array values using the `prometheus` format: `(value1|value2)`. This is correct for PromQL regex matchers (`namespace=~"$namespace"`), but wrong for URL parameters where Thanos expects a plain namespace name.

**Solution:** Use `${namespace:raw}` in `queryParams` to get the raw value without parens.

### 3. Perses Forwards the User's Token (Not the SA Token)

**This was the most significant finding of the spike.** Initial assumptions that Perses uses its own service account token for outbound datasource requests were **wrong**.

#### How the token flows

```
Browser ──[session]──▶ ODH Backend ──[user token]──▶ Perses ──[user token]──▶ Thanos
```

1. **ODH Backend → Perses:** The backend extracts the user's token and sets it as the `Authorization: Bearer` header. In production this comes from `x-forwarded-access-token`; in dev mode from the kubeconfig (`kc.applyToRequest()`).
2. **Perses receives the token** and authenticates the user via Kubernetes `TokenReview` (Perses has K8s authn/authz enabled via [perses/perses#3065](https://github.com/perses/perses/pull/3065)).
3. **Perses → Thanos:** Perses forwards the same token on the outbound proxy request to Thanos.

#### How we proved this

| Test | Token sent to Perses | Thanos result |
|------|---------------------|---------------|
| `perses-sa` token (no `cluster-monitoring-view`) | SA token | `Forbidden (user=system:serviceaccount:...:perses-sa)` |
| Admin token (`kubeadmin`) | Admin token | `200 OK` — data returned |
| `regularuser1` token (with `view` in `redhat-ods-monitoring`) | User token | `200 OK` — data returned |
| `regularuser1` token (querying `openshift-monitoring`) | User token | `Forbidden (user=regularuser1)` |

The `Forbidden` responses explicitly name the calling user, confirming Thanos sees the token Perses received — not a service account token.

We also removed `perses-sa`'s `view` role in `redhat-ods-monitoring` and confirmed that regularuser1's queries still worked, proving the SA's permissions are irrelevant.

#### What the Perses Secret actually contains

The secret referenced by the datasource CR (`thanos-querier-tenancy-datasource-secret`) contains **only TLS config**, not bearer credentials:

```yaml
spec:
  tlsConfig:
    caFile: /ca/service-ca.crt
```

The secret is needed so Perses can verify the Thanos service's TLS certificate. Removing the secret causes `tls: failed to verify certificate: x509: certificate signed by unknown authority`. It has no role in authentication.

#### Perses and Authorization headers

Perses [explicitly strips](https://github.com/perses/perses/pull/3673) any `Authorization` header from datasource `headers` config (a Dec 2025 breaking change). However, this only applies to headers configured in the datasource CR. The K8s auth token received on the inbound request is forwarded through a separate code path when proxying to the upstream datasource.

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

### 6. RBAC Requirements for Tenancy

The `kube-rbac-proxy` on port 9092 performs SubjectAccessReview checks against `metrics.k8s.io` API group resources, not standard Kubernetes resources. Its configuration (from `thanos-querier-kube-rbac-proxy` Secret in `openshift-monitoring`):

```yaml
authorization:
  resourceAttributes:
    apiGroup: metrics.k8s.io
    apiVersion: v1beta1
    namespace: "{{ .Value }}"
    resource: pods
  rewrites:
    byQueryParameter:
      name: namespace
```

The HTTP method maps to the RBAC verb: GET → `get`, POST → `create`. Perses sends **POST** for `query_range`, so the user needs the `create` verb on `metrics.k8s.io/pods`.

The built-in `view` ClusterRole only grants `get`, `list`, `watch` on `metrics.k8s.io/pods` — **not** `create`. This means `view` alone is insufficient for tenancy queries that use `query_range` (which is what Perses uses for time-series panels).

**Required custom ClusterRole:**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: thanos-tenancy-metrics-reader
rules:
- apiGroups:
  - metrics.k8s.io
  resources:
  - pods
  verbs:
  - get
  - list
  - watch
  - create
```

This role must be bound per-namespace to each user who needs tenancy access:

```bash
oc adm policy add-role-to-user thanos-tenancy-metrics-reader <user> -n <namespace>
```

For Perses to accept the user's token (K8s authn/authz), the user also needs the `perses-cr` ClusterRole:

```bash
oc adm policy add-cluster-role-to-user perses-cr <user>
```

### 7. Observability Page Access Control

The observability dashboard pages are currently gated by the `ADMIN_USER` flag in `extensions.ts`:

```text
flags:
  required: [PLUGIN_OBSERVABILITY, ADMIN_USER]
```

Non-admin users cannot access the page at all. For tenancy to be useful, the `ADMIN_USER` gate will need to be removed or replaced with a more granular check. During the spike, we removed it temporarily to test with `regularuser1`.

### 8. Dev Mode Considerations

#### `start:dev:ext` vs `start:dev`

| Aspect | `start:dev:ext` | `start:dev` |
|--------|----------------|-------------|
| Backend location | External cluster | Local (port 4000) |
| Token source | Kubeconfig (`kc.applyToRequest()`) | Same |
| Perses connection | Through cluster gateway | Port-forward (`localhost:9005`) |
| TLS to Perses | Handled by cluster | Requires `tls: true` in proxy config |
| Impersonation UI | Hidden (`EXT_CLUSTER=true` disables the toggle) | Visible if `APP_ENV=development` |

#### Token handling in dev mode

In dev mode, the backend uses the kubeconfig token for all requests (line 25 of `directCallUtils.ts`). When impersonating, it swaps to the impersonated user's token — **except** for URLs containing `thanos-querier-openshift-monitoring`, where it always uses the admin token. The Perses proxy URL (`/perses/api/proxy/...`) does not match this exclusion, so impersonation works correctly for Perses/Thanos requests.

#### Impersonation setup

To test as a non-admin user, add to `.env.local`:

```bash
APP_ENV=development
DEV_IMPERSONATE_USER=regularuser1
DEV_IMPERSONATE_PASSWORD=<password>
DEV_OAUTH_PREFIX=oauth  # required for ROSA clusters
```

Then use the "Start impersonate" option in the user dropdown (top right). The backend calls the cluster's OAuth endpoint to obtain the impersonated user's real token.

#### Port-forward for `start:dev`

The Perses service must be port-forwarded when running locally:

```bash
oc port-forward -n openshift-cluster-observability-operator svc/perses 9005:8080
```

The proxy config (`packages/observability/package.json`) must have `"tls": true` because Perses serves HTTPS. Without it, Perses rejects the connection with `client sent an HTTP request to an HTTPS server`.

## Files Changed

| File | Change |
|------|--------|
| `packages/observability/package.json` | Bumped 5 Perses deps to beta versions; set `tls: true` on proxy config |
| `package.json` | Added 5 npm overrides for Perses packages |
| `packages/observability/setup/prometheus-tenancy-data-source.yaml` | **New** -- tenancy datasource CR (port 9092, `default: false`) |
| `packages/observability/setup/perses-dashboard-tenancy-test.yaml` | **New** -- test dashboard for tenancy verification |
| `packages/observability/setup/prometheus-data-source.yaml` | Unchanged |
| `packages/observability/src/perses/PersesWrapper.tsx` | Added `PanelFocusProvider` wrapper (required by 0.54.x) |
| `packages/observability/extensions.ts` | Removed `ADMIN_USER` gate (for tenancy testing) |
| `manifests/observability/odh/perses-dashboard-cluster.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/odh/perses-dashboard-model.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/rhoai/perses-dashboard-cluster.yaml` | Unchanged (uses default datasource) |
| `manifests/observability/rhoai/perses-dashboard-model.yaml` | Unchanged (uses default datasource) |
| `packages/observability/setup/README.md` | Added tenancy datasource setup instructions |

## Cluster-Side Changes (Manual)

These changes were applied manually during testing and are not tracked in code:

```bash
# Custom ClusterRole for tenancy metrics access (create verb on metrics.k8s.io/pods)
oc apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: thanos-tenancy-metrics-reader
rules:
- apiGroups: ["metrics.k8s.io"]
  resources: ["pods"]
  verbs: ["get", "list", "watch", "create"]
EOF

# Grant regularuser1 access for tenancy testing
oc adm policy add-cluster-role-to-user perses-cr regularuser1
oc adm policy add-role-to-user view regularuser1 -n opendatahub
oc adm policy add-role-to-user view regularuser1 -n redhat-ods-monitoring
oc adm policy add-role-to-user thanos-tenancy-metrics-reader regularuser1 -n redhat-ods-monitoring
```

## Open Items for Implementation

1. **Stable Perses plugin releases** -- Wait for chart/viz plugins to release versions compatible with 0.54.x core to remove npm overrides and manual `node_modules` workarounds.
2. **`ADMIN_USER` gate decision** -- Determine the correct access model for tenancy dashboards. Options: remove the gate entirely, add a separate non-admin route, or use a different feature flag.
3. **`thanos-tenancy-metrics-reader` ClusterRole provisioning** -- Decide who creates/manages this ClusterRole and how it gets bound to users. It could be provisioned by the Observability Operator or by RHOAI.
4. **Tenancy dashboard creation** -- Create new dashboards targeting the tenancy datasource with namespace-agnostic PromQL queries (no `namespace=` in the query; let `prom-label-proxy` handle scoping).
5. **Namespace variable population** -- The current namespace variable queries `kserve_vllm:num_requests_running` for its label list, which only returns namespaces with model deployments. Tenancy dashboards may need a different variable source to show all accessible namespaces.
6. **Multi-namespace support** -- The tenancy port accepts a single `namespace` parameter. Multi-namespace queries (e.g., `namespace=~"ns1|ns2"`) are not supported through this path. Dashboards should enforce single namespace selection when using the tenancy datasource.
7. **Dev environment TLS** -- The `tls: true` change in `packages/observability/package.json` may need to be reconciled with the existing `start:dev:ext` flow, which previously used `tls: false`. Need to verify both dev modes work with the new setting.
