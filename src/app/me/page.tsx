import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Your pass', robots: { index: false, follow: false } };

export default function MePage() {
  return (
    <main data-surface="bay" className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center bg-surface px-4 py-16">
      <h1 className="text-title text-chalk">Your pass</h1>
    </main>
  );
}
