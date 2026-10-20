import { describe, expect, test } from 'vitest';
import { reasonStatus, sameOrigin } from '@/lib/photos/http';

const req = (headers: Record<string, string>) => new Request('https://creators-kootam.vercel.app/api/photo/me', { method: 'POST', headers });

describe('sameOrigin: only our own pages may change a photo', () => {
  test('accepts a request whose Origin is this site', () => expect(sameOrigin(req({ origin: 'https://creators-kootam.vercel.app' }))).toBe(true));
  test('refuses another site, a lookalike, or no Origin at all', () => {
    expect(sameOrigin(req({ origin: 'https://evil.example' }))).toBe(false);
    expect(sameOrigin(req({ origin: 'https://creators-kootam.vercel.app.evil.example' }))).toBe(false);
    expect(sameOrigin(req({}))).toBe(false);
    expect(sameOrigin(req({ origin: 'null' }))).toBe(false);
  });
  test('behind a proxy it compares with the forwarded host', () => {
    expect(sameOrigin(new Request('http://internal:3000/api/photo/me', { method: 'POST', headers: { origin: 'https://example.in', 'x-forwarded-host': 'example.in' } }))).toBe(true);
  });
});

describe('reasonStatus', () => {
  test('each reason maps to an honest status', () => {
    expect(reasonStatus('unauthenticated')).toBe(401);
    expect(reasonStatus('no_member')).toBe(404);
    expect(reasonStatus('inactive')).toBe(403);
    expect(reasonStatus('not_an_image')).toBe(415);
    expect(reasonStatus('too_big')).toBe(413);
    expect(reasonStatus('no_google_photo')).toBe(404);
    expect(reasonStatus('unavailable')).toBe(502);
    expect(reasonStatus('unknown')).toBe(500);
  });
});
