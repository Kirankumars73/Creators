import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SiteNav } from '@/components/landing/SiteNav';
import { DevJoinPreview } from './preview';

export const metadata = { title: 'Join preview', robots: { index: false } };

// Dev-only: walk the join flow with fake actions (no Supabase needed). 404 in production.
export default function DevJoin() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    // Mirrors src/app/join/layout.tsx and page.tsx, so the preview looks like the real thing.
    <div data-surface="wall" className="limewash min-h-dvh overflow-x-clip text-chalk">
      <SiteNav />
      <main className="mx-auto flex min-h-dvh max-w-[90rem] flex-col gap-10 px-4 pb-24 pt-28 md:px-10 md:pt-36">
        <h1 className="font-display text-[clamp(3rem,9vw,7rem)] uppercase leading-[0.94] tracking-[-0.015em] text-chalk">Take your place.</h1>
        <Suspense>
          <DevJoinPreview />
        </Suspense>
      </main>
    </div>
  );
}
