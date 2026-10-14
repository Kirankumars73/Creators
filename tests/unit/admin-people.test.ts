import { describe, expect, test } from 'vitest';
import { buildPeople, filterPeople, tallyPeople, type AuthUserLite, type MemberLite } from '@/lib/admin/people';
import { parseAdminQuery } from '@/lib/auth/admin';

const google = { app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }], email_confirmed_at: '2026-10-14T00:00:00Z' };
const users: AuthUserLite[] = [
  { id: 'u1', email: 'anu@gmail.com', created_at: '2026-10-14T05:00:00Z', last_sign_in_at: '2026-10-14T09:00:00Z', user_metadata: { full_name: 'Anu' }, ...google },
  { id: 'u2', email: 'ravi@gmail.com', created_at: '2026-10-14T06:00:00Z', last_sign_in_at: '2026-10-14T06:00:00Z', user_metadata: { full_name: 'Ravi' }, ...google },
  { id: 'u3', email: 'Gowthamdas04@gmail.com', created_at: '2026-10-14T07:00:00Z', last_sign_in_at: null, user_metadata: { name: 'Gowtham' }, ...google },
  { id: 'u4', email: 'meera@gmail.com', created_at: '2026-10-14T08:00:00Z', last_sign_in_at: '2026-10-14T08:00:00Z', user_metadata: {}, ...google },
];
const member = (over: Partial<MemberLite>): MemberLite => ({
  id: 'm', user_id: 'u', display_name: 'x', instagram: 'x', role: 'creator', role_other_text: null, city: 'Kochi', tags: [], portfolio_url: null,
  show_on_wall: true, status: 'active', created_at: '2026-10-14T05:05:00Z', ...over,
});
const members: MemberLite[] = [
  member({ id: 'm1', user_id: 'u1', display_name: 'Anu K', instagram: 'anu.shoots', role: 'creator' }),
  member({ id: 'm2', user_id: 'u2', display_name: 'Ravi', instagram: 'ravicuts', role: 'editor', status: 'flagged' }),
  member({ id: 'm4', user_id: 'u4', display_name: 'Meera', instagram: 'meera.writes', role: 'other', role_other_text: 'Writer' }),
];
const allow = ['gowthamdas04@gmail.com'];
const people = buildPeople(users, members, allow);

describe('buildPeople — everyone who signed in, with what they are', () => {
  test('every sign-in is a row; members carry their record, the rest have none', () => {
    expect(people.map((p) => [p.email, p.member?.role ?? null])).toEqual([
      ['anu@gmail.com', 'creator'],
      ['ravi@gmail.com', 'editor'],
      ['Gowthamdas04@gmail.com', null],
      ['meera@gmail.com', 'other'],
    ]);
  });

  test('admins are marked (case-insensitive), and names come from Google', () => {
    expect(people.find((p) => p.userId === 'u3')).toMatchObject({ isAdmin: true, name: 'Gowtham', lastSignInAt: null });
    expect(people.find((p) => p.userId === 'u1')).toMatchObject({ isAdmin: false, name: 'Anu' });
  });
});

describe('filterPeople', () => {
  const run = (sp: Record<string, string>) => filterPeople(people, parseAdminQuery(sp)).map((p) => p.userId);
  test('newest sign-in first by default, oldest on request', () => {
    expect(run({})).toEqual(['u4', 'u3', 'u2', 'u1']);
    expect(run({ sort: 'old' })).toEqual(['u1', 'u2', 'u3', 'u4']);
  });
  test('"not joined" lists the sign-ins without a member record', () => expect(run({ view: 'notjoined' })).toEqual(['u3']));
  test('the other queue and lane filters only keep members', () => {
    expect(run({ view: 'other' })).toEqual(['u4']);
    expect(run({ lane: 'editor' })).toEqual(['u2']);
  });
  test('search matches email, Google name, display name or handle', () => {
    expect(run({ q: 'ravi@gmail' })).toEqual(['u2']);
    expect(run({ q: 'GOWTHAM' })).toEqual(['u3']);
    expect(run({ q: 'meera.writes' })).toEqual(['u4']);
  });
});

describe('tallyPeople', () => {
  test('counts sign-ins, the not-joined, and active members per lane', () =>
    expect(tallyPeople(people)).toEqual({ signedIn: 4, notJoined: 1, creators: 1, editors: 0, other: 1, flagged: 1, removed: 0 }));
});
