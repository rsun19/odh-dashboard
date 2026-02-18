# Data model: Compare runs parallel coordinates plot

**Feature**: `002-parallel-coords-plot`  
**Date**: 2026-02-17

## Overview

This feature is UI-only and builds a visualization from existing Compare runs data:

- Selected runs: from `CompareRunsContext` (`selectedRuns`)
- Parameters: from `PipelineRunKF.runtime_config.parameters`
- Metrics (scalar): from MLMD artifacts used by the existing Scalar metrics compare section

## Entities

### Run

- **id**: `run_id`
- **name**: `display_name`
- **parameters**: map of `parameterKey -> rawValue`
- **scalarMetrics**: map of `metricKey -> rawValue`

### Axis (plot dimension)

- **id**: stable identifier, e.g. `param:<key>` or `metric:<key>`
- **label**: display label for the UI (e.g., `paramOne`, `accuracy`)
- **group**: `parameters | metrics`
- **type**:
  - `value` (numeric) when all non-missing values parse as finite numbers
  - `category` otherwise
- **categories** (only for `category`): ordered list of distinct stringified values, stable across renders for the current selection

### PlotModel

- **axes**: ordered list of Axis shown in the plot
- **series**: one series per run, containing an ordered list of values corresponding to axes
  - numeric values for `value` axes
  - category indices or category labels for `category` axes (per ECharts requirements)
  - missing values represented as `null` / omitted per ECharts best practice

## Transformations

### Axis discovery

For the current `selectedRuns`:

- Parameter axis candidates are the union of keys across `runtime_config.parameters`
- Metric axis candidates are the union of scalar metric keys available for those runs

### Axis typing

For each candidate axis:

- Normalize run values to strings for categorical comparison
- Attempt numeric parsing; if all non-missing parse to finite numbers, mark as `value`
- Otherwise mark as `category` and derive a category set from observed values

### Filtering

The UI maintains a selected axis set (multi-select). The plot uses only the selected axes, preserving a stable ordering:

1. Parameters (alphabetical by label)
2. Metrics (alphabetical by label)

## Validation rules

- If fewer than 2 runs are selected: show empty state for the visualization
- If zero axes are selected: show empty state for the visualization
- If an axis has no values across selected runs: omit it from the plot and keep it unselectable (or show as disabled) to avoid misleading empty axes

