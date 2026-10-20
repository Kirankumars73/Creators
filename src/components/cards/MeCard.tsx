'use client';

import dynamic from 'next/dynamic';
import type { Lane } from '@/config/brand';
import { brand } from '@/config/brand';
import { LANE_TINT } from './lane-style';

const ProfileCard = dynamic(() => import('@/components/bits/ProfileCard'), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="aspect-[0.72] w-full max-w-[19rem] animate-pulse rounded-[1rem] bg-wall-shade" />,
});

type MeCardProps = {
  lane: Lane;
  name: string;
  instagram: string;
  hasPhoto: boolean;
  /** Changes when the photo does, so the card refetches it. */
  version: number;
  /** Where to load the photo from; your own photo by default. */
  photoSrc?: string;
  onOpen(): void;
  openLabel: string;
};

// Until there is a photo: the initials, in the room's colour.
const initialsImage = (name: string, bg: string, fg: string) => {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0] ?? '').join('').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><rect width="600" height="750" fill="${bg}"/><text x="300" y="440" font-family="Impact,Anton,sans-serif" font-size="260" text-anchor="middle" fill="${fg}">${letters}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** /me: your own pass as a live profile card: your photo, name, room and handle, tilting with the pointer. */
export function MeCard({ lane, name, instagram, hasPhoto, version, photoSrc, onOpen, openLabel }: MeCardProps) {
  const look = LANE_TINT[lane];
  return (
    <div className="w-full max-w-[19rem]">
      <ProfileCard
        avatarUrl={hasPhoto ? (photoSrc ?? `/api/photo/me?v=${version}`) : initialsImage(name, look.tint, look.ink)}
        name={name}
        title={brand.rooms[lane].name}
        handle={instagram}
        status="In the room"
        statusColor={look.tint}
        contactText={openLabel}
        onContactClick={onOpen}
        theme="light"
        backdropColor={look.tint}
        holo={0.8}
        glare={0.5}
        enableMobileTilt
        intro={false}
      />
    </div>
  );
}
