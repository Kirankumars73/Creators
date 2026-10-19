import { Odometer } from '@/components/brand/Odometer';
import { Star } from '@/components/brand/Star';
import { CircularText } from '@/components/fx/CircularText';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { HERO } from '@/config/landing';
import type { MemberCounts, WallMember } from '@/lib/wall/queries';
import { HeroStack } from './HeroStack';
import { HeroThreads } from './HeroThreads';
import { ProximityHeadline } from './ProximityHeadline';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase())
    .join('');

/** The first screen: who this is for, the two ways in, and — only if real — who's already inside. */
export function Hero({ counts, wall }: { counts: MemberCounts | null; wall: WallMember[] | null }) {
  const faces = (wall ?? []).slice(0, 5);
  const live = counts && counts.total > 0;
  return (
    <section id="top" aria-label={brand.name} className="relative isolate flex min-h-svh flex-col overflow-hidden pt-24 md:pt-28">
      <HeroThreads />

      <div className="relative mx-auto grid w-full max-w-[90rem] flex-1 grid-cols-1 items-center gap-12 px-4 pb-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
        <div className="flex flex-col items-start">
          <p className="text-label hero-rise inline-flex items-center gap-2 border border-rule bg-ink/70 px-3 py-1.5 text-chalk-dim">
            <Star size={11} className="star-pulse" /> {HERO.tag}
          </p>
          <ProximityHeadline lines={HERO.headline} className="mt-6" />
          <p className="text-body hero-rise mt-8 max-w-[44ch] text-chalk-dim [animation-delay:120ms] md:mt-10">{HERO.sub}</p>
          <div className="hero-rise mt-9 flex flex-wrap items-center gap-4 [animation-delay:200ms]">
            <span data-magnet="60" className="inline-flex transition-transform duration-300 ease-pan">
              <Button href="/join">
                {HERO.primary} <span aria-hidden="true">→</span>
              </Button>
            </span>
            <Button href="/#brands" variant="ghost">
              {HERO.secondary}
            </Button>
          </div>

          <div className="hero-rise mt-10 flex flex-wrap items-center gap-5 [animation-delay:280ms]">
            {live ? (
              <>
                {faces.length ? (
                  <ul aria-label="Recently joined" className="flex">
                    {faces.map((m, i) => (
                      <li
                        key={`${m.instagram}-${m.createdAt}`}
                        data-lane={m.role}
                        title={m.displayName}
                        className="-ml-2 grid size-10 place-items-center rounded-full border-2 border-ink bg-lane font-mono text-xs font-medium text-ink first:ml-0"
                        style={{ zIndex: 10 - i }}
                      >
                        <span aria-hidden="true">{initials(m.displayName)}</span>
                        <span className="sr-only">{m.displayName}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-label flex items-center gap-3 text-chalk-dim">
                  <span className="font-mono text-base text-chalk">
                    <Odometer value={counts.total} digits={4} label="Members" />
                  </span>
                  <span aria-hidden="true">makers inside</span>
                </p>
              </>
            ) : (
              <p className="text-label max-w-[40ch] text-chalk-dim">{HERO.empty}</p>
            )}
          </div>
        </div>

        <div className="relative hidden justify-self-center sm:block lg:mr-10">
          <HeroStack />
          <CircularText id="hero-ring" text={HERO.sticker} size={132} className="absolute -bottom-10 -left-14 rounded-full bg-mustard text-ink">
            <Star size={30} color="var(--ink)" />
          </CircularText>
        </div>
      </div>
    </section>
  );
}
