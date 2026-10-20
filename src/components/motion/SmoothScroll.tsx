'use client';

import { useEffect } from 'react';

/**
 * Lenis smooth scrolling for the whole site, loaded after hydration so it never touches first
 * paint. Lenis reads `scroll-padding-top`, so anchored sections land below the fixed nav.
 * Same-page anchor links ("/#how") glide; the phone menu's scroll lock (overflow: hidden on
 * <html>) pauses it; reduced motion turns it off entirely (native scrolling, native jumps).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let destroy = () => {};
    let alive = true;

    void import('lenis').then(({ default: Lenis }) => {
      if (!alive) return;
      const lenis = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 1, prevent: (node) => !!node.closest('[data-lenis-prevent]') });
      document.documentElement.dataset.smooth = '';

      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href*="#"]') : null;
        if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
        const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
        if (!target) return;
        // preventDefault alone: next/link then skips its own navigation, and the link's other
        // click handlers (the phone menu closing itself) still run.
        e.preventDefault();
        history.pushState(null, '', a.hash);
        // Next frame, forced: a link in the phone menu fires while the menu's scroll lock still
        // has Lenis stopped, and a stopped Lenis drops the request.
        requestAnimationFrame(() => lenis.scrollTo(target, { duration: 1.1, force: true }));
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      document.addEventListener('click', onClick, true);

      // The phone menu locks scrolling with overflow: hidden on <html>; Lenis must hold still too.
      const lock = new MutationObserver(() => (document.documentElement.style.overflow === 'hidden' ? lenis.stop() : lenis.start()));
      lock.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

      destroy = () => {
        document.removeEventListener('click', onClick, true);
        lock.disconnect();
        lenis.destroy();
        delete document.documentElement.dataset.smooth;
      };
    });

    return () => {
      alive = false;
      destroy();
    };
  }, []);
  return null;
}
