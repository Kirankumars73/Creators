import 'server-only';
import type { AdminQuery } from '@/lib/auth/admin';
import type { MemberRow, MemberStatus } from '@/lib/members/types';
import { createAdminSupabase } from '@/lib/supabase/admin';

export type AdminMember = Omit<MemberRow, 'user_id' | 'email' | 'avatar_url' | 'accepted_code'>;
const COLUMNS = 'id, display_name, instagram, role, role_other_text, city, tags, portfolio_url, show_on_wall, status, role_changes, created_at, updated_at';

export async function listMembers(q: AdminQuery): Promise<AdminMember[]> {
  let query = createAdminSupabase()
    .from('members')
    .select(COLUMNS)
    .order('created_at', { ascending: q.sort === 'old' })
    .limit(1000);
  if (q.view === 'other') query = query.eq('role', 'other');
  else if (q.lane !== 'all') query = query.eq('role', q.lane);
  // q is already stripped to letters/digits/._ - and spaces by parseAdminQuery.
  if (q.q) query = query.or(`display_name.ilike.%${q.q}%,instagram.ilike.%${q.q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AdminMember[];
}

export async function statusCounts(): Promise<Record<MemberStatus, number> & { creators: number; editors: number; other: number }> {
  const { data, error } = await createAdminSupabase().from('members').select('role, status');
  if (error) throw error;
  const rows = (data ?? []) as Pick<MemberRow, 'role' | 'status'>[];
  const active = rows.filter((r) => r.status === 'active');
  return {
    active: active.length,
    flagged: rows.filter((r) => r.status === 'flagged').length,
    removed: rows.filter((r) => r.status === 'removed').length,
    creators: active.filter((r) => r.role === 'creator').length,
    editors: active.filter((r) => r.role === 'editor').length,
    other: active.filter((r) => r.role === 'other').length,
  };
}

export async function updateStatus(id: string, status: MemberStatus): Promise<void> {
  const { error } = await createAdminSupabase().from('members').update({ status }).eq('id', id);
  if (error) throw error;
}
