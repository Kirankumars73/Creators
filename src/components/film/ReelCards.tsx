'use client';

import { useEffect, useRef } from 'react';
import { CropMarks } from '@/components/brand/CropMarks';
import type { Lane } from '@/config/brand';
import { useScrollFilm } from './ScrollFilm';

type Craft = 'viewfinder' | 'timeline' | 'bars';

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
          {c.craft === 'viewfinder' ? <Viewfinder /> : c.craft === 'timeline' ? <Timeline /> : <Bars />}
          <span className="absolute inset-y-0 left-0 w-[3px] bg-lane" />
          <CropMarks size={10} />
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_30%,var(--ink)_85%)]" />
    </div>
  );
}

const ART = 'reel-craft absolute inset-0 h-full w-full font-mono';

/** Creators: what the camera sees — REC, timecode, thirds, a focus box, exposure. */
function Viewfinder() {
  return (
    <svg data-craft-art="" viewBox="0 0 90 160" className={ART}>
      <g className="stroke-chalk" strokeWidth="0.3" opacity="0.22">
        <line x1="30" y1="0" x2="30" y2="160" />
        <line x1="60" y1="0" x2="60" y2="160" />
        <line x1="0" y1="53.3" x2="90" y2="53.3" />
        <line x1="0" y1="106.7" x2="90" y2="106.7" />
      </g>
      <g className="stroke-chalk" strokeWidth="0.8" fill="none" opacity="0.7">
        <path d="M12 24 V18 H18" />
        <path d="M72 18 H78 V24" />
        <path d="M12 136 V142 H18" />
        <path d="M72 142 H78 V136" />
      </g>
      <rect x="37" y="72" width="16" height="16" fill="none" className="stroke-lane" strokeWidth="0.8" />
      <circle cx="15" cy="10" r="2" className="reel-rec fill-lane" />
      <text x="19" y="11.7" fontSize="5" className="fill-chalk">REC</text>
      <text x="79" y="11.7" fontSize="4.4" textAnchor="end" className="fill-chalk-dim">
        00:00:12:08
      </text>
      <text x="45" y="153" fontSize="4.2" textAnchor="middle" className="fill-chalk-dim">
        ISO 800 · 1/50 · F2.8
      </text>
    </svg>
  );
}

const WAVE = [3, 6, 4, 9, 5, 7, 11, 6, 4, 8, 5, 3, 7, 10, 6, 4, 5, 8, 4, 6, 9, 5, 3, 6, 8, 4, 7, 5, 9, 4, 6, 3];

/** Editors: a timeline mid-cut — two video tracks, two audio waveforms, the playhead. */
function Timeline() {
  return (
    <svg data-craft-art="" viewBox="0 0 90 160" className={ART}>
      <text x="16" y="22" fontSize="4.4" className="fill-chalk-dim">
        00:00:24:00
      </text>
      <g className="stroke-chalk-mute" strokeWidth="0.4">
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={16 + i * 6.6} y1="34" x2={16 + i * 6.6} y2={i % 5 === 0 ? 27 : 31} />
        ))}
      </g>
      <g fontSize="4" className="fill-chalk-mute">
        <text x="5" y="50">V2</text>
        <text x="5" y="67">V1</text>
        <text x="5" y="87">A1</text>
        <text x="5" y="108">A2</text>
      </g>
      <g className="fill-graphite stroke-chalk-mute" strokeWidth="0.4">
        <rect x="34" y="43" width="26" height="10" />
        <rect x="16" y="60" width="30" height="11" />
        <rect x="47" y="60" width="38" height="11" />
      </g>
      <g className="fill-lane" opacity="0.8">
        {WAVE.map((h, i) => (
          <rect key={i} x={16 + i * 2.1} y={86 - h / 2} width="1.2" height={h} />
        ))}
      </g>
      <g className="fill-chalk-mute" opacity="0.7">
        {WAVE.map((h, i) => (
          <rect key={i} x={16 + i * 2.1} y={106 - h / 4} width="1.2" height={h / 2} />
        ))}
      </g>
      <line x1="52" y1="36" x2="52" y2="118" className="stroke-lane" strokeWidth="0.8" />
      <path d="M49 34 H55 L52 38 Z" className="fill-lane" />
      <text x="45" y="153" fontSize="4.2" textAnchor="middle" className="fill-chalk-dim">
        EDIT · 24 FPS
      </text>
    </svg>
  );
}

const BAR_FILLS = ['fill-chalk', 'fill-mustard', 'fill-mint', 'fill-lumen', 'fill-rosso-deep', 'fill-rosso', 'fill-graphite'];

/** Everyone else (grade, sound, design): bars and tone — what every pipeline starts from. */
function Bars() {
  const w = 90 / BAR_FILLS.length;
  return (
    <svg data-craft-art="" viewBox="0 0 90 160" className={ART}>
      {BAR_FILLS.map((fill, i) => (
        <rect key={fill} x={i * w} y="0" width={w + 0.2} height="100" className={fill} />
      ))}
      {[...BAR_FILLS].reverse().map((fill, i) => (
        <rect key={fill} x={i * w} y="100" width={w + 0.2} height="10" className={i % 2 ? 'fill-carbon' : fill} />
      ))}
      <text x="45" y="134" fontSize="5" textAnchor="middle" className="fill-chalk">
        BARS + TONE
      </text>
      <text x="45" y="144" fontSize="4.2" textAnchor="middle" className="fill-chalk-mute">
        1 kHz · −18 dB
      </text>
    </svg>
  );
}
