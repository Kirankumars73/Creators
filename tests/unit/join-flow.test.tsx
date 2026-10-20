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
    expect(current).toHaveTextContent('Step 2');
    expect(current).toHaveTextContent('Pick your room');
  });

  test('choosing EDITORS moves to details and writes it into the URL and the draft', async () => {
    render(<JoinFlow {...props()} />);
    await userEvent.click((await screen.findAllByRole('radio'))[1]!);
    await waitFor(() => expect(window.location.search).toBe('?step=details&lane=editor'), { timeout: 2000 });
    expect(JSON.parse(sessionStorage.getItem('ck:join-draft') ?? '{}')).toMatchObject({ lane: 'editor' });
    expect(await screen.findByRole('status')).toHaveTextContent('Step 3 of 4');
  });

  test('blocked storage does not block the flow', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(<JoinFlow {...props()} />);
    await userEvent.click((await screen.findAllByRole('radio'))[0]!);
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

  describe('the photo picked while joining', () => {
    beforeEach(() => {
      URL.createObjectURL = vi.fn(() => 'blob:preview');
      URL.revokeObjectURL = vi.fn();
    });

    async function joinWithPhoto(extra: Partial<Parameters<typeof JoinFlow>[0]>, tick: { show?: boolean } = {}) {
      render(<JoinFlow {...props({ initial: { step: 'details', lane: 'editor' }, ...extra })} />);
      await userEvent.type(await screen.findByRole('textbox', { name: 'Instagram handle' }), 'the.gowtham_das');
      await userEvent.type(screen.getByRole('combobox', { name: 'City / district' }), 'Ernakulam');
      await userEvent.tab();
      await userEvent.upload(screen.getByLabelText('Add a photo'), new File([new Uint8Array(900)], 'me.jpg', { type: 'image/jpeg' }));
      if (tick.show) await userEvent.click(screen.getByRole('checkbox', { name: /show my photo/i }));
      await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
      await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    }

    test('it is uploaded only AFTER the member record is saved, and before the links are fetched; private by default', async () => {
      const calls: string[] = [];
      const submitMember = vi.fn(async (): Promise<SubmitResult> => (calls.push('member saved'), { ok: true, alreadyMember: false }));
      const sendPhoto = vi.fn(async () => (calls.push('photo uploaded'), { ok: true as const }));
      const setPhotoPublic = vi.fn(async () => ({ ok: true }));
      const fetchInvite = vi.fn(async () => (calls.push('links fetched'), okInvite));
      await joinWithPhoto({ submitMember, sendPhoto, setPhotoPublic, fetchInvite });
      await waitFor(() => expect(calls).toEqual(['member saved', 'photo uploaded', 'links fetched']));
      expect(sendPhoto).toHaveBeenCalledWith({ kind: 'file', file: expect.any(File) });
      expect(setPhotoPublic).not.toHaveBeenCalled(); // they didn't tick "show my photo"
    });

    test('ticking "show my photo" switches it on after the upload', async () => {
      const setPhotoPublic = vi.fn(async () => ({ ok: true }));
      await joinWithPhoto({ sendPhoto: vi.fn(async () => ({ ok: true as const })), setPhotoPublic }, { show: true });
      await waitFor(() => expect(setPhotoPublic).toHaveBeenCalledWith(true));
    });

    test('a failed upload never stops them joining: they reach the links and are told where to add it', async () => {
      const sendPhoto = vi.fn(async () => ({ ok: false as const, reason: 'too_big' }));
      await joinWithPhoto({ sendPhoto });
      expect(await screen.findByRole('heading', { name: /export complete/i }, { timeout: 4000 })).toBeInTheDocument();
      expect(screen.getByText(/your photo didn’t upload/i)).toBeInTheDocument();
      expect(screen.getByText(/add it from your pass page/i)).toBeInTheDocument();
    });

    test('no photo picked means nothing is uploaded at all', async () => {
      const sendPhoto = vi.fn(async () => ({ ok: true as const }));
      render(<JoinFlow {...props({ initial: { step: 'details', lane: 'editor' }, sendPhoto })} />);
      await userEvent.type(await screen.findByRole('textbox', { name: 'Instagram handle' }), 'the.gowtham_das');
      await userEvent.type(screen.getByRole('combobox', { name: 'City / district' }), 'Ernakulam');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
      await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
      expect(await screen.findByRole('heading', { name: /export complete/i }, { timeout: 4000 })).toBeInTheDocument();
      expect(sendPhoto).not.toHaveBeenCalled();
    });

    test('the Google photo is offered when the account has one, and uploads as the google source', async () => {
      const sendPhoto = vi.fn(async () => ({ ok: true as const }));
      render(<JoinFlow {...props({ initial: { step: 'details', lane: 'editor' }, sendPhoto, googlePhotoUrl: 'https://lh3.googleusercontent.com/a/x=s96-c' })} />);
      await userEvent.type(await screen.findByRole('textbox', { name: 'Instagram handle' }), 'the.gowtham_das');
      await userEvent.type(screen.getByRole('combobox', { name: 'City / district' }), 'Ernakulam');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('button', { name: 'Use my Google photo' }));
      await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
      await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
      await waitFor(() => expect(sendPhoto).toHaveBeenCalledWith({ kind: 'google' }));
    });
  });

  test('a returning member lands on the condensed reveal with both links open', async () => {
    render(<JoinFlow {...props({ initial: { step: 'reveal', lane: null }, member: { id: 'm1', role: 'editor', instagram: 'the.gowtham_das' } })} />);
    const two = await screen.findByRole('link', { name: /EDITORS/ }, { timeout: 3000 });
    expect(two).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
  });

  test('browser Back from details returns to the lane picker', async () => {
    render(<JoinFlow {...props()} />);
    await userEvent.click((await screen.findAllByRole('radio'))[1]!);
    await waitFor(() => expect(window.location.search).toBe('?step=details&lane=editor'), { timeout: 2000 });
    window.history.back();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4'));
    await waitFor(() => expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label') ?? r.textContent?.slice(0, 20))).toHaveLength(3), { timeout: 3000 });
  });
});
