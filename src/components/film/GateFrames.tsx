'use client';

import { useState, useSyncExternalStore, type PointerEvent } from 'react';
import type { Lane } from '@/config/brand';
import { LaneFrame } from '@/components/join/LaneFrame';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

const FINE = '(pointer: fine)';
const subscribeFine = (cb: () => void) => {
  const mq = window.matchMedia(FINE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const usePointerFine = () => useSyncExternalStore(subscribeFine, () => window.matchMedia(FINE).matches, () => false);

type FrameState = 'rest' | 'focus' | 'soft';

/**
 * §6.4 — two film gates. On a fine pointer, hovering one racks focus onto it: it snaps
 * sharp with its lane border and doubled grain while the other goes soft (blur 3px), and it
 * tilts up to 4° toward the pointer (CSS transition on the settle curve — no animation
 * library on the landing page's critical path). At rest both are sharp.
 */
export function GateFrames() {
  const [hovered, setHovered] = useState<Lane | null>(null);
  return (
    <div className="mt-12 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-8">
      {(['creator', 'editor'] as const).map((lane) => (
        <GateFrame
          key={lane}
          lane={lane}
          state={hovered === null ? 'rest' : hovered === lane ? 'focus' : 'soft'}
          onHover={setHovered}
        />
      ))}
    </div>
  );
}

function GateFrame({ lane, state, onHover }: { lane: Lane; state: FrameState; onHover(lane: Lane | null): void }) {
  const fine = usePointerFine();
  const reduced = usePrefersReducedMotion();
  const tilt = fine && !reduced;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!tilt) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const rx = -((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  }

  return (
    <div
      data-gate=""
      data-state={state}
      onPointerEnter={() => fine && onHover(lane)}
      onPointerMove={onMove}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = '';
        onHover(null);
      }}
      className="gate relative w-full max-w-[22rem] md:max-w-[26rem]"
    >
      <LaneFrame lane={lane} mode="static" selected={state === 'focus'} />
      <span aria-hidden="true" className="gate-grain" />
    </div>
  );
}
