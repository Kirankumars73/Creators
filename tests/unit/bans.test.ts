import { describe, expect, test } from 'vitest';
import { findBans } from '../../scripts/check-bans.mjs';

describe('findBans', () => {
  test('flags a banned hex in any case', () => {
    expect(findBans('a{color:#cc785c}', 'a.css')[0]).toMatchObject({ kind: 'hex', line: 1 });
  });

  test('flags a warm near-neighbour of a banned hex', () => {
    expect(findBans('--chalk:#F2F3F0;', 'a.css')[0]?.kind).toBe('near-hex');
  });

  test('passes the approved palette', () => {
    for (const h of ['#0A0A0B', '#121215', '#1E1E24', '#2E2E37', '#F2F3F5', '#9B9BA3', '#85858F', '#E4261C', '#9E1009', '#F2B705', '#C6F24E', '#7FD4B8', '#FFFFFF']) {
      expect(findBans(`--t:${h};`, 'a.css')).toEqual([]);
    }
  });

  test('flags banned font families', () => {
    expect(findBans("font-family:'Styrene B'", 'a.css')[0]?.kind).toBe('font');
    expect(findBans('Tiempos Text', 'a.tsx')[0]?.kind).toBe('font');
  });

  test('flags the assistant brand only on user-facing paths', () => {
    expect(findBans('<p>Made with Claude</p>', 'src/app/x.tsx')[0]?.kind).toBe('brand');
    expect(findBans('Claude', 'docs/x.md')).toEqual([]);
  });

  test('reports the line number of the hit', () => {
    expect(findBans('a\nb\nc{color:#FAF9F5}', 'a.css')[0]?.line).toBe(3);
  });
});
