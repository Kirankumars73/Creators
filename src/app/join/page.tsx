import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { JoinFlow } from '@/components/join/JoinFlow';
import { getSessionUser } from '@/lib/auth/session';
import { detectInAppBrowser } from '@/lib/join/in-app-browser';
import { resolveStep } from '@/lib/join/step';
import { getOwnMember } from '@/lib/members/self';
import { submitMember } from './actions';
import { requestOrigin, siteUrl } from '@/lib/site';

export const metadata: Metadata = { title: 'Take your place' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function JoinPage({ searchParams }: PageProps<'/join'>) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-4 py-10 md:px-10 md:py-16">
      <h1 className="text-title text-chalk">Take your place.</h1>
      {/* The session is a request-time read: it streams in behind Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-label text-chalk-mute">Loading…</p>}>
        <JoinStepServer searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function JoinStepServer({ searchParams }: { searchParams: PageProps<'/join'>['searchParams'] }) {
  const sp = await searchParams;
  const h = await headers();
  const ua = h.get('user-agent') ?? '';
  const user = await getSessionUser();
  const member = user
    ? await getOwnMember().catch((err: unknown) => {
        console.error('[join] member read failed', err);
        return null;
      })
    : null;
  const { step, lane } = resolveStep({ step: first(sp.step), lane: first(sp.lane) }, { signedIn: !!user, hasMember: !!member });
  return (
    <JoinFlow
      initial={{ step, lane }}
      user={user ? { name: user.name } : null}
      member={member ? { id: member.id, role: member.role, instagram: member.instagram } : null}
      inApp={detectInAppBrowser(ua)}
      currentUrl={`${requestOrigin(h, siteUrl)}/join`}
      authError={first(sp.error) === 'auth'}
      submitMember={submitMember}
    />
  );
}
