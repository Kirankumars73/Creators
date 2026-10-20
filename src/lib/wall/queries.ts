import type { Lane } from '@/config/brand';

export type MemberCounts = { total: number; creators: number; editors: number; other: number };
/** A directory row: wall fields, plus district and crafts only for members with a public profile. */
export type WallMember = {
  displayName: string;
  instagram: string;
  role: Lane;
  createdAt: string;
  isNew: boolean;
  city: string | null;
  tags: string[];
  hasProfile: boolean;
  /** Photo switched on and uploaded: served from /api/photo/by/<handle>. */
  hasPhoto: boolean;
};
export type MemberProfile = {
  displayName: string;
  instagram: string;
  role: Lane;
  roleOtherText: string | null;
  createdAt: string;
  city: string | null;
  tags: string[];
  portfolioUrl: string | null;
  hasProfile: boolean;
  hasPhoto: boolean;
};

type RpcClient = { rpc(fn: string, args?: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }> };
type DirectoryRow = { display_name: string; instagram: string; role: Lane; created_at: string; city?: string | null; tags?: string[] | null; has_profile?: boolean; has_photo?: boolean };

const DAY_MS = 86_400_000;
const HANDLE = /^[a-zA-Z0-9._]{1,30}$/;
// PostgREST "function not found" / Postgres "undefined function": migration 0005 isn't applied yet.
const MISSING_FUNCTION = new Set(['PGRST202', '42883']);

/** Lane counts for the public page; null whenever Supabase is missing or unreachable. */
export async function readMemberCounts(client: RpcClient | null): Promise<MemberCounts | null> {
  if (!client) return null;
  try {
    const { data, error } = await client.rpc('member_counts');
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as Partial<MemberCounts> | undefined;
    if (!row) return null;
    return { total: Number(row.total ?? 0), creators: Number(row.creators ?? 0), editors: Number(row.editors ?? 0), other: Number(row.other ?? 0) };
  } catch (err) {
    console.error('[wall] member_counts', err);
    return null;
  }
}

/**
 * The opted-in member directory (name, handle, room; district and crafts only for public
 * profiles — never email); null when unreachable. Falls back to the plain wall while the
 * database predates migration 0005, so deploying before migrating never empties the wall.
 */
export async function readMemberWall(client: RpcClient | null, now: Date, limit = 500): Promise<WallMember[] | null> {
  if (!client) return null;
  try {
    let { data, error } = await client.rpc('member_directory', { max_rows: limit });
    if (error && MISSING_FUNCTION.has(String((error as { code?: unknown }).code))) {
      console.warn('[wall] member_directory missing; falling back to member_wall (apply migration 0005)');
      ({ data, error } = await client.rpc('member_wall', { max_rows: limit }));
    }
    if (error) throw error;
    return ((data ?? []) as DirectoryRow[]).map((r) => ({
      displayName: r.display_name,
      instagram: r.instagram,
      role: r.role,
      createdAt: r.created_at,
      isNew: now.getTime() - new Date(r.created_at).getTime() < DAY_MS,
      city: r.city ?? null,
      tags: r.tags ?? [],
      hasProfile: r.has_profile ?? false,
      hasPhoto: r.has_photo ?? false,
    }));
  } catch (err) {
    console.error('[wall] member_directory', err);
    return null;
  }
}

/** One member's public page: the profile, 'missing' if nobody by that handle is on the wall, null if unreachable. */
export async function readMemberProfile(client: RpcClient | null, handle: string): Promise<MemberProfile | 'missing' | null> {
  if (!HANDLE.test(handle)) return 'missing';
  if (!client) return null;
  try {
    const { data, error } = await client.rpc('member_profile', { handle });
    if (error) throw error;
    const r = (Array.isArray(data) ? data[0] : data) as
      | (DirectoryRow & { role_other_text: string | null; portfolio_url: string | null })
      | undefined;
    if (!r) return 'missing';
    return {
      displayName: r.display_name,
      instagram: r.instagram,
      role: r.role,
      roleOtherText: r.role_other_text,
      createdAt: r.created_at,
      city: r.city ?? null,
      tags: r.tags ?? [],
      portfolioUrl: r.portfolio_url,
      hasProfile: r.has_profile ?? false,
      hasPhoto: r.has_photo ?? false,
    };
  } catch (err) {
    console.error('[wall] member_profile', err);
    return null;
  }
}
