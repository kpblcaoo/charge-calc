import { Cycle, ParsedResult, Step } from './types';
import { calculateCharge } from './calculateCharge';

export interface CycleStats {
  cycle: number;
  totalSteps: number;
  totalPoints: number;
  totalCharge: number;
  chargeInput: number;
  dischargeOutput: number;
  efficiency: number | null;
}

export function normalizeCycles(result: ParsedResult): Cycle[] {
  const map = new Map<number, Step[]>();

  for (const cycle of result.cycles) {
    const current = map.get(cycle.cycle);
    if (current) {
      current.push(...cycle.steps);
    } else {
      map.set(cycle.cycle, [...cycle.steps]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([cycleNumber, steps]) => ({
      cycle: cycleNumber,
      steps: steps.map((step) => ({
        step: step.step,
        dp: [...step.dp],
      })),
    }));
}

export function calculateCycleStats(cycle: Cycle): CycleStats {
  let totalPoints = 0;
  let totalCharge = 0;
  let chargeInput = 0;
  let dischargeOutput = 0;

  for (const step of cycle.steps) {
    const stepCharge = calculateCharge(step.dp);
    totalPoints += step.dp.length;
    totalCharge += stepCharge;
    if (stepCharge >= 0) {
      chargeInput += stepCharge;
    } else {
      dischargeOutput += Math.abs(stepCharge);
    }
  }

  const efficiency = chargeInput > 0 ? dischargeOutput / chargeInput : null;

  return {
    cycle: cycle.cycle,
    totalSteps: cycle.steps.length,
    totalPoints,
    totalCharge,
    chargeInput,
    dischargeOutput,
    efficiency,
  };
}
