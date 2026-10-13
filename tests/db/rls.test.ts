import { beforeAll, describe, expect, test } from 'vitest';
import { createTestDb, insertRow, memberFixture, type TestDb, type TestUser } from './harness';

let db: TestDb;
beforeAll(async () => {
  db = await createTestDb();
});

async function seedMember(overrides: Record<string, unknown> = {}): Promise<{ user: TestUser; row: Record<string, unknown> }> {
  const user = await db.addUser();
  const row = await db.asService((q) => insertRow(q, 'public.members', memberFixture(user.id, overrides)));
  return { user, row };
}

describe('members RLS: reads own row only, writes are server-only', () => {
  test('anon cannot read members at all', async () => {
    await seedMember();
    await expect(db.asAnon((q) => q('select * from public.members'))).rejects.toMatchObject({ code: '42501' });
  });

  test('a signed-in user sees exactly their own row', async () => {
    const a = await seedMember();
    await seedMember();
    const res = await db.asUser(a.user, (q) => q<{ user_id: string }>('select user_id from public.members'));
    expect(res.rows).toEqual([{ user_id: a.user.id }]);
  });

  test('a flagged user cannot un-flag themselves or reset their lane change (Departure 3)', async () => {
    const a = await seedMember({ status: 'flagged', role_changes: 1 });
    await expect(
      db.asUser(a.user, (q) => q(`update public.members set status = 'active', role_changes = 0 where user_id = $1`, [a.user.id])),
    ).rejects.toMatchObject({ code: '42501' });
  });

  test('a signed-in user cannot insert or delete member rows', async () => {
    const u = await db.addUser();
    await expect(db.asUser(u, (q) => insertRow(q, 'public.members', memberFixture(u.id)))).rejects.toMatchObject({ code: '42501' });
    const a = await seedMember();
    await expect(db.asUser(a.user, (q) => q('delete from public.members where user_id = $1', [a.user.id]))).rejects.toMatchObject({
      code: '42501',
    });
  });
});

describe('member wall (§6.7, §8 test 10)', () => {
  test('anon gets only display_name, instagram, role, created_at — never email', async () => {
    await seedMember({ display_name: 'Wall Person', instagram: 'wall.person' });
    const res = await db.asAnon((q) => q<Record<string, unknown>>('select * from public.member_wall()'));
    expect(res.rows.length).toBeGreaterThan(0);
    for (const row of res.rows) expect(Object.keys(row).sort()).toEqual(['created_at', 'display_name', 'instagram', 'role']);
  });

  test('the wall leaves out opted-out, flagged and removed members', async () => {
    await seedMember({ instagram: 'hidden.one', show_on_wall: false });
    await seedMember({ instagram: 'flagged.one', status: 'flagged' });
    await seedMember({ instagram: 'removed.one', status: 'removed' });
    await seedMember({ instagram: 'shown.one' });
    const res = await db.asAnon((q) => q<{ instagram: string }>('select instagram from public.member_wall()'));
    const handles = res.rows.map((r) => r.instagram);
    expect(handles).toContain('shown.one');
    expect(handles).not.toContain('hidden.one');
    expect(handles).not.toContain('flagged.one');
    expect(handles).not.toContain('removed.one');
  });

  test('member_counts counts active members only, split by lane', async () => {
    const fresh = await createTestDb();
    for (const [role, status] of [['creator', 'active'], ['creator', 'active'], ['editor', 'active'], ['editor', 'removed']] as const) {
      const u = await fresh.addUser();
      await fresh.asService((q) => insertRow(q, 'public.members', memberFixture(u.id, { role, status })));
    }
    const res = await fresh.asAnon((q) => q('select * from public.member_counts()'));
    expect(res.rows[0]).toEqual({ total: 3, creators: 2, editors: 1, other: 0 });
  });
});

describe('link_reveals is server-only', () => {
  test('anon and signed-in users cannot write reveal logs; the service role can', async () => {
    const a = await seedMember();
    await expect(db.asAnon((q) => insertRow(q, 'public.link_reveals', { member_id: a.row.id, link_key: 'community' }))).rejects.toMatchObject({
      code: '42501',
    });
    await expect(
      db.asUser(a.user, (q) => insertRow(q, 'public.link_reveals', { member_id: a.row.id, link_key: 'community' })),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(db.asService((q) => insertRow(q, 'public.link_reveals', { member_id: a.row.id, link_key: 'community' }))).resolves.toMatchObject({
      link_key: 'community',
    });
  });
});
