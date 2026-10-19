'use client';

import { useEffect, useRef } from 'react';

const REACH = 220; // px: how far from a letter the pointer starts to pull it

/**
 * The hero headline. Letters near the pointer lift, stretch and burn rosso (after React Bits'
 * VariableProximity, done with transforms since Anton has no variable axes). Screen readers
 * get the sentence once, from a visually hidden copy; the letters are aria-hidden.
 * Server markup is the plain headline, so it paints at first paint (it is the LCP).
 */
export function ProximityHeadline({ lines, className = '' }: { lines: readonly string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const h = ref.current;
    if (!h || !window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const letters = [...h.querySelectorAll<HTMLElement>('[data-letter]')];
    let raf = 0;
    let px = -1e4;
    let py = -1e4;
    const apply = () => {
      raf = 0;
      for (const l of letters) {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const p = Math.max(0, 1 - d / REACH);
        l.style.setProperty('--p', (p * p).toFixed(3));
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = py = -1e4;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <h1 ref={ref} className={`text-hero text-chalk ${className}`}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, li) => (
        <span key={line} aria-hidden="true" className={`block ${li === lines.length - 1 ? 'text-hollow-rosso' : ''}`}>
          {line.split(' ').map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {[...word].map((ch, ci) => (
                <span key={ci} data-letter="" className="proximity-letter inline-block">
                  {ch}
                </span>
              ))}
              {wi < line.split(' ').length - 1 ? ' ' : null}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
