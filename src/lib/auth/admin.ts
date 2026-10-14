import { LANES, type Lane } from '@/config/brand';
import type { MemberStatus } from '@/lib/members/types';

type MaybeAdmin = {
  email?: string | null;
  email_confirmed_at?: string | null;
  app_metadata?: { provider?: string } | null;
  identities?: { provider: string }[] | null;
} | null;

/**
 * Admin = on ADMIN_EMAILS, with a confirmed email, through a Google identity. The provider
 * check matters: if an email/password provider were ever switched on, someone could
 * otherwise sign up with the admin's address (Phase 2 review).
 */
export function isAdminUser(user: MaybeAdmin, allow: string[]): boolean {
  if (!user?.email || !user.email_confirmed_at || allow.length === 0) return false;
  const viaGoogle = user.app_metadata?.provider === 'google' || (user.identities ?? []).some((i) => i.provider === 'google');
  return viaGoogle && allow.includes(user.email.trim().toLowerCase());
}

export type AdminQuery = { lane: Lane | 'all'; q: string; sort: 'new' | 'old'; view: 'all' | 'other' | 'notjoined' };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export function parseAdminQuery(sp: Record<string, string | string[] | undefined>): AdminQuery {
  const lane = one(sp.lane);
  return {
    lane: (LANES as readonly string[]).includes(lane) ? (lane as Lane) : 'all',
    // What names, handles and emails are made of; nothing else (search runs in memory, never as a filter string).
    q: one(sp.q).replace(/[^\p{L}\p{M}\p{N}._@+ -]/gu, '').trim().slice(0, 60),
    sort: one(sp.sort) === 'old' ? 'old' : 'new',
    view: one(sp.view) === 'other' ? 'other' : one(sp.view) === 'notjoined' ? 'notjoined' : 'all',
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES: readonly MemberStatus[] = ['active', 'flagged', 'removed'];

/** Flag / remove / restore. Never deletes. Checks admin itself: server actions are public endpoints. */
export async function setMemberStatusCore(
  deps: { requireAdmin(): Promise<unknown>; update(id: string, status: MemberStatus): Promise<void> },
  id: string,
  status: MemberStatus,
): Promise<{ ok: boolean }> {
  await deps.requireAdmin();
  if (!UUID.test(id) || !STATUSES.includes(status)) return { ok: false };
  await deps.update(id, status);
  return { ok: true };
}
