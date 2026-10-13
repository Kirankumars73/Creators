import { describe, expect, test } from 'vitest';
import { requestOrigin } from '@/lib/site';

const h = (init: Record<string, string>) => new Headers(init);

describe('requestOrigin', () => {
  test('behind Vercel: forwarded host and proto', () =>
    expect(requestOrigin(h({ 'x-forwarded-host': 'creatorskootam.in', 'x-forwarded-proto': 'https', host: 'internal' }), 'x')).toBe(
      'https://creatorskootam.in',
    ));
  test('a preview deployment uses its own host', () =>
    expect(requestOrigin(h({ host: 'ck-git-main.vercel.app' }), 'https://creatorskootam.in')).toBe('https://ck-git-main.vercel.app'));
  test('localhost is plain http', () => expect(requestOrigin(h({ host: 'localhost:3100' }), 'x')).toBe('http://localhost:3100'));
  test('no host header falls back', () => expect(requestOrigin(h({}), 'https://creatorskootam.in')).toBe('https://creatorskootam.in'));
  test('a malformed host is not trusted', () => expect(requestOrigin(h({ host: 'evil.com/path?x' }), 'https://creatorskootam.in')).toBe('https://creatorskootam.in'));
});
