import { ParseRequest, ParseResponse } from './messages';
import { ParsedResult } from '../domain/types';

let worker: Worker | null = null;
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./parser.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

export function parseFileInWorker(file: File): Promise<ParsedResult> {
  return new Promise(async (resolve, reject) => {
    const arrayBuffer = await file.arrayBuffer();
    const id = crypto.randomUUID();
    const req: ParseRequest = { id, fileName: file.name, arrayBuffer, mime: file.type };
    const w = getWorker();
    function handle(e: MessageEvent<ParseResponse>) {
      if (e.data.id !== id) return;
      w.removeEventListener('message', handle as any);
      if (e.data.status === 'ok') resolve(e.data.data);
      else reject(new Error(e.data.error));
    }
    w.addEventListener('message', handle as any);
    w.postMessage(req, [arrayBuffer]);
  });
}
