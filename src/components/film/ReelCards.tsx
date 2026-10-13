'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { CropMarks } from '@/components/brand/CropMarks';
import type { Lane } from '@/config/brand';
import { REEL_STILLS } from '@/config/reels';
import { useScrollFilm } from './ScrollFilm';

const CARDS: { lane: Lane; speed: number; place: string }[] = [
  { lane: 'creator', speed: 0.6, place: 'right-[44%] top-[6%] md:right-[36%] md:top-[14%]' },
  { lane: 'editor', speed: 1.0, place: 'right-[22%] top-[13%] md:right-[19%] md:top-[30%]' },
  { lane: 'other', speed: 1.4, place: 'right-[-6%] top-[3%] md:right-[3%] md:top-[9%]' },
];

/**
 * §6.1 — three 9:16 reel cards behind the headline, drifting at 0.6×, 1.0× and 1.4× scroll.
 * Desaturated until the pointer comes near; then the nearest one takes its color and burns.
 */
export function ReelCards() {
  const film = useScrollFilm();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const hero = el?.closest('section');
    if (!film.ready || film.reduced || !el || !hero) return;
    const cards = [...el.querySelectorAll<HTMLElement>('[data-reel]')];
    const revert = film.add(() => {
      cards.forEach((card, i) => {
        gsap.to(card, {
          y: () => (1 - CARDS[i]!.speed) * hero.offsetHeight * 0.6,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        });
      });
    });

    if (!window.matchMedia('(pointer: fine)').matches) return revert;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let nearest: HTMLElement | null = null;
        let best = Infinity;
        for (const card of cards) {
          const r = card.getBoundingClientRect();
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          if (d < best) [best, nearest] = [d, card];
        }
        for (const card of cards) card.toggleAttribute('data-near', card === nearest && best < 420);
      });
    };
    const onLeave = () => cards.forEach((c) => c.removeAttribute('data-near'));
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);
    return () => {
      revert();
      cancelAnimationFrame(raf);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, [film]);

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CARDS.map((c, i) => (
        <div
          key={c.lane}
          data-reel=""
          data-lane={c.lane}
          className={`reel absolute aspect-[9/16] w-[34vw] max-w-[15rem] border border-rule bg-carbon md:w-[13vw] ${c.place}`}
        >
          {REEL_STILLS[i] ? (
            <Image src={REEL_STILLS[i]} alt="" fill sizes="(min-width: 768px) 13vw, 34vw" className="reel-still object-cover" />
          ) : (
            <span className="absolute inset-y-0 left-0 w-[3px] bg-lane" />
          )}
          <CropMarks size={10} />
          <span className="text-label absolute bottom-3 left-4 text-chalk-mute">REEL 0{i + 1}</span>
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_30%,var(--ink)_85%)]" />
    </div>
  );
}
