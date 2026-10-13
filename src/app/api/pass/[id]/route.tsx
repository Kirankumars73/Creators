import { getSessionUser } from '@/lib/auth/session';
import { getMemberById } from '@/lib/members/repo';
import { getOwnMember } from '@/lib/members/self';
import type { MemberRow } from '@/lib/members/types';
import { toPassData } from '@/lib/pass/data';
import { passImage } from '@/lib/pass/image';
import { siteUrl } from '@/lib/site';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/pass/<member id> — a shareable, public pass (name, handle, lane; never email).
// GET /api/pass/me — the signed-in member's own pass, for SAVE MY PASS.
export async function GET(_req: Request, ctx: RouteContext<'/api/pass/[id]'>) {
  const { id } = await ctx.params;
  try {
    let row: MemberRow | null = null;
    if (id === 'me') row = (await getSessionUser()) ? await getOwnMember() : null;
    else if (UUID.test(id)) row = await getMemberById(id);
    const pass = row ? toPassData(row) : null;
    if (!pass) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const cache = id === 'me' ? 'private, no-store' : 'public, max-age=300';
    return await passImage(pass, cache, new URL(siteUrl).host);
  } catch (err) {
    console.error('[api/pass]', err);
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
