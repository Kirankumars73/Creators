'use client';

import { useSearchParams } from 'next/navigation';
import { JoinFlow } from '@/components/join/JoinFlow';
import { isLane } from '@/lib/join/step';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A generated sample (a gradient and a silhouette), never a real person.
const SAMPLE_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD4B8"/><stop offset="1" stop-color="#2346C8"/></linearGradient></defs><rect width="320" height="400" fill="url(#g)"/><circle cx="160" cy="140" r="52" fill="#EEF2F8"/><rect x="76" y="210" width="168" height="200" rx="84" fill="#EEF2F8"/></svg>',
)}`;

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
      googlePhotoUrl={sp.get('google') === '0' ? null : SAMPLE_PHOTO}
      // ?photofail=1 previews a photo that didn't upload; the join still goes through.
      sendPhoto={async () => {
        await wait(400);
        return sp.get('photofail') ? { ok: false, reason: 'too_big' } : { ok: true };
      }}
      setPhotoPublic={async () => ({ ok: true })}
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
