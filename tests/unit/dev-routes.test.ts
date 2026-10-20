import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => vi.unstubAllEnvs());

describe('dev-only preview routes are invisible in production', () => {
  test('/dev/badge', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { GET } = await import('@/app/dev/badge/route');
    expect((await GET(new Request('http://x/dev/badge'))).status).toBe(404);
  });
});
