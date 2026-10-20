// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { JoinButton } from '@/components/session/JoinButton';
import { hasAuthCookie, loadSession, refreshSession, resetSession } from '@/lib/session/store';

beforeEach(() => resetSession());
afterEach(cleanup);

const COOKIE = 'theme=x; sb-jbldqvkthpbzjmfyyegm-auth-token=abc';
const reply = (body: unknown, ok = true) => vi.fn(async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 }));

describe('hasAuthCookie', () => {
  test('finds the Supabase auth cookie, including its chunked form', () => {
    expect(hasAuthCookie(COOKIE)).toBe(true);
    expect(hasAuthCookie('a=1; sb-abc-auth-token.0=xyz; b=2')).toBe(true);
  });
  test('not fooled by other cookies', () => {
    expect(hasAuthCookie('')).toBe(false);
    expect(hasAuthCookie('theme=dark; sb-something-else=1')).toBe(false);
    expect(hasAuthCookie('x-sb-abc-auth-token=1')).toBe(false);
  });
});

describe('loadSession', () => {
  test('a visitor with no sign-in cookie is "signed out" with NO request at all', async () => {
    const f = reply({});
    await loadSession({ cookie: 'theme=dark', fetchImpl: f as unknown as typeof fetch });
    expect(f).not.toHaveBeenCalled();
  });

  test('a signed-in browser asks /api/session once, and not again on the next call', async () => {
    const f = reply({ state: 'member', name: 'Anu', handle: 'anu', role: 'editor', hasPhoto: true });
    await loadSession({ cookie: COOKIE, fetchImpl: f as unknown as typeof fetch });
    await loadSession({ cookie: COOKIE, fetchImpl: f as unknown as typeof fetch });
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0]).toEqual(['/api/session', expect.objectContaining({ cache: 'no-store' })]);
  });

  test('refreshSession asks again (after they just joined, say)', async () => {
    const f = reply({ state: 'signed-out' });
    await loadSession({ cookie: COOKIE, fetchImpl: f as unknown as typeof fetch });
    await loadSession({ cookie: COOKIE, fetchImpl: f as unknown as typeof fetch, force: true });
    expect(f).toHaveBeenCalledTimes(2);
    void refreshSession;
  });

  test('a failed request leaves them a visitor — never pretends someone is signed in', async () => {
    await loadSession({ cookie: COOKIE, fetchImpl: (async () => Promise.reject(new Error('offline'))) as typeof fetch });
    render(<JoinButton />);
    expect(screen.getByRole('link', { name: 'Join the kootam' })).toHaveAttribute('href', '/join');
  });
});

describe('JoinButton: the main button knows who is looking', () => {
  const show = async (body: unknown) => {
    render(<JoinButton>Join as a creator</JoinButton>);
    await act(async () => {
      await loadSession({ cookie: COOKIE, fetchImpl: reply(body) as unknown as typeof fetch, force: true });
    });
  };

  test('before anything is known it is exactly what a visitor sees (so cached HTML matches)', () => {
    render(<JoinButton>Join as a creator</JoinButton>);
    expect(screen.getByRole('link', { name: 'Join as a creator' })).toHaveAttribute('href', '/join');
  });

  test('a signed-out visitor: join', async () => {
    await show({ state: 'signed-out' });
    expect(screen.getByRole('link', { name: 'Join as a creator' })).toHaveAttribute('href', '/join');
  });

  test('signed in but not joined: finish joining, back at the room step', async () => {
    await show({ state: 'no-member', name: 'Anu' });
    expect(screen.getByRole('link', { name: 'Finish joining' })).toHaveAttribute('href', '/join?step=lane');
    expect(screen.queryByText('Join as a creator')).toBeNull();
  });

  test('a member: their pass — not another invitation to join', async () => {
    await show({ state: 'member', name: 'Anu', handle: 'anu', role: 'editor', hasPhoto: false });
    expect(screen.getByRole('link', { name: 'Your pass' })).toHaveAttribute('href', '/me');
    expect(screen.queryByText(/join/i)).toBeNull();
  });
});
