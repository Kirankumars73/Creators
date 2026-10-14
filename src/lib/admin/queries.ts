import 'server-only';
import type { AdminQuery } from '@/lib/auth/admin';
import { fetchAllPages } from './paging';
import type { MemberRow, MemberStatus } from '@/lib/members/types';
import { createAdminSupabase } from '@/lib/supabase/admin';

export type AdminMember = Omit<MemberRow, 'user_id' | 'email' | 'avatar_url' | 'accepted_code'>;
const COLUMNS = 'id, display_name, instagram, role, role_other_text, city, tags, portfolio_url, show_on_wall, status, role_changes, created_at, updated_at';

/** Every matching member — paged past the API's 1,000-row cap (the community holds 2,000). */
export async function listMembers(q: AdminQuery): Promise<AdminMember[]> {
  const admin = createAdminSupabase();
  return fetchAllPages(async (from, to) => {
    let query = admin.from('members').select(COLUMNS).order('created_at', { ascending: q.sort === 'old' }).order('id').range(from, to);
    if (q.view === 'other') query = query.eq('role', 'other');
    else if (q.lane !== 'all') query = query.eq('role', q.lane);
    // q is already stripped to letters/digits/._ - and spaces by parseAdminQuery.
    if (q.q) query = query.or(`display_name.ilike.%${q.q}%,instagram.ilike.%${q.q}%`);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as AdminMember[];
  });
}

/** Exact counts (head requests), never limited by a page of rows. */
export async function statusCounts(): Promise<Record<MemberStatus, number> & { creators: number; editors: number; other: number }> {
  const admin = createAdminSupabase();
  const count = async (filters: Partial<Pick<MemberRow, 'status' | 'role'>>) => {
    let query = admin.from('members').select('id', { count: 'exact', head: true });
    for (const [col, value] of Object.entries(filters)) query = query.eq(col, value);
    const { count: n, error } = await query;
    if (error) throw error;
    return n ?? 0;
  };
  const [active, flagged, removed, creators, editors, other] = await Promise.all([
    count({ status: 'active' }),
    count({ status: 'flagged' }),
    count({ status: 'removed' }),
    count({ status: 'active', role: 'creator' }),
    count({ status: 'active', role: 'editor' }),
    count({ status: 'active', role: 'other' }),
  ]);
  return { active, flagged, removed, creators, editors, other };
}

export async function updateStatus(id: string, status: MemberStatus): Promise<void> {
  const { error } = await createAdminSupabase().from('members').update({ status }).eq('id', id);
  if (error) throw error;
}
