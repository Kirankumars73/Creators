// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PageLoader } from '@/components/brand/PageLoader';
import { ROUTE_CHANGED } from '@/components/brand/RouteWatcher';

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

  test('never traps anyone: it lets go after eight seconds even if something hangs', async () => {
    render(<PageLoader />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8600);
    });
    expect(loader().dataset.done).toBe('true');
  });

  test('is removed from the page after it has faded out', async () => {
    render(<PageLoader />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8600);
    });
    act(() => loader().dispatchEvent(new Event('transitionend', { bubbles: true })));
    expect(document.getElementById('page-loader')).toBeNull();
  });

  test('stays up while a part of the page marks itself as still loading, and lifts once it is ready', async () => {
    const hold = document.createElement('div');
    hold.setAttribute('data-page-hold', '');
    document.body.appendChild(hold);
    render(<PageLoader />);
    await act(async () => {
      window.dispatchEvent(new Event('load'));
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(loader().dataset.done).toBeUndefined();
    await act(async () => {
      hold.removeAttribute('data-page-hold');
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(loader().dataset.done).toBe('true');
    hold.remove();
  });

  test('clicking on to another page covers it again, and lifts once that page is ready (no load event needed)', async () => {
    render(<PageLoader />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    act(() => loader().dispatchEvent(new Event('transitionend', { bubbles: true })));
    expect(document.getElementById('page-loader')).toBeNull();

    const hold = document.createElement('div');
    hold.setAttribute('data-page-hold', '');
    document.body.appendChild(hold);
    await act(async () => {
      window.dispatchEvent(new Event(ROUTE_CHANGED));
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(loader().dataset.done).toBeUndefined(); // the new page is still loading
    await act(async () => {
      hold.remove();
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(loader().dataset.done).toBe('true');
  });
});
