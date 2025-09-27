import { calculateCharge } from '../domain/calculateCharge';
import { calculateEnergy } from '../domain/calculateEnergy';
import { calculateCycleStats, normalizeCycles } from '../domain/cycleUtils';
import { ParsedResult } from '../domain/types';

// Flatten structure: cycle,step,time,voltage,current,charge,calculatedCharge,totalChargeForCycle
export function exportCsv(data: ParsedResult): Blob {
  const rows: string[] = [];
  rows.push(
    'cycle,step,time,voltage,current,charge,calculatedCharge,totalCycleCharge,calculatedEnergy,totalCycleEnergyInput,totalCycleEnergyOutput,chargeEfficiency,energyEfficiency',
  );

  const cycles = normalizeCycles(data);

  for (const cycle of cycles) {
    const stats = calculateCycleStats(cycle);
    const totalCharge = stats.totalCharge;
    const totalEnergyIn = stats.energyInput ?? '';
    const totalEnergyOut = stats.energyOutput ?? '';
    const chargeEfficiency = stats.efficiency != null ? stats.efficiency : '';
    const energyEfficiency = stats.energyEfficiency != null ? stats.energyEfficiency : '';

    for (const step of cycle.steps) {
      const calculatedCharge = calculateCharge(step.dp);
      const calculatedEnergy = calculateEnergy(step.dp);
      for (const dp of step.dp) {
        rows.push(
          [
            cycle.cycle,
            step.step,
            formatValue(dp.time),
            formatValue(dp.voltage),
            formatValue(dp.current),
            formatOptional(dp.charge),
            formatValue(calculatedCharge),
            formatValue(totalCharge),
            formatOptional(calculatedEnergy),
            formatOptional(totalEnergyIn),
            formatOptional(totalEnergyOut),
            formatOptional(chargeEfficiency),
            formatOptional(energyEfficiency),
          ].join(','),
        );
      }
    }
  }

  return new Blob([rows.join('\n') + '\n'], { type: 'text/csv' });
}

function formatOptional(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : '';
  }
  return value;
}

function formatValue(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toString() : '';
  }
  return value;
}
