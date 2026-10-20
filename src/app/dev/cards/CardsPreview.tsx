'use client';

import { LazyInView } from '@/components/cards/LazyInView';
import { MeCard } from '@/components/cards/MeCard';
import { PassHolo } from '@/components/cards/PassHolo';
import { RoomCard } from '@/components/cards/RoomCard';
import { LANES } from '@/config/brand';

export function CardsPreview() {
  return (
    <main data-surface="wall" className="limewash min-h-screen p-6">
      <div className="flex flex-wrap items-start gap-8">
        {LANES.map((lane) => (
          <MeCard key={`me-${lane}`} lane={lane} name="Thomas Martin" instagram="_thomas.martin__" hasPhoto={false} version={0} openLabel="My page" onOpen={() => {}} />
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-start gap-8">
        {LANES.map((lane) => (
          <LazyInView key={`room-${lane}`} className="min-h-[27.5rem] w-[18.75rem]" fallback={<p>loading</p>}>
            <RoomCard lane={lane} name="Thomas Martin" handle="_thomas.martin__" />
          </LazyInView>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-start gap-8">
        {LANES.map((lane) => (
          <LazyInView key={`holo-${lane}`} className="min-h-[34.5rem] w-[19.5rem]" fallback={<p>loading</p>}>
            <PassHolo src={`/api/pass/sample?lane=${lane}`} alt="" lane={lane} />
          </LazyInView>
        ))}
      </div>
    </main>
  );
}
