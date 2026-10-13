import { CropMarks } from '@/components/brand/CropMarks';
import { brand } from '@/config/brand';
import { sectionTitle } from './sections';

const FRAMES = ['creator', 'editor'] as const;

export function WhosInside() {
  return (
    <section id="whos-inside" className="relative px-4 py-28 md:px-10 md:py-40">
      <h2 className="text-label text-chalk-mute">{sectionTitle('whos-inside')}</h2>
      <div className="mt-12 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-8">
        {FRAMES.map((lane) => {
          const room = brand.rooms[lane];
          return (
            <article
              key={lane}
              data-lane={lane}
              className="relative flex aspect-[9/16] w-full max-w-[22rem] flex-col justify-between border border-rule bg-carbon p-6 md:max-w-[26rem]"
            >
              <CropMarks offset={8} />
              <p className="text-label flex items-center gap-2 text-chalk-dim">
                <span aria-hidden="true" className="inline-block size-2 bg-lane" />
                {room.label}
              </p>
              <div>
                <h3 className="text-title text-lane">{room.name}</h3>
                <p className="text-body mt-5 text-chalk">{room.copy}</p>
              </div>
            </article>
          );
        })}
      </div>
      <aside
        data-lane="other"
        className="relative mx-auto mt-14 max-w-xl -rotate-1 border border-dashed border-mint bg-carbon p-6"
      >
        <p className="font-display text-[1.75rem] uppercase leading-none text-mint">{brand.rooms.other.name}?</p>
        <p className="mt-3 font-mono text-sm leading-relaxed text-chalk">{brand.rooms.other.copy}</p>
      </aside>
    </section>
  );
}
