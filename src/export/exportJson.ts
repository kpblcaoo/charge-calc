import { ParsedResult } from '../domain/types';

export function exportJson(data: ParsedResult): Blob {
  const text = JSON.stringify(data, null, 2);
  return new Blob([text], { type: 'application/json' });
}
