'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { withWillChange } from '@/lib/motion/will-change';
import { useScrollFilm } from './ScrollFilm';

/**
 * Each `[data-reveal]` child rises 16px into place as it scrolls into view (pan, 520ms);
 * `[data-reveal="trim"]` trims in like a timeline clip instead;
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
    return film.add(({ gsap }) => {
      for (const item of items) {
        const scrollTrigger = { trigger: item, start: 'top 88%', once: true };
        if (item.dataset.reveal === 'trim' && !film.reduced) {
          // §6.6: a clip trimmed out on a timeline — scaleX from its left edge with a slight
          // overshoot (never a width animation), then its label lands.
          const label = item.querySelector('span');
          const tl = gsap.timeline({ scrollTrigger });
          tl.fromTo(item, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1.04, duration: 0.4, ease: 'pan' })
            .to(item, { scaleX: 1, duration: 0.1, ease: 'cut' });
          if (label) tl.from(label, { opacity: 0, duration: 0.15 }, '-=0.05');
          withWillChange(tl, [item]);
          continue;
        }
        const from = film.reduced ? { opacity: 0, duration: 0.15 } : { y: 16, opacity: 0, duration: 0.52, ease: 'pan' };
        withWillChange(gsap.from(item, { ...from, scrollTrigger }), [item], 'transform, opacity');
      }
    });
  }, [film]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
