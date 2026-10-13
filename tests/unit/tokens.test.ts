import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { TOKENS } from '@/config/tokens';
import { findBans } from '../../scripts/check-bans.mjs';

function rootHexTokens(css: string): Record<string, string> {
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  return Object.fromEntries(
    [...root.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)].map((m) => [m[1], m[2]!.toUpperCase()]),
  );
}

describe('token layer', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');

  test('globals.css :root hex tokens and TOKENS are the same set with the same values', () => {
    const upper = Object.fromEntries(Object.entries(TOKENS).map(([k, v]) => [k, v.toUpperCase()]));
    expect(rootHexTokens(css)).toEqual(upper);
  });

  test('values are §4.1 with the approved contrast fixes (chalk, chalk-mute)', () => {
    expect(TOKENS).toEqual({
      ink: '#0A0A0B',
      carbon: '#121215',
      graphite: '#1E1E24',
      rule: '#2E2E37',
      chalk: '#F2F3F5',
      'chalk-dim': '#9B9BA3',
      'chalk-mute': '#85858F',
      rosso: '#E4261C',
      'rosso-deep': '#9E1009',
      mustard: '#F2B705',
      lumen: '#C6F24E',
      mint: '#7FD4B8',
      focus: '#7FD4B8',
    });
  });

  test('no token trips the aesthetic ban', () => {
    for (const [name, hex] of Object.entries(TOKENS)) {
      expect(findBans(`--${name}: ${hex};`, 'src/app/globals.css')).toEqual([]);
    }
  });

  test('the default Tailwind palette is switched off', () => {
    expect(css).toMatch(/--color-\*:\s*initial/);
  });
});
