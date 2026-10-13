import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { MePanel } from '@/components/me/MePanel';
import { getSessionUser } from '@/lib/auth/session';
import { getOwnMember } from '@/lib/members/self';
import { changeLane } from './actions';

export const metadata: Metadata = { title: 'Your pass', robots: { index: false, follow: false } };

export default function MePage() {
  return (
    <div data-surface="bay" className="min-h-dvh overflow-x-clip bg-surface">
      <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-title text-chalk">Your pass</h1>
        <Suspense fallback={<p className="text-label text-chalk-mute">Loading…</p>}>
          <MeServer />
        </Suspense>
      </main>
    </div>
  );
}

async function MeServer() {
  const user = await getSessionUser().catch((err: unknown) => {
    console.error('[me] session read failed', err);
    return null;
  });
  if (!user) redirect('/join');
  const member = await getOwnMember().catch((err: unknown) => {
    console.error('[me] member read failed', err);
    return null;
  });
  if (!member) redirect('/join?step=lane');
  return (
    <MePanel
      member={{ role: member.role, instagram: member.instagram, roleChanges: member.role_changes, active: member.status === 'active' }}
      changeLane={changeLane}
    />
  );
}
