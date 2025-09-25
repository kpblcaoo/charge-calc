import { ParsedResult } from '../domain/types';

// Flatten structure: cycle,step,time,voltage,current,charge,calculatedCharge,totalChargeForCycle
export function exportCsv(data: ParsedResult): Blob {
  const rows: string[] = [];
  rows.push('cycle,step,time,voltage,current,charge,calculatedCharge,totalCycleCharge');
  for (const c of (data as any).cycles) {
    const total = (c as any).totalCharge ?? '';
    for (const s of c.steps) {
      const calc = (s as any).calculatedCharge ?? '';
      for (const dp of s.dp) {
        rows.push([
          c.cycle,
          s.step,
          dp.time,
          dp.voltage,
          dp.current,
            dp.charge ?? '',
            calc,
            total
        ].join(','));
      }
    }
  }
  return new Blob([rows.join('\n') + '\n'], { type: 'text/csv' });
}
