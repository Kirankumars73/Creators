import { beforeAll, describe, expect, test } from 'vitest';
import { createTestDb, insertRow, memberFixture, type TestDb } from './harness';

let db: TestDb;
beforeAll(async () => {
  db = await createTestDb();
});

const insertMember = (row: Record<string, unknown>) => db.asService((q) => insertRow(q, 'public.members', row));

describe('members constraints (§8 schema)', () => {
  test("role 'other' with no role_other_text is rejected (§8 test 5)", async () => {
    const u = await db.addUser();
    await expect(insertMember(memberFixture(u.id, { role: 'other', role_other_text: null }))).rejects.toMatchObject({ code: '23514' });
  });

  test("role 'other' needs 2–60 chars of text", async () => {
    const a = await db.addUser();
    await expect(insertMember(memberFixture(a.id, { role: 'other', role_other_text: 'x' }))).rejects.toMatchObject({ code: '23514' });
    const b = await db.addUser();
    await expect(insertMember(memberFixture(b.id, { role: 'other', role_other_text: 'DOP' }))).resolves.toMatchObject({ role: 'other' });
  });

  test('accepted_code false is rejected (§8 test 6)', async () => {
    const u = await db.addUser();
    await expect(insertMember(memberFixture(u.id, { accepted_code: false }))).rejects.toMatchObject({ code: '23514' });
  });

  test('instagram check accepts a real handle and rejects URLs and spaces (§8 test 7)', async () => {
    const ok = await db.addUser();
    await expect(insertMember(memberFixture(ok.id, { instagram: 'the.gowtham_das' }))).resolves.toMatchObject({ instagram: 'the.gowtham_das' });
    for (const bad of ['https://instagram.com/x', 'a b']) {
      const u = await db.addUser();
      await expect(insertMember(memberFixture(u.id, { instagram: bad }))).rejects.toMatchObject({ code: '23514' });
    }
  });

  test('a second row for the same user_id is a unique violation (§8 test 8)', async () => {
    const u = await db.addUser();
    await insertMember(memberFixture(u.id));
    await expect(insertMember(memberFixture(u.id, { instagram: 'someone.else' }))).rejects.toMatchObject({ code: '23505' });
  });

  test('a lane can change at most once', async () => {
    const u = await db.addUser();
    await expect(insertMember(memberFixture(u.id, { role_changes: 2 }))).rejects.toMatchObject({ code: '23514' });
  });

  test('defaults: active, on the wall, no role changes, no tags', async () => {
    const u = await db.addUser();
    const row = await insertMember(memberFixture(u.id));
    expect(row).toMatchObject({ status: 'active', show_on_wall: true, role_changes: 0, tags: [] });
  });

  test('updated_at advances on update', async () => {
    const u = await db.addUser();
    const row = await insertMember(memberFixture(u.id, { updated_at: '2026-01-01T00:00:00Z' }));
    const updated = await db.asService((q) =>
      q<{ updated_at: Date }>('update public.members set display_name = $1 where id = $2 returning updated_at', ['New Name', row.id]),
    );
    expect(updated.rows[0]!.updated_at.getTime()).toBeGreaterThan(new Date('2026-01-01T00:00:00Z').getTime());
  });

  test('deleting the auth user cascades to members and link_reveals', async () => {
    const u = await db.addUser();
    const row = await insertMember(memberFixture(u.id));
    await db.asService((q) => insertRow(q, 'public.link_reveals', { member_id: row.id, link_key: 'community' }));
    await db.pg.query('delete from auth.users where id = $1', [u.id]);
    const left = await db.pg.query<{ n: number }>(
      `select (select count(*) from public.members where user_id = $1)::int
            + (select count(*) from public.link_reveals where member_id = $2)::int as n`,
      [u.id, row.id],
    );
    expect(left.rows[0]!.n).toBe(0);
  });
});
