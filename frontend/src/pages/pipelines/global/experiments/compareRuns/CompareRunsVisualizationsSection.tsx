import React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
  HelperText,
  HelperTextItem,
  Spinner,
  Tab,
  TabContentBody,
  TabTitleText,
  Tabs,
  getResizeObserver,
} from '@patternfly/react-core';
import { Charts } from '@patternfly/react-charts/echarts';
import { useCompareRuns } from '#~/concepts/pipelines/content/compareRuns/CompareRunsContext';
import { CompareRunsEmptyState } from '#~/concepts/pipelines/content/compareRuns/CompareRunsEmptyState';
import { useGetArtifactTypes } from '#~/concepts/pipelines/apiHooks/mlmd/useGetArtifactTypes';
import { MlmdContextTypes } from '#~/concepts/pipelines/apiHooks/mlmd/types';
import { useMlmdContextsByType } from '#~/concepts/pipelines/apiHooks/mlmd/useMlmdContextsByType';
import useMlmdPackagesForPipelineRuns from '#~/concepts/pipelines/content/compareRuns/metricsSection/useMlmdPackagesForPipelineRuns';
import {
  filterRunArtifactsByType,
  getRunArtifacts,
} from '#~/concepts/pipelines/content/compareRuns/metricsSection/utils';
import { MetricsType } from '#~/concepts/pipelines/content/compareRuns/metricsSection/const';
import { MultiSelection, SelectionOptions } from '#~/components/MultiSelection';
import {
  buildParallelCoordinatesModel,
  buildParallelCoordinatesOption,
  getParameterKeys,
  makeAxisId,
} from '#~/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils';
import '#~/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/echartsSetup';

export const CompareRunsVisualizationsSection: React.FC = () => {
  const { selectedRuns, loaded } = useCompareRuns();
  const [isSectionOpen, setIsSectionOpen] = React.useState(true);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>('parallel-coordinates');
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = React.useState(0);
  const [selectedAxisIds, setSelectedAxisIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const ref = bodyRef.current;
    let observer: ReturnType<typeof getResizeObserver> = () => undefined;
    if (ref) {
      const handleResize = () => {
        setChartWidth(ref.clientWidth);
      };
      observer = getResizeObserver(ref, handleResize);
      handleResize();
    }
    return () => observer();
  }, [activeTabKey, isSectionOpen, loaded]);

  const [contexts, contextsLoaded] = useMlmdContextsByType(MlmdContextTypes.RUN);
  const [mlmdPackages, mlmdPackagesLoaded] = useMlmdPackagesForPipelineRuns(selectedRuns, contexts);
  const [artifactTypes, artifactTypesLoaded] = useGetArtifactTypes();
  const scalarMetricsLoaded = contextsLoaded && mlmdPackagesLoaded && artifactTypesLoaded;

  const scalarMetricsArtifacts = React.useMemo(() => {
    if (!scalarMetricsLoaded) {
      return [];
    }
    const runArtifacts = getRunArtifacts(mlmdPackages);
    return filterRunArtifactsByType(runArtifacts, artifactTypes, MetricsType.SCALAR_METRICS);
  }, [artifactTypes, mlmdPackages, scalarMetricsLoaded]);

  const parameterKeys = React.useMemo(() => getParameterKeys(selectedRuns), [selectedRuns]);

  const metricKeys = React.useMemo(() => {
    if (!scalarMetricsLoaded) {
      return [];
    }
    const keys = new Set<string>();
    scalarMetricsArtifacts.forEach((runArtifact) => {
      runArtifact.executionArtifacts.forEach((executionArtifact) => {
        executionArtifact.linkedArtifacts.forEach((linkedArtifact) => {
          linkedArtifact.artifact
            .getCustomPropertiesMap()
            .getEntryList()
            .forEach(([key]) => {
              if (key !== 'display_name') {
                keys.add(key);
              }
            });
        });
      });
    });
    return Array.from(keys).toSorted((a, b) => a.localeCompare(b));
  }, [scalarMetricsArtifacts, scalarMetricsLoaded]);

  const availableAxisIds = React.useMemo(() => {
    const ids = new Set<string>();
    parameterKeys.forEach((k) => ids.add(makeAxisId('parameter', k)));
    metricKeys.forEach((k) => ids.add(makeAxisId('metric', k)));
    return ids;
  }, [metricKeys, parameterKeys]);

  React.useEffect(() => {
    // Prune selections that are no longer available when runs change.
    setSelectedAxisIds((prev) => prev.filter((id) => availableAxisIds.has(id)));
  }, [availableAxisIds]);

  React.useEffect(() => {
    // Default selection: prefer parameters, otherwise metrics (keeps stable after user changes).
    if (!loaded || selectedAxisIds.length > 0) {
      return;
    }
    if (parameterKeys.length > 0) {
      setSelectedAxisIds(parameterKeys.slice(0, 5).map((k) => makeAxisId('parameter', k)));
      return;
    }
    if (metricKeys.length > 0) {
      setSelectedAxisIds(metricKeys.slice(0, 5).map((k) => makeAxisId('metric', k)));
    }
  }, [loaded, metricKeys, parameterKeys, selectedAxisIds.length]);

  const selectedParameterKeys = React.useMemo(
    () => parameterKeys.filter((k) => selectedAxisIds.includes(makeAxisId('parameter', k))),
    [parameterKeys, selectedAxisIds],
  );

  const selectedMetricKeys = React.useMemo(
    () => metricKeys.filter((k) => selectedAxisIds.includes(makeAxisId('metric', k))),
    [metricKeys, selectedAxisIds],
  );

  const model = React.useMemo(
    () =>
      buildParallelCoordinatesModel(
        selectedRuns,
        selectedParameterKeys,
        selectedMetricKeys,
        scalarMetricsArtifacts,
      ),
    [scalarMetricsArtifacts, selectedMetricKeys, selectedParameterKeys, selectedRuns],
  );

  const option = React.useMemo(() => buildParallelCoordinatesOption(model), [model]);

  const isEmpty = loaded && selectedRuns.length < 2;
  const hasAxes = selectedParameterKeys.length + selectedMetricKeys.length > 0;
  const hasPlottableAxes = model.axes.length >= 2;
  const hasMissingValues = React.useMemo(
    () => hasAxes && model.series.some((row) => row.values.some((v) => v === null)),
    [hasAxes, model.series],
  );
  const selectionOptions = React.useMemo(() => {
    const parameterOptions: SelectionOptions[] = parameterKeys.map((k) => ({
      id: makeAxisId('parameter', k),
      name: k,
      selected: selectedAxisIds.includes(makeAxisId('parameter', k)),
    }));

    const metricOptions: SelectionOptions[] = metricKeys.map((k) => ({
      id: makeAxisId('metric', k),
      name: k,
      selected: selectedAxisIds.includes(makeAxisId('metric', k)),
    }));

    return [
      { id: 'parameters', name: 'Parameters', values: parameterOptions },
      { id: 'metrics', name: 'Metrics', values: metricOptions },
    ];
  }, [metricKeys, parameterKeys, selectedAxisIds]);

  return (
    <ExpandableSection
      toggleText="Visualizations"
      onToggle={(_event, isOpen) => setIsSectionOpen(isOpen)}
      isExpanded={isSectionOpen}
      isIndented
      data-testid="compare-runs-visualizations-content"
    >
      <Tabs activeKey={activeTabKey} onSelect={(_e, key) => setActiveTabKey(key)}>
        <Tab
          eventKey="parallel-coordinates"
          title={<TabTitleText>Parallel coordinates plot</TabTitleText>}
          data-testid="compare-runs-parallel-coordinates-tab"
        >
          <TabContentBody hasPadding data-testid="compare-runs-parallel-coordinates-tab-content">
            <div data-testid="compare-runs-parallel-coordinates-plot" ref={bodyRef}>
              {!loaded ? (
                <Bullseye>
                  <Spinner />
                </Bullseye>
              ) : isEmpty ? (
                <CompareRunsEmptyState
                  title="Select at least two runs"
                  data-testid="compare-runs-visualizations-empty-state"
                />
              ) : parameterKeys.length + metricKeys.length === 0 ? (
                <EmptyState
                  headingLevel="h4"
                  titleText="No data available"
                  variant={EmptyStateVariant.xs}
                >
                  <EmptyStateBody>
                    Select runs that include parameters or metrics to visualize.
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <div>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                    <FlexItem>
                      <FormGroup
                        label="Select data"
                        fieldId="compare-runs-parallel-coordinates-axis-filter-input"
                      >
                        <MultiSelection
                          ariaLabel="Select data"
                          placeholder="Select data"
                          groupedValues={selectionOptions}
                          setValue={(options) => {
                            setSelectedAxisIds(
                              options.filter((o) => o.selected).map((o) => String(o.id)),
                            );
                          }}
                          selectionRequired
                          noSelectedOptionsMessage="Select at least one parameter or metric"
                          toggleId="compare-runs-parallel-coordinates-axis-filter"
                          inputId="compare-runs-parallel-coordinates-axis-filter-input"
                          toggleTestId="compare-runs-parallel-coordinates-axis-filter"
                          listTestId="compare-runs-parallel-coordinates-axis-filter-list"
                          clearSelectionsTestId="compare-runs-parallel-coordinates-axis-filter-clear"
                          filterFunction={(newValue, options) => {
                            if (!newValue) {
                              return options;
                            }
                            return options.filter((o) =>
                              o.name.toLowerCase().includes(newValue.toLowerCase()),
                            );
                          }}
                          popperProps={{ minWidth: '320px' }}
                        />
                      </FormGroup>
                    </FlexItem>
                    <FlexItem>
                      {!hasAxes ? (
                        <EmptyState
                          headingLevel="h4"
                          titleText="Select data to plot"
                          variant={EmptyStateVariant.xs}
                        >
                          <EmptyStateBody>
                            Select at least one parameter or metric to display the plot.
                          </EmptyStateBody>
                        </EmptyState>
                      ) : !hasPlottableAxes ? (
                        <EmptyState
                          headingLevel="h4"
                          titleText="Select more data to plot"
                          variant={EmptyStateVariant.xs}
                        >
                          <EmptyStateBody>
                            Select at least two parameters or metrics to display the parallel
                            coordinates plot.
                          </EmptyStateBody>
                        </EmptyState>
                      ) : chartWidth > 0 ? (
                        <Charts
                          aria-label="Parallel coordinates plot"
                          height={350}
                          width={chartWidth}
                          nodeSelector="html"
                          isSvgRenderer={false}
                          option={option}
                        />
                      ) : null}
                    </FlexItem>
                    {hasMissingValues ? (
                      <FlexItem>
                        <HelperText>
                          <HelperTextItem data-testid="compare-runs-parallel-coordinates-missing-values-warning">
                            Some selected runs are missing values for one or more axes.
                          </HelperTextItem>
                        </HelperText>
                      </FlexItem>
                    ) : null}
                  </Flex>
                  {chartWidth > 0 ? (
                    <div
                      data-testid="compare-runs-parallel-coordinates-axis-labels"
                      aria-hidden
                      style={{ position: 'absolute', left: '-99999px' }}
                    >
                      {selectedParameterKeys.concat(selectedMetricKeys).join(',')}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </TabContentBody>
        </Tab>
        <Tab
          eventKey="scatter-plot"
          title={<TabTitleText>Scatter plot</TabTitleText>}
          data-testid="compare-runs-scatter-plot-tab"
          isDisabled
        />
      </Tabs>
    </ExpandableSection>
  );
};
