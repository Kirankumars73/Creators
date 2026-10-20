import type { SessionUser } from '@/lib/auth/session';
import type { MemberRow } from './types';

export type ProfileReason = 'unauthenticated' | 'no_member' | 'invalid' | 'inactive' | 'off_wall' | 'unknown';

export type ProfileDeps = {
  getUser(): Promise<SessionUser | null>;
  getMember(): Promise<MemberRow | null>;
  /** Writes only `profile_public` on the member's own row; returns rows changed. */
  update(id: string, patch: Pick<MemberRow, 'profile_public'>): Promise<number>;
};

/** /me's switch for the public profile page. The row is the caller's own, read through RLS. */
export async function setProfilePublicCore(deps: ProfileDeps, value: boolean): Promise<{ ok: true } | { ok: false; reason: ProfileReason }> {
  const user = await deps.getUser();
  if (!user) return { ok: false, reason: 'unauthenticated' };
  if (typeof value !== 'boolean') return { ok: false, reason: 'invalid' };
  const member = await deps.getMember();
  if (!member) return { ok: false, reason: 'no_member' };
  if (member.status !== 'active') return { ok: false, reason: 'inactive' };
  if (value && !member.show_on_wall) return { ok: false, reason: 'off_wall' };
  const changed = await deps.update(member.id, { profile_public: value });
  return changed ? { ok: true } : { ok: false, reason: 'unknown' };
}
