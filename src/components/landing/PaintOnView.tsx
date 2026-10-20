'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Wipes its content in left to right, like a line painted on a wall, the first time it scrolls
 * into view. Content is fully visible by default (no script, reduced motion, or already on
 * screen); it is only hidden, just before the reveal, if it starts below the fold. The scroll
 * watcher is on the outer box; only the inner box is clipped, so the watcher never loses sight
 * of what it is waiting for.
 */
export function PaintOnView({ children, className = '' }: { children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const watch = outer.current;
    const paint = inner.current;
    if (!watch || !paint || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (watch.getBoundingClientRect().top < window.innerHeight) return;
    paint.dataset.paint = 'armed';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        paint.dataset.paint = 'in';
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(watch);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={outer} className={className}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
