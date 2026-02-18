# Contracts: Compare runs parallel coordinates plot

**Feature**: `002-parallel-coords-plot`  
**Date**: 2026-02-17

## Summary

This feature is expected to be **frontend-only** and does **not** introduce new backend endpoints.

## Existing dependencies

- Compare runs obtains run details via existing Pipelines API calls (run IDs from URL).
- Scalar metrics are derived from existing MLMD artifact APIs used by the current Metrics section.

## Contract test impact

- **No new BFF contracts** are required for this change (no BFF code changes planned).
- If implementation reveals missing data required for the visualization, a follow-up design update will be needed to define the minimal API/contract additions.

