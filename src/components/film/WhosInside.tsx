import { LaneFrame } from '@/components/join/LaneFrame';
import { sectionTitle } from './sections';

export function WhosInside() {
  return (
    <section id="whos-inside" className="relative px-4 py-20 md:px-10 md:py-28">
      <h2 className="text-label text-chalk-mute">{sectionTitle('whos-inside')}</h2>
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <LaneFrame lane="creator" mode="static" />
        <LaneFrame lane="editor" mode="static" />
        <LaneFrame lane="other" mode="static" className="md:col-span-2" />
      </div>
    </section>
  );
}
