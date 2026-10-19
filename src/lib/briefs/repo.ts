import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/admin';
import type { BriefInsert } from './submit';

export type BriefRow = BriefInsert & { id: string; status: 'new' | 'read' | 'archived'; created_at: string };

/** Returns the Postgres error code instead of throwing; the form falls back to email on any. */
export async function insertBrief(row: BriefInsert): Promise<{ errorCode: string | null }> {
  try {
    const { error } = await createAdminSupabase().from('brand_briefs').insert(row);
    return { errorCode: error ? (error.code ?? 'unknown') : null };
  } catch (err) {
    // Missing server env (e.g. a preview deploy) lands here.
    console.error('[briefs] no database', err);
    return { errorCode: 'unavailable' };
  }
}

/** Newest first, for /admin. */
export async function listBriefs(limit = 200): Promise<BriefRow[]> {
  const { data, error } = await createAdminSupabase()
    .from('brand_briefs')
    .select('id, brand, contact_name, email, phone, brief, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as BriefRow[];
}
