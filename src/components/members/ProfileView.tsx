import type { ReactNode } from 'react';
import TiltedCard from '@/components/bits/TiltedCard';
import { LazyInView } from '@/components/cards/LazyInView';
import { MemberLanyard } from '@/components/cards/MemberLanyard';
import { PortraitCard } from '@/components/members/PortraitCard';
import { BriefForm } from '@/components/landing/BriefForm';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import type { MemberProfile } from '@/lib/wall/queries';

const SINCE = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/**
 * A member's page (the "creator kit"): their pass as a poster, how to reach them, and a brief
 * form addressed to them. District, crafts and portfolio show only if they chose a public
 * profile; everyone on the wall gets at least their name, handle and room.
 */
export function ProfileView({ p }: { p: MemberProfile }) {
  return (
    <>
      <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-20">
        <ProfilePoster p={p} />
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] uppercase leading-[0.92] tracking-[-0.015em] text-chalk">{p.displayName}</h1>
            <p data-lane={p.role} className="text-lg font-semibold text-chalk-dim">
              <span className="text-lane">{brand.rooms[p.role].name}</span>
              {p.city ? <> in {p.city}</> : null}
              <span className="text-chalk-mute"> · member since {SINCE.format(new Date(p.createdAt))}</span>
            </p>
          </header>

          {p.hasProfile ? (
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {p.roleOtherText ? <Detail term="What they do">{p.roleOtherText}</Detail> : null}
              {p.tags.length ? (
                <Detail term="Crafts">
                  <ul className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li key={t} data-lane={p.role} className={`rounded-full bg-lane px-3 py-1 text-sm font-semibold ${p.role === 'creator' ? 'text-paper' : 'text-print'}`}>
                        {t}
                      </li>
                    ))}
                  </ul>
                </Detail>
              ) : null}
            </dl>
          ) : (
            <p className="text-body max-w-[52ch] text-chalk-dim">{p.displayName} keeps their district and work private. Reach them on Instagram.</p>
          )}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noopener noreferrer">
              Instagram @{p.instagram}
            </Button>
            {p.portfolioUrl ? (
              <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className="wall-link inline-flex min-h-11 items-center font-display text-[1.5rem] uppercase">
                See their work
              </a>
            ) : null}
            <a href="#brief" className="wall-link inline-flex min-h-11 items-center font-display text-[1.5rem] uppercase">
              Work with {p.displayName.split(/\s+/)[0]}
            </a>
          </div>
        </div>
      </div>

      <section id="brief" aria-label={`Brief ${p.displayName}`} data-surface="night" className="mt-16 grid grid-cols-1 gap-8 bg-ink p-4 text-chalk md:mt-20 md:gap-10 md:p-10 lg:grid-cols-[minmax(0,1fr)_34rem]">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.94]">Work with {p.displayName}</h2>
          <p className="text-body max-w-[46ch] text-chalk-dim">
            Brands and collaborators: tell us what you’re making. The {brand.name} team reads every brief and passes it to @{p.instagram}.
          </p>
        </div>
        <BriefForm forInstagram={p.instagram} />
      </section>
    </>
  );
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-sm font-semibold text-chalk-mute">{term}</dt>
      <dd className="text-lg font-semibold text-chalk">{children}</dd>
    </div>
  );
}

/**
 * Their pass hanging on a strap you can drag (three.js, fetched only as it scrolls into view).
 * Until then, and on browsers without WebGL, it is their portrait card, tilting with the pointer.
 */
function ProfilePoster({ p }: { p: MemberProfile }) {
  const portrait = (
    <div className="mx-auto w-full max-w-[22rem]" role="img" aria-label={`${p.displayName}, ${brand.rooms[p.role].name}`}>
      <TiltedCard containerHeight="auto" containerWidth="100%" imageHeight="auto" imageWidth="100%" radius={6} rotateAmplitude={9} glare={0.4} intro={false} floating>
        <PortraitCard name={p.displayName} instagram={p.instagram} role={p.role} hasPhoto={p.hasPhoto} size="full" eager className="min-h-[26rem]" />
      </TiltedCard>
    </div>
  );
  return (
    <LazyInView fallback={portrait} margin="200px" className="mx-auto h-[34rem] w-full max-w-[24rem]">
      <div role="img" aria-label={`${p.displayName}'s member pass, hanging on a strap. Drag it to swing it, tap it to flip it.`} className="size-full">
        <MemberLanyard instagram={p.instagram} role={p.role} />
      </div>
    </LazyInView>
  );
}
