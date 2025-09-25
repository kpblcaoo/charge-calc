import { describe, it, expect } from 'vitest';
import { validateResult } from '../validation/validateResult';

describe('validateResult', () => {
  it('accepts a minimal valid parsed structure', () => {
    const sample = { cycles: [{ cycle: 1, steps: [{ step: 1, dp: [{ time: 0, voltage: 3.7, current: 0.1 }] }] }] };
    expect(() => validateResult(sample)).not.toThrow();
  });
  it('rejects invalid structure', () => {
    const bad: any = { cycles: [{ cycle: 1, steps: [{ step: 1, dp: [{ time: 'x', voltage: 3.7, current: 0.1 }] }] }] };
    expect(() => validateResult(bad)).toThrow();
  });
});
