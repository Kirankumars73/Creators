'use client';

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';
import type { SectionId } from './sections';

type Film = {
  /**
   * Register scroll-linked animations (§10.2). Returns their cleanup — return it from the
   * effect. Everything still registered is reverted when the page unmounts.
   */
  add(setup: () => void): () => void;
  scrollTo(id: SectionId): void;
  reduced: boolean;
  /**
   * False during server render and hydration, when `reduced` is only a guess. Register
   * nothing until it's true: registering twice (guess, then truth) leaves `from` tweens
   * animating 0 → 0 and duplicate triggers behind.
   */
  ready: boolean;
};

const subscribeNothing = () => () => {};

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
  const ready = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const live = useRef(new Set<gsap.Context>());
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    register();
    if (!ready || reduced) return;
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
  }, [ready, reduced]);

  // Trigger positions are measured once; fonts swapping in or sections growing (the roll
  // call filling up) move everything below. Re-measure when fonts land and when the page resizes.
  useEffect(() => {
    register();
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    void document.fonts?.ready.then(refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const contexts = live.current;
    return () => {
      for (const c of contexts) c.revert();
      contexts.clear();
    };
  }, []);

  const film = useMemo<Film>(
    () => ({
      reduced,
      ready,
      add: (setup) => {
        register();
        const c = gsap.context(setup);
        live.current.add(c);
        return () => {
          c.revert();
          live.current.delete(c);
        };
      },
      scrollTo: (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis.current) lenis.current.scrollTo(el, { duration: 0.62, easing: (t) => 1 - (1 - t) ** 3 });
        else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      },
    }),
    [reduced, ready],
  );

  return <FilmContext.Provider value={film}>{children}</FilmContext.Provider>;
}

export function useScrollFilm(): Film {
  const film = useContext(FilmContext);
  if (!film) throw new Error('useScrollFilm must be used inside <ScrollFilm>');
  return film;
}
