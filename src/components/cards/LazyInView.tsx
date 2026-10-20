'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Can this browser draw WebGL 2? Checked once; the heavy cards fall back to plain ones without it. */
let webgl: boolean | undefined;
export function hasWebGL2(): boolean {
  if (webgl === undefined) {
    try {
      webgl = !!document.createElement('canvas').getContext('webgl2');
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/**
 * Shows `fallback` (the plain version, which is also what search engines and slow phones get)
 * and swaps in `children` only when the spot is about to scroll into view and the browser can
 * do WebGL. The heavy card's code is only downloaded then, so pages that never scroll to it
 * never pay for it.
 */
export function LazyInView({ children, fallback, margin = '300px', className }: { children: ReactNode; fallback: ReactNode; margin?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || live) return;
    if (!hasWebGL2()) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live, margin]);

  return (
    <div ref={box} className={className}>
      {live ? children : fallback}
    </div>
  );
}
