import { describe, expect, test, vi } from 'vitest';
import { readMemberCounts, readMemberProfile, readMemberWall } from '@/lib/wall/queries';

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

describe('readMemberWall (the directory: wall fields, plus district and crafts for public profiles)', () => {
  test('maps directory rows and marks joins from the last 24 hours', async () => {
    const rows = [
      { display_name: 'New One', instagram: 'new.one', role: 'editor', created_at: '2026-10-14T02:00:00Z', city: 'Thrissur', tags: ['davinci'], has_profile: true },
      { display_name: 'Old One', instagram: 'old.one', role: 'creator', created_at: '2026-10-10T02:00:00Z', city: null, tags: [], has_profile: false },
    ];
    expect(await readMemberWall(client(rows), NOW)).toEqual([
      { displayName: 'New One', instagram: 'new.one', role: 'editor', createdAt: '2026-10-14T02:00:00Z', isNew: true, city: 'Thrissur', tags: ['davinci'], hasProfile: true, hasPhoto: false },
      { displayName: 'Old One', instagram: 'old.one', role: 'creator', createdAt: '2026-10-10T02:00:00Z', isNew: false, city: null, tags: [], hasProfile: false, hasPhoto: false },
    ]);
  });

  test('asks the directory for at most the limit', async () => {
    const c = client([]);
    await readMemberWall(c, NOW, 50);
    expect(c.rpc).toHaveBeenCalledWith('member_directory', { max_rows: 50 });
  });

  test('before migration 0005 reaches the database it falls back to the plain wall, with no details', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const rpc = vi.fn(async (fn: string) =>
      fn === 'member_directory'
        ? { data: null, error: { code: 'PGRST202', message: 'Could not find the function' } }
        : { data: [{ display_name: 'Old One', instagram: 'old.one', role: 'creator', created_at: '2026-10-10T02:00:00Z' }], error: null },
    );
    expect(await readMemberWall({ rpc }, NOW)).toEqual([
      { displayName: 'Old One', instagram: 'old.one', role: 'creator', createdAt: '2026-10-10T02:00:00Z', isNew: false, city: null, tags: [], hasProfile: false, hasPhoto: false },
    ]);
    expect(rpc).toHaveBeenLastCalledWith('member_wall', { max_rows: 500 });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('apply migration 0005'));
  });

  test('no Supabase → null', async () => expect(await readMemberWall(null, NOW)).toBeNull());
});

describe('readMemberProfile', () => {
  const row = {
    display_name: 'Kit Maker',
    instagram: 'kit.maker',
    role: 'other',
    role_other_text: 'Colourist',
    created_at: '2026-10-10T02:00:00Z',
    city: 'Kochi',
    tags: [],
    portfolio_url: 'https://example.com/reel',
    has_profile: true,
  };

  test('maps the profile row', async () =>
    expect(await readMemberProfile(client([row]), 'kit.maker')).toEqual({
      displayName: 'Kit Maker',
      instagram: 'kit.maker',
      role: 'other',
      roleOtherText: 'Colourist',
      createdAt: '2026-10-10T02:00:00Z',
      city: 'Kochi',
      tags: [],
      portfolioUrl: 'https://example.com/reel',
      hasProfile: true,
      hasPhoto: false,
    }));

  test('nobody by that handle → "missing"', async () => expect(await readMemberProfile(client([]), 'nobody')).toBe('missing'));

  test('a handle that could never exist is not even looked up', async () => {
    const c = client([row]);
    expect(await readMemberProfile(c, '../etc')).toBe('missing');
    expect(c.rpc).not.toHaveBeenCalled();
  });

  test('database trouble → null (the page says it did not load, not "nobody")', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await readMemberProfile(client(null, { message: 'down' }), 'kit.maker')).toBeNull();
    expect(await readMemberProfile(null, 'kit.maker')).toBeNull();
  });
});

describe('photos in the directory and profile reads', () => {
  test('has_photo comes through; a database without migration 0006 simply has none', async () => {
    const row = { display_name: 'A', instagram: 'a', role: 'creator', created_at: '2026-10-10T02:00:00Z', has_photo: true };
    expect((await readMemberWall(client([row]), NOW))![0]).toMatchObject({ hasPhoto: true });
    const before0006 = { display_name: 'A', instagram: 'a', role: 'creator', created_at: '2026-10-10T02:00:00Z' };
    expect((await readMemberWall(client([before0006]), NOW))![0]).toMatchObject({ hasPhoto: false });
    expect(await readMemberProfile(client([{ ...row, role_other_text: null, portfolio_url: null }]), 'a')).toMatchObject({ hasPhoto: true });
  });
});
