import { Cycle, DataPoint } from './types';

export interface ChartPoint {
  time: number;
  voltage: number;
  current: number;
  charge?: number | null;
  originalTime: number;
  step: number;
}

export interface DownsampleOptions {
  maxPoints?: number;
}

export interface FlattenOptions {
  downsample?: DownsampleOptions;
}

const DEFAULT_MAX_POINTS = 600;

export function flattenCyclePoints(cycle: Cycle, options?: FlattenOptions): ChartPoint[] {
  const raw: ChartPoint[] = [];
  let offset = 0;

  for (const step of cycle.steps) {
    if (!step.dp.length) continue;
    const baseTime = step.dp[0].time;
    for (const point of step.dp) {
      const normalizedTime = offset + (point.time - baseTime);
      raw.push({
        time: normalizedTime,
        voltage: point.voltage,
        current: point.current,
        charge: point.charge,
        originalTime: point.time,
        step: step.step,
      });
    }
    const last = raw[raw.length - 1];
    if (last) {
      offset = last.time;
    }
  }

  if (!options?.downsample) return raw;
  const maxPoints = options.downsample.maxPoints ?? DEFAULT_MAX_POINTS;
  return downsample(raw, maxPoints);
}

export function downsample<T>(points: T[], maxPoints: number): T[] {
  if (points.length <= maxPoints) return points;
  if (maxPoints <= 0) return [];
  const stride = Math.ceil(points.length / maxPoints);
  const result: T[] = [];
  for (let i = 0; i < points.length; i += stride) {
    result.push(points[i]);
  }
  const lastPoint = points[points.length - 1];
  if (result[result.length - 1] !== lastPoint) {
    result.push(lastPoint);
  }
  return result;
}

export function flattenAllCycles(cycles: Cycle[], options?: FlattenOptions): Map<number, ChartPoint[]> {
  const map = new Map<number, ChartPoint[]>();
  for (const cycle of cycles) {
    map.set(cycle.cycle, flattenCyclePoints(cycle, options));
  }
  return map;
}
