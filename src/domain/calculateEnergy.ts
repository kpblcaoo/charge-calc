import { DataPoint } from './types';

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function calculateEnergy(dp: DataPoint[]): number | null {
  if (!dp.length) {
    return 0;
  }

  const hasAllVoltages = dp.every((point) => isFiniteNumber(point.voltage));
  const hasAllCurrents = dp.every((point) => isFiniteNumber(point.current));

  if (!hasAllVoltages || !hasAllCurrents) {
    return null;
  }

  const times = dp.map((d) => d.time);
  const powers = dp.map((d) => d.voltage * d.current);

  if (powers.length <= 1) {
    return 0;
  }

  const allConst = powers.every((p) => Math.abs(p - powers[0]) < 1e-9);
  if (allConst) {
    return powers[0] * (times[times.length - 1] - times[0]);
  }

  let energy = 0;
  for (let i = 0; i < dp.length - 1; i++) {
    const dt = times[i + 1] - times[i];
    if (dt <= 0) {
      continue;
    }
    energy += ((powers[i] + powers[i + 1]) / 2) * dt;
  }

  return energy;
}
