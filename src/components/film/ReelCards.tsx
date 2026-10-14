'use client';

import { useEffect, useRef } from 'react';
import { CropMarks } from '@/components/brand/CropMarks';
import { CraftArt, type Craft } from '@/components/brand/CraftArt';
import type { Lane } from '@/config/brand';
import { useScrollFilm } from './ScrollFilm';

const CARDS: { lane: Lane; craft: Craft; speed: number; place: string }[] = [
  { lane: 'creator', craft: 'viewfinder', speed: 0.6, place: 'right-[44%] top-[6%] md:right-[27%] md:top-[14%]' },
  { lane: 'editor', craft: 'timeline', speed: 1.0, place: 'right-[22%] top-[13%] md:right-[14%] md:top-[32%]' },
  { lane: 'other', craft: 'bars', speed: 1.4, place: 'right-[-6%] top-[3%] md:right-[3%] md:top-[9%]' },
];

/**
 * §6.1 — three 9:16 reel cards behind the headline, drifting at 0.6×, 1.0× and 1.4× scroll.
 * They show the craft, never a person (decided 2026-10-14: this is the community's site, not
 * a page about its founder): a camera viewfinder for creators, an edit timeline for editors,
 * bars and tone for everyone else. Drawn inline: no image requests in the hero.
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
    const revert = film.add(({ gsap }) => {
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
      {CARDS.map((c) => (
        <div
          key={c.lane}
          data-reel=""
          data-lane={c.lane}
          data-craft={c.craft}
          className={`reel absolute aspect-[9/16] w-[34vw] max-w-[15rem] overflow-hidden border border-rule bg-carbon md:w-[13vw] ${c.place}`}
        >
          <CraftArt craft={c.craft} className="reel-craft absolute inset-0 h-full w-full" />
          <span className="absolute inset-y-0 left-0 w-[3px] bg-lane" />
          <CropMarks size={10} />
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_30%,var(--ink)_85%)]" />
    </div>
  );
}
