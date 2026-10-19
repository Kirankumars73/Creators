'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { Odometer } from '@/components/brand/Odometer';
import { Star } from '@/components/brand/Star';
import { LANES, brand, type Lane } from '@/config/brand';
import { ROLL_CALL } from '@/config/landing';
import type { MemberCounts, WallMember } from '@/lib/wall/queries';

type Filter = 'all' | Lane;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Everyone' },
  ...LANES.map((l) => ({ id: l, label: brand.rooms[l].name })),
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase())
    .join('');

/**
 * The member wall as a directory: filter by lane, search by name or handle, tap through to
 * Instagram. Honest in all three states — populated, empty, unreachable. Only what members
 * opted to show (name, handle, lane); never email.
 */
export function Directory({
  wall,
  counts,
  limit,
}: {
  wall: WallMember[] | null;
  counts: MemberCounts | null;
  /** Show at most this many, with a link to the full directory. */
  limit?: number;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query.trim().toLowerCase().replace(/^@/, ''));

  if (!wall || !counts) {
    return <p className="mt-12 max-w-2xl font-mono text-base leading-relaxed text-chalk-dim">{ROLL_CALL.unreachable}</p>;
  }
  if (counts.total === 0 || wall.length === 0) {
    return <p className="mt-12 max-w-2xl font-mono text-base leading-relaxed text-chalk">{ROLL_CALL.empty}</p>;
  }

  const matches = wall.filter(
    (m) => (filter === 'all' || m.role === filter) && (!q || m.displayName.toLowerCase().includes(q) || m.instagram.toLowerCase().includes(q)),
  );
  const shown = limit ? matches.slice(0, limit) : matches;
  const tallies = [
    ['Members', counts.total],
    ['Creators', counts.creators],
    ['Editors', counts.editors],
    ['Other', counts.other],
  ] as const;

  return (
    <div className="mt-12 flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by lane" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              data-lane={f.id === 'all' ? undefined : f.id}
              onClick={() => setFilter(f.id)}
              className="text-label inline-flex min-h-11 items-center gap-2 border border-rule px-3 text-chalk-dim aria-pressed:border-chalk aria-pressed:bg-chalk aria-pressed:text-ink"
            >
              {f.id === 'all' ? <Star size={10} /> : <span className="size-2 bg-lane" />}
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative flex min-h-11 items-center lg:w-80">
          <span className="sr-only">{ROLL_CALL.search}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ROLL_CALL.search}
            className="peer block min-h-11 w-full rounded-none border-0 border-b border-chalk-dim bg-graphite px-3 text-base text-chalk outline-none placeholder:text-chalk-mute"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-rosso transition-transform duration-[180ms] ease-cut peer-focus:scale-x-100" />
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {matches.length} {matches.length === 1 ? 'member' : 'members'} shown
      </p>

      {shown.length ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((m) => (
            <li key={`${m.instagram}-${m.createdAt}`} data-lane={m.role}>
              <a
                href={`https://instagram.com/${m.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                data-spotlight=""
                className="spot group relative flex min-h-16 items-center gap-3 border border-rule border-l-[3px] border-l-lane bg-carbon p-3 transition-colors hover:border-lane focus-visible:border-lane"
              >
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center bg-lane font-mono text-sm font-medium text-ink">
                  {initials(m.displayName)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-body truncate text-chalk">{m.displayName}</span>
                  <span className="truncate font-mono text-sm text-chalk-dim">@{m.instagram}</span>
                </span>
                <span className="text-label ml-auto shrink-0 text-chalk-mute">{brand.rooms[m.role].short}</span>
                {m.isNew ? (
                  <span className="star-pulse absolute -right-1.5 -top-1.5 inline-flex" title="Joined in the last day">
                    <Star size={14} />
                    <span className="sr-only">New</span>
                  </span>
                ) : null}
                <span className="sr-only">(opens Instagram)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-base text-chalk-dim">{ROLL_CALL.none}</p>
      )}

      <div className="flex flex-col gap-6 border-t border-rule pt-6 md:flex-row md:items-center md:justify-between">
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
        {limit ? (
          <Link href="/creators" className="text-label inline-flex min-h-11 items-center gap-2 border-b border-chalk-dim text-chalk hover:border-chalk">
            {ROLL_CALL.more} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
