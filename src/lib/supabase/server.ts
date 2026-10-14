import 'server-only';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { supabasePublicConfig } from './config';

/** Per-request client acting as the signed-in user (RLS applies). */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const cfg = supabasePublicConfig();
  if (!cfg) throw new Error('Supabase is not configured');
  const cookieStore = await cookies();
  // The auth client reads Date.now() as soon as it exists (session expiry). cookies() alone still
  // allows a runtime prerender, where that read is an error; connection() makes this request-time.
  await connection();
  return createServerClient(cfg.url, cfg.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component render, where cookies are read-only.
          // The proxy refreshes the session on the next request.
        }
      },
    },
  });
}
