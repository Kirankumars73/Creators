import { thumbnail } from '@/lib/photos/process';
import { readPhotoObject, publicPhotoPath } from '@/lib/photos/storage';

const HANDLE = /^[a-zA-Z0-9._]{1,30}$/;

// GET /api/photo/by/<handle> — a member's photo, only if they put it on the wall and switched
// it on. ?size=thumb gives the small copy used by the member grid. Short cache: when someone
// switches it off, or changes it, the old one stops being served within about a minute. Anything
// not found is never cached, so a photo someone has just switched on shows straight away.
export async function GET(req: Request, ctx: RouteContext<'/api/photo/by/[handle]'>) {
  const { handle } = await ctx.params;
  if (!HANDLE.test(handle)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  try {
    const path = await publicPhotoPath(handle);
    const bytes = path ? await readPhotoObject(path) : null;
    if (!bytes) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const small = new URL(req.url).searchParams.get('size') === 'thumb';
    return new Response(new Uint8Array(small ? await thumbnail(bytes) : bytes), {
      headers: { 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    console.error('[api/photo/by]', err);
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
