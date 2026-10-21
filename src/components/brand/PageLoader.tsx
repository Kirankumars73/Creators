'use client';

import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { TOKENS } from '@/config/tokens';

// Short enough to never feel slow, long enough that a fast load doesn't flash.
const MIN_MS = 450;
// Never trap someone behind it if a picture, font or the 3D badge hangs.
const MAX_MS = 8000;

/**
 * Covers the page while it loads (HTML, fonts, pictures), then fades away, so people see the
 * finished page rather than it assembling itself. It is in the server HTML, so it is there from
 * the first paint; without script a <noscript> rule hides it. Reduced motion: no pulsing.
 */
export function PageLoader() {
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => setDone(true), wait);
    };
    // Parts of a page that need longer (the member badge) mark themselves [data-page-hold] while
    // they are not ready; the page stays covered until none are left.
    const held = () => !!document.querySelector('[data-page-hold]');
    const whenNotHeld = () =>
      new Promise<void>((resolve) => {
        if (!held()) return resolve();
        const mo = new MutationObserver(() => {
          if (!held()) {
            mo.disconnect();
            resolve();
          }
        });
        mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-page-hold'] });
      });
    const ready = () => void Promise.all([document.fonts?.ready, new Promise((r) => requestAnimationFrame(() => r(null)))]).then(whenNotHeld).then(finish, finish);
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    const cap = window.setTimeout(finish, MAX_MS);
    return () => {
      window.removeEventListener('load', ready);
      window.clearTimeout(cap);
    };
  }, []);

  if (gone) return null;
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
        data-done={done || undefined}
        onTransitionEnd={() => done && setGone(true)}
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
