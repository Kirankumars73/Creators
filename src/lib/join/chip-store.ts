'use client';

import { useSyncExternalStore } from 'react';

// Has this tab opened (or copied) the community link yet? Kept in sessionStorage so a
// trip out to WhatsApp — even one that discards the tab — doesn't re-lock chip 02.
const KEY = 'ck:chip01';
const listeners = new Set<() => void>();
let inMemory = false;

function read(): boolean {
  if (inMemory) return true;
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markCommunityOpened(): void {
  inMemory = true;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // private mode / blocked storage: the in-memory flag still unlocks this view
  }
  for (const l of listeners) l();
}

export function useCommunityOpened(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => false,
  );
}

/** Test hook: forget the in-memory flag. */
export function resetCommunityOpened(): void {
  inMemory = false;
}
