import { describe, it, expect } from 'vitest';
import { assemble } from '../domain/assemble';

describe('assemble', () => {
  it('builds cycles and steps with dp', () => {
    const tokens = [
      { key: 'cy', values: ['1'] },
      { key: 'st', values: ['1'] },
      { key: 'dp', values: ['0', '3.7', '0.1'] },
      { key: 'dp', values: ['10', '3.8', '0.1'] },
      { key: 'de', values: [] },
      { key: 'st', values: ['2'] },
      { key: 'dp', values: ['0', '3.9', '0.2'] }
    ];
    const res = assemble(tokens as any);
    expect(res.cycles.length).toBe(1);
    expect(res.cycles[0].steps.length).toBe(2);
    expect(res.cycles[0].steps[0].dp.length).toBe(2);
  });

  it('auto numbers missing cycle/step ids', () => {
    const tokens = [
      { key: 'cy', values: [] },
      { key: 'st', values: [] },
      { key: 'dp', values: ['0', '3.7', '0.1'] },
      { key: 'cy', values: [] },
      { key: 'st', values: [] },
      { key: 'dp', values: ['1', '3.7', '0.1'] }
    ];
    const r = assemble(tokens as any);
    expect(r.cycles[0].cycle).toBe(1);
    expect(r.cycles[1].cycle).toBe(2);
    expect(r.cycles[0].steps[0].step).toBe(1);
  });
});
