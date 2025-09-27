import { describe, it, expect } from 'vitest';
import { exportJson } from '../export/exportJson';
import { exportCsv } from '../export/exportCsv';

const sample = { cycles: [ { cycle: 1, steps: [ { step: 1, dp: [ { time:0, voltage:3.7, current:0.1 } ] } ] } ] } as any;

describe('export utilities', () => {
  it('exports JSON blob', async () => {
    const blob = exportJson(sample);
    const text = await blob.text();
    expect(text).toContain('"cycles"');
  });
  it('exports CSV blob with header', async () => {
    const blob = exportCsv(sample);
    const text = await blob.text();
    const lines = text.trim().split('\n');
    expect(lines[0]).toBe(
      'cycle,step,time,voltage,current,charge,calculatedCharge,totalCycleCharge,calculatedEnergy,totalCycleEnergyInput,totalCycleEnergyOutput,chargeEfficiency,energyEfficiency',
    );
    const values = lines[1].split(',');
    expect(values).toHaveLength(13);
    expect(values[8]).toBe('0');
  });
});
