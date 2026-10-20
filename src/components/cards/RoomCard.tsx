'use client';

import dynamic from 'next/dynamic';
import { brand, type Lane } from '@/config/brand';
import { LANE_TINT } from './lane-style';

const ReflectiveCard = dynamic(() => import('@/components/bits/ReflectiveCard'), { ssr: false });

/** The member ID of a room, as a polished plate tinted in that room's colour. */
export function RoomCard({ lane, name, handle }: { lane: Lane; name: string; handle: string }) {
  const look = LANE_TINT[lane];
  return (
    <ReflectiveCard
      name={name}
      role={brand.rooms[lane].name}
      badge="Member"
      status="In the room"
      statusColor={look.tint}
      idLabel="Handle"
      idValue={`@${handle}`}
      theme={lane === 'creator' ? 'dark' : 'light'}
      tint={look.tint}
      warp={0.9}
      warpScale={0.8}
      width={300}
      height={440}
      radius={14}
    />
  );
}
