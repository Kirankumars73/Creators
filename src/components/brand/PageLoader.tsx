'use client';

import { useEffect, useState } from 'react';
import { ROUTE_CHANGED } from '@/components/brand/RouteWatcher';
import { Wordmark } from '@/components/brand/Wordmark';
import { TOKENS } from '@/config/tokens';

// Short enough to never feel slow, long enough that a fast load doesn't flash.
const MIN_MS = 450;
// Never trap someone behind it if a picture, font or the 3D badge hangs.
const MAX_MS = 8000;

type Phase = 'on' | 'done' | 'gone';

/** True while something on the page says it is not ready: the member badge, or a loading skeleton. */
const held = () => !!document.querySelector('[data-page-hold]');

function whenNotHeld(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!held()) return resolve();
    const mo = new MutationObserver(() => {
      if (!held()) {
        mo.disconnect();
        resolve();
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-page-hold'] });
  });
}

/**
 * Covers the page while it loads (HTML, fonts, pictures, and any part that marks itself
 * [data-page-hold] until it is ready, like the member badge), then fades away, so people see the
 * finished page rather than it assembling. It covers a full page load AND a click from one page of
 * the site to another. It is in the server HTML, so it is there from the first paint; without
 * script a <noscript> rule hides it. Reduced motion: no pulsing.
 */
export function PageLoader() {
  const [phase, setPhase] = useState<Phase>('on');
  // Bumped each time a click moves to another page; the first run is the full page load.
  const [visit, setVisit] = useState(0);

  useEffect(() => {
    const onRoute = () => {
      setPhase('on');
      setVisit((v) => v + 1);
    };
    window.addEventListener(ROUTE_CHANGED, onRoute);
    return () => window.removeEventListener(ROUTE_CHANGED, onRoute);
  }, []);

  useEffect(() => {
    const isFirst = visit === 0;
    const start = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => setPhase((p) => (p === 'on' ? 'done' : p)), wait);
    };
    const ready = () =>
      void Promise.all([document.fonts?.ready, new Promise((r) => requestAnimationFrame(() => r(null)))]).then(whenNotHeld).then(finish, finish);
    // A full load waits for the browser's load event; a click between pages has no such event.
    if (!isFirst || document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    const cap = window.setTimeout(finish, MAX_MS);
    return () => {
      window.removeEventListener('load', ready);
      window.clearTimeout(cap);
    };
  }, [visit]);

  if (phase === 'gone') return null;
  return (
    <>
      <noscript>
        <style>{'#page-loader{display:none!important}'}</style>
      </noscript>
      <div
        id="page-loader"
        data-surface="wall"
        role="status"
        aria-live="polite"
        aria-label="Loading"
        data-done={phase === 'done' || undefined}
        onTransitionEnd={() => phase === 'done' && setPhase('gone')}
        style={{ background: TOKENS.wall, color: TOKENS.print }}
        className="page-loader fixed inset-0 z-[200] grid place-items-center"
      >
        <div className="flex flex-col items-center gap-6">
          <span className="page-loader-mark">
            <Wordmark size="md" />
          </span>
          <span aria-hidden="true" className="page-loader-bar relative h-1 w-40 overflow-hidden rounded-full" style={{ background: 'rgb(16 24 40 / 0.12)' }}>
            <span className="absolute inset-y-0 left-0 w-1/3 rounded-full" style={{ background: TOKENS.rosso }} />
          </span>
          <span className="sr-only">Loading</span>
        </div>
      </div>
    </>
  );
}
