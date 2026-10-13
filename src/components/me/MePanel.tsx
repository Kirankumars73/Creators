'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ExportSequence } from '@/components/join/Reveal';
import { SavePassButton } from '@/components/join/SavePassButton';
import type { Lane } from '@/config/brand';
import { fetchInvite } from '@/lib/join/invite-client';
import type { RenderTask } from '@/lib/join/render-progress';
import { LaneChanger } from './LaneChanger';

type MePanelProps = {
  member: { role: Lane; instagram: string; roleChanges: number; active: boolean };
  changeLane: Parameters<typeof LaneChanger>[0]['changeLane'];
};

/** Returning members: their links again (condensed reveal), their pass, and the one lane move. */
export function MePanel({ member, changeLane }: MePanelProps) {
  return (
    <div data-lane={member.role} className="flex flex-col gap-14">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_17rem]">
        {/* Keyed by lane: after a move the links are fetched fresh for the new room. */}
        <MyLinks key={member.role} lane={member.role} instagram={member.instagram} />
        <figure className="flex flex-col gap-3">
          <Image
            src="/api/pass/me"
            alt="Your member pass"
            width={272}
            height={484}
            unoptimized
            className="h-auto w-full max-w-[17rem] border border-rule"
          />
          <figcaption className="text-label text-chalk-mute">Member pass · 1080 × 1920</figcaption>
        </figure>
      </div>
      {member.active && member.roleChanges === 0 ? <LaneChanger current={member.role} changeLane={changeLane} /> : null}
    </div>
  );
}

function MyLinks({ lane, instagram }: { lane: Lane; instagram: string }) {
  const [task, setTask] = useState<RenderTask<Awaited<ReturnType<typeof fetchInvite>>>>(() => fetchInvite);
  return (
    <ExportSequence
      task={task}
      lane={lane}
      returning
      onRetry={() => setTask(fetchInvite())}
      footer={<SavePassButton instagram={instagram} />}
    />
  );
}
