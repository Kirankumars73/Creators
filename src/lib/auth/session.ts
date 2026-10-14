import 'server-only';
import type { User } from '@supabase/supabase-js';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { createServerSupabase } from '@/lib/supabase/server';

export type SessionUser = { id: string; email: string; name: string | null; avatarUrl: string | null };

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

export function toSessionUser(user: User): SessionUser | null {
  if (!user.email) return null;
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email,
    name: str(meta.full_name) ?? str(meta.name),
    avatarUrl: str(meta.avatar_url) ?? str(meta.picture),
  };
}

/**
 * The signed-in user, verified with the Auth server (not just a cookie read).
 * Only Supabase's own failures are caught: `cookies()` must stay uncaught so Next can
 * postpone the read while prerendering a static shell.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!supabasePublicConfig()) return null;
  const supabase = await createServerSupabase();
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return toSessionUser(data.user);
  } catch (err) {
    console.error('[auth] getUser failed', err);
    return null;
  }
}
