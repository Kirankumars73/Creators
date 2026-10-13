'use client';

import { useSearchParams } from 'next/navigation';
import { JoinFlow } from '@/components/join/JoinFlow';
import { isLane } from '@/lib/join/step';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DevJoinPreview() {
  const sp = useSearchParams();
  const step = (['signin', 'lane', 'details', 'reveal'] as const).find((s) => s === sp.get('step')) ?? 'lane';
  const laneParam = sp.get('lane');
  const lane = isLane(laneParam) ? laneParam : null;
  const status = Number(sp.get('status') ?? 200);
  return (
    <JoinFlow
      initial={{ step, lane }}
      user={{ name: 'Gowtham Das' }}
      member={step === 'reveal' ? { id: 'preview', role: lane ?? 'editor', instagram: 'the.gowtham_das' } : null}
      inApp={{ inApp: sp.get('inapp') === '1', app: 'instagram', platform: 'android' }}
      currentUrl="http://localhost:3000/join"
      authError={false}
      submitMember={async () => {
        await wait(250);
        return { ok: true, alreadyMember: false };
      }}
      fetchInvite={async () => {
        await wait(900);
        if (status !== 200) return { status, error: 'preview' };
        return {
          status: 200,
          body: {
            community: 'https://example.com/preview-community',
            lane: lane === 'other' ? null : 'https://example.com/preview-lane',
            laneKey: lane === 'other' ? null : lane === 'creator' ? 'creators' : 'editors',
          },
        };
      }}
    />
  );
}
