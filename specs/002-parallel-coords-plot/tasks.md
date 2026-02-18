# Tasks: Compare runs parallel coordinates plot

**Input**: Design documents in `specs/002-parallel-coords-plot/`  
**Prerequisites**: `specs/002-parallel-coords-plot/plan.md`, `specs/002-parallel-coords-plot/spec.md`  
**Tests**: Unit tests (Jest) + Cypress mocked tests are REQUIRED by the feature spec.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature scaffolding and confirm chart dependency availability.

- [x] T001 Confirm PatternFly ECharts wrapper import path and usage for `Charts` in `frontend/` (doc reference only) and note chosen import in `specs/002-parallel-coords-plot/research.md`
- [x] T002 [P] Create `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (section skeleton with test ids; no chart logic yet)
- [x] T003 [P] Create `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/types.ts` (Axis/series types used by utils + component)
- [x] T004 [P] Create `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (function stubs for axis discovery, typing, and ECharts option generation)
- [x] T005 Wire the new Visualizations section into `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsPage.tsx` in the mock order (Run list → Visualizations → Parameters → Metrics)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data shaping + shared utilities + baseline tests used by all user stories.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [x] T006 Implement parameter axis discovery in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (union of `runtime_config.parameters` across `selectedRuns`)
- [x] T007 Implement scalar metric axis discovery helpers in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (shape scalar metrics into per-run key/value map using MLMD artifacts; reuse `getRunArtifacts` + `filterRunArtifactsByType` patterns from `frontend/src/concepts/pipelines/content/compareRuns/metricsSection/utils.ts`)
- [x] T008 Implement axis typing + category derivation rules in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (numeric vs categorical; stable category ordering)
- [x] T009 Implement ECharts parallel coordinates option builder in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (uses axes + run series; supports missing values)
- [x] T010 [P] Add Jest unit tests for axis discovery and typing in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/__tests__/utils.spec.ts`
- [x] T011 [P] Add Jest unit tests for ECharts option generation in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/__tests__/utils.spec.ts`

**Checkpoint**: Utils and unit tests exist; option builder can be used by UI without additional research.

---

## Phase 3: User Story 1 - Compare selected runs visually (Priority: P1) 🎯 MVP

**Goal**: Show a parallel coordinates plot under Visualizations that reflects the current selected runs.

**Independent Test**: Visit Compare runs with 2+ runs selected and verify the Visualizations section renders a parallel coordinates plot and updates when runs are selected/unselected in Run list.

### Tests for User Story 1

- [x] T012 [P] [US1] Extend Cypress page object with visualization helpers in `packages/cypress/cypress/pages/pipelines/compareRuns.ts` (find section, find plot container)
- [x] T013 [P] [US1] Add Cypress mocked test coverage for “Visualizations section renders” in `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts`

### Implementation for User Story 1

- [x] T014 [US1] Implement `CompareRunsVisualizationsSection` layout in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (ExpandableSection “Visualizations”; includes “Parallel coordinates plot” tab/area per mock; omit any Notes UI)
- [x] T015 [US1] Implement chart container + accessibility labels/test ids in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (e.g., `data-testid="compare-runs-visualizations-content"` and `data-testid="compare-runs-parallel-coordinates-plot"`)
- [x] T016 [US1] Connect to `useCompareRuns()` in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` and render a plot series per selected run (using utils from `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts`)
- [x] T017 [US1] Add empty states for invalid selection in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (fewer than 2 runs; show helpful message instead of chart)

**Checkpoint**: US1 complete and demoable without filters (plot renders for selected runs; section appears under Run list).

---

## Phase 4: User Story 2 - Filter which data is shown (Priority: P2)

**Goal**: Provide a filter control (Parameters + Metrics) that updates which axes are shown in the plot.

**Independent Test**: Select a subset of parameter/metric axes in the filter and verify axis labels in the plot reflect the selection; clear selection shows an empty state.

### Tests for User Story 2

- [x] T018 [P] [US2] Add Cypress page object helpers for axis filter interaction in `packages/cypress/cypress/pages/pipelines/compareRuns.ts` (open filter, search, select/deselect, assert selected values)
- [x] T019 [P] [US2] Add Cypress mocked test “filtering updates plot axes” in `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts` (select `paramOne` + a scalar metric like `accuracy`; assert labels appear; deselect and assert they disappear)
- [x] T020 [P] [US2] Add Jest unit tests for filter-driven axis ordering rules in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/__tests__/utils.spec.ts`

### Implementation for User Story 2

- [x] T021 [US2] Add axis filter UI (searchable multi-select grouped into Parameters and Metrics) to `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` with stable `data-testid` (e.g., `compare-runs-parallel-coordinates-axis-filter`)
- [x] T022 [US2] Derive available axis options from selected runs in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (parameters from `selectedRuns[].runtime_config.parameters`; metrics from scalar metrics MLMD artifacts loaded similarly to `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsMetricsSection.tsx`)
- [x] T023 [US2] Implement default axis selection behavior in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (choose a reasonable default subset when axes exist; keep user selection stable across re-renders)
- [x] T024 [US2] Apply selected axes to the plot option builder in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (plot updates on selection changes)
- [x] T025 [US2] Implement “no axes selected” empty state in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (matches FR-006)

**Checkpoint**: US2 complete: filters exist and directly control which axes are displayed in the plot.

---

## Phase 5: User Story 3 - Understand missing or incompatible values (Priority: P3)

**Goal**: Handle missing/non-numeric/inconsistent values without breaking the page and without misleading users.

**Independent Test**: Use runs with missing parameter values and mixed-type parameter values; verify the plot still renders and the UI communicates omissions clearly.

### Tests for User Story 3

- [x] T026 [P] [US3] Add Jest unit tests for missing/mixed-type values in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/__tests__/utils.spec.ts`
- [x] T027 [P] [US3] Add Cypress mocked coverage for missing values behavior (uses existing mock run with empty params) in `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts`

### Implementation for User Story 3

- [x] T028 [US3] Ensure missing values are represented safely in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (no crashes; values omitted/null where appropriate)
- [x] T029 [US3] Ensure mixed-type axes are treated categorically in `frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts` (stable categories; no numeric coercion that misleads)
- [x] T030 [US3] Add user-facing messaging for omitted/unsupported axes or missing values in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (tooltip or helper text; must not clutter UI)

**Checkpoint**: US3 complete: visualization is resilient to realistic run metadata variability.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, accessibility, and maintainability improvements affecting multiple stories.

- [ ] T031 [P] Add/verify keyboard-only navigation for the axis filter in `frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx` (focus order; screen-reader labels)
- [ ] T032 Ensure no “Notes” panel exists anywhere in Compare runs UI by auditing `frontend/src/pages/pipelines/global/experiments/compareRuns/` (remove if accidentally introduced)
- [ ] T033 Run and fix lint/type issues introduced by the feature (touched files under `frontend/src/pages/pipelines/global/experiments/compareRuns/` and `frontend/src/concepts/pipelines/content/compareRuns/visualizations/`)
- [ ] T034 Run and fix Cypress mocked test failures for `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts`
- [ ] T035 Update `specs/002-parallel-coords-plot/quickstart.md` if any navigation/test steps changed during implementation

---

## Dependencies & Execution Order

### Dependency graph (high-level)

- Phase 1 → Phase 2 → (US1 → US2 → US3) → Phase 6

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user story phases.
- **User Stories (Phase 3–5)**: All depend on Phase 2.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2; no dependency on US2/US3.
- **US2 (P2)**: Depends on Phase 2; builds on the US1 visualization section UI.
- **US3 (P3)**: Depends on Phase 2; can be developed alongside US2 but may require minor UI additions in the visualization section.

### Parallel Opportunities

- In Phase 1, file scaffolding tasks `T002–T004` can be done in parallel.
- In Phase 2, test tasks `T010–T011` can be written in parallel with implementation `T006–T009` (as long as stubs exist).
- In story phases, Cypress page-object work can be done in parallel with UI implementation.

---

## Parallel Example: User Story 2

```text
Task: "Add axis filter UI in frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx"
Task: "Add Cypress helpers in packages/cypress/cypress/pages/pipelines/compareRuns.ts"
Task: "Add Cypress mocked test in packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts"
```

---

## Parallel Example: User Story 1

```text
Task: "Implement CompareRunsVisualizationsSection layout in frontend/src/pages/pipelines/global/experiments/compareRuns/CompareRunsVisualizationsSection.tsx"
Task: "Add Cypress helpers in packages/cypress/cypress/pages/pipelines/compareRuns.ts"
Task: "Add Cypress mocked test in packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts"
```

---

## Parallel Example: User Story 3

```text
Task: "Harden missing/mixed-type handling in frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils.ts"
Task: "Add Jest unit tests in frontend/src/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/__tests__/utils.spec.ts"
Task: "Add Cypress mocked test coverage in packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

- Complete **Phase 1–2** (scaffolding + tested utils)
- Implement **US1** (section renders + plot displays selected runs)
- Validate with Cypress mocked test additions and a manual smoke check in dev

### Incremental Delivery

- Add **US2** filtering and tests
- Add **US3** resilience and tests
- Finish with **Phase 6** polish + quality gates

