import { describe, expect, test } from 'vitest';
import { handleInvite, RATE_LIMIT, type InviteDeps } from '@/lib/invite/handler';
import type { MemberRow } from '@/lib/members/types';

const NOW = new Date('2026-10-13T12:00:00Z');
const wa = {
  community: 'https://chat.whatsapp.com/COMM',
  creators: 'https://chat.whatsapp.com/CRE',
  editors: 'https://chat.whatsapp.com/EDI',
  other: null,
};

function member(overrides: Partial<MemberRow> = {}): MemberRow {
  return {
    id: 'member-1',
    user_id: 'user-1',
    email: 'g@example.com',
    display_name: 'Gowtham Das',
    avatar_url: null,
    instagram: 'the.gowtham_das',
    role: 'creator',
    role_other_text: null,
    city: 'Ernakulam',
    tags: [],
    portfolio_url: null,
    show_on_wall: true,
    profile_public: false,
    photo_path: null,
    photo_public: false,
    accepted_code: true,
    status: 'active',
    role_changes: 0,
    created_at: NOW.toISOString(),
    updated_at: NOW.toISOString(),
    ...overrides,
  };
}

function fakeDeps(overrides: Partial<InviteDeps> = {}) {
  const logged: string[][] = [];
  const sinceSeen: Date[] = [];
  const deps: InviteDeps = {
    getUserId: async () => 'user-1',
    getMemberByUserId: async () => member(),
    countRecentReveals: async (_id, since) => {
      sinceSeen.push(since);
      return 0;
    },
    logReveals: async (_id, keys) => {
      logged.push(keys);
    },
    wa,
    now: () => NOW,
    ...overrides,
  };
  return { deps, logged, sinceSeen };
}

describe('POST /api/invite handler (§8)', () => {
  test('no session → 401 (§8 test 1)', async () => {
    const { deps } = fakeDeps({ getUserId: async () => null });
    expect(await handleInvite(deps)).toEqual({ status: 401, body: { error: 'unauthenticated' } });
  });

  test('session but no member row → 404 (§8 test 2)', async () => {
    const { deps } = fakeDeps({ getMemberByUserId: async () => null });
    expect(await handleInvite(deps)).toEqual({ status: 404, body: { error: 'no_member' } });
  });

  test('a creator gets community + CONTENT CREATORS and never the editors link (§8 test 3)', async () => {
    const { deps } = fakeDeps();
    const res = await handleInvite(deps);
    expect(res).toEqual({ status: 200, body: { community: wa.community, lane: wa.creators, laneKey: 'creators' } });
    expect(JSON.stringify(res)).not.toContain('EDI');
  });

  test('an editor gets EDITORS (§8 test 4)', async () => {
    const { deps } = fakeDeps({ getMemberByUserId: async () => member({ role: 'editor' }) });
    const res = await handleInvite(deps);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ lane: wa.editors, laneKey: 'editors' });
  });

  test.each(['flagged', 'removed'] as const)('a %s member gets 403 and nothing is logged', async (status) => {
    const { deps, logged } = fakeDeps({ getMemberByUserId: async () => member({ status }) });
    expect(await handleInvite(deps)).toEqual({ status: 403, body: { error: 'inactive' } });
    expect(logged).toEqual([]);
  });

  test(`the ${RATE_LIMIT.max + 1}th request inside ten minutes is rate limited`, async () => {
    const { deps, logged } = fakeDeps({ countRecentReveals: async () => 10 });
    expect(await handleInvite(deps)).toEqual({ status: 429, body: { error: 'rate_limited' } });
    expect(logged).toEqual([]);
  });

  test('nine recent requests is still fine, and the window is the last ten minutes', async () => {
    const { deps, sinceSeen } = fakeDeps();
    deps.countRecentReveals = async (id, since) => {
      sinceSeen.push(since);
      return 9;
    };
    expect((await handleInvite(deps)).status).toBe(200);
    expect(sinceSeen[0]!.getTime()).toBe(NOW.getTime() - 600_000);
  });

  test('every reveal is logged per link handed out', async () => {
    const creator = fakeDeps();
    await handleInvite(creator.deps);
    expect(creator.logged).toEqual([['community', 'creators']]);

    const other = fakeDeps({ getMemberByUserId: async () => member({ role: 'other', role_other_text: 'DOP' }) });
    await handleInvite(other.deps);
    expect(other.logged).toEqual([['community']]);
  });
});
