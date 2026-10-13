'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabasePublicConfig } from './config';

export function createBrowserSupabase(): SupabaseClient | null {
  const cfg = supabasePublicConfig();
  return cfg ? createBrowserClient(cfg.url, cfg.anonKey) : null;
}
