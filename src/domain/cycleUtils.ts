import { Cycle, ParsedResult, Step } from './types';

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
