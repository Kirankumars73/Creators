import type { Lane } from '@/config/brand';

export type MemberCounts = { total: number; creators: number; editors: number; other: number };
export type WallMember = { displayName: string; instagram: string; role: Lane; createdAt: string; isNew: boolean };

type RpcClient = { rpc(fn: string, args?: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }> };

const DAY_MS = 86_400_000;

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

/** The opted-in member wall (name, handle, lane — never email); null when unreachable. */
export async function readMemberWall(client: RpcClient | null, now: Date, limit = 200): Promise<WallMember[] | null> {
  if (!client) return null;
  try {
    const { data, error } = await client.rpc('member_wall', { max_rows: limit });
    if (error) throw error;
    return ((data ?? []) as { display_name: string; instagram: string; role: Lane; created_at: string }[]).map((r) => ({
      displayName: r.display_name,
      instagram: r.instagram,
      role: r.role,
      createdAt: r.created_at,
      isNew: now.getTime() - new Date(r.created_at).getTime() < DAY_MS,
    }));
  } catch (err) {
    console.error('[wall] member_wall', err);
    return null;
  }
}
