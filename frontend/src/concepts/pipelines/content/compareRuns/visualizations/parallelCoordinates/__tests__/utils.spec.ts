/* eslint-disable camelcase */
import { Artifact, Event, Execution, Value as MlmdValue } from '#~/third_party/mlmd';
import { PipelineRunKF } from '#~/concepts/pipelines/kfTypes';
import { RunArtifact } from '#~/concepts/pipelines/apiHooks/mlmd/types';
import {
  buildParallelCoordinatesModel,
  buildParallelCoordinatesOption,
  getParameterKeys,
  getScalarMetricsMap,
} from '#~/concepts/pipelines/content/compareRuns/visualizations/parallelCoordinates/utils';

const buildRun = (
  runId: string,
  displayName: string,
  params: Record<string, unknown>,
): PipelineRunKF =>
  ({
    run_id: runId,
    display_name: displayName,
    runtime_config: { parameters: params },
  } as unknown as PipelineRunKF);

const buildScalarMetricRunArtifact = (
  run: PipelineRunKF,
  props: Record<string, MlmdValue>,
): RunArtifact => {
  const artifact = new Artifact();
  const map = artifact.getCustomPropertiesMap();
  Object.entries(props).forEach(([k, v]) => map.set(k, v));

  return {
    run,
    executionArtifacts: [
      {
        execution: new Execution(),
        linkedArtifacts: [{ event: new Event(), artifact }],
      },
    ],
  };
};

describe('parallelCoordinates utils', () => {
  it('getParameterKeys unions and sorts runtime config parameter keys', () => {
    const runs = [
      buildRun('r1', 'Run 1', { alpha: 1, beta: 2 }),
      buildRun('r2', 'Run 2', { beta: 3, gamma: 4 }),
    ];
    expect(getParameterKeys(runs)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('getScalarMetricsMap extracts scalar metric custom properties', () => {
    const v = new MlmdValue();
    v.setDoubleValue(92);
    const run = buildRun('r1', 'Run 1', {});
    const artifacts = [buildScalarMetricRunArtifact(run, { accuracy: v })];

    expect(getScalarMetricsMap(artifacts)).toEqual({ r1: { accuracy: 92 } });
  });

  it('buildParallelCoordinatesModel infers value axes for numeric data', () => {
    const run1 = buildRun('r1', 'Run 1', { lr: '0.1' });
    const run2 = buildRun('r2', 'Run 2', { lr: '0.2' });

    const v1 = new MlmdValue();
    v1.setDoubleValue(92);
    const v2 = new MlmdValue();
    v2.setDoubleValue(93);
    const scalarArtifacts = [
      buildScalarMetricRunArtifact(run1, { accuracy: v1 }),
      buildScalarMetricRunArtifact(run2, { accuracy: v2 }),
    ];

    const model = buildParallelCoordinatesModel(
      [run1, run2],
      ['lr'],
      ['accuracy'],
      scalarArtifacts,
    );
    expect(model.axes.map((a) => ({ label: a.label, type: a.type }))).toEqual([
      { label: 'lr', type: 'value' },
      { label: 'accuracy', type: 'value' },
    ]);
    expect(model.series[0].values).toEqual([0.1, 92]);
    expect(model.series[1].values).toEqual([0.2, 93]);
  });

  it('buildParallelCoordinatesModel orders parameter axes before metric axes', () => {
    const run1 = buildRun('r1', 'Run 1', { pA: 1, pB: 2 });
    const run2 = buildRun('r2', 'Run 2', { pA: 3, pB: 4 });

    const v1 = new MlmdValue();
    v1.setDoubleValue(10);
    const v2 = new MlmdValue();
    v2.setDoubleValue(20);
    const scalarArtifacts = [
      buildScalarMetricRunArtifact(run1, { mA: v1 }),
      buildScalarMetricRunArtifact(run2, { mA: v2 }),
    ];

    const model = buildParallelCoordinatesModel(
      [run1, run2],
      ['pB', 'pA'],
      ['mA'],
      scalarArtifacts,
    );
    expect(model.axes.map((a) => a.label)).toEqual(['pB', 'pA', 'mA']);
  });

  it('buildParallelCoordinatesModel treats booleans as categorical axes', () => {
    const run1 = buildRun('r1', 'Run 1', { flag: true });
    const run2 = buildRun('r2', 'Run 2', { flag: false });

    const model = buildParallelCoordinatesModel([run1, run2], ['flag'], [], []);
    expect(model.axes[0].type).toBe('category');
    expect(model.axes[0].categories).toEqual(['false', 'true']);
    expect(model.series[0].values[0]).toBe('true');
    expect(model.series[1].values[0]).toBe('false');
  });

  it('represents missing values as null without crashing', () => {
    const run1 = buildRun('r1', 'Run 1', { p: 1 });
    const run2 = buildRun('r2', 'Run 2', {});
    const model = buildParallelCoordinatesModel([run1, run2], ['p'], [], []);
    expect(model.axes.map((a) => a.label)).toEqual(['p']);
    expect(model.series[0].values).toEqual([1]);
    expect(model.series[1].values).toEqual([null]);
  });

  it('treats mixed-type values as categorical axes', () => {
    const run1 = buildRun('r1', 'Run 1', { mixed: 1 });
    const run2 = buildRun('r2', 'Run 2', { mixed: 'foo' });
    const model = buildParallelCoordinatesModel([run1, run2], ['mixed'], [], []);
    expect(model.axes[0].type).toBe('category');
    expect(model.axes[0].categories).toEqual(['1', 'foo']);
  });

  it('buildParallelCoordinatesOption creates parallelAxis and series data', () => {
    const run1 = buildRun('r1', 'Run 1', { a: 1 });
    const run2 = buildRun('r2', 'Run 2', { a: 2 });
    const model = buildParallelCoordinatesModel([run1, run2], ['a'], [], []);
    const option = buildParallelCoordinatesOption(model);

    expect(option.parallelAxis).toHaveLength(1);
    const [firstSeries] = option.series as unknown as Array<{ type: string; data: unknown }>;
    expect(firstSeries.type).toBe('parallel');
    expect(firstSeries.data).toEqual([
      { name: 'Run 1', value: [1] },
      { name: 'Run 2', value: [2] },
    ]);
  });
});
