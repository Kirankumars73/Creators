import type { MemberRow } from '@/lib/members/types';
import { resolveInviteLinks, type ResolvedLinks, type WaLinks } from './resolve';

export const RATE_LIMIT = { max: 10, windowMs: 600_000 } as const;

export type InviteDeps = {
  getUserId(): Promise<string | null>;
  getMemberByUserId(userId: string): Promise<MemberRow | null>;
  /** Count of this member's `community` reveals since `since`. */
  countRecentReveals(memberId: string, since: Date): Promise<number>;
  logReveals(memberId: string, keys: string[]): Promise<void>;
  wa: WaLinks;
  now(): Date;
};

export type InviteOk = ResolvedLinks;
export type InviteError = 'unauthenticated' | 'inactive' | 'no_member' | 'rate_limited';
export type InviteResponse =
  | { status: 200; body: InviteOk }
  | { status: 401 | 403 | 404 | 429; body: { error: InviteError } };

/**
 * Hands a member their two WhatsApp links. Takes no request input at all:
 * the lane comes from the member row, so a client can't name its own lane.
 */
export async function handleInvite(deps: InviteDeps): Promise<InviteResponse> {
  const userId = await deps.getUserId();
  if (!userId) return { status: 401, body: { error: 'unauthenticated' } };

  const member = await deps.getMemberByUserId(userId);
  if (!member) return { status: 404, body: { error: 'no_member' } };
  if (member.status !== 'active') return { status: 403, body: { error: 'inactive' } };

  const since = new Date(deps.now().getTime() - RATE_LIMIT.windowMs);
  if ((await deps.countRecentReveals(member.id, since)) >= RATE_LIMIT.max) {
    return { status: 429, body: { error: 'rate_limited' } };
  }

  const links = resolveInviteLinks(member.role, deps.wa);
  await deps.logReveals(member.id, links.laneKey ? ['community', links.laneKey] : ['community']);
  return { status: 200, body: links };
}
