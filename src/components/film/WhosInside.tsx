import { LaneFrame } from '@/components/join/LaneFrame';
import { sectionTitle } from './sections';

export function WhosInside() {
  return (
    <section id="whos-inside" className="relative px-4 py-20 md:px-10 md:py-28">
      <h2 className="text-label text-chalk-mute">{sectionTitle('whos-inside')}</h2>
      <div className="mt-12 grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 md:gap-8">
        {(['creator', 'editor'] as const).map((lane) => (
          <div key={lane} className="w-full max-w-[22rem] md:max-w-[24rem]">
            <LaneFrame lane={lane} mode="static" />
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 max-w-xl">
        <LaneFrame lane="other" mode="static" />
      </div>
    </section>
  );
}
