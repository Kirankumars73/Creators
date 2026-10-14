import { beforeEach, describe, expect, test, vi } from 'vitest';

// Supabase's auth client reads Date.now() as soon as it is created (it checks the session's
// expiry). Under Cache Components, cookies() alone still allows a runtime prerender, where
// Date.now() is an error ("unstable value `Date.now()` while prerendering") on every signed-in
// request. connection() must resolve before the client exists.
const order: string[] = [];

vi.mock('next/server', () => ({
  connection: vi.fn(async () => {
    await Promise.resolve();
    order.push('connection');
  }),
}));
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => {
    order.push('cookies');
    return { getAll: () => [], set: () => {} };
  }),
}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => {
    order.push('createServerClient');
    return {};
  }),
}));
vi.mock('@/lib/supabase/config', () => ({ supabasePublicConfig: () => ({ url: 'https://x.supabase.co', anonKey: 'anon' }) }));

describe('createServerSupabase', () => {
  beforeEach(() => {
    order.length = 0;
  });

  test('waits for connection() before creating the Supabase client', async () => {
    const { createServerSupabase } = await import('@/lib/supabase/server');
    await createServerSupabase();
    expect(order).toContain('connection');
    expect(order.indexOf('connection')).toBeLessThan(order.indexOf('createServerClient'));
  });
});
