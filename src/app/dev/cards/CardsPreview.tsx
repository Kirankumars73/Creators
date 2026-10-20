'use client';

import dynamic from 'next/dynamic';
import { LazyInView } from '@/components/cards/LazyInView';
import { MeCard } from '@/components/cards/MeCard';
import { RoomCard } from '@/components/cards/RoomCard';
import { LANES } from '@/config/brand';

const HoloCard = dynamic(() => import('@/components/bits/HoloCard'), { ssr: false });

const PRESETS = ['shards', 'glitter', 'rainbow', 'gold', 'cosmos', 'stars'] as const;

export function CardsPreview() {
  return (
    <main data-surface="wall" className="limewash min-h-screen p-6">
      <div className="flex flex-wrap items-start gap-8">
        {LANES.map((lane) => (
          <MeCard key={`me-${lane}`} lane={lane} name="Thomas Martin" instagram="_thomas.martin__" hasPhoto photoSrc="/api/photo/by/_thomas.martin__" version={0} openLabel="My page" onOpen={() => {}} />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-start gap-8">
        {LANES.map((lane) => (
          <LazyInView key={`room-${lane}`} className="min-h-[27.5rem] w-[18.75rem]" fallback={<p>loading</p>}>
            <RoomCard lane={lane} name="Thomas Martin" handle="_thomas.martin__" />
          </LazyInView>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-start gap-6">
        {PRESETS.map((preset) => (
          <LazyInView key={preset} className="min-h-[22rem] w-[15rem]" fallback={<p>{preset}</p>}>
            <p className="mb-2 text-sm font-semibold">{preset}</p>
            <HoloCard image="/api/pass/sample?lane=editor&style=badge" preset={preset} intensity={0.45} scale={1.3} frame={3.5} glare={0.8} tiltMax={29} edgeSparkle={0.9} hoverScale={1.03} radius={9} width={240} />
          </LazyInView>
        ))}
      </div>
    </main>
  );
}
