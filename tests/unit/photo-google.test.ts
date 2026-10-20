import { describe, expect, test, vi } from 'vitest';
import { fetchGoogleAvatar, isGoogleAvatarUrl, upsizeGoogleAvatar } from '@/lib/photos/google';

describe('isGoogleAvatarUrl: the server only ever fetches Google’s own image host', () => {
  test.each([
    'https://lh3.googleusercontent.com/a/ACg8ocJ=s96-c',
    'https://lh4.googleusercontent.com/-abc/photo.jpg',
    'https://lh3.googleusercontent.com/a-/AOh14Gg',
  ])('accepts %s', (u) => expect(isGoogleAvatarUrl(u)).toBe(true));

  test.each([
    'http://lh3.googleusercontent.com/a/x', // not https
    'https://googleusercontent.com.evil.example/a/x', // suffix trick
    'https://evil.example/lh3.googleusercontent.com/x',
    'https://lh3.googleusercontent.com@evil.example/x', // userinfo trick
    'https://127.0.0.1/x',
    'https://localhost/x',
    'https://169.254.169.254/latest/meta-data',
    'https://lh3.googleusercontent.com:8443/x', // odd port
    'file:///etc/passwd',
    'javascript:alert(1)',
    '',
    'not a url',
  ])('refuses %s', (u) => expect(isGoogleAvatarUrl(u)).toBe(false));
});

describe('upsizeGoogleAvatar', () => {
  test('asks Google for a big square instead of the 96px default', () => {
    expect(upsizeGoogleAvatar('https://lh3.googleusercontent.com/a/ACg8=s96-c')).toBe('https://lh3.googleusercontent.com/a/ACg8=s800-c');
    expect(upsizeGoogleAvatar('https://lh3.googleusercontent.com/a/ACg8')).toBe('https://lh3.googleusercontent.com/a/ACg8=s800-c');
  });
});

const png = new Uint8Array([137, 80, 78, 71]);
const ok = (bytes: Uint8Array, headers: Record<string, string> = {}) => new Response(bytes as unknown as BodyInit, { status: 200, headers });

describe('fetchGoogleAvatar', () => {
  test('returns the bytes of an allowed url', async () => {
    const f = vi.fn(async () => ok(png));
    const r = await fetchGoogleAvatar('https://lh3.googleusercontent.com/a/x=s96-c', f as unknown as typeof fetch);
    expect(r).toEqual({ ok: true, bytes: png });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://lh3.googleusercontent.com/a/x=s800-c');
    expect(init.redirect).toBe('error'); // a redirect could lead off Google's host
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  test('never calls fetch for a url off the allowlist', async () => {
    const f = vi.fn();
    expect(await fetchGoogleAvatar('https://169.254.169.254/x', f as unknown as typeof fetch)).toEqual({ ok: false, error: 'unavailable' });
    expect(f).not.toHaveBeenCalled();
  });

  test('a failed or non-200 answer is "unavailable", never a throw', async () => {
    expect(await fetchGoogleAvatar('https://lh3.googleusercontent.com/a/x', (async () => new Response('', { status: 404 })) as typeof fetch)).toEqual({ ok: false, error: 'unavailable' });
    expect(await fetchGoogleAvatar('https://lh3.googleusercontent.com/a/x', (async () => Promise.reject(new Error('net'))) as typeof fetch)).toEqual({ ok: false, error: 'unavailable' });
  });

  test('an oversized answer is refused (declared length, or actual bytes)', async () => {
    const big = new Uint8Array(7 * 1024 * 1024);
    expect(await fetchGoogleAvatar('https://lh3.googleusercontent.com/a/x', (async () => ok(png, { 'content-length': String(big.length) })) as typeof fetch)).toEqual({ ok: false, error: 'too_big' });
    expect(await fetchGoogleAvatar('https://lh3.googleusercontent.com/a/x', (async () => ok(big)) as typeof fetch)).toEqual({ ok: false, error: 'too_big' });
  });
});
