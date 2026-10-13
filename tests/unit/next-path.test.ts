import { describe, expect, test } from 'vitest';
import { safeNextPath } from '@/lib/auth/next-path';

describe('safeNextPath (open-redirect guard on the OAuth callback)', () => {
  test('keeps a same-site path with its query', () => expect(safeNextPath('/join?step=lane')).toBe('/join?step=lane'));
  test.each(['https://evil.com', '//evil.com', '/\\evil.com', '/\t/evil.com', 'javascript:alert(1)'])('%s falls back to /join', (raw) =>
    expect(safeNextPath(raw)).toBe('/join'),
  );
  test('null falls back', () => expect(safeNextPath(null)).toBe('/join'));
  test('takes a custom fallback', () => expect(safeNextPath('//x', '/me')).toBe('/me'));
});

describe('safeNextPath — dot-segment bypasses (Phase 2 review)', () => {
  test.each(['/.//evil.com', '/..//evil.com', '/%2e//evil.com', '/a/..//evil.com/x?y=1'])('%s falls back', (raw) =>
    expect(safeNextPath(raw)).toBe('/join'),
  );
  test('a normal nested path still works', () => expect(safeNextPath('/me?tab=pass#top')).toBe('/me?tab=pass#top'));
});
