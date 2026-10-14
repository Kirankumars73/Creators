import type { MemberCounts, WallMember } from '@/lib/wall/queries';
import { RollCallBoard } from './RollCallBoard';
import { sectionTitle } from './sections';

export function RollCall({ wall, counts }: { wall: WallMember[] | null; counts: MemberCounts | null }) {
  return (
    <section id="roll-call" className="relative px-4 py-20 md:px-10 md:py-28">
      <h2 className="text-label text-chalk-mute">{sectionTitle('roll-call')}</h2>
      <RollCallBoard wall={wall} counts={counts} />
    </section>
  );
}
