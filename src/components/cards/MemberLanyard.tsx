'use client';

import dynamic from 'next/dynamic';
import type { Lane } from '@/config/brand';
import { LANE_TINT } from './lane-style';

// three.js is a big download, so it is only fetched when this card is about to be on screen.
const Lanyard = dynamic(() => import('@/components/bits/Lanyard'), { ssr: false });

type MemberLanyardProps = {
  instagram: string;
  role: Lane;
  /** Where it hangs across the layer, 0 to 1. */
  anchor?: number;
  /** The card's height as a fraction of the layer's height. */
  size?: number;
};

/** A member's pass hanging on a strap in their room's colour; drag it, tap it to flip it. */
export function MemberLanyard({ instagram, role, anchor = 0.5, size = 0.5 }: MemberLanyardProps) {
  const look = LANE_TINT[role];
  return (
    <Lanyard
      frontImage={`/api/pass/by/${instagram}?style=badge`}
      imageFit="cover"
      cardColor={look.tint}
      finish="glossy"
      cornerRadius={0.12}
      size={size}
      anchor={anchor}
      strapColor={look.strap}
      metal={look.metal}
      strapLength={0.45}
      className="pointer-events-auto size-full"
    />
  );
}
