import { describe, expect, test, vi } from 'vitest';
import { setProfilePublicCore } from '@/lib/members/profile';
import type { MemberRow } from '@/lib/members/types';

const user = { id: 'u1', email: 'a@example.com', name: 'A', avatarUrl: null };
const member = { id: 'm1', user_id: 'u1', status: 'active', show_on_wall: true, profile_public: false } as MemberRow;

const deps = (over: Partial<Parameters<typeof setProfilePublicCore>[0]> = {}) => ({
  getUser: vi.fn(async () => user),
  getMember: vi.fn(async () => member),
  update: vi.fn(async () => 1),
  ...over,
});

describe('turning your public profile on and off (from /me)', () => {
  test('a member can switch it on; only that one column is written, on their own row', async () => {
    const d = deps();
    await expect(setProfilePublicCore(d, true)).resolves.toEqual({ ok: true });
    expect(d.update).toHaveBeenCalledWith('m1', { profile_public: true });
  });

  test('…and off again', async () => {
    const d = deps({ getMember: vi.fn(async () => ({ ...member, profile_public: true })) });
    await expect(setProfilePublicCore(d, false)).resolves.toEqual({ ok: true });
    expect(d.update).toHaveBeenCalledWith('m1', { profile_public: false });
  });

  test('signed out, not a member, or not a boolean: nothing is written', async () => {
    for (const [d, input, reason] of [
      [deps({ getUser: vi.fn(async () => null) }), true, 'unauthenticated'],
      [deps({ getMember: vi.fn(async () => null) }), true, 'no_member'],
      [deps(), 'yes', 'invalid'],
    ] as const) {
      await expect(setProfilePublicCore(d, input as unknown as boolean)).resolves.toEqual({ ok: false, reason });
      expect(d.update).not.toHaveBeenCalled();
    }
  });

  test('a member who is off the wall cannot switch a profile on (a profile lives on the wall)', async () => {
    const d = deps({ getMember: vi.fn(async () => ({ ...member, show_on_wall: false })) });
    await expect(setProfilePublicCore(d, true)).resolves.toEqual({ ok: false, reason: 'off_wall' });
    expect(d.update).not.toHaveBeenCalled();
  });

  test('a flagged member cannot change it', async () => {
    const d = deps({ getMember: vi.fn(async () => ({ ...member, status: 'flagged' as const })) });
    await expect(setProfilePublicCore(d, true)).resolves.toEqual({ ok: false, reason: 'inactive' });
  });
});
