'use client';

import { useEffect, useRef } from 'react';
import { useScrollFilm } from '@/components/film/ScrollFilm';
import { Button } from '@/components/ui/Button';
import type { Lane } from '@/config/brand';
import { STEPS, sectionEyebrow } from '@/config/landing';
import { formatTimecode } from '@/lib/timecode';
import { SectionHead } from './SectionHead';
import { StepIcon } from './StepIcon';

const LANE_CYCLE: Lane[] = ['creator', 'editor', 'other'];

/**
 * From sign-in to the first credited collab, as eight clips on a timeline. On wide screens the
 * section pins and the clips scrub sideways with the scrollbar while a playhead runs along the
 * ruler; everywhere else (phones, reduced motion, no JS) it's a plain grid.
 */
export function HowItWorks() {
  const film = useScrollFilm();
  const section = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const head = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const s = section.current;
    const w = wrap.current;
    const t = track.current;
    if (!film.ready || film.reduced || !s || !w || !t) return;
    let mm: gsap.MatchMedia | undefined;
    const revert = film.add(({ gsap }) => {
      mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        w.dataset.pinned = '';
        const distance = () => Math.max(0, t.scrollWidth - w.clientWidth);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: s, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.5, invalidateOnRefresh: true },
        });
        tl.to(t, { x: () => -distance(), ease: 'none' }, 0);
        if (head.current) tl.fromTo(head.current, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);
        return () => {
          delete w.dataset.pinned;
        };
      });
    });
    return () => {
      mm?.revert();
      revert();
    };
  }, [film]);

  return (
    <section id="how" ref={section} aria-labelledby="how-title" className="relative overflow-hidden bg-carbon py-24 md:py-32 lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-20">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 px-4 md:px-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHead
          id="how-title"
          eyebrow={sectionEyebrow('how')}
          title={['FROM SIGN-IN', 'TO THE ROOM.']}
          accent={1}
          sub="Eight steps, the first five take about thirty seconds. The last three are the point."
        />
        <Button href="/join" className="self-start lg:self-auto">
          Start step 01
        </Button>
      </div>

      <div ref={wrap} className="how-wrap mt-14 px-4 md:px-10 lg:mt-16">
        <ol ref={track} className="how-track grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              data-lane={LANE_CYCLE[i % 3]}
              data-spotlight=""
              className="spot relative flex min-h-[18rem] flex-col gap-4 border border-rule border-l-[3px] border-l-lane bg-ink p-6"
            >
              <div className="flex items-start justify-between">
                <span className="text-hollow font-display text-[4.5rem] leading-[0.8]">{s.n}</span>
                <StepIcon icon={s.icon} />
              </div>
              <h3 className="mt-auto font-display text-[2rem] uppercase leading-none tracking-[-0.01em] text-chalk">{s.title}</h3>
              <p className="text-body text-chalk-dim">{s.copy}</p>
              <span className="text-label text-chalk-mute">{formatTimecode(i * 25 * 4)}</span>
            </li>
          ))}
        </ol>
        <div aria-hidden="true" className="how-ruler relative mt-6 h-6">
          <div className="ruler absolute inset-x-0 top-0 h-full" />
          <span ref={head} className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-rosso" />
        </div>
      </div>
    </section>
  );
}
