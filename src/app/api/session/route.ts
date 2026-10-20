import { NextResponse } from 'next/server';
import type { Lane } from '@/config/brand';
import { getSessionUser } from '@/lib/auth/session';
import { getOwnMember } from '@/lib/members/self';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export type SessionInfo =
  | { state: 'signed-out' }
  | { state: 'no-member'; name: string | null }
  | { state: 'member'; name: string; handle: string; role: Lane; hasPhoto: boolean };

// GET /api/session — what the header and the join buttons need to know about whoever is looking:
// signed out, signed in but not joined, or a member. The public pages are cached for everyone, so
// they can't know this on the server; the browser asks here (and only if it has a sign-in cookie).
// Never returns the email, the user id or the photo path.
export async function GET() {
  let info: SessionInfo = { state: 'signed-out' };
  try {
    const user = await getSessionUser();
    if (user) {
      info = { state: 'no-member', name: user.name };
      const member = await getOwnMember().catch((err: unknown) => {
        console.error('[api/session] member read failed', err);
        return null;
      });
      if (member) info = { state: 'member', name: member.display_name, handle: member.instagram, role: member.role, hasPhoto: !!member.photo_path };
    }
  } catch (err) {
    console.error('[api/session]', err);
  }
  return NextResponse.json(info, { headers: NO_STORE });
}
