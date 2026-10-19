import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { BriefList } from '@/components/admin/BriefList';
import { listPeople } from '@/lib/admin/queries';
import { parseAdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';
import { listBriefs } from '@/lib/briefs/repo';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <div data-surface="bay" className="min-h-dvh bg-surface">
      <main className="flex flex-col gap-10 px-4 py-10 md:px-10">
        <h1 className="text-title text-chalk">Admin</h1>
        <Suspense fallback={<p className="text-label text-chalk-mute">Loading…</p>}>
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
