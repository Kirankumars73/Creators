import Link from 'next/link';
import { CraftArt, type Craft } from '@/components/brand/CraftArt';
import { CraftScene } from '@/components/brand/CraftScene';
import { CropMarks } from '@/components/brand/CropMarks';
import { brand, type Lane } from '@/config/brand';
import { LANE_CTA, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

const LANES: { lane: Lane; craft: Craft; wide?: boolean }[] = [
  { lane: 'creator', craft: 'viewfinder' },
  { lane: 'editor', craft: 'timeline' },
  { lane: 'other', craft: 'bars', wide: true },
];

/**
 * Who it's for: three lanes, each a card with its craft on a screen. The pointer lights the card
 * in its lane colour and leans it a few degrees (PointerFx); keyboard focus lights it too.
 */
export function Lanes() {
  return (
    <section id="lanes" aria-labelledby="lanes-title" className="relative mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-36">
      <SectionHead
        id="lanes-title"
        eyebrow={sectionEyebrow('lanes')}
        title={['THREE LANES.', 'ONE KOOTAM.']}
        accent={1}
        sub="Pick the one that sounds like you. The lane decides your room — the community is for everyone."
      />
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {LANES.map(({ lane, craft, wide }) => {
          const room = brand.rooms[lane];
          return (
            <article
              key={lane}
              data-lane={lane}
              data-spotlight=""
              data-tilt="5"
              className={`spot group relative flex flex-col overflow-hidden border border-rule bg-carbon transition-[transform,border-color] duration-300 ease-pan focus-within:border-lane hover:border-lane ${
                wide ? 'md:col-span-2 md:flex-row' : ''
              }`}
            >
              <div data-monitor="" className={`relative overflow-hidden border-b border-rule bg-ink ${wide ? 'aspect-[16/7] md:aspect-auto md:w-2/5 md:border-b-0 md:border-r' : 'aspect-[16/10]'}`}>
                {craft === 'bars' ? (
                  <CraftArt craft={craft} className="lane-art absolute inset-0 h-full w-full" />
                ) : (
                  <CraftScene craft={craft} className="lane-art absolute inset-0 h-full w-full" />
                )}
                <span className="text-label absolute left-3 top-3 flex items-center gap-2 bg-ink/80 px-2 py-1 text-chalk">
                  <span className="rec-dot size-2 rounded-full bg-lane" /> {room.short}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                <p className="text-label flex items-center gap-2 text-chalk-dim">
                  <span className="size-2 bg-lane" /> {room.label}
                </p>
                <h3 className="font-display text-[clamp(2.5rem,5vw,4rem)] uppercase leading-[0.9] tracking-[-0.02em] text-lane">{room.name}</h3>
                <p className="text-body max-w-[46ch] text-chalk-dim">{room.copy}</p>
                <Link
                  href="/join"
                  className="text-label mt-auto inline-flex min-h-11 items-center gap-2 self-start border-b border-lane pt-4 text-chalk"
                >
                  {LANE_CTA[lane]} <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
              <CropMarks size={12} tone="lane" />
            </article>
          );
        })}
      </div>
    </section>
  );
}
