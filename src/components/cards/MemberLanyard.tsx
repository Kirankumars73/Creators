'use client';

import dynamic from 'next/dynamic';
import type { Lane } from '@/config/brand';
import { LANE_TINT } from './lane-style';

// three.js is a big download, so it is only fetched when this card is about to be on screen.
const Lanyard = dynamic(() => import('@/components/bits/Lanyard'), { ssr: false });

/** A member's pass hanging on a strap in their room's colour; drag it, tap it to flip it. */
export function MemberLanyard({ instagram, role }: { instagram: string; role: Lane }) {
  const look = LANE_TINT[role];
  // Only ever rendered in the browser (after scrolling into view), so the width is known here.
  const narrow = window.innerWidth < 640;
  return (
    <Lanyard
      frontImage={`/api/pass/by/${instagram}`}
      imageFit="contain"
      cardColor={look.tint}
      finish="glossy"
      cornerRadius={0.12}
      size={narrow ? 0.5 : 0.8}
      strapColor={look.strap}
      metal={look.metal}
      strapLength={0.45}
      className="size-full"
    />
  );
}
