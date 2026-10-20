'use server';

import { getSessionUser } from '@/lib/auth/session';
import { insertMember } from '@/lib/members/repo';
import { submitMemberCore, type SubmitResult } from '@/lib/members/submit';
import { refreshOnOk } from '@/lib/wall/revalidate';

export async function submitMember(input: unknown): Promise<SubmitResult> {
  try {
    // A new member appears on the wall (and in the counts) the moment they join.
    return refreshOnOk(await submitMemberCore({ getUser: getSessionUser, insert: insertMember }, input));
  } catch (err) {
    console.error('[join] submitMember', err);
    return { ok: false, error: 'unknown' };
  }
}
