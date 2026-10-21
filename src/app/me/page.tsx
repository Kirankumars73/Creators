import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { SiteNav } from '@/components/landing/SiteNav';
import { MePanel } from '@/components/me/MePanel';
import { MeLoading } from '@/components/ui/Loading';
import { TOKENS } from '@/config/tokens';
import { getSessionUser } from '@/lib/auth/session';
import { listBriefsFor } from '@/lib/briefs/repo';
import { getOwnMember } from '@/lib/members/self';
import { changeLane, setPhotoPublic, setProfilePublic } from './actions';

export const metadata: Metadata = { title: 'Your pass', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export default function MePage() {
  return (
    <div data-surface="wall" className="limewash min-h-dvh overflow-x-clip text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto flex min-h-dvh max-w-[90rem] flex-col gap-10 px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.94] tracking-[-0.015em] text-chalk">Your pass</h1>
        <Suspense fallback={<MeLoading />}>
          <MeServer />
        </Suspense>
      </main>
    </div>
  );
}

async function MeServer() {
  const user = await getSessionUser();
  if (!user) redirect('/join');
  const member = await getOwnMember().catch((err: unknown) => {
    console.error('[me] member read failed', err);
    return null;
  });
  if (!member) redirect('/join?step=lane');
  // Briefs sent through their page. Unreadable (e.g. before the brief migration) is just "none".
  const briefs = await listBriefsFor(member.instagram).catch((err: unknown) => {
    console.error('[me] briefs read failed', err);
    return [];
  });
  return (
    <MePanel
      briefs={briefs}
      member={{
        role: member.role,
        displayName: member.display_name,
        instagram: member.instagram,
        roleChanges: member.role_changes,
        active: member.status === 'active',
        showOnWall: member.show_on_wall,
        // Before migration 0005 the column doesn't exist yet: treat that as "off".
        profilePublic: member.profile_public ?? false,
        // Likewise photo_path / photo_public before migration 0006.
        hasPhoto: !!member.photo_path,
        photoPublic: member.photo_public ?? false,
        hasGoogle: !!user.avatarUrl,
      }}
      changeLane={changeLane}
      setProfilePublic={setProfilePublic}
      setPhotoPublic={setPhotoPublic}
    />
  );
}
