'use client';

import { Button } from '@/components/ui/Button';

/** Anything that throws while a page renders lands here, on the wall, with a way forward. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <main className="mx-auto flex min-h-dvh max-w-[90rem] flex-col items-start justify-center gap-6 px-4 md:px-10">
        <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.94] tracking-[-0.01em]">Something went wrong on our side.</h1>
        <p className="text-body max-w-[46ch] text-chalk-dim">Nothing you did. Try again, and if it keeps happening, message us on Instagram.</p>
        <Button onClick={reset}>Try again</Button>
      </main>
    </div>
  );
}
