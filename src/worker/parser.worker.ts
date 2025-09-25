import { detectMime } from '../parsing/detectMime';
import { extractTokensFromEdf } from '../parsing/extractTokensFromEdf';
import { extractTokensFromXlsx } from '../parsing/extractTokensFromXlsx';
import { assemble } from '../domain/assemble';
import { calculateCharge } from '../domain/calculateCharge';
import { validateResult } from '../validation/validateResult';
import { Token, ParsedResult } from '../domain/types';
import { ParseRequest, ParseResponse } from './messages';
import { MAX_FILE_BYTES } from '../config/limits';

self.onmessage = async (e: MessageEvent<ParseRequest>) => {
  const msg = e.data;
  try {
    if (msg.arrayBuffer.byteLength > MAX_FILE_BYTES) {
      throw new Error(`File too large (> ${MAX_FILE_BYTES} bytes)`);
    }
    const head = new Uint8Array(msg.arrayBuffer.slice(0, 2048));
    const detection = await detectMime(new File([msg.arrayBuffer], msg.fileName, { type: msg.mime || '' }), head);
    let tokens: Token[] = [];
    if (detection.kind === 'edf') {
      const text = new TextDecoder().decode(msg.arrayBuffer);
      tokens = await extractTokensFromEdf(text);
    } else {
      tokens = await extractTokensFromXlsx(msg.arrayBuffer);
    }
  const parsed = assemble(tokens);
    // enrich with calculated charges (mutate)
    for (const c of parsed.cycles) {
      for (const s of c.steps) {
        const q = calculateCharge(s.dp);
        // attach synthetic final dp charge? (skipping: just rely on computation)
        (s as any).calculatedCharge = q;
      }
      (c as any).totalCharge = c.steps.reduce((acc, s) => acc + calculateCharge(s.dp), 0);
    }
  // Validate structure after enrichment
  const validated = validateResult(parsed);
  const response: ParseResponse = { id: msg.id, status: 'ok', data: validated };
    (self as any).postMessage(response);
  } catch (err:any) {
    const resp: ParseResponse = { id: msg.id, status: 'error', error: err?.message || String(err) };
    (self as any).postMessage(resp);
  }
};
