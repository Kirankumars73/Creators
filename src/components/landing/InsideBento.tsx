import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import { INSIDE, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WAVE = [4, 9, 6, 13, 8, 11, 16, 9, 6, 12, 7, 5, 10, 15, 9, 6, 8, 12, 6, 9, 14, 8, 5, 9, 12, 6, 10, 7, 13, 6, 9, 5];
const PINS = [18, 46, 71];

const CELL = 'spot relative flex flex-col gap-4 overflow-hidden border border-rule bg-carbon p-6 md:p-7';

function CellHead({ name, copy }: { name: string; copy: string }) {
  return (
    <>
      <h3 className="text-label inline-flex items-center gap-2 self-start border-l-[3px] border-lane bg-graphite px-3 py-2 text-chalk">{name}</h3>
      <p className="text-body max-w-[42ch] text-chalk-dim">{copy}</p>
    </>
  );
}

/** What actually happens inside: the four rituals and the brief board, as an uneven grid of screens. */
export function InsideBento() {
  const { lookingFor, weeklyDrop, cutRoom, gear, briefs } = INSIDE;
  return (
    <section id="inside" aria-labelledby="inside-title" className="relative mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-36">
      <SectionHead id="inside-title" eyebrow={sectionEyebrow('inside')} title={INSIDE.title} accent={1} sub={INSIDE.sub} />

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <article data-spotlight="" data-lane="creator" className={`${CELL} md:col-span-2 lg:col-span-4 lg:row-span-2`}>
          <CellHead name={lookingFor.name} copy={lookingFor.copy} />
          <div className="mt-auto flex flex-col gap-3 pt-4">
            <p className="text-label text-chalk-mute">The format · examples</p>
            <ul className="flex flex-col gap-3">
              {lookingFor.examples.map((p, i) => (
                <li
                  key={p.text}
                  data-lane={p.lane}
                  className="bento-post flex flex-col gap-1 border-l-[3px] border-lane bg-ink px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  <span className="flex items-center gap-3 text-chalk">
                    <span className="text-label text-lane">Looking for</span> {p.text}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-chalk-dim">{p.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article data-spotlight="" data-lane="creator" className={`${CELL} lg:col-span-2`}>
          <CellHead name={weeklyDrop.name} copy={weeklyDrop.copy} />
          <ol aria-label="Drop day: Friday" className="mt-auto grid grid-cols-7 gap-1 pt-2">
            {DAYS.map((d, i) => (
              <li
                key={i}
                className={`grid aspect-square place-items-center font-mono text-xs ${i === 4 ? 'bg-rosso text-chalk' : 'border border-rule text-chalk-mute'}`}
              >
                {i === 4 ? <Star size={14} color="var(--chalk)" /> : d}
                {i === 4 ? <span className="sr-only">Friday</span> : null}
              </li>
            ))}
          </ol>
        </article>

        <article data-spotlight="" data-lane="editor" className={`${CELL} lg:col-span-2`}>
          <CellHead name={cutRoom.name} copy={cutRoom.copy} />
          <div aria-hidden="true" className="relative mt-auto h-16 border-y border-rule">
            <div className="absolute inset-0 flex items-center gap-[3px] px-1">
              {WAVE.map((h, i) => (
                <span key={i} className="cut-wave w-full bg-lumen/70" style={{ height: `${h * 3}px`, animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
            {PINS.map((left, i) => (
              <span key={left} className="absolute -top-2 flex flex-col items-center" style={{ left: `${left}%` }}>
                <span className="grid size-4 place-items-center rounded-full bg-mustard font-mono text-[0.55rem] text-ink">{i + 1}</span>
                <span className="h-[4.5rem] w-px bg-mustard/70" />
              </span>
            ))}
          </div>
        </article>

        <article data-spotlight="" data-lane="other" className={`${CELL} md:col-span-1 lg:col-span-3`}>
          <CellHead name={gear.name} copy={gear.copy} />
          <ul className="mt-auto flex flex-wrap gap-2 pt-2">
            {gear.tags.map((t, i) => (
              <li key={t} className={`text-label border px-3 py-2 ${i === 2 ? 'border-rosso text-rosso line-through decoration-2' : 'border-rule text-chalk'}`}>
                {t}
              </li>
            ))}
          </ul>
        </article>

        <article data-spotlight="" data-lane="other" className={`${CELL} md:col-span-1 lg:col-span-3`}>
          <CellHead name={briefs.name} copy={briefs.copy} />
          <div className="mt-auto border border-dashed border-mint/60 bg-ink p-4 font-mono text-xs uppercase leading-relaxed tracking-[0.1em] text-chalk-dim">
            <p className="text-mint">Example brief</p>
            <p className="mt-2 text-chalk">Café launch · Kozhikode</p>
            <p>2 reels + 1 story · paid + barter · editors welcome</p>
          </div>
          <Link href="/#brands" className="text-label inline-flex min-h-11 items-center gap-2 self-start border-b border-mint text-chalk">
            Post a brief <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>
    </section>
  );
}
