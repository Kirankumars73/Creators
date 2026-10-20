import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { ProfileView } from '@/components/members/ProfileView';
import { Bone, LoadingPage } from '@/components/ui/Loading';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { getMemberProfile } from '@/lib/wall/cached';

export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export async function generateMetadata({ params }: PageProps<'/m/[handle]'>): Promise<Metadata> {
  const { handle } = await params;
  const p = await getMemberProfile(handle);
  if (!p || p === 'missing') return { title: 'Member', robots: { index: false } };
  const room = brand.rooms[p.role].name.toLowerCase();
  const description = `${p.displayName} (@${p.instagram}) is in the ${room} room of ${brand.name}${p.city ? `, from ${p.city}` : ''}.`;
  return {
    title: `${p.displayName} (@${p.instagram})`,
    description,
    // Only members who chose a public profile are worth indexing.
    robots: p.hasProfile ? undefined : { index: false },
    openGraph: { type: 'profile', locale: 'en_IN', siteName: brand.name, title: p.displayName, description },
  };
}

/** A member's page: the static shell renders at once; the profile streams in by handle. */
export default function MemberPage({ params }: PageProps<'/m/[handle]'>) {
  return (
    <div data-surface="wall" className="limewash relative min-h-dvh overflow-x-clip text-chalk">
      <SiteNav />
      {/* The hanging badge is drawn into this layer (components/cards/HangingBadge): full window width, from the very top, behind the content. */}
      <div id="badge-layer" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[44rem] md:h-[56rem]" />
      <main id="main" className="pointer-events-none relative z-10 mx-auto max-w-[90rem] px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <Link href="/creators" className="wall-link pointer-events-auto inline-flex min-h-11 items-center font-semibold text-chalk">
          All members
        </Link>
        <Suspense fallback={<LoadingPage label="Loading the member page"><div className="mt-10"><Bone className="h-16 w-4/5 md:h-24" /></div></LoadingPage>}>
          <Profile params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

async function Profile({ params }: { params: PageProps<'/m/[handle]'>['params'] }) {
  const { handle } = await params;
  const p = await getMemberProfile(handle);
  if (p === 'missing') notFound();
  if (!p) return <p className="text-body mt-10 text-chalk-dim">This page didn’t load. Refresh in a minute.</p>;
  return <ProfileView p={p} />;
}
