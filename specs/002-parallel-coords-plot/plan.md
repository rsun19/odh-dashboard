# Implementation Plan: Compare runs parallel coordinates plot

**Branch**: `002-parallel-coords-plot` | **Date**: 2026-02-17 | **Spec**: `specs/002-parallel-coords-plot/spec.md`  
**Input**: Feature specification from `specs/002-parallel-coords-plot/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a new **Visualizations** section to the Compare runs page, containing a **Parallel coordinates plot** that visualizes the currently selected runs. Provide an axis filter that lets users include/exclude **parameters** and **metrics** and updates the plot accordingly, matching the provided mock layout and omitting any “Notes” UI.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict) + React 18  
**Primary Dependencies**: PatternFly v6 (`@patternfly/react-core`) + PatternFly React Charts (`@patternfly/react-charts` ECharts `Charts`)  
**Storage**: N/A (UI-only feature; uses existing Compare runs data sources)  
**Testing**: Jest unit tests + Cypress mocked/component tests (ODH Cypress package)  
**Target Platform**: Web (RHOAI/ODH dashboard in browser)  
**Project Type**: web application (monorepo `frontend/` + `packages/cypress/`)  
**Performance Goals**: Plot renders and updates within ~1s for typical compare-run sizes (2–10 runs, up to ~30 axes)  
**Constraints**: Must follow existing Compare runs UX patterns; accessibility (WCAG 2.1 AA) and dark theme support; no new ESLint warnings  
**Scale/Scope**: Single page enhancement (Compare runs); no backend or API contract changes expected

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code quality**: TypeScript strict, no ESLint warnings; keep components single-responsibility.
- **Testing**: Add Jest unit tests for data shaping/filter logic; add Cypress mocked tests for the new Visualization section UI and filter behavior.
- **UX consistency & accessibility**: Use PatternFly v6 components; keyboard-operable filter; meaningful labels/test ids; respect dark theme.
- **Performance**: Avoid re-computing chart options on every render; memoize data transforms; keep chart bundle additions minimal.
- **Monorepo discipline**: Reuse existing compare-runs context and MLMD helpers where practical; keep utilities in appropriate directories.

## Project Structure

### Documentation (this feature)

```text
specs/002-parallel-coords-plot/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── concepts/pipelines/content/compareRuns/
│   │   └── ... (shared compare-runs hooks & utilities)
│   └── pages/pipelines/global/experiments/compareRuns/
│       ├── CompareRunsPage.tsx
│       ├── CompareRunParamsSection.tsx
│       ├── CompareRunsMetricsSection.tsx
│       └── (new) CompareRunsVisualizationsSection.tsx

packages/cypress/
└── cypress/tests/mocked/pipelines/runs/
    └── compareRuns.cy.ts
```

**Structure Decision**: Implement the new visualization section as a dedicated component under
`frontend/src/pages/pipelines/global/experiments/compareRuns/` and use existing Compare runs context/data utilities from
`frontend/src/concepts/pipelines/content/compareRuns/`. Extend the existing mocked Cypress test at
`packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts`.

## Complexity Tracking

No constitution violations anticipated for this feature.
