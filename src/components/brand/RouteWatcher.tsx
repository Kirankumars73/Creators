'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** Fired on window each time a click moves the visitor to a different page of the site. */
export const ROUTE_CHANGED = 'kootam:route-changed';

/**
 * Renders nothing; tells the page loader when the address changes (not on first load). It lives
 * in its own <Suspense>, because reading the address on pages with dynamic addresses must not hold
 * the rest of the page, and the loader itself has to be in the first paint.
 */
export function RouteWatcher() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.dispatchEvent(new Event(ROUTE_CHANGED));
  }, [pathname]);
  return null;
}
