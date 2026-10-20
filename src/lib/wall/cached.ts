import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cacheLife, cacheTag } from 'next/cache';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { readMemberCounts, readMemberProfile, readMemberWall } from './queries';
import { WALL_TAG } from './tags';

// Public, anonymous reads: no cookies, so they can be cached and prerendered.
// Cache Components replaces route-level `revalidate`: 'minutes' revalidates about every 60s.
// Every read carries WALL_TAG, which member changes expire on the spot (lib/wall/revalidate.ts),
// so 'minutes' is only the safety net, not how long a change takes to show.
function anonClient() {
  const cfg = supabasePublicConfig();
  return cfg ? createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export async function getMemberCounts() {
  'use cache';
  cacheLife('minutes');
  cacheTag(WALL_TAG);
  return readMemberCounts(anonClient());
}

export async function getMemberWall() {
  'use cache';
  cacheLife('minutes');
  cacheTag(WALL_TAG);
  return readMemberWall(anonClient(), new Date());
}

export async function getMemberProfile(handle: string) {
  'use cache';
  cacheLife('minutes');
  cacheTag(WALL_TAG);
  return readMemberProfile(anonClient(), handle.toLowerCase());
}
