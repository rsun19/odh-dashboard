# Feature Specification: Compare runs parallel coordinates plot

**Feature Branch**: `002-parallel-coords-plot`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Add a parallel coordinates plot to the Compare runs page (under Visualizations) and ensure parameter/metric filters control what is shown. Follow the provided mock layout; do not include the mock’s Notes panel in the UI. Add necessary unit tests and cypress mock tests."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Compare selected runs visually (Priority: P1)

As a user comparing multiple runs, I want to see a parallel coordinates plot under the Visualizations section so I can quickly identify differences and trade-offs across parameters and metrics.

**Why this priority**: This is the primary value of the feature: a visual comparison of run characteristics.

**Independent Test**: Can be fully tested by selecting 2+ runs and confirming that a parallel coordinates plot is displayed under Visualizations and draws one polyline per run.

**Acceptance Scenarios**:

1. **Given** I am on the Compare runs page with at least two runs available, **When** I view the Visualizations section, **Then** I can access a "Parallel coordinates plot" visualization and it renders for the selected runs.
2. **Given** the plot is displayed, **When** I add or remove runs from the comparison, **Then** the plot updates to reflect exactly the runs currently in the comparison.

---

### User Story 2 - Filter which data is shown (Priority: P2)

As a user, I want to choose which parameters and metrics are included in the plot so that the visualization focuses on the dimensions that matter to my analysis.

**Why this priority**: Filtering is required to make the plot useful and readable when many parameters/metrics exist.

**Independent Test**: Can be tested by applying filters that select a known subset of parameters/metrics and verifying that the plot axes correspond to the selection.

**Acceptance Scenarios**:

1. **Given** multiple parameters and metrics exist across the selected runs, **When** I select a subset in the filter control, **Then** the plot updates to show only those selected parameters/metrics.
2. **Given** my filter selection results in no selected parameters/metrics, **When** I view the visualization, **Then** I see a clear empty state explaining that I must select at least one parameter or metric to display the plot.

---

### User Story 3 - Understand missing or incompatible values (Priority: P3)

As a user, I want the plot to handle missing, non-numeric, or inconsistent parameter/metric values gracefully so that the visualization remains understandable and does not break the page.

**Why this priority**: Run metadata is often incomplete or mixed-type; graceful handling prevents confusion and reduces support burden.

**Independent Test**: Can be tested by using runs with missing values and mixed types and verifying the page remains usable and communicates omissions clearly.

**Acceptance Scenarios**:

1. **Given** at least one selected run is missing a value for a selected axis, **When** I view the plot, **Then** the run is still represented without causing errors and the omission is communicated in a user-understandable way (for example via tooltip text or axis/value indication).
2. **Given** a selected parameter/metric contains values that cannot be meaningfully displayed on a numeric axis, **When** I include it in the filter, **Then** the system either excludes it from the plot with a clear explanation or displays it in a way that does not mislead users.

---

### Edge Cases

- **No runs selected / fewer than 2 runs**: Visualizations show a clear empty state explaining that at least two runs are needed to compare.
- **No parameters/metrics available**: The filter control indicates that there is no data available to plot, and the plot is not shown.
- **Too many candidate axes**: The filter remains usable (searchable) and the plot remains readable by requiring explicit selection (or a reasonable default subset) rather than attempting to show everything.
- **Large values / outliers**: The plot remains usable and does not visually collapse in a way that hides most runs.
- **Mixed availability**: Some axes exist only for some runs; the plot does not error and communicates missing values.

## Requirements *(mandatory)*

### Assumptions & Dependencies

- The Compare runs page already provides a selected run list and exposes each run’s available parameters and metrics in the UI.
- The parallel coordinates plot will only visualize parameters/metrics that can be meaningfully plotted as axes without misleading users; unsupported values are omitted with clear user-facing messaging.
- When many parameters/metrics exist, the user can narrow to a manageable subset via filtering (and the experience remains usable without requiring users to scroll through an unbounded list).

### Functional Requirements

- **FR-001**: The Compare runs page MUST include a Visualizations section that offers a "Parallel coordinates plot" visualization.
- **FR-002**: The parallel coordinates plot MUST be displayed under the Visualizations section and MUST render one distinct line per selected run.
- **FR-003**: The Visualizations section MUST provide a filter control that lets users choose which **parameters** and **metrics** are included as axes in the plot.
- **FR-004**: Applying the parameter/metric filters MUST update the plot to show only the selected axes.
- **FR-005**: The set of available filter options MUST reflect the parameters and metrics available across the currently selected runs.
- **FR-006**: If the filter selection contains zero axes, the system MUST show an empty state and MUST NOT render a misleading/blank plot.
- **FR-007**: When runs are added to or removed from the comparison, the plot MUST update to reflect the current selection without requiring a full page refresh.
- **FR-008**: The plot and filter control MUST be accessible: users can operate the filter with keyboard-only navigation and the visualization is labeled in a way that supports assistive technologies.
- **FR-009**: The UI MUST NOT include any "Notes" panel/section as shown in the mock reference notes.
- **FR-010**: The change MUST be covered by automated tests that validate: (a) the plot appears in the Visualizations section, and (b) filter selections change what is plotted.

### Key Entities *(include if feature involves data)*

- **Run**: A single experiment execution with a name, timestamps, and a set of parameters and metrics.
- **Parameter**: A named input/value associated with a run (may be missing for some runs).
- **Metric**: A named outcome/value associated with a run (may be missing for some runs).
- **Visualization selection**: The chosen visualization type and the chosen subset of parameter/metric axes to display.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: With 2–20 runs selected and up to 30 axes selected, users see the parallel coordinates plot displayed within 2 seconds after opening the Visualizations section.
- **SC-002**: When users change the axis filter selection, the plot updates to reflect the selection within 1 second.
- **SC-003**: In usability validation, at least 90% of participants can (a) locate the parallel coordinates plot and (b) apply a filter that changes the displayed axes, on their first attempt without assistance.
- **SC-004**: The Compare runs page introduces no new high-severity accessibility regressions for the Visualizations section (verified by accessibility checks and keyboard-only testing).
