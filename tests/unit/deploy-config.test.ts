import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { shouldRefreshTriggers } from '@/lib/film/scrub';

describe('F5 — functions run next to the database', () => {
  test('Vercel functions are pinned to Mumbai (bom1), where Supabase lives (ap-south-1)', () => {
    expect(existsSync('vercel.json')).toBe(true);
    expect(JSON.parse(readFileSync('vercel.json', 'utf8')).regions).toEqual(['bom1']);
  });
});

describe('F7 — only real layout changes re-measure scroll triggers', () => {
  test('a phone URL bar showing/hiding (small height-only change) does not', () =>
    expect(shouldRefreshTriggers({ w: 390, h: 7000 }, { w: 390, h: 7056 })).toBe(false));
  test('a width change does', () => expect(shouldRefreshTriggers({ w: 390, h: 7000 }, { w: 844, h: 4000 })).toBe(true));
  test('a section growing (fonts, roll call) does', () => expect(shouldRefreshTriggers({ w: 390, h: 7000 }, { w: 390, h: 7400 })).toBe(true));
  test('the first measurement does', () => expect(shouldRefreshTriggers(null, { w: 390, h: 7000 })).toBe(true));
});
