import { NextRequest } from 'next/server';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { proxy } from '@/proxy';

const auth = vi.hoisted(() => ({ user: null as Record<string, unknown> | null }));
vi.mock('@supabase/ssr', async (orig) => ({
  ...(await orig<typeof import('@supabase/ssr')>()),
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: auth.user }, error: null }) } }),
}));

const ADMIN = { email: 'gowthamdas04@gmail.com', email_confirmed_at: '2026-10-14T00:00:00Z', app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }] };
const MEMBER = { ...ADMIN, email: 'someone@gmail.com' };
const live = () => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
  vi.stubEnv('ADMIN_EMAILS', 'gowthamdas04@gmail.com');
};

afterEach(() => vi.unstubAllEnvs());

describe('proxy', () => {
  test('a malformed Supabase URL does not take /join down', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not a url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await proxy(new NextRequest('http://localhost/join'));
    expect(res.status).toBe(200);
  });

  test('no Supabase config passes straight through', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    const res = await proxy(new NextRequest('http://localhost/join'));
    expect(res.status).toBe(200);
  });

  test('an admin who lands on /join (straight from Google sign-in, or typed) is sent to the admin panel', async () => {
    live();
    auth.user = ADMIN;
    for (const path of ['/join', '/join?step=lane']) {
      const res = await proxy(new NextRequest(`http://localhost${path}`));
      expect(res.status).toBe(307);
      expect(new URL(res.headers.get('location')!).pathname).toBe('/admin');
    }
  });

  test('members and signed-out visitors still get /join', async () => {
    live();
    for (const user of [MEMBER, null]) {
      auth.user = user;
      expect((await proxy(new NextRequest('http://localhost/join'))).status).toBe(200);
    }
  });

  test('an admin still reaches /admin itself', async () => {
    live();
    auth.user = ADMIN;
    expect((await proxy(new NextRequest('http://localhost/admin'))).status).toBe(200);
  });
});
