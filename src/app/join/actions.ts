'use server';

import { getSessionUser } from '@/lib/auth/session';
import { insertMember } from '@/lib/members/repo';
import { submitMemberCore, type SubmitResult } from '@/lib/members/submit';

export async function submitMember(input: unknown): Promise<SubmitResult> {
  try {
    return await submitMemberCore({ getUser: getSessionUser, insert: insertMember }, input);
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
