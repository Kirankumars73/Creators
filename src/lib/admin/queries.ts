import 'server-only';
import { adminEmailsFromEnv } from '@/lib/env.server';
import type { MemberStatus } from '@/lib/members/types';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { fetchAllPages } from './paging';
import { buildPeople, type AdminPerson, type AuthUserLite, type MemberLite } from './people';

const MEMBER_COLUMNS = 'id, user_id, display_name, instagram, role, role_other_text, city, tags, portfolio_url, show_on_wall, status, created_at';
const PER_PAGE = 1000;

/** Every Google sign-in, paged through the Auth admin API (the community holds 2,000). */
async function listAuthUsers(): Promise<AuthUserLite[]> {
  const admin = createAdminSupabase();
  const out: AuthUserLite[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw error;
    out.push(...(data.users as AuthUserLite[]));
    if (data.users.length < PER_PAGE) break;
  }
  return out;
}

async function listAllMembers(): Promise<MemberLite[]> {
  const admin = createAdminSupabase();
  return fetchAllPages(async (from, to) => {
    const { data, error } = await admin.from('members').select(MEMBER_COLUMNS).order('created_at').order('id').range(from, to);
    if (error) throw error;
    return (data ?? []) as MemberLite[];
  });
}

/** Everyone who signed in, with their member record if they joined. Filter with `filterPeople`. */
export async function listPeople(): Promise<AdminPerson[]> {
  const [users, members] = await Promise.all([listAuthUsers(), listAllMembers()]);
  return buildPeople(users, members, adminEmailsFromEnv());
}

export async function updateStatus(id: string, status: MemberStatus): Promise<void> {
  const { error } = await createAdminSupabase().from('members').update({ status }).eq('id', id);
  if (error) throw error;
}
