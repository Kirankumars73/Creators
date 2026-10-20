import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('F5 — functions run next to the database', () => {
  test('Vercel functions are pinned to Mumbai (bom1), where Supabase lives (ap-south-1)', () => {
    expect(existsSync('vercel.json')).toBe(true);
    expect(JSON.parse(readFileSync('vercel.json', 'utf8')).regions).toEqual(['bom1']);
  });
});
