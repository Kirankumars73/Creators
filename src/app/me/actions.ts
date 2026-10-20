'use server';

import type { Lane } from '@/config/brand';
import { getSessionUser } from '@/lib/auth/session';
import { updateMember } from '@/lib/members/repo';
import { setProfilePublicCore, type ProfileReason } from '@/lib/members/profile';
import { setPhotoPublicCore, type PhotoResult } from '@/lib/photos/actions';
import { photoDeps } from '@/lib/photos/deps';
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

export async function setProfilePublic(value: boolean): Promise<{ ok: true } | { ok: false; reason: ProfileReason }> {
  try {
    return await setProfilePublicCore({ getUser: getSessionUser, getMember: getOwnMember, update: (id, patch) => updateMember(id, patch) }, value);
  } catch (err) {
    console.error('[me] setProfilePublic', err);
    return { ok: false, reason: 'unknown' };
  }
}

export async function setPhotoPublic(value: boolean): Promise<PhotoResult> {
  try {
    return await setPhotoPublicCore(photoDeps, value);
  } catch (err) {
    console.error('[me] setPhotoPublic', err);
    return { ok: false, reason: 'unknown' };
  }
}
