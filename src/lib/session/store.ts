'use client';

import { useSyncExternalStore } from 'react';
import type { SessionInfo } from '@/app/api/session/route';

export type SessionState = SessionInfo | { state: 'unknown' };

// One tiny store for the whole page: who is looking at the site. It starts "unknown" (which renders
// exactly what a signed-out visitor sees, so the cached pages match what the server sent) and is
// filled in by loadSession().
let current: SessionState = { state: 'unknown' };
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

function set(next: SessionState) {
  current = next;
  for (const l of listeners) l();
}

/** The Supabase auth cookie is `sb-<project>-auth-token` (or chunked as `….0`, `….1`). */
export function hasAuthCookie(cookie: string): boolean {
  return /(?:^|;\s*)sb-[^=;]*-auth-token/.test(cookie);
}

/**
 * Asks /api/session who is here, once per page load. A visitor with no sign-in cookie is
 * "signed out" without any request at all. A failed request leaves them as a visitor, since
 * pretending someone is signed in would be worse than showing "Join".
 */
export function loadSession(opts: { force?: boolean; fetchImpl?: typeof fetch; cookie?: string } = {}): Promise<void> {
  if (!opts.force && current.state !== 'unknown') return Promise.resolve();
  if (inflight && !opts.force) return inflight;
  const cookie = opts.cookie ?? (typeof document === 'undefined' ? '' : document.cookie);
  if (!hasAuthCookie(cookie)) {
    set({ state: 'signed-out' });
    return Promise.resolve();
  }
  const doFetch = opts.fetchImpl ?? fetch;
  inflight = (async () => {
    try {
      const res = await doFetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
      const body = (await res.json()) as SessionInfo;
      set(res.ok && body && typeof body.state === 'string' ? body : { state: 'signed-out' });
    } catch {
      set({ state: 'signed-out' });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** After something changes who someone is (they just joined, or their photo changed). */
export const refreshSession = () => loadSession({ force: true });

/** Test helper: back to "unknown". */
export function resetSession(): void {
  inflight = null;
  set({ state: 'unknown' });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const SERVER: SessionState = { state: 'unknown' };

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, () => current, () => SERVER);
}
