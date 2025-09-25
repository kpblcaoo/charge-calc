import { DataPoint } from './types';

export function calculateCharge(dp: DataPoint[]): number {
  if (!dp.length) return 0;
  const lastWithCharge = [...dp].reverse().find(d => d.charge != null);
  if (lastWithCharge && lastWithCharge.charge != null) return lastWithCharge.charge;
  const times = dp.map(d => d.time);
  const currents = dp.map(d => d.current);
  const allConst = currents.every(c => Math.abs(c - currents[0]) < 1e-9);
  if (allConst) return currents[0] * (times[times.length - 1] - times[0]);
  let q = 0;
  for (let i = 0; i < dp.length - 1; i++) {
    const dt = times[i + 1] - times[i];
    q += (currents[i] + currents[i + 1]) / 2 * dt;
  }
  return q;
}
