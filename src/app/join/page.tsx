import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { BasicJoin } from '@/components/join/BasicJoin';
import { getSessionUser } from '@/lib/auth/session';
import { detectInAppBrowser } from '@/lib/join/in-app-browser';
import { resolveStep } from '@/lib/join/step';
import { getOwnMember } from '@/lib/members/self';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = { title: 'Take your place' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function JoinPage({ searchParams }: PageProps<'/join'>) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-4 py-16">
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
  const ua = (await headers()).get('user-agent') ?? '';
  const user = await getSessionUser().catch(() => null);
  const member = user ? await getOwnMember().catch(() => null) : null;
  const { step, lane } = resolveStep({ step: first(sp.step), lane: first(sp.lane) }, { signedIn: !!user, hasMember: !!member });
  return (
    <BasicJoin
      step={step}
      lane={lane}
      userName={user?.name ?? null}
      inApp={detectInAppBrowser(ua)}
      siteUrl={siteUrl}
      currentUrl={`${siteUrl}/join`}
      authError={first(sp.error) === 'auth'}
    />
  );
}
