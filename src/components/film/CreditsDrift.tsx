'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, type ReactNode } from 'react';
import { useScrollFilm } from './ScrollFilm';

/** §6.9 — the credits roll: tied to scroll, they rise a little slower than the page. */
export function CreditsDrift({ children, className }: { children: ReactNode; className?: string }) {
  const film = useScrollFilm();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!film.ready || film.reduced || !el) return;
    return film.add(() => {
      gsap.fromTo(el, { y: 80 }, { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });
  }, [film]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
