'use server';

import type { Lane } from '@/config/brand';
import { getSessionUser } from '@/lib/auth/session';
import { updateMember } from '@/lib/members/repo';
import { changeLaneCore, type ChangeReason } from '@/lib/members/role-change';
import { getOwnMember } from '@/lib/members/self';

export async function changeLane(input: { role: Lane; roleOtherText?: string }): Promise<{ ok: true } | { ok: false; reason: ChangeReason }> {
  try {
    return await changeLaneCore({ getUser: getSessionUser, getMember: getOwnMember, update: updateMember }, input);
  } catch (err) {
    console.error('[me] changeLane', err);
    return { ok: false, reason: 'unknown' };
  }
}
