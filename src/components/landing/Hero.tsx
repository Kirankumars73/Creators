import Link from 'next/link';
import type { CSSProperties } from 'react';
import CountUp from '@/components/bits/CountUp';
import GlareHover from '@/components/bits/GlareHover';
import Magnet from '@/components/bits/Magnet';
import { CraftArt } from '@/components/brand/CraftArt';
import { CraftScene } from '@/components/brand/CraftScene';
import { MlMark } from '@/components/brand/MlMark';
import { JoinButton } from '@/components/session/JoinButton';
import { LANES, brand, type Lane } from '@/config/brand';
import { HERO } from '@/config/landing';
import type { MemberCounts } from '@/lib/wall/queries';
import { HeroFind } from './HeroFind';

// Where each poster sits in the cluster, how crooked it hangs, and when it's slapped on
// (after the wall-writing has painted in).
const POSTERS: Record<Lane, { rot: string; place: string; delay: number }> = {
  creator: { rot: '-4deg', place: 'lg:absolute lg:right-[17rem] lg:top-0 lg:z-20', delay: 1050 },
  editor: { rot: '3deg', place: 'lg:absolute lg:right-0 lg:top-14 lg:z-10', delay: 1250 },
  other: { rot: '-1.5deg', place: 'lg:absolute lg:right-[8rem] lg:top-[22rem] lg:z-30', delay: 1450 },
};

/**
 * A Kerala wall: lime-washed, കൂട്ടം hand-painted across it, and the three rooms pasted on top
 * as film posters. The paint brushes in once and the posters slap on after it — the page's one
 * piece of motion that nobody asked for. The headline paints at first paint (it's the LCP).
 */
export function Hero({ counts }: { counts: MemberCounts | null }) {
  return (
    <section id="top" data-surface="wall" aria-labelledby="hero-title" className="relative overflow-hidden text-chalk">
      {/* Roughens the wall-writing's edges so it reads as brushed paint, not a font. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="brush" x="-5%" y="-5%" width="110%" height="110%">
          {/* wobble: the brush never follows the outline exactly */}
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="14" result="painted" />
          {/* dry brush: noise stretched sideways leaves thin unpainted streaks, like a dragged brush */}
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.4" numOctaves="2" seed="4" result="grit" />
          <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 5.6" result="dry" />
          <feComposite in="painted" in2="dry" operator="in" />
        </filter>
      </svg>

      <div className="relative mx-auto grid max-w-[90rem] grid-cols-1 gap-y-10 px-4 pb-16 pt-24 md:px-10 md:pt-28 lg:min-h-svh lg:grid-cols-[minmax(0,1fr)_33rem] lg:gap-x-10 lg:pb-20">
        <div className="flex flex-col justify-center">
          <p aria-hidden="true" className="-ml-[0.04em] -mt-[0.3em] mb-[-0.04em] text-[min(60vw,20rem,36svh)] leading-none text-rosso lg:text-[min(32vw,20rem,40svh)]">
            <MlMark mlKey="wordmark" variant="wall" className="wall-writing" />
          </p>
          <h1 id="hero-title" className="font-display text-[clamp(3rem,8.5vw,7.25rem)] uppercase leading-[0.94] tracking-[-0.015em]">
            {HERO.headline.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < HERO.headline.length - 1 ? ' ' : null}
              </span>
            ))}
          </h1>
          <HeroFind />
          <p className="text-body mt-6 max-w-[46ch] text-chalk-dim md:mt-8 md:text-[1.1875rem]">{HERO.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            {/* React Bits Magnet: the way in leans toward the cursor. */}
            <Magnet padding={70} magnetStrength={4}>
              <JoinButton>{HERO.primary}</JoinButton>
            </Magnet>
            <Link href="/#brands" className="wall-link inline-flex min-h-11 items-center font-display text-[1.5rem] uppercase">
              {HERO.secondary}
            </Link>
          </div>
          <p className="mt-6 text-sm text-chalk-mute">
            {counts && counts.total > 0 ? (
              <>
                <span className="sr-only">{HERO.members(counts.total)}</span>
                <span aria-hidden="true">
                  <CountUp to={counts.total} duration={1.6} className="font-semibold text-chalk" />{' '}
                  {HERO.members(counts.total).replace(/^\d+ /, '')}
                </span>
              </>
            ) : (
              HERO.empty
            )}
          </p>
        </div>

        {/* On wide screens the posters hang loose; this keeps the wall tall enough to hold them. */}
        <div className="relative lg:min-h-[52rem]">
          <h2 className="mb-4 text-sm font-semibold text-chalk-dim lg:sr-only">{HERO.postersLabel}</h2>
          <ul className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-4 lg:mx-0 lg:block lg:h-full lg:overflow-visible lg:p-0">
            {LANES.map((lane) => (
              <li key={lane} className={`shrink-0 snap-center ${POSTERS[lane].place}`}>
                <Poster lane={lane} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Poster({ lane }: { lane: Lane }) {
  const room = brand.rooms[lane];
  const p = POSTERS[lane];
  return (
    <Link
      href="/join"
      data-lane={lane}
      data-poster={lane}
      aria-label={`Join the ${room.name.toLowerCase()} room: ${room.tagline}`}
      className={`poster paste relative flex w-[16rem] flex-col gap-3 bg-lane p-4 pb-5 sm:w-[17rem] ${lane === 'creator' ? 'text-paper' : 'text-print'}`}
      style={{ '--rot': p.rot, animationDelay: `${p.delay}ms` } as CSSProperties}
    >
      {/* React Bits GlareHover: the photo is a glossy print that catches the light. */}
      <span data-surface="night" className="block">
        <GlareHover width="100%" height="auto" borderRadius="0" background="var(--ink)" glareOpacity={0.35} className="aspect-[16/10] w-full">
          {lane === 'other' ? (
            <CraftArt craft="bars" labels={false} className="absolute inset-0 h-full w-full" />
          ) : (
            <CraftScene craft={lane === 'creator' ? 'viewfinder' : 'timeline'} className="absolute inset-0 h-full w-full" />
          )}
        </GlareHover>
      </span>
      <span className="font-display text-[2.5rem] uppercase leading-[0.9]">{room.name}</span>
      <span className="text-base font-semibold leading-snug">{room.tagline}</span>
      <span className="text-sm leading-snug">{room.copy}</span>
    </Link>
  );
}
