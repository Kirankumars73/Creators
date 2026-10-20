'use client';

import RotatingText from '@/components/bits/RotatingText';
import { FIND } from '@/config/landing';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

/**
 * "Find your editor." — the craft swaps every couple of seconds (React Bits RotatingText).
 * RotatingText doesn't check reduced motion itself, so here it holds still on the first word.
 * Screen readers get the whole list once.
 */
export function HeroFind() {
  const reduced = usePrefersReducedMotion();
  return (
    <p className="mt-5 font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-none tracking-[-0.01em]">
      <span className="sr-only">
        {FIND.lead} {FIND.words.join(' ')}
      </span>
      <span aria-hidden="true" className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {FIND.lead}
        {reduced ? (
          <span className="bg-rosso px-3 pb-1 pt-1.5 text-paper">{FIND.words[0]}</span>
        ) : (
          <RotatingText
            texts={[...FIND.words]}
            mainClassName="overflow-hidden bg-rosso px-3 pb-1 pt-1.5 text-paper"
            splitLevelClassName="overflow-hidden"
            staggerFrom="last"
            staggerDuration={0.02}
            rotationInterval={2200}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
        )}
      </span>
    </p>
  );
}
