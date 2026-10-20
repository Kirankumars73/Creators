'use client';

import { useCallback, useRef, useState } from 'react';
import type { Lane } from '@/config/brand';

/** Everything typed into /join so far, kept per tab so back/refresh never loses it. */
export type JoinDraft = Partial<{
  lane: Lane;
  roleOtherText: string;
  displayName: string;
  instagram: string;
  city: string;
  tags: string[];
  portfolioUrl: string;
  showOnWall: boolean;
  profilePublic: boolean;
}>;

const KEY = 'ck:join-draft';

function readDraft(): JoinDraft {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as JoinDraft;
  } catch {
    return {};
  }
}

/** The tab's draft: [draft, patch, clear]. Storage failures are swallowed; the flow never depends on them. */
export function useJoinDraft(): [JoinDraft, (patch: JoinDraft) => void, () => void] {
  const [draft, setDraft] = useState<JoinDraft>(readDraft);
  const latest = useRef(draft);

  const patch = useCallback((p: JoinDraft) => {
    const next = { ...latest.current, ...p };
    latest.current = next;
    setDraft(next);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // private mode / quota: keep going in memory
    }
  }, []);

  const clear = useCallback(() => {
    latest.current = {};
    setDraft({});
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);

  return [draft, patch, clear];
}
