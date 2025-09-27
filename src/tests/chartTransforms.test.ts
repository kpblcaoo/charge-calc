import { describe, expect, it } from 'vitest';
import { buildCycleMetricSeries, buildAllCyclesMetricSeries, flattenCyclePoints, downsample } from '../domain/chartTransforms';

const sampleCycle = {
  cycle: 1,
  steps: [
    {
      step: 1,
      dp: [
        { time: 0, voltage: 3.7, current: 0.1 },
        { time: 10, voltage: 3.8, current: 0.12, charge: 0.015 },
      ],
    },
    {
      step: 2,
      dp: [
        { time: 0, voltage: 3.9, current: 0.15, charge: 0.018 },
        { time: 5, voltage: 4, current: 0.18, charge: 0.022 },
      ],
    },
  ],
} as const;

describe('flattenCyclePoints', () => {
  it('normalizes time across steps and keeps order', () => {
    const points = flattenCyclePoints({
      cycle: sampleCycle.cycle,
      steps: sampleCycle.steps.map((step) => ({
        step: step.step,
        dp: step.dp.map((d) => ({ ...d })),
      })),
    });

    expect(points).toHaveLength(4);
    expect(points[0].time).toBe(0);
    expect(points[1].time).toBe(10);
    // step 2 should continue from previous offset (10)
    expect(points[2].time).toBe(10);
    expect(points[3].time).toBe(15);
  });

  it('supports downsampling option', () => {
    const denseCycle = {
      cycle: 1,
      steps: [
        {
          step: 1,
          dp: Array.from({ length: 1000 }, (_, idx) => ({
            time: idx,
            voltage: idx * 0.01,
            current: 0.1,
          })),
        },
      ],
    };

    const points = flattenCyclePoints(denseCycle, { downsample: { maxPoints: 100 } });
    expect(points.length).toBeLessThanOrEqual(101);
    expect(points[0].time).toBe(0);
    expect(points[points.length - 1].time).toBe(999);
  });
});

describe('downsample', () => {
  it('returns last point even when stride skips it', () => {
    const data = Array.from({ length: 10 }, (_, idx) => idx);
    const sampled = downsample(data, 3);
    expect(sampled[0]).toBe(0);
    expect(sampled[sampled.length - 1]).toBe(9);
    expect(sampled.length).toBeGreaterThan(3);
  });
});

describe('buildCycleMetricSeries', () => {
  it('produces metric arrays with existing charge values', () => {
    const result = buildCycleMetricSeries({
      cycle: sampleCycle.cycle,
      steps: sampleCycle.steps.map((step) => ({
        step: step.step,
        dp: step.dp.map((d) => ({ ...d })),
      })),
    });

    expect(result.cycle).toBe(1);
    expect(result.metrics.voltage.x).toEqual([0, 10, 10, 15]);
    expect(result.metrics.voltage.y[0]).toBeCloseTo(3.7);
    expect(result.metrics.current.hasData).toBe(true);
    expect(result.metrics.charge.hasData).toBe(true);
    expect(result.metrics.charge.y).toEqual([null, 0.015, 0.018, 0.022]);
  });

  it('builds series for multiple cycles', () => {
    const [first, second] = buildAllCyclesMetricSeries([
      {
        cycle: 1,
        steps: [
          {
            step: 1,
            dp: [
              { time: 0, voltage: 3.6, current: 0.11, charge: null },
              { time: 1, voltage: 3.65, current: 0.12, charge: null },
            ],
          },
        ],
      },
      {
        cycle: 2,
        steps: [
          {
            step: 1,
            dp: [
              { time: 0, voltage: 3.8, current: 0.14, charge: 0.01 },
              { time: 2, voltage: 3.85, current: 0.16, charge: 0.02 },
            ],
          },
        ],
      },
    ]);

    expect(first.cycle).toBe(1);
    expect(first.metrics.charge.hasData).toBe(false);
    expect(second.cycle).toBe(2);
    expect(second.metrics.charge.hasData).toBe(true);
    expect(second.metrics.charge.y).toEqual([0.01, 0.02]);
  });
});
