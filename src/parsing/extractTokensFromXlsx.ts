import type { Token } from '../domain/types';

export async function extractTokensFromXlsx(arrayBuffer: ArrayBuffer): Promise<Token[]> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  const tokens: Token[] = [];
  for (const row of rows) {
    if (!row.length) continue;
    const keyCell = row[0];
    if (keyCell == null || keyCell === '') continue;
    const key = String(keyCell).trim();
    const values = row.slice(1).map(v => (v == null ? '' : String(v).trim()));
    tokens.push({ key, values });
  }
  return tokens;
}
