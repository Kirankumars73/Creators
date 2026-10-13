import type { Lane } from '@/config/brand';
import type { SessionUser } from '@/lib/auth/session';
import { isLane } from '@/lib/join/step';
import type { MemberRow } from './types';

export type ChangeReason = 'used' | 'inactive' | 'same' | 'invalid' | 'unauthenticated' | 'no_member' | 'unknown';

export function canChangeRole(
  m: Pick<MemberRow, 'role' | 'role_changes' | 'status'>,
  next: Lane,
): { ok: true } | { ok: false; reason: 'used' | 'inactive' | 'same' } {
  if (m.status !== 'active') return { ok: false, reason: 'inactive' };
  if (m.role_changes >= 1) return { ok: false, reason: 'used' };
  if (m.role === next) return { ok: false, reason: 'same' };
  return { ok: true };
}

export type ChangeLaneDeps = {
  getUser(): Promise<SessionUser | null>;
  getMember(): Promise<MemberRow | null>;
  /** Returns rows changed; `guard` makes the update conditional. */
  update(
    id: string,
    patch: Pick<MemberRow, 'role' | 'role_other_text' | 'role_changes' | 'tags'>,
    guard: Pick<MemberRow, 'role_changes'>,
  ): Promise<number>;
};

export async function changeLaneCore(
  deps: ChangeLaneDeps,
  input: { role: Lane; roleOtherText?: string },
): Promise<{ ok: true } | { ok: false; reason: ChangeReason }> {
  const user = await deps.getUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };
  if (!isLane(input.role)) return { ok: false, reason: 'invalid' };
  const text = input.roleOtherText?.trim() ?? '';
  const n = [...text].length;
  if (input.role === 'other' && (n < 2 || n > 60)) return { ok: false, reason: 'invalid' };

  const member = await deps.getMember();
  if (!member) return { ok: false, reason: 'no_member' };
  const allowed = canChangeRole(member, input.role);
  if (!allowed.ok) return allowed;

  // Guarded on role_changes = 0: two racing tabs can't both spend the one change.
  const changed = await deps.update(
    member.id,
    { role: input.role, role_other_text: input.role === 'other' ? text : null, role_changes: 1, tags: [] },
    { role_changes: 0 },
  );
  return changed ? { ok: true } : { ok: false, reason: 'used' };
}
