import { describe, it, expect } from 'vitest';
import { detectMime } from '../parsing/detectMime';

// Minimal File polyfill for Node (Vitest) environment
// Only properties used: type, name
class FilePoly extends Blob {
  name: string;
  lastModified: number;
  constructor(parts: BlobPart[], name: string, opts: any = {}) {
    super(parts, opts);
    this.name = name;
    this.lastModified = Date.now();
  }
}
// @ts-ignore
const FileCtor: typeof File = (typeof File !== 'undefined' ? File : (FilePoly as any));

function file(data: string | Uint8Array, name: string, type='') {
  let blob: Blob;
  if (typeof data === 'string') blob = new Blob([data]);
  else {
    const copy = new Uint8Array(data); // ensure plain Uint8Array
    blob = new Blob([copy.buffer as ArrayBuffer]);
  }
  return new FileCtor([blob], name, { type });
}

describe('detectMime', () => {
  it('detects xlsx via magic', async () => {
    const head = new Uint8Array([0x50,0x4b,0x03,0x04]);
    const f = file(head, 'test.xlsx', 'application/octet-stream');
    const res = await detectMime(f, head);
    expect(res.kind).toBe('xlsx');
  });
  it('detects edf via heuristic', async () => {
    const txt = 'cy 1\nst 1\ndp 0 3.7 0.1';
    const head = new TextEncoder().encode(txt);
    const f = file(txt, 'test.edf', 'text/plain');
    const res = await detectMime(f, head);
    expect(res.kind).toBe('edf');
  });
});
