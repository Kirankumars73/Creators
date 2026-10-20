'use client';

import ScrollVelocity from '@/components/bits/ScrollVelocity';
import { Star } from '@/components/brand/Star';
import { CRAFTS } from '@/config/landing';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

const ROW = 'flex items-center gap-[0.4em] pr-[0.4em]';

/**
 * Every craft in the room on two pasted strips that run opposite ways and surge with scroll
 * speed (React Bits ScrollVelocity). Screen readers get the plain list once.
 */
export function CraftTicker() {
  // ScrollVelocity doesn't check reduced motion itself: then the strips are simply pasted, still.
  const reduced = usePrefersReducedMotion();
  const half = Math.ceil(CRAFTS.length / 2);
  const row = (items: readonly string[], star: string) => (
    <span className={ROW}>
      {items.map((c) => (
        <span key={c} className={ROW}>
          {c} <Star size="0.5em" color={star} />
        </span>
      ))}
    </span>
  );
  return (
    <div className="relative z-10 overflow-hidden py-6">
      <ul className="sr-only" aria-label="Crafts in the kootam">
        {CRAFTS.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="-rotate-[1.5deg] [&_.parallax]:py-2.5 [&_.parallax:first-child]:bg-rosso [&_.parallax:first-child]:text-paper [&_.parallax:last-child]:bg-print [&_.parallax:last-child]:text-wall">
        {reduced ? (
          <div className="flex flex-col font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-[1.05]">
            <div className="parallax overflow-hidden whitespace-nowrap px-4">{row(CRAFTS.slice(0, half), 'var(--print)')}</div>
            <div className="parallax overflow-hidden whitespace-nowrap px-4">{row(CRAFTS.slice(half), 'var(--mustard)')}</div>
          </div>
        ) : (
          <ScrollVelocity
            texts={[row(CRAFTS.slice(0, half), 'var(--print)'), row(CRAFTS.slice(half), 'var(--mustard)')]}
            velocity={45}
            numCopies={4}
            skewWithVelocity={6}
            scrollerStyle={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: 1.05, textTransform: 'uppercase', filter: 'none', letterSpacing: '-0.01em' }}
          />
        )}
      </div>
    </div>
  );
}
