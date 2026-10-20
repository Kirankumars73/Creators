import { IMAGE_CACHE, etagOf, hasVersion } from '@/lib/http/etag';
import { thumbnail } from '@/lib/photos/process';
import { readPhotoObject, publicPhotoPath } from '@/lib/photos/storage';

const HANDLE = /^[a-zA-Z0-9._]{1,30}$/;

// GET /api/photo/by/<handle> — a member's photo, only if they put it on the wall and switched
// it on. ?size=thumb gives the small copy used by the member grid. Browsers re-check every time
// (cheap 304s) and the shared cache keeps a copy for seconds, so a new, changed or switched-off
// photo shows almost at once. Anything not found is never cached.
export async function GET(req: Request, ctx: RouteContext<'/api/photo/by/[handle]'>) {
  const { handle } = await ctx.params;
  if (!HANDLE.test(handle)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  try {
    const path = await publicPhotoPath(handle);
    const bytes = path ? await readPhotoObject(path) : null;
    if (!bytes) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const small = new URL(req.url).searchParams.get('size') === 'thumb';
    const etag = etagOf(small ? 'thumb' : 'full', bytes);
    const headers = { ETag: etag, 'Cache-Control': IMAGE_CACHE };
    if (hasVersion(req, etag)) return new Response(null, { status: 304, headers });
    return new Response(new Uint8Array(small ? await thumbnail(bytes) : bytes), {
      headers: { ...headers, 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    console.error('[api/photo/by]', err);
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
