import { Token } from '../domain/types';

export async function extractTokensFromEdf(text: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const key = parts[0];
    const values = parts.slice(1);
    tokens.push({ key, values });
  }
  return tokens;
}
