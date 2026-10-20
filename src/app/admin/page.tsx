import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SiteNav } from '@/components/landing/SiteNav';
import { TOKENS } from '@/config/tokens';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { BriefList } from '@/components/admin/BriefList';
import { listPeople } from '@/lib/admin/queries';
import { parseAdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';
import { listBriefs } from '@/lib/briefs/repo';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export default function AdminPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto flex max-w-[90rem] flex-col gap-10 px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.94] tracking-[-0.015em] text-chalk">Admin</h1>
        <Suspense fallback={<p className="text-chalk-mute">Loading…</p>}>
          <AdminBoard searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function AdminBoard({ searchParams }: { searchParams: PageProps<'/admin'>['searchParams'] }) {
  if (!(await getAdminEmail())) notFound();
  const [people, q, briefs] = await Promise.all([
    listPeople(),
    searchParams.then(parseAdminQuery),
    // A missing table (migration not applied yet) must not take the member list down with it.
    listBriefs().catch((err: unknown) => {
      console.error('[admin] briefs', err);
      return null;
    }),
  ]);
  return (
    <>
      <AdminPanel people={people} q={q} />
      <BriefList briefs={briefs} />
    </>
  );
}
