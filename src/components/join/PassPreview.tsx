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

/**
 * The member pass taking shape beside the join form: it takes your room's colour when you pick
 * one and your name and handle as you type them (a React Bits TiltedCard, so it turns toward
 * the pointer). Decorative: the form is the source of truth, so screen readers skip it.
 */
export function PassPreview({ lane, name, handle, photo, googlePhotoUrl }: PassPreviewProps) {
  const file = photo?.choice.kind === 'file' ? photo.choice.file : null;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (objectUrl && URL.revokeObjectURL(objectUrl)), [objectUrl]);
  const photoSrc = objectUrl ?? (photo?.choice.kind === 'google' ? googlePhotoUrl : null);
  const room = lane ? brand.rooms[lane] : null;
  const ink = lane === 'creator' ? 'text-paper' : 'text-print';
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-4">
      <TiltedCard containerHeight="27rem" containerWidth="17.5rem" imageHeight="27rem" imageWidth="17.5rem" radius={4} rotateAmplitude={9} glare={0.4} intro={false} floating>
        <div data-lane={lane ?? undefined} className={`absolute inset-0 flex flex-col p-5 transition-colors duration-500 ${lane ? `bg-lane ${ink}` : 'bg-print text-paper'}`}>
          {/* Light lockup on red or the blank pass, dark on lime and mint paper. */}
          <div data-surface={lane === 'creator' || !lane ? 'night' : 'wall'}>
            <Wordmark size="sm" />
          </div>
          {photoSrc ? (
            // The photo as it will sit on the real pass: a framed band above the name.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt="" referrerPolicy="no-referrer" className="mt-4 h-28 w-full border-4 border-current/60 object-cover object-[50%_22%]" />
          ) : null}
          <span className="mt-auto pt-3 text-sm font-semibold">Member pass</span>
          <span className="mt-1 break-words font-display text-[2.6rem] uppercase leading-[0.9]">{name?.trim() || 'Your name'}</span>
          <span className="mt-2 truncate text-base">@{handle?.trim().replace(/^@/, '') || 'yourhandle'}</span>
          <span className="mt-4 border-t border-current/30 pt-3 font-display text-[1.375rem] uppercase leading-none">
            {room ? room.name : 'Pick your room'}
          </span>
        </div>
      </TiltedCard>
      <p className="text-sm font-semibold text-chalk-mute">Your pass, taking shape</p>
    </div>
  );
}
