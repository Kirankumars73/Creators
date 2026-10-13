'use client';

import { useEffect, useState } from 'react';

export type RenderProgress<T> = { progress: number; frames: number; done: boolean; result?: T; error?: unknown };
/** A promise already in flight, or a factory started when the bar mounts (client only). */
export type RenderTask<T> = Promise<T> | (() => Promise<T>);

const IDLE = { progress: 0, frames: 0, done: false } as const;
const FRAME_MS = 40; // 25fps, so the timecode ticks in real frames

/**
 * Drives the "RENDERING YOUR PASS" bar from a real request: it eases toward 90% while the
 * request is out, and finishes when it lands — never sooner than `minMs`, so the cut reads.
 */
export function useRenderProgress<T>(task: RenderTask<T> | null, { minMs = 600 }: { minMs?: number } = {}): RenderProgress<T> {
  const [state, setState] = useState<{ task: RenderTask<T>; value: RenderProgress<T> } | null>(null);

  useEffect(() => {
    if (!task) return;
    let settled: { result?: T; error?: unknown } | null = null;
    const running = typeof task === 'function' ? task() : task;
    running.then(
      (result) => (settled = { result }),
      (error: unknown) => (settled = { error }),
    );
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const frames = Math.floor(elapsed / FRAME_MS);
      if (settled && elapsed >= minMs) {
        clearInterval(id);
        setState({ task, value: { progress: 1, frames, done: true, ...settled } });
        return;
      }
      setState({ task, value: { progress: 0.9 * (1 - Math.exp(-elapsed / 700)), frames, done: false } });
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [task, minMs]);

  return task && state?.task === task ? state.value : IDLE;
}
