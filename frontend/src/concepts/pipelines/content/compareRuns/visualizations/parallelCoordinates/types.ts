export type AxisGroup = 'parameter' | 'metric';

export type AxisType = 'value' | 'category';

export type AxisId = string;

export type AxisDefinition = {
  id: AxisId;
  label: string;
  group: AxisGroup;
  type: AxisType;
  /**
   * Populated only for category axes.
   * Values MUST be stable for a given selected-run set.
   */
  categories?: string[];
};

export type RunSeriesRow = {
  runId: string;
  runName: string;
  /**
   * Values correspond 1:1 to the axes list.
   * - `number` for value axes
   * - `string` for category axes (category label)
   * - `null` for missing values
   */
  values: Array<number | string | null>;
};

export type ParallelCoordinatesModel = {
  axes: AxisDefinition[];
  series: RunSeriesRow[];
};
