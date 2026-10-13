import { describe, expect, test, vi } from 'vitest';
import { canChangeRole, changeLaneCore } from '@/lib/members/role-change';
import type { MemberRow } from '@/lib/members/types';

const member = { id: 'm1', role: 'creator', role_changes: 0, status: 'active' } as MemberRow;
const user = { id: 'u1', email: 'g@example.com', name: null, avatarUrl: null };

describe('canChangeRole — one lane change, ever', () => {
  test('a first change is allowed', () => expect(canChangeRole(member, 'editor')).toEqual({ ok: true }));
  test('a second is not', () => expect(canChangeRole({ ...member, role_changes: 1 }, 'editor')).toEqual({ ok: false, reason: 'used' }));
  test('flagged members cannot', () => expect(canChangeRole({ ...member, status: 'flagged' }, 'editor')).toEqual({ ok: false, reason: 'inactive' }));
  test('moving to the lane you are in is a no-op', () => expect(canChangeRole(member, 'creator')).toEqual({ ok: false, reason: 'same' }));
});

describe('changeLaneCore', () => {
  const deps = (over: Partial<Parameters<typeof changeLaneCore>[0]> = {}) => ({
    getUser: async () => user,
    getMember: async () => member,
    update: vi.fn(async () => 1),
    ...over,
  });

  test('moves lane, spends the one change, clears lane-specific tags', async () => {
    const d = deps();
    expect(await changeLaneCore(d, { role: 'editor' })).toEqual({ ok: true });
    expect(d.update).toHaveBeenCalledWith('m1', { role: 'editor', role_other_text: null, role_changes: 1, tags: [] }, { role_changes: 0 });
  });

  test('other needs 2–60 characters of what they do', async () => {
    const d = deps();
    expect(await changeLaneCore(d, { role: 'other', roleOtherText: 'x' })).toEqual({ ok: false, reason: 'invalid' });
    expect(d.update).not.toHaveBeenCalled();
    expect(await changeLaneCore(d, { role: 'other', roleOtherText: ' DOP ' })).toEqual({ ok: true });
    expect(d.update).toHaveBeenLastCalledWith('m1', expect.objectContaining({ role: 'other', role_other_text: 'DOP' }), { role_changes: 0 });
  });

  test('two tabs racing: the second finds the change already spent', async () => {
    expect(await changeLaneCore(deps({ update: vi.fn(async () => 0) }), { role: 'editor' })).toEqual({ ok: false, reason: 'used' });
  });

  test('a made-up lane is rejected', async () => {
    expect(await changeLaneCore(deps(), { role: 'admin' as never })).toEqual({ ok: false, reason: 'invalid' });
  });

  test('signed out', async () => {
    expect(await changeLaneCore(deps({ getUser: async () => null }), { role: 'editor' })).toEqual({ ok: false, reason: 'unauthenticated' });
  });
});
