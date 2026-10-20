// @vitest-environment jsdom
// Regression tests for the final whole-branch review's fix pass.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DeliverableChip } from '@/components/join/DeliverableChip';
import { DetailsForm } from '@/components/join/DetailsForm';
import { Reveal } from '@/components/join/Reveal';
import { SavePassButton } from '@/components/join/SavePassButton';
import { Combobox } from '@/components/ui/Combobox';
import { DISTRICTS, DISTRICT_ALIASES } from '@/config/join';
import { fetchAllPages } from '@/lib/admin/paging';
import { resetCommunityOpened } from '@/lib/join/chip-store';
import { fetchInvite } from '@/lib/join/invite-client';
import type { MemberRow } from '@/lib/members/types';
import { toPassData } from '@/lib/pass/data';

beforeEach(() => {
  sessionStorage.clear();
  resetCommunityOpened();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('F6 — chip 02 names the room the server actually linked', () => {
  test('client thinks creator, server says editors → EDITORS', () => {
    render(
      <Reveal
        result={{ status: 200, body: { community: 'https://chat.whatsapp.com/C', lane: 'https://chat.whatsapp.com/E', laneKey: 'editors' } }}
        lane="creator"
        returning
      />,
    );
    expect(screen.getByRole('link', { name: /EDITORS/ })).toHaveAttribute('href', 'https://chat.whatsapp.com/E');
    expect(screen.queryByRole('link', { name: /CONTENT CREATORS/ })).toBeNull();
  });
});

describe('F2 — recovery actions on the reveal reload the flow from the server', () => {
  test.each([
    [401, /sign in/i, '/join'],
    [404, /back to your lane/i, '/join?step=lane'],
  ])('%s → a full reload of %s', async (status, name, url) => {
    const onRecover = vi.fn();
    render(<Reveal result={{ status, error: 'x' }} lane="creator" returning={false} onRecover={onRecover} />);
    await userEvent.click(screen.getByRole('button', { name }));
    expect(onRecover).toHaveBeenCalledWith(url);
  });

  test('an expired sign-in on the details form offers a way back in', async () => {
    render(
      <DetailsForm
        lane="creator"
        user={{ name: 'Gowtham Das' }}
        draft={{ instagram: 'the.gowtham_das', city: 'Ernakulam' }}
        onDraft={vi.fn()}
        onSubmit={vi.fn(async () => ({ ok: false as const, error: 'unauthenticated' as const }))}
        onDone={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    expect(await screen.findByRole('link', { name: /sign in again/i })).toHaveAttribute('href', '/join');
  });
});

describe('F3 — SAVE MY PASS never fails silently', () => {
  const png = () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 });

  test('the pass is fetched before the tap, so the share keeps its user gesture', async () => {
    const fetchSpy = vi.fn(async () => png());
    vi.stubGlobal('fetch', fetchSpy);
    render(<SavePassButton instagram="x" />);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith('/api/pass/me', expect.anything()));
  });

  test('a share the browser refuses falls back to a download', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => png()));
    Object.assign(navigator, { canShare: () => true, share: vi.fn(async () => Promise.reject(new DOMException('no gesture', 'NotAllowedError'))) });
    URL.createObjectURL = vi.fn(() => 'blob:pass');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<SavePassButton instagram="x" />);
    await userEvent.click(screen.getByRole('button', { name: /save my pass/i }));
    await waitFor(() => expect(click).toHaveBeenCalled());
  });

  test('closing the share sheet is not an error and downloads nothing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => png()));
    Object.assign(navigator, { canShare: () => true, share: vi.fn(async () => Promise.reject(new DOMException('closed', 'AbortError'))) });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<SavePassButton instagram="x" />);
    await userEvent.click(screen.getByRole('button', { name: /save my pass/i }));
    await new Promise((r) => setTimeout(r, 20));
    expect(click).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('F8 — the invite request cannot hang forever', () => {
  test('it carries an abort signal, and a timeout lands in the retry state', async () => {
    let seen: RequestInit | undefined;
    const f = vi.fn(async (_u: string, init?: RequestInit) => {
      seen = init;
      throw new DOMException('timed out', 'TimeoutError');
    });
    vi.stubGlobal('fetch', f);
    expect(await fetchInvite()).toEqual({ status: 0, error: 'network' });
    expect(seen?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe('F9 — Kerala cities by the names people actually type', () => {
  function Harness({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('');
    return (
      <Combobox
        label="City / district"
        options={DISTRICTS}
        aliases={DISTRICT_ALIASES}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    );
  }
  test('typing Kochi offers Ernakulam', async () => {
    render(<Harness onChange={() => {}} />);
    await userEvent.type(screen.getByRole('combobox'), 'kochi');
    expect(screen.getByRole('option', { name: 'Ernakulam' })).toBeInTheDocument();
  });
  test('leaving the field on "Trivandrum" picks Thiruvananthapuram', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'Trivandrum');
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith('Thiruvananthapuram');
  });
});

describe('F12 — members who opted out of the wall have no public pass by id', () => {
  const row = { id: 'm', user_id: 'u', email: 'e', display_name: 'A B', avatar_url: null, instagram: 'a.b', role: 'creator', role_other_text: null, city: 'Kollam', tags: [], portfolio_url: null, show_on_wall: false, profile_public: false, accepted_code: true, status: 'active', role_changes: 0, created_at: '2026-10-13T00:00:00Z', updated_at: '2026-10-13T00:00:00Z' } as MemberRow;
  test('public by-id request → no pass', () => expect(toPassData(row, { public: true })).toBeNull());
  test('their own pass still works', () => expect(toPassData(row)).not.toBeNull());
});

describe('F14 — copying a link has a manual fallback', () => {
  test('when the clipboard refuses, the link is shown to select by hand', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn(async () => Promise.reject(new Error('denied'))) }, configurable: true });
    render(<DeliverableChip index="01" title="CREATORS KOOTAM" body="b" href="https://chat.whatsapp.com/C" locked={false} />);
    await userEvent.click(screen.getByRole('button', { name: /copy link/i }));
    expect(await screen.findByRole('textbox', { name: /link to copy/i })).toHaveValue('https://chat.whatsapp.com/C');
  });
});

describe('F4 — admin lists page past Supabase’s 1,000-row cap', () => {
  test('keeps asking until a short page comes back', async () => {
    const all = Array.from({ length: 2345 }, (_, i) => i);
    const page = vi.fn(async (from: number, to: number) => all.slice(from, to + 1));
    expect(await fetchAllPages(page, 1000)).toHaveLength(2345);
    expect(page).toHaveBeenCalledTimes(3);
  });
});

describe('F15 — brand strings live only in brand.ts', () => {
  function files(dir: string): string[] {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
    });
  }
  test('no component hard-codes the founder or the community name', () => {
    const offenders = files('src/components').filter((f) => /['"`>][^'"`<]*\b(Gowtham|Goutham|Creators Kootam)\b/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
