import { formatTimecode } from '@/lib/timecode';

const CELLS = 20;

/** §7 step 4 — a render bar, not a spinner. */
export function RenderBar({ progress, frames }: { progress: number; frames: number }) {
  const pct = Math.round(progress * 100);
  const filled = Math.round(progress * CELLS);
  return (
    <div
      role="progressbar"
      aria-label="Rendering your pass"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="flex flex-col gap-3 font-mono text-sm text-chalk md:text-base"
    >
      <p className="tracking-[0.14em]">RENDERING YOUR PASS ...</p>
      <p aria-hidden="true" className="flex flex-wrap items-center gap-x-6 gap-y-1 tabular-nums">
        <span>
          [<span className="text-lane">{'█'.repeat(filled)}</span>
          <span className="text-chalk-mute">{'░'.repeat(CELLS - filled)}</span>]
        </span>
        <span>{String(pct).padStart(3, ' ')}%</span>
        <span className="text-chalk-dim">{formatTimecode(frames)}</span>
      </p>
    </div>
  );
}
