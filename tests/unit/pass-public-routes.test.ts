import { beforeEach, describe, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({ profile: null as unknown, photoThrows: false }));
vi.mock('@/lib/wall/cached', () => ({ getMemberProfile: async () => state.profile }));
vi.mock('@/lib/photos/storage', () => ({
  publicPhotoPath: async () => {
    if (state.photoThrows) throw new Error('no service key');
    return 'm1/p.jpg';
  },
  readPhotoObject: async () => null,
}));
vi.mock('@/lib/pass/image', () => ({
  passImage: async (pass: unknown, cache: string) => new Response(JSON.stringify(pass), { headers: { 'Cache-Control': cache } }),
}));

const profile = { displayName: 'Anu K', instagram: 'anu.k', role: 'editor', createdAt: '2026-10-14T10:00:00Z', hasPhoto: true, city: 'Kochi', tags: [], hasProfile: true };
beforeEach(() => {
  state.profile = profile;
  state.photoThrows = false;
});

const ctx = (handle: string) => ({ params: Promise.resolve({ handle }) }) as never;

describe('GET /api/pass/by/<handle>', () => {
  test('draws the pass from public fields only, short-cached', async () => {
    const { GET } = await import('@/app/api/pass/by/[handle]/route');
    const res = await GET(new Request('http://x'), ctx('anu.k'));
    const body = await res.json();
    expect(body).toMatchObject({ headline: 'Anu K', instagram: 'anu.k', role: 'editor', joined: '14.10.2026' });
    expect(JSON.stringify(body)).not.toMatch(/email|user_id|photo_path/);
    expect(res.headers.get('cache-control')).toContain('s-maxage=60');
  });

  test('a photo that cannot be read still gives a pass', async () => {
    state.photoThrows = true;
    const { GET } = await import('@/app/api/pass/by/[handle]/route');
    expect((await GET(new Request('http://x'), ctx('anu.k'))).status).toBe(200);
  });

  test('nobody by that handle (or not on the wall): 404, never cached', async () => {
    state.profile = 'missing';
    const { GET } = await import('@/app/api/pass/by/[handle]/route');
    const res = await GET(new Request('http://x'), ctx('ghost'));
    expect(res.status).toBe(404);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  test('a junk handle is a 404 before anything is looked up', async () => {
    const { GET } = await import('@/app/api/pass/by/[handle]/route');
    expect((await GET(new Request('http://x'), ctx('../etc'))).status).toBe(404);
  });

  test('the wall being unreachable is a 503, not a 404', async () => {
    state.profile = null;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { GET } = await import('@/app/api/pass/by/[handle]/route');
    expect((await GET(new Request('http://x'), ctx('anu.k'))).status).toBe(503);
  });
});

describe('GET /api/pass/sample', () => {
  test('a made-up pass in the asked room, defaulting to creator, cached for a day', async () => {
    const { GET } = await import('@/app/api/pass/sample/route');
    const editor = await (await GET(new Request('http://x/api/pass/sample?lane=editor'))).json();
    expect(editor).toMatchObject({ role: 'editor', headline: 'Your name', photoPath: null });
    const junk = await GET(new Request('http://x/api/pass/sample?lane=nope'));
    expect((await junk.json()).role).toBe('creator');
    expect(junk.headers.get('cache-control')).toContain('s-maxage=86400');
  });
});
