import { ChartsOptionProps } from '@patternfly/react-charts/echarts';
import { RunArtifact } from '#~/concepts/pipelines/apiHooks/mlmd/types';
import { PipelineRunKF } from '#~/concepts/pipelines/kfTypes';
import { getMlmdMetadataValue } from '#~/pages/pipelines/global/experiments/executions/utils';
import { AxisDefinition, AxisGroup, ParallelCoordinatesModel, RunSeriesRow } from './types';

export const makeAxisId = (group: AxisGroup, key: string): string => `${group}:${key}`;

export const getParameterKeys = (runs: PipelineRunKF[]): string[] => {
  const keys = new Set<string>();
  runs.forEach((run) => {
    Object.keys(run.runtime_config?.parameters ?? {}).forEach((k) => keys.add(k));
  });
  return Array.from(keys).toSorted((a, b) => a.localeCompare(b));
};

/**
 * Extract scalar metric values from MLMD RunArtifact structures.
 *
 * Returns: runId -> metricKey -> raw value (string|number|boolean|null)
 */
export const getScalarMetricsMap = (
  scalarMetricsArtifacts: RunArtifact[],
): Partial<Record<string, Record<string, unknown>>> => {
  const result: Partial<Record<string, Record<string, unknown>>> = {};

  scalarMetricsArtifacts.forEach((runArtifact) => {
    const runId = runArtifact.run.run_id;
    const runMap = result[runId] ?? {};
    result[runId] = runMap;

    runArtifact.executionArtifacts.forEach((executionArtifact) => {
      executionArtifact.linkedArtifacts.forEach((linkedArtifact) => {
        const customProperties = linkedArtifact.artifact.getCustomPropertiesMap();
        const propsObj = mlmdCustomPropertiesToObject(customProperties);
        Object.entries(propsObj).forEach(([key, value]) => {
          // Prefer first value seen to keep a stable mapping.
          if (!(key in runMap)) {
            runMap[key] = value;
          }
        });
      });
    });
  });

  return result;
};

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const toNumberOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined) {
    return null;
  }
  if (isFiniteNumber(v)) {
    return v;
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const normalizeCategory = (v: unknown): string | null => {
  if (v === null || v === undefined) {
    return null;
  }
  if (typeof v === 'string') {
    return v;
  }
  if (typeof v === 'number') {
    return Number.isFinite(v) ? String(v) : null;
  }
  if (typeof v === 'boolean') {
    return v ? 'true' : 'false';
  }
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const buildAxisDefinitions = (
  runs: PipelineRunKF[],
  selectedParameterKeys: string[],
  selectedMetricKeys: string[],
  scalarMetricsMap: Partial<Record<string, Record<string, unknown>>>,
): AxisDefinition[] => {
  const axes: AxisDefinition[] = [];

  const addAxis = (group: AxisGroup, key: string, values: Array<unknown>): void => {
    const nonMissing = values.filter((v) => v !== null && v !== undefined);
    if (nonMissing.length === 0) {
      return;
    }
    const containsBoolean = nonMissing.some((v) => typeof v === 'boolean');
    const numericValues = nonMissing.map(toNumberOrNull).filter((v): v is number => v !== null);
    const isValueAxis =
      !containsBoolean && nonMissing.length > 0 && numericValues.length === nonMissing.length;
    if (isValueAxis) {
      axes.push({
        id: makeAxisId(group, key),
        label: key,
        group,
        type: 'value',
      });
      return;
    }

    const cats = Array.from(
      new Set(values.map(normalizeCategory).filter((v): v is string => v !== null)),
    ).toSorted((a, b) => a.localeCompare(b));
    axes.push({
      id: makeAxisId(group, key),
      label: key,
      group,
      type: 'category',
      categories: cats,
    });
  };

  selectedParameterKeys.forEach((key) => {
    const vals = runs.map((run) => (run.runtime_config?.parameters ?? {})[key]);
    addAxis('parameter', key, vals);
  });

  selectedMetricKeys.forEach((key) => {
    const vals = runs.map((run) => scalarMetricsMap[run.run_id]?.[key]);
    addAxis('metric', key, vals);
  });

  return axes;
};

export const buildParallelCoordinatesModel = (
  runs: PipelineRunKF[],
  selectedParameterKeys: string[],
  selectedMetricKeys: string[],
  scalarMetricsArtifacts: RunArtifact[],
): ParallelCoordinatesModel => {
  const scalarMetricsMap = getScalarMetricsMap(scalarMetricsArtifacts);
  const axes = buildAxisDefinitions(
    runs,
    selectedParameterKeys,
    selectedMetricKeys,
    scalarMetricsMap,
  );

  const series: RunSeriesRow[] = runs.map((run) => {
    const values = axes.map((axis) => {
      const raw =
        axis.group === 'parameter'
          ? (run.runtime_config?.parameters ?? {})[axis.label]
          : scalarMetricsMap[run.run_id]?.[axis.label];
      if (axis.type === 'value') {
        return toNumberOrNull(raw);
      }
      return normalizeCategory(raw);
    });

    return {
      runId: run.run_id,
      runName: run.display_name,
      values,
    };
  });

  return { axes, series };
};

/**
 * Build ECharts option for a parallel coordinates plot.
 */
export const buildParallelCoordinatesOption = (
  model: ParallelCoordinatesModel,
): ChartsOptionProps => {
  const parallelAxis = model.axes.map((axis, dim) => ({
    dim,
    name: axis.label,
    type: axis.type,
    ...(axis.type === 'category' ? { data: axis.categories ?? [] } : {}),
  }));

  const axisLabels = model.axes.map((a) => a.label);

  const formatValue = (v: unknown): string => {
    if (v === null || v === undefined) {
      return '—';
    }
    if (typeof v === 'number') {
      return Number.isFinite(v) ? String(v) : '—';
    }
    if (typeof v === 'string') {
      return v;
    }
    return String(v);
  };

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        // ECharts passes a series data item; keep this robust to typing mismatches.
        const p = params as { name?: string; value?: unknown[] };
        const values = Array.isArray(p.value) ? p.value : [];
        const header = p.name ? `<strong>${p.name}</strong>` : '<strong>Run</strong>';
        const rows = axisLabels
          .map((label, idx) => `${label}: ${formatValue(values[idx])}`)
          .join('<br/>');
        return `${header}<br/>${rows}`;
      },
    },
    parallel: {
      left: 40,
      right: 40,
      top: 24,
      bottom: 16,
      parallelAxisDefault: {
        nameLocation: 'end',
        nameGap: 12,
      },
    },
    parallelAxis,
    series: [
      {
        type: 'parallel',
        lineStyle: { width: 1, opacity: 0.5 },
        emphasis: { lineStyle: { width: 2, opacity: 0.9 } },
        data: model.series.map((row) => ({ name: row.runName, value: row.values })),
      },
    ],
  };
};

/**
 * Utility for extracting MLMD custom properties into a plain object.
 * (Used by scalar metrics extraction in Phase 2.)
 */
type MlmdCustomPropertiesMap = {
  getEntryList: () => Array<[string, unknown]>;
  get: (key: string) => unknown;
};

const isMlmdCustomPropertiesMap = (x: unknown): x is MlmdCustomPropertiesMap => {
  if (typeof x !== 'object' || x === null) {
    return false;
  }
  const getEntryList = Reflect.get(x, 'getEntryList');
  const get = Reflect.get(x, 'get');
  return typeof getEntryList === 'function' && typeof get === 'function';
};

const isMlmdValue = (x: unknown): x is Parameters<typeof getMlmdMetadataValue>[0] => {
  if (typeof x !== 'object' || x === null) {
    return false;
  }
  const getValueCase = Reflect.get(x, 'getValueCase');
  return typeof getValueCase === 'function';
};

export const mlmdCustomPropertiesToObject = (
  customProperties: unknown,
): Record<string, unknown> => {
  if (!isMlmdCustomPropertiesMap(customProperties)) {
    return {};
  }

  const result: Record<string, unknown> = {};
  customProperties.getEntryList().forEach(([key]) => {
    if (key === 'display_name') {
      return;
    }
    const raw = customProperties.get(key);
    const value = getMlmdMetadataValue(isMlmdValue(raw) ? raw : undefined);
    result[key] = value;
  });
  return result;
};
