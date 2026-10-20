'use client';

import { useState } from 'react';
import TiltedCard from '@/components/bits/TiltedCard';
import { Wordmark } from '@/components/brand/Wordmark';
import { LazyInView } from '@/components/cards/LazyInView';
import { PassHolo } from '@/components/cards/PassHolo';
import { brand, LANES, type Lane } from '@/config/brand';
import { PASS } from '@/config/landing';

const CHIP_LABEL: Record<Lane, string> = { creator: 'Content creators', editor: 'Editors', other: 'Something else' };

/**
 * The sample member card as a foil collectible (shards, glitter or cosmos, by room), with a
 * switch to see it in each room's colour. The foil card is only fetched as it scrolls into view;
 * until then, and without WebGL, it is a plain card that tilts toward the pointer.
 */
export function PassShowcase() {
  const [lane, setLane] = useState<Lane>('creator');
  const room = brand.rooms[lane];
  return (
    <div className="mx-auto flex w-full max-w-[19.5rem] flex-col items-center gap-5">
      <LazyInView
        className="min-h-[27.5rem] w-full"
        fallback={
          <TiltedCard containerHeight="27rem" containerWidth="100%" imageHeight="27rem" imageWidth="19.5rem" radius={9} rotateAmplitude={10} scaleOnHover={1.04} glare={0.45} intro={false}>
            <div aria-label="A sample member card" role="img" data-lane={lane} className="absolute inset-0 flex flex-col bg-lane p-6 text-paper">
              <div data-surface="night" className="text-chalk">
                <Wordmark size="sm" />
              </div>
              <span className="mt-auto text-sm font-semibold">Member pass</span>
              <span className="mt-1 font-display text-[3rem] uppercase leading-[0.9]">{PASS.sample.name}</span>
              <span className="mt-2 text-base">@{PASS.sample.handle}</span>
              <span className="mt-5 border-t border-paper/40 pt-4 font-display text-[1.5rem] uppercase leading-none">{room.name}</span>
            </div>
          </TiltedCard>
        }
      >
        <PassHolo src={`/api/pass/sample?lane=${lane}&style=badge`} alt={`A sample member card in the ${room.name.toLowerCase()} room`} lane={lane} />
      </LazyInView>
      <div role="group" aria-label="See the card in each room" className="flex flex-wrap justify-center gap-2">
        {LANES.map((l) => (
          <button
            key={l}
            type="button"
            data-lane={l}
            aria-pressed={lane === l}
            onClick={() => setLane(l)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3.5 text-sm font-semibold transition-colors ${lane === l ? 'border-chalk bg-chalk text-surface' : 'border-chalk/20 text-chalk hover:border-chalk'}`}
          >
            <span aria-hidden="true" className="size-2.5 rounded-full bg-lane" />
            {CHIP_LABEL[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
