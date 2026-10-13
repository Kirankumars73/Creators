import { NextRequest } from 'next/server';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { proxy } from '@/proxy';

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
});
