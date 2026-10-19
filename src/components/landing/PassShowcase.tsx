'use client';

import { useState } from 'react';
import { SlateStripes } from '@/components/brand/SlateStripes';
import { Star } from '@/components/brand/Star';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { LANES, brand, type Lane } from '@/config/brand';
import { PASS, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

const BARS = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2];

/**
 * The member pass, as a card you can turn in the light: it leans toward the pointer and a
 * holographic sheen follows it (after React Bits' HoloCard / ProfileCard). The lane buttons
 * recolour it. It's a sample — the real one is made at the end of the join flow.
 */
export function PassShowcase() {
  const [lane, setLane] = useState<Lane>('editor');
  const room = brand.rooms[lane];
  return (
    <section id="pass" aria-labelledby="pass-title" className="relative mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-16 px-4 py-24 md:px-10 md:py-36 lg:grid-cols-2">
      <div className="flex flex-col gap-8">
        <SectionHead id="pass-title" eyebrow={sectionEyebrow('pass')} title={PASS.title} accent={1} sub={PASS.copy} />
        <ul className="flex flex-col gap-5">
          {PASS.points.map((p, i) => (
            <li key={p.title} className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center border border-rule font-mono text-xs text-chalk-dim">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="font-subhead text-lg font-bold text-chalk">{p.title}</p>
                <p className="text-body text-chalk-dim">{p.copy}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button href="/join" className="self-start">
          {PASS.cta}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div data-lane={lane} data-spotlight="" data-tilt="12" className="holo-pass relative w-full max-w-[22rem] transition-transform duration-300 ease-pan">
          <div className="relative flex aspect-[5/7] flex-col overflow-hidden border-2 border-lane bg-carbon transition-colors duration-500">
            <SlateStripes className="h-5" band={10} />
            <div className="flex items-start justify-between p-5">
              <Wordmark size="sm" lane={lane} />
              <span className="text-label border border-lane px-2 py-1 text-lane transition-colors duration-500">Member pass</span>
            </div>
            <div className="mt-auto flex flex-col gap-2 px-5">
              <span className="text-label text-chalk-dim">{room.label}</span>
              <span className="font-display text-[3.25rem] uppercase leading-[0.9] text-chalk">{PASS.sample.name}</span>
              <span className="font-mono text-sm text-chalk-dim">@{PASS.sample.handle}</span>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4 border-t border-rule p-5">
              <div className="flex flex-col gap-1">
                <span className="text-label text-chalk-mute">District</span>
                <span className="text-label text-chalk">{PASS.sample.city}</span>
              </div>
              <span aria-hidden="true" className="flex h-9 items-stretch gap-[2px]">
                {BARS.map((w, i) => (
                  <span key={i} className="bg-chalk" style={{ width: w }} />
                ))}
              </span>
            </div>
            <span aria-hidden="true" className="holo-sheen pointer-events-none absolute inset-0" />
            <Star size={18} className="absolute right-5 top-[4.6rem]" />
          </div>
        </div>

        <div role="group" aria-label="Preview the pass in a lane" className="flex gap-2">
          {LANES.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lane}
              data-lane={l}
              onClick={() => setLane(l)}
              className="text-label inline-flex min-h-11 items-center gap-2 border border-rule px-3 text-chalk-dim aria-pressed:border-lane aria-pressed:text-chalk"
            >
              <span className="size-2 bg-lane" />
              {brand.rooms[l].short}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
