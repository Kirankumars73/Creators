import { afterEach, describe, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({ user: null as null | { id: string; email: string; name: string | null; avatarUrl: string | null }, member: null as unknown, throwMember: false }));
vi.mock('@/lib/auth/session', () => ({ getSessionUser: async () => state.user }));
vi.mock('@/lib/members/self', () => ({
  getOwnMember: async () => {
    if (state.throwMember) throw new Error('db down');
    return state.member;
  },
}));

afterEach(() => {
  state.user = null;
  state.member = null;
  state.throwMember = false;
  vi.restoreAllMocks();
});

const call = async () => {
  const { GET } = await import('@/app/api/session/route');
  const res = await GET();
  return { res, body: await res.json() };
};

describe('GET /api/session — who is looking at the site', () => {
  test('signed out: says so, and never touches the member table', async () => {
    const { res, body } = await call();
    expect(body).toEqual({ state: 'signed-out' });
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });

  test('signed in but not joined yet: "no-member", with their first name for the header', async () => {
    state.user = { id: 'u1', email: 'a@example.com', name: 'Anu Krishna', avatarUrl: null };
    expect((await call()).body).toEqual({ state: 'no-member', name: 'Anu Krishna' });
  });

  test('a member: handle, name, room and whether they have a photo — never the email, user id or photo path', async () => {
    state.user = { id: 'u1', email: 'secret@example.com', name: 'Anu', avatarUrl: 'https://lh3.googleusercontent.com/a/x' };
    state.member = { id: 'm1', user_id: 'u1', email: 'secret@example.com', display_name: 'Anu K', instagram: 'anu.shoots', role: 'editor', status: 'active', photo_path: 'm1/secret-path.jpg', photo_public: false, avatar_url: 'https://lh3.googleusercontent.com/a/x' };
    const { body } = await call();
    expect(body).toEqual({ state: 'member', name: 'Anu K', handle: 'anu.shoots', role: 'editor', hasPhoto: true });
    expect(JSON.stringify(body)).not.toMatch(/secret|m1|googleusercontent/);
  });

  test('a member on hold is still "member" (they can sign out and see their pass page), not "signed-out"', async () => {
    state.user = { id: 'u1', email: 'a@example.com', name: 'A', avatarUrl: null };
    state.member = { display_name: 'A B', instagram: 'a.b', role: 'creator', status: 'flagged', photo_path: null };
    expect((await call()).body).toMatchObject({ state: 'member', handle: 'a.b', hasPhoto: false });
  });

  test('if the database is down it degrades to "no-member" rather than an error the header would show', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    state.user = { id: 'u1', email: 'a@example.com', name: 'A', avatarUrl: null };
    state.throwMember = true;
    const { res, body } = await call();
    expect(res.status).toBe(200);
    expect(body.state).toBe('no-member');
  });
});
