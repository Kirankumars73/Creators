import { describe, expect, test, vi } from 'vitest';

const calls: Record<string, unknown[]> = {};
const chain = (result: { data: unknown; error: unknown }) => {
  const c: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'neq', 'order', 'limit']) c[m] = (...a: unknown[]) => ((calls[m] = a), c);
  c.then = (res: (v: unknown) => unknown) => res(result);
  return c;
};
vi.mock('@/lib/supabase/admin', () => ({ createAdminSupabase: () => ({ from: () => chain({ data: [{ id: '1' }], error: null }) }) }));
vi.mock('server-only', () => ({}));

describe('listBriefsFor', () => {
  test('asks only for the safe columns, for that handle (lower-cased), archived left out', async () => {
    const { listBriefsFor } = await import('@/lib/briefs/repo');
    expect(await listBriefsFor('Anu.K')).toEqual([{ id: '1' }]);
    expect(calls.select).toEqual(['id, brand, contact_name, brief, created_at']);
    expect(calls.eq).toEqual(['for_instagram', 'anu.k']);
    expect(calls.neq).toEqual(['status', 'archived']);
    expect(String(calls.select![0])).not.toMatch(/email|phone/);
  });
});
