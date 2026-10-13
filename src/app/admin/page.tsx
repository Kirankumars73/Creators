import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main data-surface="bay" className="min-h-dvh bg-surface px-4 py-16 md:px-10">
      <h1 className="text-title text-chalk">Admin</h1>
    </main>
  );
}
