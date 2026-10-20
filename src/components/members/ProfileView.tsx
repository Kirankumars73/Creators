import type { CSSProperties, ReactNode } from 'react';
import GlareHover from '@/components/bits/GlareHover';
import { Wordmark } from '@/components/brand/Wordmark';
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

/** Their pass as a pasted poster in their room's colour; the photo frame catches the light. */
function ProfilePoster({ p }: { p: MemberProfile }) {
  const ink = p.role === 'creator' ? 'text-paper' : 'text-print';
  return (
    <div
      data-lane={p.role}
      role="img"
      aria-label={`${p.displayName}'s member pass`}
      className={`poster paste relative mx-auto flex aspect-[9/14] w-full max-w-[22rem] flex-col bg-lane p-6 ${ink}`}
      style={{ '--rot': '-2deg' } as CSSProperties}
    >
      <div data-surface={p.role === 'creator' ? 'night' : 'wall'}>
        <Wordmark size="sm" />
      </div>
      <span data-surface="night" className="mt-6 block">
        <GlareHover width="100%" height="auto" borderRadius="0" background="var(--ink)" glareOpacity={0.35} className="aspect-[16/10] w-full">
          {p.hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/photo/by/${p.instagram}`} alt={`${p.displayName}`} width={400} height={250} className="absolute inset-0 size-full object-cover object-[50%_22%]" />
          ) : (
            <span className="font-display text-[clamp(3rem,10vw,4.5rem)] uppercase leading-none text-chalk">{[...p.displayName][0]}</span>
          )}
        </GlareHover>
      </span>
      <span className="mt-auto text-sm font-semibold">Member pass</span>
      <span className="mt-1 break-words font-display text-[2.5rem] uppercase leading-[0.9]">{p.displayName}</span>
      <span className="mt-2 text-base">@{p.instagram}</span>
      <span className="mt-4 border-t border-current/30 pt-3 font-display text-[1.375rem] uppercase leading-none">{brand.rooms[p.role].name}</span>
    </div>
  );
}
