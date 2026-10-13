'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, type ReactNode } from 'react';
import { withWillChange } from '@/lib/motion/will-change';
import { useScrollFilm } from './ScrollFilm';

/**
 * Each `[data-reveal]` child rises 16px into place as it scrolls into view (pan, 520ms);
 * under reduced motion it's a 150ms opacity cut. Content is server-rendered either way —
 * this only arms the animation (plan Departure 9).
 */
export function RevealOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const film = useScrollFilm();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!film.ready || !el) return;
    const items = [...el.querySelectorAll<HTMLElement>('[data-reveal]')];
    return film.add(() => {
      for (const item of items) {
        const from = film.reduced ? { opacity: 0, duration: 0.15 } : { y: 16, opacity: 0, duration: 0.52, ease: 'pan' };
        withWillChange(gsap.from(item, { ...from, scrollTrigger: { trigger: item, start: 'top 88%', once: true } }), [item], 'transform, opacity');
      }
    });
  }, [film]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
