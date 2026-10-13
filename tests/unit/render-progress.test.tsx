// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useRenderProgress } from '@/lib/join/render-progress';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useRenderProgress', () => {
  test('a fast request still shows the render for at least 600ms, then completes', async () => {
    const task = new Promise<string>((r) => setTimeout(() => r('ok'), 10));
    const { result } = renderHook(() => useRenderProgress(task));
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(result.current.done).toBe(false);
    expect(result.current.progress).toBeGreaterThan(0);
    expect(result.current.progress).toBeLessThan(1);
    await act(() => vi.advanceTimersByTimeAsync(320));
    expect(result.current).toMatchObject({ done: true, progress: 1, result: 'ok' });
  });

  test('a slow request holds below 90% until it lands', async () => {
    const task = new Promise<string>((r) => setTimeout(() => r('late'), 5000));
    const { result } = renderHook(() => useRenderProgress(task));
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(result.current.done).toBe(false);
    expect(result.current.progress).toBeLessThanOrEqual(0.9);
    await act(() => vi.advanceTimersByTimeAsync(1100));
    expect(result.current).toMatchObject({ done: true, result: 'late' });
  });

  test('frames tick at 25fps', async () => {
    const task = new Promise<void>(() => {});
    const { result } = renderHook(() => useRenderProgress(task));
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(result.current.frames).toBe(25);
  });

  test('no task is idle', () => {
    const { result } = renderHook(() => useRenderProgress(null));
    expect(result.current).toMatchObject({ progress: 0, frames: 0, done: false });
  });
});
