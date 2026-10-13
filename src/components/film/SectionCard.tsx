'use client';

import { useEffect, useRef } from 'react';
import { withWillChange } from '@/lib/motion/will-change';
import { useScrollFilm } from './ScrollFilm';
import { sectionTitle, type SectionId } from './sections';

/**
 * §6.3 — the cut. As a section arrives, a rosso panel sweeps in left→right carrying its
 * title, holds 350ms, then wipes off upward. Not rendered at all under reduced motion.
 */
export function SectionCard({ id, tone = 'rosso' }: { id: SectionId; tone?: 'rosso' | 'ink' }) {
  const film = useScrollFilm();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    const section = el?.closest('section');
    if (!film.ready || film.reduced || !el || !section) return;
    return film.add(({ gsap, ScrollTrigger }) => {
      const tl = gsap.timeline({ paused: true });
      // x: 0 clears the parked CSS translateX(-100%), which GSAP would otherwise read as a px offset.
      tl.fromTo(el, { xPercent: -100, x: 0 }, { xPercent: 0, x: 0, duration: 0.3, ease: 'pan' })
        .to(el, { yPercent: -100, duration: 0.3, ease: 'cut' }, '+=0.35')
        .set(el, { display: 'none' });
      withWillChange(tl, [el]);
      ScrollTrigger.create({ trigger: section, start: 'top 70%', once: true, onEnter: () => tl.play() });
    });
  }, [film]);

  if (!film.ready || film.reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[min(100%,100svh)] overflow-hidden">
      <div
        ref={panel}
        data-section-card=""
        className={`section-card flex h-full w-full items-center px-4 md:px-10 ${tone === 'ink' ? 'bg-ink' : 'bg-rosso'}`}
      >
        <p className="text-title text-chalk">{sectionTitle(id)}</p>
      </div>
    </div>
  );
}
