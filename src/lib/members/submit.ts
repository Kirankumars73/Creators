import type { SessionUser } from '@/lib/auth/session';
import { buildMemberInsert, mapInsertError } from './row';
import { memberInputSchema } from './schema';
import type { MemberInsert } from './types';

export type SubmitResult =
  | { ok: true; alreadyMember: boolean }
  | { ok: false; error: 'unauthenticated' | 'invalid' | 'unknown'; fieldErrors?: Record<string, string> };

export type SubmitDeps = {
  getUser(): Promise<SessionUser | null>;
  insert(row: MemberInsert): Promise<{ errorCode: string | null }>;
};

export async function submitMemberCore(deps: SubmitDeps, input: unknown): Promise<SubmitResult> {
  const user = await deps.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  const parsed = memberInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: 'invalid', fieldErrors };
  }

  const { errorCode } = await deps.insert(buildMemberInsert(user, parsed.data));
  if (!errorCode) return { ok: true, alreadyMember: false };
  const mapped = mapInsertError(errorCode);
  if (mapped === 'unknown') console.error('[join] member insert failed', errorCode);
  return mapped === 'already_member' ? { ok: true, alreadyMember: true } : { ok: false, error: mapped };
}
