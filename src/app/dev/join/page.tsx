import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DevJoinPreview } from './preview';

export const metadata = { title: 'Join preview', robots: { index: false } };

// Dev-only: walk the join flow with fake actions (no Supabase needed). 404 in production.
export default function DevJoin() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div data-surface="bay" className="min-h-dvh overflow-x-clip bg-surface">
      <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-4 py-10 md:px-10 md:py-16">
        <h1 className="text-title text-chalk">Take your place.</h1>
        <Suspense>
          <DevJoinPreview />
        </Suspense>
      </main>
    </div>
  );
}
