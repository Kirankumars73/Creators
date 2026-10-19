'use client';

import { useEffect, useRef } from 'react';
import { useScrollFilm } from '@/components/film/ScrollFilm';
import { MANIFESTO, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

/**
 * His grievance, stated plainly. Words light up one after another as the section comes into
 * view (after React Bits' ScrollReveal). Server markup is fully lit; under reduced motion it
 * stays that way.
 */
export function Manifesto() {
  const film = useScrollFilm();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!film.ready || film.reduced || !el) return;
    const words = el.querySelectorAll('[data-word]');
    return film.add(({ gsap }) => {
      // Once, then lit for good: GSAP's own `once` (a hand-rolled scrub-then-kill left words dim
      // when the page loaded already scrolled past, e.g. /#brands).
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        { opacity: 1, duration: 0.5, ease: 'pan', stagger: 0.045, scrollTrigger: { trigger: el, start: 'top 72%', once: true } },
      );
    });
  }, [film]);

  const split = (line: string) =>
    line.split(' ').map((w, i) => (
      <span key={i} data-word="" className="inline-block pr-[0.28em]">
        {w}
      </span>
    ));

  return (
    <section id="the-room" aria-labelledby="the-room-title" className="relative mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-36">
      <SectionHead id="the-room-title" eyebrow={sectionEyebrow('the-room')} title={['WHY A ROOM?']} />
      <div ref={root} className="mt-14 flex max-w-6xl flex-col gap-4 font-subhead text-[clamp(1.9rem,4.6vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.02em]">
        {MANIFESTO.lines.map((line, i) => (
          <p key={line} className={i % 2 ? 'text-rosso' : 'text-chalk'}>
            {split(line)}
          </p>
        ))}
        <p className="halation-rosso mt-8 font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[0.9] tracking-[-0.02em] text-rosso">
          {split(MANIFESTO.close)}
        </p>
      </div>
    </section>
  );
}
