import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/env.server', () => ({
  getServerEnv: () => {
    throw new Error('Server env is missing or invalid: WA_EDITORS_URL');
  },
}));
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => null }));
vi.mock('@/lib/members/repo', () => ({}));

afterEach(() => vi.restoreAllMocks());

describe('POST /api/invite failure path', () => {
  test('a server misconfiguration answers 503 no-store and is logged for whoever runs it', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await import('@/app/api/invite/route');
    const res = await POST();
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(log).toHaveBeenCalledWith('[api/invite]', expect.any(Error));
  });

  test('missing env says "not_configured", so the page can say so instead of blaming the connection', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } = await import('@/app/api/invite/route');
    expect(await (await POST()).json()).toEqual({ error: 'not_configured' });
  });
});
