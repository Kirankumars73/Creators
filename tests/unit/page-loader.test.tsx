// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageLoader } from '@/components/brand/PageLoader';

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const loader = () => document.getElementById('page-loader')!;

describe('PageLoader', () => {
  test('covers the page from the first render, announced as loading', () => {
    render(<PageLoader />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(loader().dataset.done).toBeUndefined();
  });

  test('once the page has loaded it stays for a short minimum, then lets go', async () => {
    render(<PageLoader />);
    await act(async () => {
      window.dispatchEvent(new Event('load'));
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(loader().dataset.done).toBeUndefined(); // not a flash
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(loader().dataset.done).toBe('true');
  });

  test('never traps anyone: it lets go after five seconds even if something hangs', async () => {
    render(<PageLoader />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5600);
    });
    expect(loader().dataset.done).toBe('true');
  });

  test('is removed from the page after it has faded out', async () => {
    render(<PageLoader />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5600);
    });
    act(() => loader().dispatchEvent(new Event('transitionend', { bubbles: true })));
    expect(document.getElementById('page-loader')).toBeNull();
  });
});
