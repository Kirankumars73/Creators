import Link from 'next/link';
import type { CSSProperties } from 'react';
import BlurText from '@/components/bits/BlurText';
import TiltedCard from '@/components/bits/TiltedCard';
import { MlMark } from '@/components/brand/MlMark';
import { Wordmark } from '@/components/brand/Wordmark';
import { JoinButton } from '@/components/session/JoinButton';
import { brand } from '@/config/brand';
import { CODE_ARTICLES } from '@/config/code';
import { CODE_SHELF, FINAL, HOW, INSIDE, MANIFESTO, PASS } from '@/config/landing';
import { WallHeading } from './WallHeading';

const SECTION = 'mx-auto max-w-[90rem] px-4 py-16 md:px-10 md:py-24';

/** His grievance, said plainly at street scale. The last line is painted. */
export function Manifesto() {
  return (
    <section id="the-room" aria-labelledby="the-room-title" className={SECTION}>
      <h2 id="the-room-title" className="sr-only">
        {MANIFESTO.title}
      </h2>
      {/* React Bits BlurText: each line comes into focus word by word as it scrolls in. */}
      <div className="flex max-w-5xl flex-col gap-3 text-[clamp(1.75rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-chalk">
        {MANIFESTO.lines.map((line) => (
          <BlurText key={line} text={line} animateBy="words" direction="bottom" stepDuration={0.3} />
        ))}
      </div>
      <BlurText
        text={MANIFESTO.close}
        animateBy="letters"
        direction="top"
        delay={40}
        className="mt-10 font-display text-[clamp(3rem,10vw,8.5rem)] uppercase leading-[0.9] tracking-[-0.02em] text-rosso"
      />
    </section>
  );
}

/** The five steps of joining. Numbered because it is a sequence. */
export function HowToJoin() {
  return (
    <section id="how" aria-labelledby="how-title" className={SECTION}>
      <WallHeading id="how-title" title={HOW.title} />
      <ol className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {HOW.steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 lg:grid-cols-1">
            <span aria-hidden="true" className="row-span-2 font-display text-[3.5rem] leading-none text-rosso lg:row-span-1 lg:text-[4.5rem]">
              {i + 1}
            </span>
            <h3 className="text-lg font-semibold text-chalk">{s.title}</h3>
            <p className="text-body text-chalk-dim">{s.copy}</p>
          </li>
        ))}
      </ol>
      <JoinButton className="mt-14">{HOW.cta}</JoinButton>
    </section>
  );
}

/** What happens inside: four habits, and one real-shaped example pinned to the wall. */
export function Inside() {
  return (
    <section id="inside" aria-labelledby="inside-title" className={SECTION}>
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
        <div>
          <WallHeading id="inside-title" title={INSIDE.title} sub={INSIDE.sub} />
          <dl className="mt-14 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
            {INSIDE.items.map((item) => (
              <div key={item.name} className="flex flex-col gap-2">
                <dt className="font-display text-[2.25rem] uppercase leading-none text-chalk">{item.name}</dt>
                <dd className="text-body max-w-[40ch] text-chalk-dim">{item.copy}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="poster relative self-center bg-paper p-6 pt-7" style={{ '--rot': '2deg' } as CSSProperties}>
          <figcaption className="text-sm font-semibold text-chalk-mute">{INSIDE.example.label}</figcaption>
          <p className="mt-3 text-[1.375rem] font-semibold leading-snug text-chalk">{INSIDE.example.text}</p>
        </figure>
      </div>
    </section>
  );
}

/** The member pass, as the printed card it is. */
export function Pass() {
  const room = brand.rooms.creator;
  return (
    <section id="pass" aria-labelledby="pass-title" className={SECTION}>
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
        <div>
          <WallHeading id="pass-title" title={PASS.title} sub={PASS.copy} />
          <ul className="mt-10 flex flex-col gap-3">
            {PASS.points.map((p) => (
              <li key={p} className="text-body flex gap-3 text-chalk">
                <span aria-hidden="true" className="mt-[0.6em] size-2 shrink-0 bg-rosso" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        {/* React Bits TiltedCard: the pass turns toward the pointer and catches the light. */}
        <div className="mx-auto w-full max-w-[20rem]">
          <TiltedCard containerHeight="31rem" containerWidth="100%" imageHeight="31rem" imageWidth="20rem" radius={4} rotateAmplitude={10} scaleOnHover={1.04} glare={0.45} intro={false}>
            <div aria-label="A sample member pass" role="img" data-lane="creator" className="absolute inset-0 flex flex-col bg-lane p-6 text-paper">
              <div data-surface="night" className="text-chalk">
                <Wordmark size="sm" />
              </div>
              <span className="mt-auto text-sm font-semibold">Member pass</span>
              <span className="mt-1 font-display text-[3rem] uppercase leading-[0.9]">{PASS.sample.name}</span>
              <span className="mt-2 text-base">@{PASS.sample.handle}</span>
              <span className="mt-5 border-t border-paper/40 pt-4 font-display text-[1.5rem] uppercase leading-none">{room.name}</span>
            </div>
          </TiltedCard>
        </div>
      </div>
    </section>
  );
}

/** The Code: the first three articles, big, and the way to the rest. */
export function CodeShelf() {
  return (
    <section id="the-code" aria-labelledby="code-title" className={SECTION}>
      <WallHeading id="code-title" title={CODE_SHELF.title} sub={CODE_SHELF.sub} />
      <ol className="mt-14 flex flex-col gap-10">
        {CODE_ARTICLES.slice(0, 3).map((a) => (
          <li key={a.n} className="grid grid-cols-[3rem_1fr] items-baseline gap-3 md:grid-cols-[7rem_1fr] md:gap-8">
            <span className="font-display text-[clamp(3rem,8vw,6rem)] leading-none text-rosso">{Number(a.n)}</span>
            <p className="max-w-[34ch] text-[clamp(1.375rem,2.6vw,2.125rem)] font-bold leading-[1.15] tracking-[-0.01em] text-chalk">{a.text}</p>
          </li>
        ))}
      </ol>
      <Link href="/code" className="wall-link mt-12 inline-flex min-h-11 items-center text-lg font-semibold text-chalk">
        {CODE_SHELF.more}
      </Link>
    </section>
  );
}

/** The last wall: all red, the biggest type on the page, one way in and one for brands. */
export function FinalCta() {
  return (
    <section id="join" aria-labelledby="join-title" data-on="rosso" className="relative overflow-hidden bg-rosso text-paper">
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[0.32em] -right-[0.05em] text-[min(60vw,34rem)] leading-none text-rosso-deep/70">
        <MlMark mlKey="wordmark" variant="wall" />
      </span>
      <div className="relative mx-auto flex max-w-[90rem] flex-col items-start gap-8 px-4 py-24 md:px-10 md:py-32">
        <h2 id="join-title" className="font-display text-[clamp(4rem,14vw,11rem)] uppercase leading-[0.94] tracking-[-0.02em]">
          {FINAL.headline.map((l, i) => (
            <span key={l} className="block">
              {l}
              {i < FINAL.headline.length - 1 ? ' ' : null}
            </span>
          ))}
        </h2>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <JoinButton variant="ink">{FINAL.primary}</JoinButton>
          <Link href="/#brands" className="inline-flex min-h-11 items-center font-display text-[1.5rem] uppercase underline decoration-2 underline-offset-[6px]">
            {FINAL.secondary}
          </Link>
        </div>
        <p className="text-base font-medium">{FINAL.note}</p>
      </div>
    </section>
  );
}
