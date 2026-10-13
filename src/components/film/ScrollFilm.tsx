'use client';

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';
import type { SectionId } from './sections';

type Film = {
  /** Register scroll-linked animations in the page's one GSAP context (§10.2). */
  add(setup: () => void): void;
  scrollTo(id: SectionId): void;
  reduced: boolean;
};

const FilmContext = createContext<Film | null>(null);

let registered = false;
function register() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('cut', '.85,0,.15,1');
  CustomEase.create('pan', '.33,1,.68,1');
  registered = true;
}

/**
 * The landing page's motion host: Lenis smooth scroll (off under reduced motion) driven by
 * GSAP's ticker, feeding ScrollTrigger; one gsap.context for every scroll-linked animation,
 * reverted when the page unmounts. GSAP and Lenis ship only with this route.
 */
export function ScrollFilm({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const ctx = useRef<gsap.Context | null>(null);
  const lenis = useRef<Lenis | null>(null);

  const getCtx = useCallback(() => {
    register();
    ctx.current ??= gsap.context(() => {});
    return ctx.current;
  }, []);

  useEffect(() => {
    register();
    if (reduced) return;
    const l = new Lenis({ autoRaf: false });
    lenis.current = l;
    l.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  useEffect(
    () => () => {
      ctx.current?.revert();
      ctx.current = null;
    },
    [],
  );

  const film = useMemo<Film>(
    () => ({
      reduced,
      add: (setup) => getCtx().add(setup),
      scrollTo: (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis.current) lenis.current.scrollTo(el, { duration: 0.62, easing: (t) => 1 - (1 - t) ** 3 });
        else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      },
    }),
    [reduced, getCtx],
  );

  return <FilmContext.Provider value={film}>{children}</FilmContext.Provider>;
}

export function useScrollFilm(): Film {
  const film = useContext(FilmContext);
  if (!film) throw new Error('useScrollFilm must be used inside <ScrollFilm>');
  return film;
}
