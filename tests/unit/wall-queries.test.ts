import { describe, expect, test, vi } from 'vitest';
import { readMemberCounts, readMemberWall } from '@/lib/wall/queries';

const client = (data: unknown, error: unknown = null) => ({ rpc: vi.fn(async () => ({ data, error })) });
const NOW = new Date('2026-10-14T12:00:00Z');

describe('readMemberCounts (Review Focus 5: Supabase down must not break the page)', () => {
  test('no Supabase configured → null', async () => expect(await readMemberCounts(null)).toBeNull());
  test('an RPC error → null', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await readMemberCounts(client(null, { message: 'down' }))).toBeNull();
  });
  test('maps the counts row', async () =>
    expect(await readMemberCounts(client([{ total: 147, creators: 89, editors: 51, other: 7 }]))).toEqual({
      total: 147,
      creators: 89,
      editors: 51,
      other: 7,
    }));
  test('a thrown network error → null', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await readMemberCounts({ rpc: vi.fn(async () => Promise.reject(new Error('fetch failed'))) })).toBeNull();
  });
});

describe('readMemberWall', () => {
  test('maps rows and marks joins from the last 24 hours', async () => {
    const rows = [
      { display_name: 'New One', instagram: 'new.one', role: 'editor', created_at: '2026-10-14T02:00:00Z' },
      { display_name: 'Old One', instagram: 'old.one', role: 'creator', created_at: '2026-10-10T02:00:00Z' },
    ];
    expect(await readMemberWall(client(rows), NOW)).toEqual([
      { displayName: 'New One', instagram: 'new.one', role: 'editor', createdAt: '2026-10-14T02:00:00Z', isNew: true },
      { displayName: 'Old One', instagram: 'old.one', role: 'creator', createdAt: '2026-10-10T02:00:00Z', isNew: false },
    ]);
  });
  test('asks for at most the limit', async () => {
    const c = client([]);
    await readMemberWall(c, NOW, 50);
    expect(c.rpc).toHaveBeenCalledWith('member_wall', { max_rows: 50 });
  });
  test('no Supabase → null', async () => expect(await readMemberWall(null, NOW)).toBeNull());
});
