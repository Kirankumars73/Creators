import { NextResponse } from 'next/server';
import { removePhotoCore, setPhotoCore, type PhotoResult } from '@/lib/photos/actions';
import { photoDeps } from '@/lib/photos/deps';
import { reasonStatus, sameOrigin } from '@/lib/photos/http';
import { MAX_INPUT_BYTES } from '@/lib/photos/process';
import { readPhotoObject } from '@/lib/photos/storage';
import { getSessionUser } from '@/lib/auth/session';
import { getOwnMember } from '@/lib/members/self';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const reply = (r: PhotoResult) =>
  r.ok ? NextResponse.json({ ok: true }, { headers: NO_STORE }) : NextResponse.json({ error: r.reason }, { status: reasonStatus(r.reason), headers: NO_STORE });

// GET /api/photo/me — the signed-in member's own photo, whether or not it is switched on publicly.
export async function GET() {
  try {
    const member = (await getSessionUser()) ? await getOwnMember() : null;
    const bytes = member?.photo_path ? await readPhotoObject(member.photo_path) : null;
    if (!bytes) return new Response('Not found', { status: 404, headers: NO_STORE });
    return new Response(new Uint8Array(bytes), { headers: { ...NO_STORE, 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff' } });
  } catch (err) {
    console.error('[api/photo/me GET]', err);
    return new Response('Unavailable', { status: 503, headers: NO_STORE });
  }
}

// POST /api/photo/me — multipart `file`, or JSON {"source":"google"} to use their Google photo.
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE });
  try {
    const type = req.headers.get('content-type') ?? '';
    if (type.startsWith('application/json')) {
      const body = (await req.json().catch(() => null)) as { source?: unknown } | null;
      if (body?.source !== 'google') return NextResponse.json({ error: 'invalid' }, { status: 400, headers: NO_STORE });
      return reply(await setPhotoCore(photoDeps, { source: 'google' }));
    }
    // Refuse before reading a huge body into memory.
    if (Number(req.headers.get('content-length') ?? 0) > MAX_INPUT_BYTES + 64 * 1024) return NextResponse.json({ error: 'too_big' }, { status: 413, headers: NO_STORE });
    const file = (await req.formData()).get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'invalid' }, { status: 400, headers: NO_STORE });
    return reply(await setPhotoCore(photoDeps, { source: 'upload', bytes: new Uint8Array(await file.arrayBuffer()) }));
  } catch (err) {
    console.error('[api/photo/me POST]', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE });
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403, headers: NO_STORE });
  try {
    return reply(await removePhotoCore(photoDeps));
  } catch (err) {
    console.error('[api/photo/me DELETE]', err);
    return NextResponse.json({ error: 'unavailable' }, { status: 503, headers: NO_STORE });
  }
}
