import 'server-only';
import { adminEmailsFromEnv } from '@/lib/env.server';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminUser } from './admin';

/** The signed-in admin's email, or null. Verified with the Auth server, never a cookie read. */
export async function getAdminEmail(): Promise<string | null> {
  if (!supabasePublicConfig()) return null;
  const supabase = await createServerSupabase();
  try {
    const { data } = await supabase.auth.getUser();
    return isAdminUser(data.user, adminEmailsFromEnv()) ? data.user!.email! : null;
  } catch (err) {
    console.error('[admin] getUser failed', err);
    return null;
  }
}

export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) throw new Error('not an admin');
  return email;
}
