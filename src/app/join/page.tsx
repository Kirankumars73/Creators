import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Take your place' };

export default function JoinPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-4 py-16">
      <p className="text-label text-chalk-mute">01 SIGN IN · 02 LANE · 03 DETAILS · 04 EXPORT</p>
      <h1 className="text-title mt-6 text-chalk">Take your place.</h1>
      <p className="text-body mt-6 text-chalk-dim">Sign-in opens shortly.</p>
    </main>
  );
}
