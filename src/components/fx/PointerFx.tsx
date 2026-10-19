'use client';

import { useEffect } from 'react';

/**
 * One pointer listener for the whole page instead of one per card:
 * - `[data-spotlight]` gets `--mx`/`--my` (pointer position inside it), which the CSS turns into
 *   a lane-coloured light and border glow (after React Bits' SpotlightCard / BorderGlow);
 * - `[data-tilt]` leans toward the pointer, a few degrees at most (after TiltedCard);
 * - `[data-magnet]` drifts toward the pointer when it is close (after Magnet).
 * Fine pointers only. Nothing at all under reduced motion except the (static) spotlight.
 */
export function PointerFx() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let e: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    const magnets = new Set<HTMLElement>();

    const apply = () => {
      raf = 0;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      const spot = target?.closest<HTMLElement>('[data-spotlight]');
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      if (reduced) return;

      const tilt = target?.closest<HTMLElement>('[data-tilt]') ?? null;
      if (tilted && tilted !== tilt) tilted.style.transform = '';
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const max = Number(tilt.dataset.tilt) || 6;
        tilt.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
      }

      for (const m of document.querySelectorAll<HTMLElement>('[data-magnet]')) {
        const r = m.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const pad = Number(m.dataset.magnet) || 80;
        if (Math.abs(dx) < r.width / 2 + pad && Math.abs(dy) < r.height / 2 + pad) {
          m.style.transform = `translate3d(${(dx * 0.22).toFixed(1)}px,${(dy * 0.22).toFixed(1)}px,0)`;
          magnets.add(m);
        } else if (magnets.has(m)) {
          m.style.transform = '';
          magnets.delete(m);
        }
      }
    };

    const onMove = (ev: PointerEvent) => {
      e = ev;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      if (tilted) tilted.style.transform = '';
      tilted = null;
      for (const m of magnets) m.style.transform = '';
      magnets.clear();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      onLeave();
    };
  }, []);
  return null;
}
