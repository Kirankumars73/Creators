import type { CSSProperties } from 'react';
import { brand, type Lane } from '@/config/brand';

type PortraitCardProps = {
  name: string;
  instagram: string;
  role: Lane;
  hasPhoto: boolean;
  /** Which size of photo to ask for; the small one keeps a grid of tiles light. */
  size?: 'thumb' | 'full';
  /** First screenful of images load at once, the rest wait until near the screen. */
  eager?: boolean;
  /** The room as written for people (e.g. "Editors"); defaults to the room's name. */
  roomLabel?: string;
  className?: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('')
    .toUpperCase();

/**
 * A member as a portrait card: their photo filling the card (or their room's colour and initials
 * until they add one), with a dark fade at the bottom carrying name, handle and room.
 */
export function PortraitCard({ name, instagram, role, hasPhoto, size = 'thumb', eager = false, roomLabel, className = '' }: PortraitCardProps) {
  const ink = role === 'creator' ? 'text-paper' : 'text-print';
  return (
    <div data-lane={role} className={`relative isolate aspect-[4/5] w-full overflow-hidden bg-lane ${className}`} style={{ '--fade': 'rgb(8 12 24 / 0.82)' } as CSSProperties}>
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/photo/by/${instagram}${size === 'thumb' ? '?size=thumb' : ''}`}
          alt=""
          width={size === 'thumb' ? 240 : 800}
          height={size === 'thumb' ? 300 : 1000}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover object-[50%_25%]"
        />
      ) : (
        <span aria-hidden="true" className={`absolute inset-0 -z-10 grid place-items-center font-display text-[clamp(4rem,18vw,7rem)] uppercase leading-none ${ink} opacity-90`}>
          {initials(name)}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-[var(--fade)] via-[var(--fade)]/60 to-transparent px-3 pb-3 pt-14 sm:px-4 sm:pb-4" style={{ color: '#fff' }}>
        <span className="line-clamp-2 break-words font-display text-[1.375rem] uppercase leading-[0.95] sm:text-[1.75rem]">{name}</span>
        <span className="truncate text-sm" style={{ color: "rgb(255 255 255 / 0.88)" }}>@{instagram}</span>
        <span className="mt-1.5 inline-flex w-fit rounded-full bg-lane px-2.5 py-0.5 text-xs font-semibold text-print">
          <span className={role === 'creator' ? 'text-paper' : ''}>{roomLabel ?? brand.rooms[role].name}</span>
        </span>
      </div>
    </div>
  );
}
