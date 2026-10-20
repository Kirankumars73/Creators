'use client';

import { useState } from 'react';
import TiltedCard from '@/components/bits/TiltedCard';
import { ExportSequence } from '@/components/join/Reveal';
import { SavePassButton } from '@/components/join/SavePassButton';
import type { Lane } from '@/config/brand';
import { fetchInvite } from '@/lib/join/invite-client';
import type { RenderTask } from '@/lib/join/render-progress';
import { LaneChanger } from './LaneChanger';
import { ProfileSwitch } from './ProfileSwitch';

type MePanelProps = {
  member: { role: Lane; instagram: string; roleChanges: number; active: boolean; showOnWall: boolean; profilePublic: boolean };
  changeLane: Parameters<typeof LaneChanger>[0]['changeLane'];
  setProfilePublic: Parameters<typeof ProfileSwitch>[0]['setProfilePublic'];
};

/** Returning members: their links again (condensed reveal), their pass, their profile page, and the one lane move. */
export function MePanel({ member, changeLane, setProfilePublic }: MePanelProps) {
  return (
    <div data-lane={member.role} className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-12">
        {/* Keyed by lane: after a move the links are fetched fresh for the new room. */}
        <MyLinks key={member.role} lane={member.role} />
        {member.active ? (
          <ProfileSwitch handle={member.instagram} initial={member.profilePublic} onWall={member.showOnWall} setProfilePublic={setProfilePublic} />
        ) : null}
        {member.active && member.roleChanges === 0 ? <LaneChanger current={member.role} changeLane={changeLane} /> : null}
      </div>

      <aside aria-label="Your member pass" className="order-first lg:order-none">
        <figure className="flex flex-col items-center gap-5 lg:sticky lg:top-28">
          {/* React Bits TiltedCard: the real pass image, turning toward the pointer and catching the light. */}
          <TiltedCard
            imageSrc="/api/pass/me"
            altText="Your member pass"
            containerHeight="30rem"
            containerWidth="17rem"
            imageHeight="30rem"
            imageWidth="17rem"
            radius={4}
            rotateAmplitude={10}
            glare={0.45}
            intro={false}
            floating
          />
          <figcaption className="text-sm font-semibold text-chalk-mute">Story-sized: 1080 × 1920</figcaption>
          <SavePassButton instagram={member.instagram} />
        </figure>
      </aside>
    </div>
  );
}

function MyLinks({ lane }: { lane: Lane }) {
  const [task, setTask] = useState<RenderTask<Awaited<ReturnType<typeof fetchInvite>>>>(() => fetchInvite);
  return (
    <section aria-labelledby="links-title" className="flex flex-col gap-6">
      <h2 id="links-title" className="font-display text-[2rem] uppercase leading-none text-chalk">
        Your WhatsApp rooms
      </h2>
      <ExportSequence task={task} lane={lane} returning onRetry={() => setTask(fetchInvite())} />
    </section>
  );
}
