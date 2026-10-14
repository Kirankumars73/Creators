'use client';

import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { shouldRefreshTriggers } from '@/lib/film/scrub';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';
import type { SectionId } from './sections';

export type FilmEngine = { gsap: typeof Gsap; ScrollTrigger: typeof ScrollTriggerType };

type Film = {
  /**
   * Register scroll-linked animations (§10.2). Returns their cleanup — return it from the
   * effect. Everything still registered is reverted when the page unmounts.
   */
  add(setup: (engine: FilmEngine) => void): () => void;
  scrollTo(id: SectionId): void;
  reduced: boolean;
  /**
   * False until the client is hydrated AND the motion engine has loaded. Register nothing
   * before: registering twice (SSR guess, then truth) leaves `from` tweens animating 0 → 0.
   */
  ready: boolean;
};

const FilmContext = createContext<Film | null>(null);
const subscribeNothing = () => () => {};

async function loadEngine(): Promise<FilmEngine> {
  const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/CustomEase'),
  ]);
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('cut', '.85,0,.15,1');
  CustomEase.create('pan', '.33,1,.68,1');
  return { gsap, ScrollTrigger };
}

/**
 * The landing page's motion host. GSAP, ScrollTrigger and Lenis are fetched after hydration
 * (dynamic import), so ~60KB of motion code stays out of the first paint. One registry of
 * gsap contexts, reverted on unmount; Lenis smooth scroll off under reduced motion.
 */
export function ScrollFilm({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [engine, setEngine] = useState<FilmEngine | null>(null);
  const live = useRef(new Set<gsap.Context>());
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    let alive = true;
    void loadEngine().then((e) => alive && setEngine(e));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!engine || reduced) return;
    let alive = true;
    let stop = () => {};
    void import('lenis').then(({ default: LenisCtor }) => {
      if (!alive) return;
      const l = new LenisCtor({ autoRaf: false });
      lenis.current = l;
      l.on('scroll', engine.ScrollTrigger.update);
      const tick = (time: number) => l.raf(time * 1000);
      engine.gsap.ticker.add(tick);
      engine.gsap.ticker.lagSmoothing(0);
      stop = () => {
        engine.gsap.ticker.remove(tick);
        l.destroy();
        lenis.current = null;
      };
    });
    return () => {
      alive = false;
      stop();
    };
  }, [engine, reduced]);

  // Trigger positions are measured once; fonts swapping in or sections growing move
  // everything below. Re-measure when fonts land and when the page resizes.
  useEffect(() => {
    if (!engine) return;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => engine.ScrollTrigger.refresh(), 120);
    };
    void document.fonts?.ready.then(refresh);
    let last: { w: number; h: number } | null = null;
    const ro = new ResizeObserver(([entry]) => {
      const next = { w: Math.round(entry!.contentRect.width), h: Math.round(entry!.contentRect.height) };
      if (!shouldRefreshTriggers(last, next)) return;
      last = next;
      refresh();
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [engine]);

  useEffect(() => {
    const contexts = live.current;
    return () => {
      for (const c of contexts) c.revert();
      contexts.clear();
    };
  }, []);

  const ready = hydrated && engine !== null;
  const film = useMemo<Film>(
    () => ({
      reduced,
      ready,
      add: (setup) => {
        if (!engine) return () => {};
        const c = engine.gsap.context(() => setup(engine));
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
        // Keyboard and screen-reader users land in the section they chose.
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      },
    }),
    [reduced, ready, engine],
  );

  return <FilmContext.Provider value={film}>{children}</FilmContext.Provider>;
}

export function useScrollFilm(): Film {
  const film = useContext(FilmContext);
  if (!film) throw new Error('useScrollFilm must be used inside <ScrollFilm>');
  return film;
}
