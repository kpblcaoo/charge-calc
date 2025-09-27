import { describe, expect, it } from 'vitest';
import { calculateCycleStats } from '../domain/cycleUtils';

const makeCycle = () => ({
  cycle: 1,
  steps: [
    {
      step: 1,
      dp: [
        { time: 0, voltage: 3.7, current: 0.5 },
        { time: 10, voltage: 3.75, current: 0.5 },
      ],
    },
    {
      step: 2,
      dp: [
        { time: 0, voltage: 3.65, current: -0.4 },
        { time: 5, voltage: 3.6, current: -0.4 },
      ],
    },
  ],
});

describe('calculateCycleStats', () => {
  it('aggregates points, charge and efficiency', () => {
    const stats = calculateCycleStats(makeCycle());
    expect(stats.totalSteps).toBe(2);
    expect(stats.totalPoints).toBe(4);
    expect(stats.totalCharge).toBeCloseTo(3, 6);
    expect(stats.chargeInput).toBeCloseTo(5, 6);
    expect(stats.dischargeOutput).toBeCloseTo(2, 6);
    expect(stats.efficiency).toBeCloseTo(0.4, 6);
  });

  it('returns null efficiency when no positive charge', () => {
    const stats = calculateCycleStats({
      cycle: 2,
      steps: [
        {
          step: 1,
          dp: [
            { time: 0, voltage: 3.5, current: -0.2 },
            { time: 6, voltage: 3.45, current: -0.25 },
          ],
        },
      ],
    });

    expect(stats.chargeInput).toBeCloseTo(0, 6);
    expect(stats.dischargeOutput).toBeGreaterThan(0);
    expect(stats.efficiency).toBeNull();
  });
});
