import { describe, it, expect } from 'vitest';
import { calculateCharge } from '../domain/calculateCharge';

describe('calculateCharge', () => {
  it('constant current', () => {
    const dp = [
      { time: 0, voltage: 3.0, current: 0.5 },
      { time: 10, voltage: 3.1, current: 0.5 }
    ];
    expect(calculateCharge(dp)).toBeCloseTo(5);
  });
  it('variable current trapezoid', () => {
    const dp = [
      { time: 0, voltage: 3.0, current: 1 },
      { time: 1, voltage: 3.1, current: 3 }
    ];
    // area = (1+3)/2 * 1 = 2
    expect(calculateCharge(dp)).toBeCloseTo(2);
  });
});
