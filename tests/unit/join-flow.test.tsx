// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { JoinFlow } from '@/components/join/JoinFlow';
import { resetCommunityOpened } from '@/lib/join/chip-store';
import type { InviteClientResult } from '@/lib/join/invite-client';
import type { SubmitResult } from '@/lib/members/submit';

const noInApp = { inApp: false, app: null, platform: 'other' } as const;
const okInvite: InviteClientResult = {
  status: 200,
  body: { community: 'https://chat.whatsapp.com/COMM', lane: 'https://chat.whatsapp.com/EDI', laneKey: 'editors' },
};

function props(overrides: Partial<Parameters<typeof JoinFlow>[0]> = {}) {
  return {
    initial: { step: 'lane' as const, lane: null },
    user: { name: 'Gowtham Das' },
    member: null,
    inApp: noInApp,
    currentUrl: 'http://localhost:3000/join',
    authError: false,
    submitMember: vi.fn(async (): Promise<SubmitResult> => ({ ok: true, alreadyMember: false })),
    fetchInvite: vi.fn(async () => okInvite),
    ...overrides,
  };
}

beforeEach(() => {
  sessionStorage.clear();
  resetCommunityOpened();
  window.history.replaceState(null, '', '/join');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('JoinFlow — four steps, URL-reflected (§7)', () => {
  test('announces the step it opens on', () => {
    render(<JoinFlow {...props()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4');
  });

  test('the step timeline marks the current step', () => {
    render(<JoinFlow {...props()} />);
    const nav = screen.getByRole('navigation', { name: 'Join progress' });
    const current = nav.querySelector('[aria-current="step"]');
    expect(current).toHaveTextContent('02');
    expect(current).toHaveTextContent('LANE');
  });

  test('choosing CUT KOOTAM moves to details and writes it into the URL and the draft', async () => {
    render(<JoinFlow {...props()} />);
    await userEvent.click(screen.getAllByRole('radio')[1]!);
    await waitFor(() => expect(window.location.search).toBe('?step=details&lane=editor'), { timeout: 2000 });
    expect(JSON.parse(sessionStorage.getItem('ck:join-draft') ?? '{}')).toMatchObject({ lane: 'editor' });
    expect(await screen.findByRole('status')).toHaveTextContent('Step 3 of 4');
  });

  test('blocked storage does not block the flow', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(<JoinFlow {...props()} />);
    await userEvent.click(screen.getAllByRole('radio')[0]!);
    await waitFor(() => expect(window.location.search).toBe('?step=details&lane=creator'), { timeout: 2000 });
  });

  test('the member row is written before the links are asked for', async () => {
    const calls: string[] = [];
    const submitMember = vi.fn(async (): Promise<SubmitResult> => {
      await new Promise((r) => setTimeout(r, 30));
      calls.push('submit:resolved');
      return { ok: true, alreadyMember: false };
    });
    const fetchInvite = vi.fn(async () => {
      calls.push('invite:called');
      return okInvite;
    });
    render(<JoinFlow {...props({ initial: { step: 'details', lane: 'editor' }, submitMember, fetchInvite })} />);
    await userEvent.type(await screen.findByRole('textbox', { name: 'Instagram handle' }), 'the.gowtham_das');
    await userEvent.type(screen.getByRole('combobox', { name: 'City / district' }), 'Ernakulam');
    await userEvent.tab();
    await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    await waitFor(() => expect(calls).toEqual(['submit:resolved', 'invite:called']));
    expect(await screen.findByRole('heading', { name: /export complete/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(window.location.search).toBe('?step=reveal');
  });

  test('a returning member lands on the condensed reveal with both links open', async () => {
    render(<JoinFlow {...props({ initial: { step: 'reveal', lane: null }, member: { id: 'm1', role: 'editor', instagram: 'the.gowtham_das' } })} />);
    const two = await screen.findByRole('link', { name: /CUT KOOTAM/ }, { timeout: 3000 });
    expect(two).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
  });

  test('browser Back from details returns to the lane picker', async () => {
    render(<JoinFlow {...props()} />);
    await userEvent.click(screen.getAllByRole('radio')[1]!);
    await waitFor(() => expect(window.location.search).toBe('?step=details&lane=editor'), { timeout: 2000 });
    window.history.back();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4'));
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });
});
