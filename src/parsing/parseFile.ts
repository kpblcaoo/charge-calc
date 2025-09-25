import { detectMime } from './detectMime';
import { extractTokensFromEdf } from './extractTokensFromEdf';
import { extractTokensFromXlsx } from './extractTokensFromXlsx';
import { assemble } from '../domain/assemble';
import { ParsedResult } from '../domain/types';

export async function parseFileBrowser(file: File): Promise<ParsedResult> {
  const headSlice = file.slice(0, 2048);
  const headBytes = new Uint8Array(await headSlice.arrayBuffer());
  const detection = await detectMime(file, headBytes);
  let tokens;
  if (detection.kind === 'edf') {
    const text = await file.text();
    tokens = await extractTokensFromEdf(text);
  } else {
    const buf = await file.arrayBuffer();
    tokens = await extractTokensFromXlsx(buf);
  }
  return assemble(tokens);
}
