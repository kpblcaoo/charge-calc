import { describe, it, expect } from 'vitest';
import { extractTokensFromEdf } from '../parsing/extractTokensFromEdf';

describe('extractTokensFromEdf', () => {
  it('parses lines into tokens', async () => {
    const text = 'cy 1\nst 1\ndp 0 3.7 0.1';
    const tokens = await extractTokensFromEdf(text);
    expect(tokens.map(t=>t.key)).toEqual(['cy','st','dp']);
  });
});
