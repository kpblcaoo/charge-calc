import { Token, ParsedResult, Cycle, Step, DataPoint } from './types';

export function assemble(tokens: Token[]): ParsedResult {
  const cycles: Cycle[] = [];
  let currentCycle: Cycle | null = null;
  let currentStep: Step | null = null;

  function flushStep() {
    if (currentCycle && currentStep) currentCycle.steps.push(currentStep);
    currentStep = null;
  }

  for (const t of tokens) {
    switch (t.key) {
      case 'cy': {
        flushStep();
        const num = parseInt(t.values[0] || '', 10);
        currentCycle = { cycle: isNaN(num) ? (cycles.length + 1) : num, steps: [] };
        cycles.push(currentCycle);
        break;
      }
      case 'st': {
        flushStep();
        const num = parseInt(t.values[0] || '', 10);
        currentStep = { step: isNaN(num) ? ((currentCycle?.steps.length || 0) + 1) : num, dp: [] };
        break;
      }
      case 'dp': {
        if (!currentStep) {
          currentStep = { step: 1, dp: [] };
        }
        if (t.values.length >= 3) {
          const time = parseFloat(t.values[0]);
          const voltage = parseFloat(t.values[1]);
          const current = parseFloat(t.values[2]);
          if (!Number.isNaN(time) && !Number.isNaN(voltage) && !Number.isNaN(current)) {
            const point: DataPoint = { time, voltage, current };
            if (t.values.length >= 5) {
              const charge = parseFloat(t.values[4]);
              if (!Number.isNaN(charge)) point.charge = charge;
            }
            currentStep.dp.push(point);
          }
        }
        break;
      }
      case 'de': {
        flushStep();
        break;
      }
      default:
        break;
    }
  }
  if (currentStep && currentCycle) currentCycle.steps.push(currentStep);
  return { cycles };
}
