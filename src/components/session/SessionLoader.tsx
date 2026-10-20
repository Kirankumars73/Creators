'use client';

import { useEffect } from 'react';
import { loadSession } from '@/lib/session/store';

/** Mounted once in the root layout: finds out who is looking so the header and buttons can adapt. */
export function SessionLoader() {
  useEffect(() => {
    void loadSession();
  }, []);
  return null;
}
