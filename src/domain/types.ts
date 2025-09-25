export interface DataPoint {
  time: number;
  voltage: number;
  current: number;
  charge?: number | null;
}
export interface Step { step: number; dp: DataPoint[] }
export interface Cycle { cycle: number; steps: Step[] }
export interface ParsedResult { cycles: Cycle[] }
export interface Token { key: string; values: string[] }
