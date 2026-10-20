'use client';

import TiltedCard from '@/components/bits/TiltedCard';
import { Wordmark } from '@/components/brand/Wordmark';
import { brand, type Lane } from '@/config/brand';

type PassPreviewProps = {
  lane: Lane | null;
  name?: string | null;
  handle?: string | null;
};

/**
 * The member pass taking shape beside the join form: it takes your room's colour when you pick
 * one and your name and handle as you type them (a React Bits TiltedCard, so it turns toward
 * the pointer). Decorative: the form is the source of truth, so screen readers skip it.
 */
export function PassPreview({ lane, name, handle }: PassPreviewProps) {
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
          <span className="mt-auto text-sm font-semibold">Member pass</span>
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
