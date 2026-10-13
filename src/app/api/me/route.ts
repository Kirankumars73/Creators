import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getOwnMember } from '@/lib/members/self';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401, headers: NO_STORE });
    const member = await getOwnMember();
    if (!member) return NextResponse.json({ error: 'no_member' }, { status: 404, headers: NO_STORE });
    return NextResponse.json({ member }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE });
  }
}
