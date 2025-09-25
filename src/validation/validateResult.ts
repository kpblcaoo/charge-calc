import { ParsedResultSchema } from './schema';
import { ParsedResult } from '../domain/types';

export function validateResult(obj: unknown): ParsedResult {
  const parsed = ParsedResultSchema.safeParse(obj);
  if (!parsed.success) {
    throw new Error('Validation failed: ' + parsed.error.issues.map(i => i.message).join('; '));
  }
  return parsed.data;
}
