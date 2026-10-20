'use client';

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { Lane } from '@/config/brand';

type MemberCardProps = {
  name: string;
  instagram: string;
  role: Lane;
  roomLabel: string;
  hasPhoto: boolean;
  eager?: boolean;
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
 * A member as a collector card for the directory: a frame in their room's colour, their photo
 * (or initials on a halftone) filling it, and the name fading in over the bottom. The card leans
 * toward the pointer and a foil sheen follows it; on touch screens it simply sits there.
 */
export function MemberCard({ name, instagram, role, roomLabel, hasPhoto, eager = false }: MemberCardProps) {
  const card = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  // The photo fades in over the initials once it has loaded, so a card never flashes empty or half-drawn.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // A photo already in the browser cache can finish before this runs.
    if (photo.current?.complete && photo.current.naturalWidth > 0) setLoaded(true);
  }, []);
  const ink = role === 'creator' ? 'text-paper' : 'text-print';

  function aim(e: PointerEvent<HTMLDivElement>) {
    const el = card.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.setProperty('--rx', `${calm ? 0 : ((0.5 - y) * 12).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${calm ? 0 : ((x - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  }

  function rest() {
    const el = card.current;
    if (!el) return;
    for (const v of ['--rx', '--ry']) el.style.removeProperty(v);
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
  }

  return (
    <div
      ref={card}
      data-lane={role}
      onPointerMove={aim}
      onPointerLeave={rest}
      className="member-card relative isolate aspect-[4/5] w-full rounded-[0.9rem] bg-lane p-[5px] shadow-[0_16px_30px_-18px_var(--print)]"
    >
      <div className="relative isolate size-full overflow-hidden rounded-[0.65rem] bg-lane">
        {/* The initials are always there: they are the card while a photo loads, and the card without one. */}
        <span aria-hidden="true" className={`halftone absolute inset-0 -z-10 grid place-items-center font-display text-[clamp(3.5rem,14vw,6rem)] uppercase leading-none ${ink}`}>
          <span className="-translate-y-4 opacity-90">{initials(name)}</span>
        </span>

        {hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={photo}
            onLoad={() => setLoaded(true)}
            src={`/api/photo/by/${instagram}?size=thumb`}
            alt=""
            width={240}
            height={300}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className={`absolute inset-0 -z-10 size-full object-cover object-[50%_25%] transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 px-3 pb-3 pt-16 sm:px-3.5" style={{ backgroundImage: 'linear-gradient(to top, rgb(8 12 24 / 0.92), rgb(8 12 24 / 0.7) 45%, rgb(8 12 24 / 0))' } as CSSProperties}>
          <span className="line-clamp-2 break-words font-display text-[1.3rem] uppercase leading-[0.95] sm:text-[1.6rem]" style={{ color: '#fff' }}>
            {name}
          </span>
          <span className="truncate text-sm" style={{ color: 'rgb(255 255 255 / 0.88)' }}>
            @{instagram}
          </span>
        </div>
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-print shadow-sm">
          <span aria-hidden="true" className="size-2 rounded-full bg-lane" />
          {roomLabel}
        </span>
      </div>
    </div>
  );
}
