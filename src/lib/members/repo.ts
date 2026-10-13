import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/admin';
import type { MemberInsert, MemberRow } from './types';

// Thin service-role data access. Callers have already checked the session and
// validated input; nothing here trusts the browser. Covered by tests/deployed.

export async function getMemberByUserId(userId: string): Promise<MemberRow | null> {
  const { data, error } = await createAdminSupabase().from('members').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data as MemberRow | null) ?? null;
}

export async function getMemberById(id: string): Promise<MemberRow | null> {
  const { data, error } = await createAdminSupabase().from('members').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as MemberRow | null) ?? null;
}

export async function countRecentReveals(memberId: string, since: Date): Promise<number> {
  const { count, error } = await createAdminSupabase()
    .from('link_reveals')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId)
    .eq('link_key', 'community')
    .gte('revealed_at', since.toISOString());
  if (error) throw error;
  return count ?? 0;
}

export async function logReveals(memberId: string, keys: string[]): Promise<void> {
  const { error } = await createAdminSupabase()
    .from('link_reveals')
    .insert(keys.map((link_key) => ({ member_id: memberId, link_key })));
  if (error) throw error;
}

/** Returns the Postgres error code instead of throwing, so callers can map 23505 → "already in". */
export async function insertMember(row: MemberInsert): Promise<{ errorCode: string | null }> {
  const { error } = await createAdminSupabase().from('members').insert(row);
  return { errorCode: error ? (error.code ?? 'unknown') : null };
}

/** Update one member; `guard` adds equality conditions (optimistic concurrency). Returns rows changed. */
export async function updateMember(
  id: string,
  patch: Partial<Omit<MemberRow, 'id' | 'user_id' | 'email' | 'created_at' | 'updated_at'>>,
  guard: Partial<Pick<MemberRow, 'role_changes' | 'status'>> = {},
): Promise<number> {
  let q = createAdminSupabase().from('members').update(patch).eq('id', id);
  for (const [col, value] of Object.entries(guard)) q = q.eq(col, value);
  const { data, error } = await q.select('id');
  if (error) throw error;
  return data?.length ?? 0;
}
