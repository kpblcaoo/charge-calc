import { z } from 'zod';

export const DataPointSchema = z.object({
  time: z.number(),
  voltage: z.number(),
  current: z.number(),
  charge: z.number().nullable().optional()
});
export const StepSchema = z.object({ step: z.number(), dp: z.array(DataPointSchema) });
export const CycleSchema = z.object({ cycle: z.number(), steps: z.array(StepSchema) });
export const ParsedResultSchema = z.object({ cycles: z.array(CycleSchema) });
export type ParsedResultType = z.infer<typeof ParsedResultSchema>;
