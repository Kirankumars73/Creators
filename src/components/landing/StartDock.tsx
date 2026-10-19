'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Star } from '@/components/brand/Star';
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
 * "Ready to start?" — a dock that rises once the hero has scrolled away and sinks again over the
 * final call to action and the footer, where it would only repeat them. Hidden for the rest of
 * the visit once dismissed.
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
      data-shown={shown || undefined}
      inert={!shown}
      className="start-dock fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl items-center gap-3 border border-rule bg-carbon/95 p-2.5 pl-4 backdrop-blur-md md:bottom-5 md:gap-5 md:p-3 md:pl-5"
    >
      <span aria-hidden="true" className="hidden size-10 shrink-0 place-items-center bg-rosso sm:grid">
        <Star size={18} color="var(--chalk)" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-subhead text-base font-bold text-chalk">{DOCK.title}</p>
        <p className="hidden truncate font-mono text-xs text-chalk-dim md:block">{DOCK.sub}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Link href="/join" data-lane="creator" className="text-label hidden min-h-11 items-center border border-lane px-3 text-chalk hover:bg-lane hover:text-ink sm:inline-flex">
          {DOCK.creator}
        </Link>
        <Link href="/join" data-lane="editor" className="text-label hidden min-h-11 items-center border border-lane px-3 text-chalk hover:bg-lane hover:text-ink sm:inline-flex">
          {DOCK.editor}
        </Link>
        <Link href="/#brands" data-lane="other" className="text-label hidden min-h-11 items-center border border-lane px-3 text-chalk hover:bg-lane hover:text-ink md:inline-flex">
          {DOCK.brand}
        </Link>
        <Link href="/join" className="text-label inline-flex min-h-11 items-center bg-rosso px-4 text-chalk sm:hidden">
          Join
        </Link>
        <button type="button" onClick={hide} aria-label={DOCK.close} className="grid size-11 place-items-center text-chalk-dim hover:text-chalk">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="stroke-current" strokeWidth="1.6">
            <path d="M3 3 L13 13 M13 3 L3 13" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
