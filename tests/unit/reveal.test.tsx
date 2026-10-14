// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ExportSequence, Reveal } from '@/components/join/Reveal';
import { resetCommunityOpened } from '@/lib/join/chip-store';
import type { InviteClientResult } from '@/lib/join/invite-client';

const ok = (lane: string | null, laneKey: 'creators' | 'editors' | 'other' | null): InviteClientResult => ({
  status: 200,
  body: { community: 'https://chat.whatsapp.com/COMM', lane, laneKey },
});
const editorLinks = ok('https://chat.whatsapp.com/EDI', 'editors');

const stopNavigation = (e: Event) => e.preventDefault();
beforeEach(() => {
  sessionStorage.clear();
  resetCommunityOpened();
  document.addEventListener('click', stopNavigation, true);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => {}) }, configurable: true });
});
afterEach(() => {
  document.removeEventListener('click', stopNavigation, true);
  cleanup();
});

const chip = (name: RegExp) => screen.getByRole('link', { name });

describe('Reveal — the two deliverables', () => {
  test('EXPORT COMPLETE, then the Malayalam line with its English', () => {
    render(<Reveal result={editorLinks} lane="editor" returning={false} />);
    expect(screen.getByRole('heading', { name: /export complete/i })).toBeInTheDocument();
    expect(screen.getByText('നിങ്ങൾ കൂട്ടത്തിലാണ്.')).toBeInTheDocument();
    expect(screen.getByText("You're in the kootam.")).toBeInTheDocument();
  });

  test('chip 02 stays locked until chip 01 is opened', async () => {
    render(<Reveal result={editorLinks} lane="editor" returning={false} />);
    const two = chip(/EDITORS/);
    expect(two).toHaveAttribute('aria-disabled', 'true');
    expect(two).not.toHaveAttribute('href');
    await userEvent.click(chip(/CREATORS KOOTAM/));
    expect(chip(/EDITORS/)).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
    expect(chip(/EDITORS/)).not.toHaveAttribute('aria-disabled');
  });

  test('copying chip 01 also unlocks chip 02, and copies the community link', async () => {
    render(<Reveal result={editorLinks} lane="editor" returning={false} />);
    expect(chip(/EDITORS/)).not.toHaveAttribute('href');
    await userEvent.click(screen.getAllByRole('button', { name: /copy link/i })[0]!);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://chat.whatsapp.com/COMM');
    expect(chip(/EDITORS/)).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
  });

  test('coming back from WhatsApp keeps chip 02 unlocked (Review Focus 3)', () => {
    sessionStorage.setItem('ck:chip01', '1');
    render(<Reveal result={editorLinks} lane="editor" returning={false} />);
    expect(chip(/EDITORS/)).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
  });

  test('returning members get both links open', () => {
    render(<Reveal result={editorLinks} lane="editor" returning />);
    expect(chip(/EDITORS/)).toHaveAttribute('href', 'https://chat.whatsapp.com/EDI');
  });

  test('links open in a new tab, safely', () => {
    render(<Reveal result={editorLinks} lane="editor" returning />);
    const one = chip(/CREATORS KOOTAM/);
    expect(one).toHaveAttribute('target', '_blank');
    expect(one).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('"other" with no room yet gets the mint note instead of chip 02', () => {
    render(<Reveal result={ok(null, null)} lane="other" returning={false} />);
    expect(screen.queryByRole('link', { name: /SOMETHING ELSE/ })).toBeNull();
    expect(screen.getByText(/We're building your room/)).toHaveTextContent('Gowtham will reach out');
  });

  test('the WhatsApp hint is there', () => {
    render(<Reveal result={editorLinks} lane="editor" returning />);
    expect(screen.getByText('Links not opening? Make sure WhatsApp is installed on this device.')).toBeInTheDocument();
  });
});

describe('ExportSequence — render bar, then the result', () => {
  test('shows a progress bar while the pass renders', () => {
    render(<ExportSequence task={new Promise(() => {})} lane="creator" returning={false} />);
    expect(screen.getByRole('progressbar', { name: /rendering your pass/i })).toBeInTheDocument();
  });

  test('a flagged member is told the pass is on hold, and the bar goes away (Review Focus 4)', async () => {
    render(<ExportSequence task={Promise.resolve({ status: 403, error: 'inactive' })} lane="creator" returning={false} />);
    await waitFor(() => expect(screen.getByText(/your pass is on hold/i)).toBeInTheDocument(), { timeout: 2000 });
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  test('a network failure offers a retry', async () => {
    const onRetry = vi.fn();
    render(<ExportSequence task={Promise.resolve({ status: 0, error: 'network' })} lane="creator" returning={false} onRetry={onRetry} />);
    await userEvent.click(await screen.findByRole('button', { name: /try again/i }, { timeout: 2000 }));
    expect(onRetry).toHaveBeenCalled();
  });
});
