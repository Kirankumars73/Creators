import { LaneFrame } from '@/components/join/LaneFrame';
import { GateFrames } from './GateFrames';
import { SectionCard } from './SectionCard';
import { sectionTitle } from './sections';

export function WhosInside() {
  return (
    <section id="whos-inside" className="relative px-4 py-28 md:px-10 md:py-40">
      <SectionCard id="whos-inside" />
      <h2 className="text-label text-chalk-mute">{sectionTitle('whos-inside')}</h2>
      <GateFrames />
      <div className="mx-auto mt-14 max-w-xl">
        <LaneFrame lane="other" mode="static" />
      </div>
    </section>
  );
}
