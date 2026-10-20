import { beforeAll, describe, expect, test } from 'vitest';
import { createTestDb, insertRow, type TestDb } from './harness';

let db: TestDb;
beforeAll(async () => {
  db = await createTestDb();
});

const brief = { brand: 'Malabar Café', contact_name: 'Anjali Menon', email: 'anjali@malabar.cafe' };

describe('brand_briefs: written and read by the server only', () => {
  test('the service role can insert and read a brief; it starts as new', async () => {
    const row = await db.asService((q) => insertRow(q, 'public.brand_briefs', brief));
    expect(row).toMatchObject({ ...brief, status: 'new', phone: null, brief: null });
  });

  test('anon can neither read nor write briefs (a public key must not dump brand contacts)', async () => {
    await expect(db.asAnon((q) => q('select * from public.brand_briefs'))).rejects.toMatchObject({ code: '42501' });
    await expect(db.asAnon((q) => insertRow(q, 'public.brand_briefs', brief))).rejects.toMatchObject({ code: '42501' });
  });

  test('signed-in members can neither read nor write briefs', async () => {
    const u = await db.addUser();
    await expect(db.asUser(u, (q) => q('select * from public.brand_briefs'))).rejects.toMatchObject({ code: '42501' });
    await expect(db.asUser(u, (q) => insertRow(q, 'public.brand_briefs', brief))).rejects.toMatchObject({ code: '42501' });
  });

  test('the table itself rejects junk the form would have caught', async () => {
    await expect(db.asService((q) => insertRow(q, 'public.brand_briefs', { ...brief, email: 'nope' }))).rejects.toThrow();
    await expect(db.asService((q) => insertRow(q, 'public.brand_briefs', { ...brief, brief: 'a'.repeat(1501) }))).rejects.toThrow();
    await expect(db.asService((q) => insertRow(q, 'public.brand_briefs', { ...brief, brand: 'x' }))).rejects.toThrow();
  });

  test('grants hold even on a project whose defaults skip service_role', async () => {
    const strict = await createTestDb({ serviceRoleDefaults: false });
    await expect(strict.asService((q) => insertRow(q, 'public.brand_briefs', brief))).resolves.toMatchObject({ status: 'new' });
  });
});
