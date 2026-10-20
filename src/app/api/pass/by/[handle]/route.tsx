import { brand } from '@/config/brand';
import { passImage } from '@/lib/pass/image';
import { publicPhotoPath, readPhotoObject } from '@/lib/photos/storage';
import { siteUrl } from '@/lib/site';
import { getMemberProfile } from '@/lib/wall/cached';

const HANDLE = /^[a-zA-Z0-9._]{1,30}$/;
const INDIC = /[ऀ-෿]/;
const JOINED = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });

// GET /api/pass/by/<handle> — the pass of someone whose page is on the wall, drawn from the same
// public data as their member page (name, handle, room, join date; never email) and with their
// photo only if they switched it on. The hanging badge on /m/<handle> is this image.
export async function GET(_req: Request, ctx: RouteContext<'/api/pass/by/[handle]'>) {
  const { handle } = await ctx.params;
  if (!HANDLE.test(handle)) return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  try {
    const p = await getMemberProfile(handle);
    if (p === 'missing') return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    if (!p) return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    const room = brand.rooms[p.role];
    // A photo that can't be read just means a pass without one, never a failed pass.
    const photo = p.hasPhoto ? await publicPhotoPath(p.instagram).then((path) => (path ? readPhotoObject(path) : null)).catch(() => null) : null;
    return await passImage(
      {
        headline: INDIC.test(p.displayName) ? `@${p.instagram}` : p.displayName,
        instagram: p.instagram,
        role: p.role,
        roomName: room.name,
        laneLabel: room.label,
        joined: JOINED.format(new Date(p.createdAt)).replaceAll('/', '.'),
        photoPath: null,
      },
      'public, max-age=60, s-maxage=60, stale-while-revalidate=120',
      new URL(siteUrl).host,
      photo,
    );
  } catch (err) {
    console.error('[api/pass/by]', err);
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
