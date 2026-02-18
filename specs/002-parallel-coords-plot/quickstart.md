# Quickstart: Compare runs parallel coordinates plot

## Prerequisites

- Node.js >= 22
- npm >= 10

## Install

```bash
npm install
```

## Run the dashboard (dev)

```bash
npm run dev
```

## Where to find the feature

- Navigate to **Develop and train → Experiments**
- Open an experiment, choose multiple runs to compare, then open **Compare runs**
- In the Compare runs page, look for the new **Visualizations → Parallel coordinates plot** section
- Use the axis filter to include/exclude **Parameters** and **Metrics** and confirm the plot updates

## Run tests

### Unit tests (Jest)

```bash
npm run test
```

### Cypress mocked tests

```bash
npm run cypress:mock
```

> The existing mocked test `packages/cypress/cypress/tests/mocked/pipelines/runs/compareRuns.cy.ts`
> will be extended to cover the visualization section.

