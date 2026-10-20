import { beforeAll, describe, expect, test } from 'vitest';
import { createTestDb, insertRow, memberFixture, type TestDb } from './harness';

let db: TestDb;
beforeAll(async () => {
  db = await createTestDb();
});

async function seed(overrides: Record<string, unknown>) {
  const user = await db.addUser();
  return db.asService((q) => insertRow(q, 'public.members', memberFixture(user.id, overrides)));
}

describe('member profiles: details only for members who chose a public profile', () => {
  test('profile_public starts off for every member (existing members agreed only to the wall)', async () => {
    const row = await seed({ instagram: 'default.off' });
    expect(row.profile_public).toBe(false);
  });

  test('the directory shows wall members; district and crafts only when the profile is public', async () => {
    await seed({ instagram: 'public.one', city: 'Thrissur', tags: ['Reels'], profile_public: true });
    await seed({ instagram: 'private.one', city: 'Kollam', tags: ['Food'] });
    const res = await db.asAnon((q) => q<Record<string, unknown>>('select * from public.member_directory()'));
    const pub = res.rows.find((r) => r.instagram === 'public.one')!;
    const priv = res.rows.find((r) => r.instagram === 'private.one')!;
    expect(pub).toMatchObject({ city: 'Thrissur', tags: ['Reels'], has_profile: true });
    expect(priv).toMatchObject({ city: null, tags: [], has_profile: false });
    for (const row of res.rows) {
      expect(Object.keys(row).sort()).toEqual(['city', 'created_at', 'display_name', 'has_profile', 'instagram', 'role', 'tags']);
    }
  });

  test('the directory never lists opted-out, flagged or removed members', async () => {
    await seed({ instagram: 'off.wall', show_on_wall: false, profile_public: true });
    await seed({ instagram: 'flagged.p', status: 'flagged', profile_public: true });
    await seed({ instagram: 'removed.p', status: 'removed', profile_public: true });
    const res = await db.asAnon((q) => q<{ instagram: string }>('select instagram from public.member_directory()'));
    const handles = res.rows.map((r) => r.instagram);
    for (const h of ['off.wall', 'flagged.p', 'removed.p']) expect(handles).not.toContain(h);
  });

  test('a public profile reads by handle, case-insensitively, with portfolio and what they do — never email', async () => {
    await seed({ instagram: 'kit.maker', role: 'other', role_other_text: 'Colourist', city: 'Kochi', tags: [], portfolio_url: 'https://example.com/reel', profile_public: true });
    const res = await db.asAnon((q) => q<Record<string, unknown>>('select * from public.member_profile($1)', ['Kit.Maker']));
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0]).toMatchObject({ instagram: 'kit.maker', role_other_text: 'Colourist', city: 'Kochi', portfolio_url: 'https://example.com/reel', has_profile: true });
    expect(JSON.stringify(res.rows[0])).not.toMatch(/@example\.com/);
  });

  test('a wall member without a public profile gets only the wall fields', async () => {
    await seed({ instagram: 'wall.only', city: 'Kannur', portfolio_url: 'https://example.com/x' });
    const res = await db.asAnon((q) => q<Record<string, unknown>>('select * from public.member_profile($1)', ['wall.only']));
    expect(res.rows[0]).toMatchObject({ instagram: 'wall.only', city: null, portfolio_url: null, role_other_text: null, has_profile: false });
  });

  test('members off the wall have no profile at all', async () => {
    await seed({ instagram: 'hidden.kit', show_on_wall: false, profile_public: true });
    const res = await db.asAnon((q) => q('select * from public.member_profile($1)', ['hidden.kit']));
    expect(res.rows).toHaveLength(0);
  });

  test('a member still cannot flip their own row from the browser (writes stay server-only)', async () => {
    const user = await db.addUser();
    await db.asService((q) => insertRow(q, 'public.members', memberFixture(user.id, { instagram: 'self.flip' })));
    await expect(
      db.asUser(user, (q) => q('update public.members set profile_public = true where user_id = $1', [user.id])),
    ).rejects.toMatchObject({ code: '42501' });
  });
});

describe('briefs addressed to one member', () => {
  test('a brief can name the member it is for, and the handle must look like one', async () => {
    const brief = { brand: 'Malabar Café', contact_name: 'Anjali', email: 'a@malabar.cafe' };
    await expect(db.asService((q) => insertRow(q, 'public.brand_briefs', { ...brief, for_instagram: 'kit.maker' }))).resolves.toMatchObject({
      for_instagram: 'kit.maker',
    });
    await expect(db.asService((q) => insertRow(q, 'public.brand_briefs', { ...brief, for_instagram: 'not a handle!' }))).rejects.toThrow();
  });
});
