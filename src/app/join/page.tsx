import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { JoinFlow } from '@/components/join/JoinFlow';
import { getSessionUser } from '@/lib/auth/session';
import { detectInAppBrowser } from '@/lib/join/in-app-browser';
import { resolveStep } from '@/lib/join/step';
import { getOwnMember } from '@/lib/members/self';
import { submitMember } from './actions';
import { requestOrigin, siteUrl } from '@/lib/site';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { TOKENS } from '@/config/tokens';

export const metadata: Metadata = { title: 'Take your place' };
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function JoinPage({ searchParams }: PageProps<'/join'>) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-[90rem] flex-col gap-10 px-4 pb-24 pt-28 md:px-10 md:pt-36">
      <h1 className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.94] tracking-[-0.015em] text-chalk">Take your place.</h1>
      {/* The session is a request-time read: it streams in behind Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-chalk-mute">Loading…</p>}>
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
      signInConfigured={supabasePublicConfig() !== null}
      submitMember={submitMember}
    />
  );
}
