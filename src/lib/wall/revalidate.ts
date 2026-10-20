import 'server-only';
import { revalidateTag, updateTag } from 'next/cache';
import { WALL_TAG } from './tags';

/**
 * Server Actions: expire the wall's cached data so the *next* request, the member's own, gets
 * fresh data rather than a copy up to minutes old ("read your own writes").
 */
export function refreshWallNow(): void {
  updateTag(WALL_TAG);
}

/** Route Handlers can't call updateTag; this expires the data immediately and serves nothing stale. */
export function refreshWallFromRoute(): void {
  revalidateTag(WALL_TAG, { expire: 0 });
}

/**
 * Runs `refresh` only if the change actually happened, and returns the result untouched. A
 * refresh that throws is logged, never allowed to turn a saved change into a failure.
 */
export function refreshOnOk<T extends { ok: boolean }>(result: T, refresh: () => void = refreshWallNow): T {
  if (result.ok) {
    try {
      refresh();
    } catch (err) {
      console.error('[wall] refresh failed', err);
    }
  }
  return result;
}
