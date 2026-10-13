import { Odometer } from '@/components/brand/Odometer';
import { Star } from '@/components/brand/Star';
import { brand } from '@/config/brand';
import type { MemberCounts, WallMember } from '@/lib/wall/queries';

const EMPTY = 'ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.';
const UNREACHABLE = 'ROLL CALL — signal lost. Refresh in a minute.';

/** §6.7 — the member wall, honest in all three states: populated, empty, unreachable. */
export function RollCallBoard({ wall, counts }: { wall: WallMember[] | null; counts: MemberCounts | null }) {
  if (!wall || !counts) {
    return <p className="mt-12 max-w-2xl font-mono text-base leading-relaxed text-chalk-dim">{UNREACHABLE}</p>;
  }
  if (counts.total === 0) {
    return <p className="mt-12 max-w-2xl font-mono text-base leading-relaxed text-chalk">{EMPTY}</p>;
  }

  const tallies = [
    ['Members', counts.total],
    ['Creators', counts.creators],
    ['Editors', counts.editors],
    ['Other', counts.other],
  ] as const;

  return (
    <div className="mt-12 flex flex-col gap-10">
      <ul className="flex flex-wrap gap-2">
        {wall.map((m) => (
          <li
            key={`${m.instagram}-${m.createdAt}`}
            data-lane={m.role}
            className="flex min-h-11 items-center gap-3 border-l-[3px] border-lane bg-graphite px-3 py-2"
          >
            <span className="text-body text-chalk">{m.displayName}</span>
            <span className="font-mono text-sm text-chalk-dim">@{m.instagram}</span>
            <span className="text-label text-chalk-mute">{brand.rooms[m.role].short}</span>
            {m.isNew ? (
              <span className="star-pulse inline-flex" title="Joined in the last day">
                <Star size={14} />
                <span className="sr-only">New</span>
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm uppercase tracking-[0.14em] text-chalk-dim">
        {tallies.map(([label, n]) => (
          <span key={label} className="flex items-center gap-3">
            <span aria-hidden="true">{label}</span>
            <span className="text-chalk">
              <Odometer value={n} digits={6} label={label} />
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}
