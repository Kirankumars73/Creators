'use client';

import TiltedCard from '@/components/bits/TiltedCard';
import { Wordmark } from '@/components/brand/Wordmark';
import { useEffect, useMemo } from 'react';
import { brand, type Lane } from '@/config/brand';
import type { JoinPhoto } from '@/lib/photos/client';

type PassPreviewProps = {
  lane: Lane | null;
  name?: string | null;
  handle?: string | null;
  /** The photo picked in the form, shown on the card as it will look. */
  photo?: JoinPhoto | null;
  googlePhotoUrl?: string | null;
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('')
    .toUpperCase();

/**
 * Your badge taking shape beside the join form, in the same design as the badge on your page:
 * your photo fills the card and fades into your room, name and handle. It takes your room's colour
 * when you pick one, and your name and handle as you type them (a React Bits TiltedCard, so it
 * turns toward the pointer). Decorative: the form is the source of truth, so screen readers skip it.
 */
export function PassPreview({ lane, name, handle, photo, googlePhotoUrl }: PassPreviewProps) {
  const file = photo?.choice.kind === 'file' ? photo.choice.file : null;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (objectUrl && URL.revokeObjectURL(objectUrl)), [objectUrl]);
  const photoSrc = objectUrl ?? (photo?.choice.kind === 'google' ? googlePhotoUrl : null);
  const room = lane ? brand.rooms[lane] : null;
  const ink = lane === 'creator' ? 'text-paper' : 'text-print';
  const shownName = name?.trim() || 'Your name';
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-4">
      <TiltedCard containerHeight="24.6rem" containerWidth="17.5rem" imageHeight="24.6rem" imageWidth="17.5rem" radius={10} rotateAmplitude={9} glare={0.4} intro={false} floating>
        <div data-lane={lane ?? undefined} className={`absolute inset-0 isolate overflow-hidden transition-colors duration-500 ${lane ? 'bg-lane' : 'bg-print'}`}>
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt="" referrerPolicy="no-referrer" className="absolute inset-0 -z-10 size-full object-cover object-[50%_22%]" />
          ) : (
            <span className={`absolute inset-x-0 top-[18%] -z-10 text-center font-display text-[7.5rem] uppercase leading-none ${lane ? ink : 'text-paper/30'}`}>
              {initialsOf(name?.trim() || 'Your name')}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 h-3/5" style={{ backgroundImage: 'linear-gradient(to top, rgb(8 12 24 / 0.96), rgb(8 12 24 / 0.82) 34%, rgb(8 12 24 / 0.4) 68%, rgb(8 12 24 / 0))' }} />
          {photoSrc ? <div className="absolute inset-x-0 top-0 h-24" style={{ backgroundImage: 'linear-gradient(to bottom, rgb(8 12 24 / 0.6), rgb(8 12 24 / 0))' }} /> : null}
          <div data-surface="night" className="absolute left-5 top-5 text-chalk">
            <Wordmark size="sm" />
          </div>
          <div className="absolute inset-x-5 bottom-5 flex flex-col items-start" style={{ color: '#fff' }}>
            <span className={`px-2.5 py-1 font-mono text-[0.7rem] tracking-[0.18em] ${lane ? `bg-lane ${ink}` : 'bg-paper text-print'}`}>{room ? room.name : 'PICK YOUR ROOM'}</span>
            <span className="mt-3 break-words font-display text-[2.4rem] uppercase leading-[0.94]">{shownName}</span>
            <span className="mt-1 truncate font-mono text-sm" style={{ color: 'rgb(255 255 255 / 0.86)' }}>
              @{handle?.trim().replace(/^@/, '') || 'yourhandle'}
            </span>
          </div>
        </div>
      </TiltedCard>
      <p className="text-sm font-semibold text-chalk-mute">Your badge, taking shape</p>
    </div>
  );
}
