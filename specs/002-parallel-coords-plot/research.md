# Research: Compare runs parallel coordinates plot

**Feature**: `002-parallel-coords-plot`  
**Date**: 2026-02-17

## Decision 1: Where to implement the new UI

- **Decision**: Add a new `CompareRunsVisualizationsSection` under `frontend/src/pages/pipelines/global/experiments/compareRuns/` and render it in `CompareRunsPage.tsx` between the Run list and Parameters sections (matching the mock layout).
- **Rationale**: The Compare runs page currently composes sections (`Run list`, `Parameters`, `Metrics`) in `CompareRunsPage.tsx`. A dedicated section component keeps responsibilities clear and aligns with existing section patterns (ExpandableSection + PF components).
- **Alternatives considered**:
  - Add visualization UI inside `CompareRunsRunList.tsx`: rejected because Run list already manages table + filtering and would become too coupled.
  - Put the section under `concepts/`: rejected because this UI is page-specific rather than a reusable concept.

## Decision 2: Charting technology and theming

- **Decision**: Use PatternFly React Charts’ ECharts wrapper (`@patternfly/react-charts` `Charts` component) to render the parallel coordinates plot.
- **Rationale**: This provides PatternFly theming, SVG renderer by default, and a React-friendly API while still using Apache ECharts’ `option` model (which supports `parallel` / `parallelAxis` natively).
- **Import path**: `import { Charts } from '@patternfly/react-charts/echarts';`
- **Alternatives considered**:
  - `echarts-for-react` directly: rejected due to losing PatternFly theming conventions and duplication of dark-mode handling.
  - Victory charts (`@patternfly/react-charts` Victory components): rejected because parallel coordinates is not a natural fit for Victory primitives.

## Decision 3: What counts as “metrics” for the plot

- **Decision**: Treat “metrics” for the plot as **scalar metrics** available in Compare runs’ metrics data (MLMD `system.Metrics` artifacts), because they map cleanly to axes for parallel coordinates. Other metrics visualizations (ROC curve, confusion matrix, markdown) remain separate and are not plotted as parallel axes.
- **Rationale**: Parallel coordinates requires per-run values per axis. Scalar metric properties already provide key/value data for each run and are used in the existing Scalar metrics table.
- **Alternatives considered**:
  - Include ROC/ConfusionMatrix-derived values: rejected for Phase 1 because those are complex multi-dimensional datasets and would require additional aggregation rules.

## Decision 4: Axis filtering UX

- **Decision**: Provide a searchable filter control that allows selecting multiple axes, grouped into **Parameters** and **Metrics**. The plot updates whenever the selection changes.
- **Rationale**: The mock shows a searchable dropdown listing Parameters and Metrics. Multi-select is required to build a meaningful parallel coordinates plot with multiple dimensions.
- **Alternatives considered**:
  - Single-select axis: rejected because it cannot represent parallel coordinates meaningfully.
  - Auto-select “all axes”: rejected because it becomes unreadable when many axes exist and conflicts with the spec’s “filter controls the plot”.

## Decision 5: Value typing rules for axes

- **Decision**:
  - If all values for an axis parse cleanly as numbers, render it as a **numeric/value axis**.
  - Otherwise render it as a **categorical axis** using stable category ordering derived from observed values (including booleans/strings).
  - Missing values are represented as “missing” (excluded from that run’s polyline for that dimension) and surfaced via tooltip messaging where possible.
- **Rationale**: Compare-run parameters can be boolean/string; scalar metrics can be numeric or strings. ECharts supports value and category axes, making mixed data practical without misleading numeric coercion.
- **Alternatives considered**:
  - Force numeric-only axes: rejected because it would exclude most parameters in realistic pipelines.

## Decision 6: Testing approach

- **Decision**:
  - **Unit tests (Jest)**: cover data shaping and filtering logic (axis list derivation, typing rules, chart `option` generation for ECharts).
  - **Cypress mocked tests**: extend `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts` to verify the Visualizations section renders and that selecting/deselecting axes affects the plot (via stable DOM hooks / test ids).
- **Rationale**: This matches the ODH constitution’s testing requirements and fits existing Compare runs test coverage patterns.

