'use client';

import dynamic from 'next/dynamic';
import { TOKENS } from '@/config/tokens';
import { useMediaQuery } from '@/lib/motion/media-query';

// WebGL code stays out of the first paint: fetched after hydration, never on the server.
const Threads = dynamic(() => import('@/components/fx/Threads'), { ssr: false });

/** The hero's moving background: rosso threads fraying into mustard, parting around the pointer. */
export function HeroThreads() {
  const wide = useMediaQuery('(min-width: 768px)');
  // Fewer lines on small screens: same look, half the vertex work. Nothing until hydrated.
  const lines = wide === null ? 0 : wide ? 70 : 36;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {lines ? (
        <Threads
          color={TOKENS.rosso}
          accentColor={TOKENS.mustard}
          lineCount={lines}
          amplitude={1.4}
          distance={0.5}
          angle={-14}
          thickness={0.7}
          speed={0.35}
          parting={0.6}
          fade={0.35}
          opacity={0.75}
          enableMouseInteraction
          className="threads-in"
        />
      ) : null}
      {/* Keeps the type readable over the threads: ink pools on the left and along the bottom. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_20%_60%,var(--ink)_20%,transparent_75%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}
