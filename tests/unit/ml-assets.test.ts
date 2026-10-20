import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { ML } from '@/i18n/ml';

const manifest = JSON.parse(readFileSync('src/assets/ml/manifest.json', 'utf8')) as Record<string, { text: string; width: number; height: number }>;

describe('pre-rendered Malayalam images (next/og cannot shape Malayalam)', () => {
  test.each(Object.entries(ML).filter(([, e]) => e.ml))('%s is rendered from the current string — run `pnpm render:ml` after editing ml.ts', (key, entry) => {
    expect(manifest[key]?.text).toBe(entry.ml);
    expect(existsSync(`src/assets/ml/${key}.png`)).toBe(true);
  });

  test('the wall-writing render matches the wordmark — run `pnpm render:ml --wall` after editing it', () => {
    expect(manifest['wordmark-wall']?.text).toBe(ML.wordmark.ml);
    expect(existsSync('public/brand/ml/wordmark-wall.png')).toBe(true);
  });
});
