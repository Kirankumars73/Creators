import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

export type Query = PGlite['query'];
export type TestUser = { id: string; email: string };

export type TestDb = {
  pg: PGlite;
  addUser(u?: Partial<TestUser>): Promise<TestUser>;
  asAnon<T>(fn: (q: Query) => Promise<T>): Promise<T>;
  asUser<T>(u: TestUser, fn: (q: Query) => Promise<T>): Promise<T>;
  asService<T>(fn: (q: Query) => Promise<T>): Promise<T>;
};

const MIGRATIONS = 'supabase/migrations';

/** A fresh in-process Postgres with the Supabase shim and every migration applied in order. */
export async function createTestDb(opts: { serviceRoleDefaults?: boolean } = {}): Promise<TestDb> {
  const pg = new PGlite();
  let shim = readFileSync(join(import.meta.dirname, 'supabase-shim.sql'), 'utf8');
  // Simulate a project whose default privileges don't cover service_role.
  if (opts.serviceRoleDefaults === false) shim = shim.replaceAll(', authenticated, service_role;', ', authenticated;');
  await pg.exec(shim);
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await pg.exec(readFileSync(join(MIGRATIONS, file), 'utf8'));
  }

  const query: Query = pg.query.bind(pg) as Query;

  async function as<T>(role: string, claims: Record<string, unknown> | null, fn: (q: Query) => Promise<T>) {
    await pg.query(`select set_config('request.jwt.claims', $1, false)`, [claims ? JSON.stringify(claims) : '']);
    await pg.exec(`set role ${role}`);
    try {
      return await fn(query);
    } finally {
      await pg.exec('reset role');
      await pg.query(`select set_config('request.jwt.claims', '', false)`);
    }
  }

  return {
    pg,
    async addUser(u = {}) {
      const user = { id: u.id ?? randomUUID(), email: u.email ?? `${randomUUID().slice(0, 8)}@example.com` };
      await pg.query('insert into auth.users (id, email) values ($1, $2)', [user.id, user.email]);
      return user;
    },
    asAnon: (fn) => as('anon', { role: 'anon' }, fn),
    asUser: (u, fn) => as('authenticated', { sub: u.id, email: u.email, role: 'authenticated' }, fn),
    asService: (fn) => as('service_role', { role: 'service_role' }, fn),
  };
}

/** A valid creator row for `userId`; override any column. */
export function memberFixture(userId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    user_id: userId,
    email: `${userId.slice(0, 8)}@example.com`,
    display_name: 'Gowtham Das',
    instagram: 'the.gowtham_das',
    role: 'creator',
    city: 'Ernakulam',
    accepted_code: true,
    ...overrides,
  };
}

/** `insert into <table> (...) values (...) returning *` from a plain object. */
export async function insertRow(q: Query, table: string, row: Record<string, unknown>) {
  const cols = Object.keys(row);
  const params = cols.map((_, i) => `$${i + 1}`).join(', ');
  const res = await q(`insert into ${table} (${cols.join(', ')}) values (${params}) returning *`, Object.values(row));
  return res.rows[0] as Record<string, unknown>;
}
