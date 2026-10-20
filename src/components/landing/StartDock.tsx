'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { JoinButton } from '@/components/session/JoinButton';
import { DOCK } from '@/config/landing';
import { useSession } from '@/lib/session/store';

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
  const session = useSession();
  // Server and hydration render nothing; the dock only exists once we know it wasn't hidden.
  const hiddenBefore = useSyncExternalStore(subscribeNothing, storedHidden, () => true);
  // Someone who has already joined doesn't need an invitation floating over the page.
  const dismissed = closed || hiddenBefore || session.state === 'member';

  useEffect(() => {
    if (dismissed) return;
    const hero = document.getElementById('top');
    const end = document.getElementById('join');
    // Also out of the way while someone fills in the brief form: it would sit on the fields.
    const brands = document.getElementById('brands');
    let pastHero = false;
    let atEnd = false;
    let inBrands = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === end) atEnd = e.isIntersecting || e.boundingClientRect.top < 0;
        if (e.target === brands) inBrands = e.isIntersecting;
      }
      setShown(pastHero && !atEnd && !inBrands);
    });
    if (hero) io.observe(hero);
    if (end) io.observe(end);
    if (brands) io.observe(brands);
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
      className="start-dock fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-2 overflow-hidden rounded-full bg-paper p-1.5 sm:gap-4 sm:py-2 sm:pl-6 sm:pr-2 text-chalk shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--print)_45%,transparent)] md:bottom-5"
    >
      <div className="hidden min-w-0 flex-1 sm:block">
        <p className="truncate font-semibold">{DOCK.title}</p>
        <p className="truncate text-sm text-chalk-dim">{DOCK.sub}</p>
      </div>
      {/* On a phone the button is the whole message. */}
      <JoinButton variant="pill" size="sm" className="flex-1 sm:flex-none">
        {DOCK.cta}
      </JoinButton>
      <button type="button" onClick={hide} aria-label={DOCK.close} className="grid size-11 shrink-0 place-items-center rounded-full text-chalk-dim hover:bg-chalk/5 hover:text-chalk">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="stroke-current" strokeWidth="1.8">
          <path d="M3 3 L13 13 M13 3 L3 13" />
        </svg>
      </button>
    </aside>
  );
}
