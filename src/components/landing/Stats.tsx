import { Odometer } from '@/components/brand/Odometer';
import { STATS_FIXED } from '@/config/landing';
import type { MemberCounts } from '@/lib/wall/queries';

/**
 * The numbers band. Only one number is live (members); the rest are facts about the room, never
 * a made-up reach figure. With no members yet, the first cell says so instead of showing 0.
 */
export function Stats({ counts }: { counts: MemberCounts | null }) {
  const live = counts && counts.total > 0;
  return (
    <section aria-label="The kootam in numbers" className="relative mx-auto max-w-[90rem] px-4 md:px-10">
      <dl className="grid grid-cols-2 border-l border-t border-rule lg:grid-cols-4">
        <div data-spotlight="" data-lane="creator" className="spot relative flex flex-col gap-3 border-b border-r border-rule p-5 md:p-8">
          <dt className="text-label order-2 text-chalk-dim">Members</dt>
          <dd className="order-1 font-display text-[clamp(2.75rem,6vw,5rem)] leading-none text-rosso">
            {live ? <Odometer value={counts.total} digits={String(counts.total).length} label="Members" /> : 'Day 1'}
          </dd>
          <dd className="order-3 font-mono text-xs leading-relaxed text-chalk-mute">
            {live ? `${counts.creators} creators · ${counts.editors} editors · ${counts.other} more` : 'Somebody has to be first.'}
          </dd>
        </div>
        {STATS_FIXED.map((s) => (
          <div key={s.label} data-spotlight="" className="spot relative flex flex-col gap-3 border-b border-r border-rule p-5 md:p-8">
            <dt className="text-label order-2 text-chalk-dim">{s.label}</dt>
            <dd className="order-1 font-display text-[clamp(2.75rem,6vw,5rem)] leading-none text-chalk">{s.value}</dd>
            <dd className="order-3 font-mono text-xs leading-relaxed text-chalk-mute">{s.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
