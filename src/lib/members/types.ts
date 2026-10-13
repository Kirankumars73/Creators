import type { Lane } from '@/config/brand';

export type MemberStatus = 'active' | 'flagged' | 'removed';

/** One row of public.members, as supabase-js returns it. */
export type MemberRow = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  instagram: string;
  role: Lane;
  role_other_text: string | null;
  city: string;
  tags: string[];
  portfolio_url: string | null;
  show_on_wall: boolean;
  accepted_code: boolean;
  status: MemberStatus;
  role_changes: number;
  created_at: string;
  updated_at: string;
};

/** What the server inserts; id, status, role_changes and timestamps come from defaults. */
export type MemberInsert = Omit<MemberRow, 'id' | 'status' | 'role_changes' | 'created_at' | 'updated_at'>;
