import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getServerEnv } from '@/lib/env.server';
import { handleInvite } from '@/lib/invite/handler';
import { countRecentReveals, getMemberByUserId, logReveals } from '@/lib/members/repo';

const NO_STORE = { 'Cache-Control': 'no-store' };

// POST only, and the request body is never read: the lane comes from the member row.
export async function POST() {
  try {
    const { wa } = getServerEnv();
    const result = await handleInvite({
      getUserId: async () => (await getSessionUser())?.id ?? null,
      getMemberByUserId,
      countRecentReveals,
      logReveals,
      wa,
      now: () => new Date(),
    });
    return NextResponse.json(result.body, { status: result.status, headers: NO_STORE });
  } catch (err) {
    console.error('[api/invite]', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE });
  }
}
