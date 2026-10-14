import type { Lane } from '@/config/brand';
import { isAdminUser, type AdminQuery } from '@/lib/auth/admin';
import type { MemberStatus } from '@/lib/members/types';

// The admin panel's rows: everyone who has signed in with Google, joined to their member
// record if they finished joining. Pure, so it is tested without a database.

/** The fields of a Supabase auth user the panel needs. */
export type AuthUserLite = {
  id: string;
  email?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: { provider?: string } | null;
  identities?: { provider: string }[] | null;
};

export type MemberLite = {
  id: string;
  user_id: string;
  display_name: string;
  instagram: string;
  role: Lane;
  role_other_text: string | null;
  city: string;
  tags: string[];
  portfolio_url: string | null;
  show_on_wall: boolean;
  status: MemberStatus;
  created_at: string;
};

export type AdminPerson = {
  userId: string;
  email: string;
  /** The name on their Google account. */
  name: string | null;
  signedUpAt: string;
  lastSignInAt: string | null;
  isAdmin: boolean;
  member: MemberLite | null;
};

const text = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

export function buildPeople(users: AuthUserLite[], members: MemberLite[], allow: string[]): AdminPerson[] {
  const byUser = new Map(members.map((m) => [m.user_id, m]));
  return users.map((u) => ({
    userId: u.id,
    email: u.email ?? '',
    name: text(u.user_metadata?.full_name) ?? text(u.user_metadata?.name),
    signedUpAt: u.created_at,
    lastSignInAt: u.last_sign_in_at ?? null,
    isAdmin: isAdminUser({ ...u, email: u.email ?? null }, allow),
    member: byUser.get(u.id) ?? null,
  }));
}

export function filterPeople(people: AdminPerson[], q: AdminQuery): AdminPerson[] {
  const needle = q.q.toLowerCase();
  return people
    .filter((p) => {
      if (q.view === 'notjoined' && p.member) return false;
      if (q.view === 'other' && p.member?.role !== 'other') return false;
      if (q.lane !== 'all' && p.member?.role !== q.lane) return false;
      if (!needle) return true;
      return [p.email, p.name, p.member?.display_name, p.member?.instagram].some((f) => f?.toLowerCase().includes(needle));
    })
    .sort((a, b) => (q.sort === 'old' ? 1 : -1) * a.signedUpAt.localeCompare(b.signedUpAt) || a.userId.localeCompare(b.userId));
}

export type PeopleTally = { signedIn: number; notJoined: number; creators: number; editors: number; other: number; flagged: number; removed: number };

/** Lane counts are active members only, as on the public roll call. */
export function tallyPeople(people: AdminPerson[]): PeopleTally {
  const active = (role: Lane) => people.filter((p) => p.member?.status === 'active' && p.member.role === role).length;
  return {
    signedIn: people.length,
    notJoined: people.filter((p) => !p.member).length,
    creators: active('creator'),
    editors: active('editor'),
    other: active('other'),
    flagged: people.filter((p) => p.member?.status === 'flagged').length,
    removed: people.filter((p) => p.member?.status === 'removed').length,
  };
}

/** What someone is, in a word or two — for the table and the export. */
export function describePerson(p: AdminPerson, roomName: (lane: Lane) => string): string {
  const what = p.member
    ? p.member.role === 'other' && p.member.role_other_text
      ? `${roomName('other')}: ${p.member.role_other_text}`
      : roomName(p.member.role)
    : 'Not joined yet';
  return p.isAdmin ? `Admin · ${what}` : what;
}
