'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type VelocityMarqueeProps = {
  children: ReactNode;
  /** Pixels per second at rest; negative runs right. */
  speed?: number;
  className?: string;
};

/**
 * A ticker that runs on its own and surges with scroll speed, flipping with scroll direction
 * (after React Bits' ScrollVelocity). One rAF loop per row, only while on screen; static under
 * reduced motion. The content is rendered twice and wrapped at -50%.
 */
export function VelocityMarquee({ children, speed = 60, className = '' }: VelocityMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const t = track.current;
    if (!el || !t || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let x = 0;
    let last = 0;
    let lastY = window.scrollY;
    let boost = 0;
    let dir = 1;
    let visible = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      if (dy !== 0) dir = dy > 0 ? 1 : -1;
      // Scroll speed in px/s, eased so a flick surges and settles rather than jerking.
      boost += (Math.min(Math.abs(dy) / Math.max(dt, 1 / 120), 4000) * 0.35 - boost) * 0.12;
      const half = t.scrollWidth / 2;
      if (!half) return;
      x -= (speed + boost) * dir * dt;
      x = ((x % half) + half) % half;
      t.style.transform = `translate3d(${-x}px,0,0)`;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      cancelAnimationFrame(raf);
      last = 0;
      lastY = window.scrollY;
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={root} className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
