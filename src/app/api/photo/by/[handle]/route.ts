import { readPhotoObject, publicPhotoPath } from '@/lib/photos/storage';

const HANDLE = /^[a-zA-Z0-9._]{1,30}$/;

// GET /api/photo/by/<handle> — a member's photo, only if they put it on the wall and switched
// it on. Short cache: when someone switches it off it stops being served within a minute.
export async function GET(_req: Request, ctx: RouteContext<'/api/photo/by/[handle]'>) {
  const { handle } = await ctx.params;
  if (!HANDLE.test(handle)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  try {
    const path = await publicPhotoPath(handle);
    const bytes = path ? await readPhotoObject(path) : null;
    if (!bytes) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'public, max-age=30' } });
    return new Response(new Uint8Array(bytes), {
      headers: { 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch (err) {
    console.error('[api/photo/by]', err);
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
