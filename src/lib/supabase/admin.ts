import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env.server';

/** Service-role client: bypasses RLS. Server only, and only after validating input. */
export function createAdminSupabase(): SupabaseClient {
  const env = getServerEnv();
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
