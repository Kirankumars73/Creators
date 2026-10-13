import 'server-only';
import { supabasePublicConfig } from '@/lib/supabase/config';
import { createServerSupabase } from '@/lib/supabase/server';
import type { MemberRow } from './types';

/** The signed-in user's own row, read as that user: RLS returns their row and nothing else. */
export async function getOwnMember(): Promise<MemberRow | null> {
  if (!supabasePublicConfig()) return null;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('members').select('*').maybeSingle();
  if (error) throw error;
  return (data as MemberRow | null) ?? null;
}
