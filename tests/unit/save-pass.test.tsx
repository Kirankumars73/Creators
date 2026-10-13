// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SavePassButton } from '@/components/join/SavePassButton';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SavePassButton', () => {
  test('on phones that can share files, it hands the pass straight to the share sheet', async () => {
    const share = vi.fn(async () => {});
    Object.assign(navigator, { canShare: () => true, share });
    render(<SavePassButton instagram="the.gowtham_das" />);
    await userEvent.click(screen.getByRole('button', { name: /save my pass/i }));
    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith('/api/pass/me', expect.anything());
    const file = (share.mock.calls[0] as unknown as [{ files: File[] }])[0].files[0]!;
    expect(file.name).toBe('kootam-pass-the.gowtham_das.png');
  });

  test('elsewhere it downloads the PNG', async () => {
    Object.assign(navigator, { canShare: undefined, share: undefined });
    URL.createObjectURL = vi.fn(() => 'blob:pass');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<SavePassButton instagram="the.gowtham_das" />);
    await userEvent.click(screen.getByRole('button', { name: /save my pass/i }));
    await waitFor(() => expect(click).toHaveBeenCalled());
  });

  test('a failed render says so', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    render(<SavePassButton instagram="x" />);
    await userEvent.click(screen.getByRole('button', { name: /save my pass/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn’t render your pass/i);
  });
});
