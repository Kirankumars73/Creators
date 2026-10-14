import { describe, expect, test, vi } from 'vitest';
import { isAdminUser, parseAdminQuery, setMemberStatusCore } from '@/lib/auth/admin';

const google = { email: 'Gowtham@Example.com', email_confirmed_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }] };
const allow = ['gowtham@example.com'];

describe('isAdminUser', () => {
  test('a listed, confirmed Google account is an admin (case-insensitive)', () => expect(isAdminUser(google, allow)).toBe(true));
  test('an unlisted email is not', () => expect(isAdminUser({ ...google, email: 'someone@example.com' }, allow)).toBe(false));
  test('the right email via an email/password account is not (Phase 2 review)', () =>
    expect(isAdminUser({ ...google, app_metadata: { provider: 'email' }, identities: [{ provider: 'email' }] }, allow)).toBe(false));
  test('an unconfirmed email is not', () => expect(isAdminUser({ ...google, email_confirmed_at: null }, allow)).toBe(false));
  test('no user is not', () => expect(isAdminUser(null, allow)).toBe(false));
  test('an empty allow-list admits nobody', () => expect(isAdminUser(google, [])).toBe(false));
});

describe('parseAdminQuery', () => {
  test('defaults', () => expect(parseAdminQuery({})).toEqual({ lane: 'all', q: '', sort: 'new', view: 'all' }));
  test('reads valid values', () =>
    expect(parseAdminQuery({ lane: 'editor', q: ' gow ', sort: 'old', view: 'other' })).toEqual({ lane: 'editor', q: 'gow', sort: 'old', view: 'other' }));
  test('ignores junk and strips filter syntax from search', () =>
    expect(parseAdminQuery({ lane: 'admin', q: 'a%,(b)*', sort: 'x', view: 'y' })).toEqual({ lane: 'all', q: 'ab', sort: 'new', view: 'all' }));
  test('keeps what handles are made of', () => expect(parseAdminQuery({ q: 'the.gowtham_das' }).q).toBe('the.gowtham_das'));
  test('keeps what emails are made of, so admins can search by email', () =>
    expect(parseAdminQuery({ q: 'kiran+test@gmail.com' }).q).toBe('kiran+test@gmail.com'));
  test('has a view for people who signed in but never joined', () => expect(parseAdminQuery({ view: 'notjoined' }).view).toBe('notjoined'));
});

describe('setMemberStatusCore — server actions are public endpoints', () => {
  const id = '6b1f3c2e-0000-4000-8000-000000000001';
  test('a non-admin call rejects and writes nothing', async () => {
    const update = vi.fn();
    await expect(setMemberStatusCore({ requireAdmin: async () => Promise.reject(new Error('not admin')), update }, id, 'removed')).rejects.toThrow();
    expect(update).not.toHaveBeenCalled();
  });
  test('an admin can flag, remove and restore — never delete', async () => {
    const update = vi.fn(async () => {});
    for (const status of ['flagged', 'removed', 'active'] as const) {
      expect(await setMemberStatusCore({ requireAdmin: async () => ({}), update }, id, status)).toEqual({ ok: true });
    }
    expect(update).toHaveBeenLastCalledWith(id, 'active');
  });
  test('junk ids and statuses are refused', async () => {
    const update = vi.fn();
    expect(await setMemberStatusCore({ requireAdmin: async () => ({}), update }, 'not-a-uuid', 'removed')).toEqual({ ok: false });
    expect(await setMemberStatusCore({ requireAdmin: async () => ({}), update }, id, 'deleted' as never)).toEqual({ ok: false });
    expect(update).not.toHaveBeenCalled();
  });
});
