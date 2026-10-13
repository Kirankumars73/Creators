'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { EASE } from '@/lib/motion/ease';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

/**
 * Gate weave (§4.3): every 4–7s the page nudges 0.3–0.6px sideways for 120ms and back,
 * like film running through a projector gate. It renders <main>, so fixed layers
 * (grain, scrubber, preloader) must live outside it — a transform would trap them.
 */
export function GateWeave({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || typeof el.animate !== 'function') return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          const dx = (0.3 + Math.random() * 0.3) * (Math.random() < 0.5 ? -1 : 1);
          el.style.willChange = 'transform';
          const a = el.animate(
            [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }],
            { duration: 120, easing: EASE.cut },
          );
          a.onfinish = a.oncancel = () => {
            el.style.willChange = '';
          };
          schedule();
        },
        4000 + Math.random() * 3000,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [reduced]);

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
