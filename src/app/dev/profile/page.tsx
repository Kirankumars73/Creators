import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SiteNav } from '@/components/landing/SiteNav';
import { ProfileView } from '@/components/members/ProfileView';
import type { MemberProfile } from '@/lib/wall/queries';

export const metadata = { title: 'Profile preview', robots: { index: false } };

const PUBLIC: MemberProfile = {
  displayName: 'Anu Krishna',
  instagram: 'anu.shoots',
  role: 'creator',
  roleOtherText: null,
  createdAt: '2026-10-14T05:00:00Z',
  city: 'Ernakulam',
  tags: ['reels', 'food', 'travel'],
  portfolioUrl: 'https://example.com/reel',
  hasProfile: true,
  hasPhoto: false,
};

// Dev-only: a member page with sample data (no Supabase). 404 in production.
export default function DevProfile({ searchParams }: PageProps<'/dev/profile'>) {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main className="mx-auto max-w-[90rem] px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <Suspense>
          <Preview searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Preview({ searchParams }: { searchParams: PageProps<'/dev/profile'>['searchParams'] }) {
  const sp = await searchParams;
  const p: MemberProfile =
    sp.view === 'private'
      ? { ...PUBLIC, displayName: 'Ravi Menon', instagram: 'ravicuts', role: 'editor', city: null, tags: [], portfolioUrl: null, hasProfile: false }
      : PUBLIC;
  return <ProfileView p={p} />;
}
