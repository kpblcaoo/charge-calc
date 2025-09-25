export type DetectedKind = 'xlsx' | 'edf';

export interface DetectionResult { kind: DetectedKind; reason: string }

export async function detectMime(file: File, headBytes: Uint8Array): Promise<DetectionResult> {
  const type = file.type;
  // XLSX magic: PK\x03\x04 (zip)
  const isZip = headBytes[0] === 0x50 && headBytes[1] === 0x4b && headBytes[2] === 0x03 && headBytes[3] === 0x04;
  if (isZip || /sheet|excel/i.test(type)) {
    return { kind: 'xlsx', reason: isZip ? 'zip signature' : 'mime match' };
  }
  // EDF heuristic: text lines starting with two lowercase letters and a space
  const textSample = new TextDecoder().decode(headBytes);
  const lines = textSample.split(/\r?\n/).slice(0, 5);
  let edfScore = 0;
  for (const ln of lines) {
    if (/^[a-z]{2}\s/.test(ln)) edfScore++;
  }
  if (edfScore >= 2) return { kind: 'edf', reason: 'heuristic token lines' };
  throw new Error('Unsupported or unrecognized file format');
}
