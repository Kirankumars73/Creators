'use client';

import { useEffect, useRef, useState } from 'react';
import { CraftArt, type Craft } from '@/components/brand/CraftArt';
import { CropMarks } from '@/components/brand/CropMarks';
import { brand, type Lane } from '@/config/brand';

const CARDS: { lane: Lane; craft: Craft }[] = [
  { lane: 'creator', craft: 'viewfinder' },
  { lane: 'editor', craft: 'timeline' },
  { lane: 'other', craft: 'bars' },
];

const EVERY = 3200;
const DROP = 520;

/**
 * Three lane cards in a fanned stack; every few seconds the front one drops away and returns
 * at the back (after React Bits' CardSwap, done with CSS transitions). They show the craft,
 * never a person. Pauses on hover, off screen, in a hidden tab, and stays still under reduced motion.
 */
export function HeroStack() {
  const [order, setOrder] = useState([0, 1, 2]);
  const [dropping, setDropping] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = true;
    let hovered = false;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(el);
    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    const tick = setInterval(() => {
      if (!visible || hovered || document.hidden) return;
      setDropping(true);
      timer = setTimeout(() => {
        setOrder((o) => [...o.slice(1), o[0]!]);
        setDropping(false);
      }, DROP);
    }, EVERY);
    return () => {
      clearInterval(tick);
      clearTimeout(timer);
      io.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="hero-stack relative aspect-[9/16] w-[11rem] sm:w-[13rem] lg:w-[15.5rem]">
      {CARDS.map((c, i) => {
        const pos = order.indexOf(i);
        return (
          <div
            key={c.lane}
            data-lane={c.lane}
            data-pos={pos}
            data-drop={pos === 0 && dropping ? '' : undefined}
            data-craft={c.craft}
            className="stack-card absolute inset-0 overflow-hidden border border-lane bg-carbon"
            style={{ zIndex: 3 - pos }}
          >
            <CraftArt craft={c.craft} className="absolute inset-0 h-full w-full" />
            <span className="absolute inset-y-0 left-0 w-[3px] bg-lane" />
            <span className="text-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent px-3 pb-3 pt-10 text-chalk">
              {brand.rooms[c.lane].label}
            </span>
            <CropMarks size={10} tone="lane" />
          </div>
        );
      })}
    </div>
  );
}
