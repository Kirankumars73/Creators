'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { Star } from '@/components/brand/Star';
import { LANES, type Lane } from '@/config/brand';
import { ROLL_CALL } from '@/config/landing';
import type { MemberCounts, WallMember } from '@/lib/wall/queries';

type Filter = 'all' | Lane;

const ROOM_LABEL: Record<Lane, string> = { creator: 'Content creators', editor: 'Editors', other: 'Something else' };
const FILTERS: { id: Filter; label: string }[] = [{ id: 'all', label: 'Everyone' }, ...LANES.map((l) => ({ id: l, label: ROOM_LABEL[l] }))];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0]!.toUpperCase())
    .join('');

/**
 * The member wall as a directory: filter by room, search by name or handle, tap through to
 * Instagram. Honest in all three states — populated, empty, unreachable. Only what members
 * opted to show (name, handle, room); never email.
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
    return <p className="text-body mt-10 max-w-2xl text-chalk-dim">{ROLL_CALL.unreachable}</p>;
  }
  if (counts.total === 0 || wall.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-start gap-5">
        <p className="text-body max-w-2xl text-chalk">{ROLL_CALL.empty}</p>
        <Link href="/join" className="wall-link inline-flex min-h-11 items-center text-lg font-semibold text-chalk">
          Join the kootam
        </Link>
      </div>
    );
  }

  const matches = wall.filter(
    (m) => (filter === 'all' || m.role === filter) && (!q || m.displayName.toLowerCase().includes(q) || m.instagram.toLowerCase().includes(q)),
  );
  const shown = limit ? matches.slice(0, limit) : matches;
  const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

  return (
    <div className="mt-10 flex flex-col gap-8">
      <p className="text-body text-chalk-dim">
        <span className="sr-only">Members {counts.total}. </span>
        <span aria-hidden="true">{counts.total} members: </span>
        <span>
          {n(counts.creators, 'content creator', 'content creators')}, {n(counts.editors, 'editor', 'editors')} and{' '}
          {n(counts.other, 'other maker', 'other makers')}.
        </span>
      </p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by room" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              data-lane={f.id === 'all' ? undefined : f.id}
              onClick={() => setFilter(f.id)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-chalk/20 px-4 text-sm font-semibold text-chalk hover:border-chalk aria-pressed:border-chalk aria-pressed:bg-chalk aria-pressed:text-surface"
            >
              {f.id === 'all' ? <Star size={12} /> : <span className="size-2.5 rounded-full bg-lane" />}
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
            className="block min-h-11 w-full rounded-full border-2 border-chalk/20 bg-carbon px-4 text-base text-chalk outline-none placeholder:text-chalk-mute focus:border-chalk"
          />
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
                className="group relative flex min-h-16 items-center gap-3 bg-carbon p-3 pr-4 shadow-[0_1px_0_color-mix(in_oklab,var(--chalk)_12%,transparent)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-lane text-sm font-bold text-print">
                  {initials(m.displayName)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-chalk">{m.displayName}</span>
                  <span className="truncate text-sm text-chalk-dim">@{m.instagram}</span>
                </span>
                <span className="ml-auto shrink-0 text-xs font-semibold text-chalk-mute">{ROOM_LABEL[m.role]}</span>
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
        <p className="text-body text-chalk-dim">{ROLL_CALL.none}</p>
      )}

      {limit ? (
        <Link href="/creators" className="wall-link inline-flex min-h-11 items-center self-start text-lg font-semibold text-chalk">
          {ROLL_CALL.more}
        </Link>
      ) : null}
    </div>
  );
}
