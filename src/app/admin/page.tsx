import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { listPeople } from '@/lib/admin/queries';
import { parseAdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';

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
  const [people, q] = await Promise.all([listPeople(), searchParams.then(parseAdminQuery)]);
  return <AdminPanel people={people} q={q} />;
}
