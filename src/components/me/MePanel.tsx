'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeCard } from '@/components/cards/MeCard';
import { ExportSequence } from '@/components/join/Reveal';
import { SavePassButton } from '@/components/join/SavePassButton';
import type { Lane } from '@/config/brand';
import { fetchInvite } from '@/lib/join/invite-client';
import type { RenderTask } from '@/lib/join/render-progress';
import { LaneChanger } from './LaneChanger';
import { PhotoPanel } from './PhotoPanel';
import { ProfileSwitch } from './ProfileSwitch';

type MePanelProps = {
  member: {
    role: Lane;
    displayName: string;
    instagram: string;
    roleChanges: number;
    active: boolean;
    showOnWall: boolean;
    profilePublic: boolean;
    hasPhoto: boolean;
    photoPublic: boolean;
    hasGoogle: boolean;
  };
  changeLane: Parameters<typeof LaneChanger>[0]['changeLane'];
  setProfilePublic: Parameters<typeof ProfileSwitch>[0]['setProfilePublic'];
  setPhotoPublic: Parameters<typeof PhotoPanel>[0]['setPhotoPublic'];
};

/** Returning members: their links again (condensed reveal), their pass, their profile page, and the one lane move. */
export function MePanel({ member, changeLane, setProfilePublic, setPhotoPublic }: MePanelProps) {
  // Bumped when the photo changes, so the pass image beside the form is fetched again.
  const [passVersion, setPassVersion] = useState(0);
  const router = useRouter();
  // The card shows the photo as soon as one is uploaded or removed, before the page reloads.
  const [hasPhoto, setHasPhoto] = useState(member.hasPhoto);
  return (
    <div data-lane={member.role} className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-12">
        {/* Keyed by lane: after a move the links are fetched fresh for the new room. */}
        <MyLinks key={member.role} lane={member.role} />
        {member.active ? (
          <PhotoPanel
            hasPhoto={member.hasPhoto}
            photoPublic={member.photoPublic}
            onWall={member.showOnWall}
            hasGoogle={member.hasGoogle}
            instagram={member.instagram}
            setPhotoPublic={setPhotoPublic}
            onChanged={(has) => {
              setPassVersion((v) => v + 1);
              setHasPhoto(has);
              // Your page, your badge and the member list read the photo too: drop the pages this
              // browser kept, so they show the new one the first time you open them.
              router.refresh();
            }}
          />
        ) : null}
        {member.active ? (
          <ProfileSwitch handle={member.instagram} initial={member.profilePublic} onWall={member.showOnWall} setProfilePublic={setProfilePublic} />
        ) : null}
        {member.active && member.roleChanges === 0 ? <LaneChanger current={member.role} changeLane={changeLane} /> : null}
      </div>

      <aside aria-label="Your member pass" className="order-first lg:order-none">
        <figure className="flex flex-col items-center gap-5 lg:sticky lg:top-28">
          {/* React Bits ProfileCard: your pass as a live card: your photo, name, room and handle. */}
          <MeCard
            lane={member.role}
            name={member.displayName}
            instagram={member.instagram}
            hasPhoto={hasPhoto}
            version={passVersion}
            openLabel={member.profilePublic ? 'My page' : 'Edit'}
            onOpen={() => (member.profilePublic ? router.push(`/m/${member.instagram}`) : document.getElementById('profile-switch')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))}
          />
          <figcaption className="text-sm font-semibold text-chalk-mute">Save it as a story-sized picture: 1080 × 1920</figcaption>
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
