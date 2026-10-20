// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';
import { photoProblemText, sendPhoto } from '@/lib/photos/client';

const file = new File([new Uint8Array(500)], 'me.jpg', { type: 'image/jpeg' });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('sendPhoto', () => {
  test('a file goes up as multipart to /api/photo/me', async () => {
    const f = vi.fn(async () => json({ ok: true }));
    await expect(sendPhoto({ kind: 'file', file }, f as unknown as typeof fetch)).resolves.toEqual({ ok: true });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/photo/me');
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBeInstanceOf(Blob);
  });

  test('"use my Google photo" sends only the word google — never a url', async () => {
    const f = vi.fn(async () => json({ ok: true }));
    await sendPhoto({ kind: 'google' }, f as unknown as typeof fetch);
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ source: 'google' });
  });

  test('a refusal carries the server’s reason; a dead network is "network"; nothing throws', async () => {
    await expect(sendPhoto({ kind: 'google' }, (async () => json({ error: 'not_an_image' }, 415)) as typeof fetch)).resolves.toEqual({ ok: false, reason: 'not_an_image' });
    await expect(sendPhoto({ kind: 'google' }, (async () => new Response('x', { status: 500 })) as typeof fetch)).resolves.toEqual({ ok: false, reason: 'unknown' });
    await expect(sendPhoto({ kind: 'google' }, (async () => Promise.reject(new Error('offline'))) as typeof fetch)).resolves.toEqual({ ok: false, reason: 'network' });
  });
});

describe('photoProblemText', () => {
  test('known reasons are plain sentences; anything else gets the generic one', () => {
    expect(photoProblemText('too_big')).toMatch(/under 6 MB/);
    expect(photoProblemText('whatever')).toBe('That didn’t save. Try again.');
  });
});
