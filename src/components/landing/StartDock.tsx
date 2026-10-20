'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/Button';
import { DOCK } from '@/config/landing';

const KEY = 'kootam:dock-hidden';

function storedHidden(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
const subscribeNothing = () => () => {};

/**
 * "Ready to join?" — a slip of paper that rises once the hero has scrolled away and sinks
 * again over the final call to action and the footer, where it would only repeat them. Hidden
 * for the rest of the visit once dismissed.
 */
export function StartDock() {
  const [shown, setShown] = useState(false);
  const [closed, setClosed] = useState(false);
  // Server and hydration render nothing; the dock only exists once we know it wasn't hidden.
  const hiddenBefore = useSyncExternalStore(subscribeNothing, storedHidden, () => true);
  const dismissed = closed || hiddenBefore;

  useEffect(() => {
    if (dismissed) return;
    const hero = document.getElementById('top');
    const end = document.getElementById('join');
    let pastHero = false;
    let atEnd = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === end) atEnd = e.isIntersecting || e.boundingClientRect.top < 0;
      }
      setShown(pastHero && !atEnd);
    });
    if (hero) io.observe(hero);
    if (end) io.observe(end);
    return () => io.disconnect();
  }, [dismissed]);

  if (dismissed) return null;

  const hide = () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {}
    setClosed(true);
  };

  return (
    <aside
      aria-label="Join"
      data-surface="wall"
      data-shown={shown || undefined}
      inert={!shown}
      className="start-dock fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-full bg-paper py-2 pl-2 pr-2 sm:gap-4 sm:pl-6 text-chalk shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--print)_45%,transparent)] md:bottom-5"
    >
      <div className="hidden min-w-0 flex-1 sm:block">
        <p className="truncate font-semibold">{DOCK.title}</p>
        <p className="truncate text-sm text-chalk-dim">{DOCK.sub}</p>
      </div>
      {/* On a phone the button is the whole message. */}
      <Button href="/join" size="sm" className="flex-1 sm:flex-none">
        {DOCK.cta}
      </Button>
      <button type="button" onClick={hide} aria-label={DOCK.close} className="grid size-11 shrink-0 place-items-center rounded-full text-chalk-dim hover:bg-chalk/5 hover:text-chalk">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="stroke-current" strokeWidth="1.8">
          <path d="M3 3 L13 13 M13 3 L3 13" />
        </svg>
      </button>
    </aside>
  );
}
