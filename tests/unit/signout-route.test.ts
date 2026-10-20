import { NextRequest } from 'next/server';
import { afterEach, describe, expect, test, vi } from 'vitest';

const supa = vi.hoisted(() => ({ signOut: vi.fn(async () => ({ error: null })) }));
vi.mock('@/lib/supabase/server', () => ({ createServerSupabase: async () => ({ auth: { signOut: supa.signOut } }) }));
vi.mock('@/lib/supabase/config', () => ({ supabasePublicConfig: () => ({ url: 'https://x.supabase.co', anonKey: 'k' }) }));

afterEach(() => supa.signOut.mockClear());

const post = (headers: Record<string, string>) => new NextRequest('https://creators-kootam.vercel.app/auth/signout', { method: 'POST', headers });

describe('POST /auth/signout', () => {
  test('signs out and sends them to the home page', async () => {
    const { POST } = await import('@/app/auth/signout/route');
    const res = await POST(post({ origin: 'https://creators-kootam.vercel.app' }));
    expect(supa.signOut).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(303);
    expect(new URL(res.headers.get('location')!).pathname).toBe('/');
  });

  test('another site can not sign someone out (Origin is checked first)', async () => {
    const { POST } = await import('@/app/auth/signout/route');
    expect((await POST(post({ origin: 'https://evil.example' }))).status).toBe(403);
    expect((await POST(post({}))).status).toBe(403);
    expect(supa.signOut).not.toHaveBeenCalled();
  });

  test('if Supabase fails it still sends them home rather than showing an error page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    supa.signOut.mockRejectedValueOnce(new Error('down'));
    const { POST } = await import('@/app/auth/signout/route');
    expect((await POST(post({ origin: 'https://creators-kootam.vercel.app' }))).status).toBe(303);
  });
});
