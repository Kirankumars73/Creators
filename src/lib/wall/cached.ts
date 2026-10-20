import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { cacheLife } from 'next/cache';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { readMemberCounts, readMemberProfile, readMemberWall } from './queries';

// Public, anonymous reads: no cookies, so they can be cached and prerendered.
// Cache Components replaces route-level `revalidate`: 'minutes' revalidates about every 60s.
function anonClient() {
  const cfg = supabasePublicConfig();
  return cfg ? createClient(cfg.url, cfg.anonKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export async function getMemberCounts() {
  'use cache';
  cacheLife('minutes');
  return readMemberCounts(anonClient());
}

export async function getMemberWall() {
  'use cache';
  cacheLife('minutes');
  return readMemberWall(anonClient(), new Date());
}

export async function getMemberProfile(handle: string) {
  'use cache';
  cacheLife('minutes');
  return readMemberProfile(anonClient(), handle.toLowerCase());
}
