// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SignIn } from '@/components/join/SignIn';
import { createBrowserSupabase } from '@/lib/supabase/browser';

vi.mock('@/lib/supabase/browser', () => ({ createBrowserSupabase: vi.fn(() => null) }));
afterEach(cleanup);

const base = { siteUrl: 'https://creatorskootam.in', currentUrl: 'https://creatorskootam.in/join' };

describe('SignIn', () => {
  test('a normal browser gets one Google button and the privacy line', () => {
    render(<SignIn {...base} inApp={{ inApp: false, app: null, platform: 'android' }} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByText('We read your name, email and profile photo. Nothing else. We never post anything.')).toBeInTheDocument();
  });

  test('Instagram on Android gets a way out to Chrome instead of a dead Google button', () => {
    render(<SignIn {...base} inApp={{ inApp: true, app: 'instagram', platform: 'android' }} />);
    expect(screen.queryByRole('button', { name: /continue with google/i })).toBeNull();
    const link = screen.getByRole('link', { name: /open in chrome/i });
    expect(link.getAttribute('href')).toMatch(/^intent:\/\//);
  });

  test('Instagram on iPhone gets instructions and a copy-link fallback', () => {
    render(<SignIn {...base} inApp={{ inApp: true, app: 'instagram', platform: 'ios' }} />);
    expect(screen.queryByRole('button', { name: /continue with google/i })).toBeNull();
    expect(screen.getByText(/open in external browser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
  });

  test('a failed Google round-trip says so', () => {
    render(<SignIn {...base} error inApp={{ inApp: false, app: null, platform: 'other' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/sign-in didn’t go through/i);
  });
});

describe('SignIn — runtime origin and Android fallback (Phase 2 review)', () => {
  test('Google sends people back to the origin they are actually on, not a build-time URL', async () => {
    const signInWithOAuth = vi.fn(async () => ({ error: null }));
    vi.mocked(createBrowserSupabase).mockReturnValue({ auth: { signInWithOAuth } } as never);
    render(<SignIn {...base} inApp={{ inApp: false, app: null, platform: 'other' }} />);
    await userEvent.click(screen.getByRole('button', { name: /continue with google/i }));
    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.objectContaining({ redirectTo: expect.stringMatching(new RegExp(`^${window.location.origin}/auth/callback`)) }) }),
    );
  });

  test('Android also gets the menu route to Chrome', () => {
    render(<SignIn {...base} inApp={{ inApp: true, app: 'instagram', platform: 'android' }} />);
    expect(screen.getByText(/open in chrome/i, { selector: 'p, p *' })).toBeInTheDocument();
  });
});
