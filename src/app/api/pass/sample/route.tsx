import { brand, type Lane } from '@/config/brand';
import { PASS } from '@/config/landing';
import { isLane } from '@/lib/join/step';
import { badgeImage } from '@/lib/pass/badge';
import { passImage } from '@/lib/pass/image';
import { siteUrl } from '@/lib/site';

// GET /api/pass/sample?lane=creator|editor|other — an example pass for the landing page. Made-up
// name, no photo, nothing from the database; cached for a day.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('lane');
  const lane: Lane = isLane(q) ? q : 'creator';
  const room = brand.rooms[lane];
  const data = { headline: PASS.sample.name, instagram: PASS.sample.handle, role: lane, roomName: room.name, laneLabel: room.label, joined: '14.10.2026', photoPath: null };
  const cache = 'public, max-age=3600, s-maxage=86400';
  // ?style=badge is the colour-filled card (the landing page's foil card); the default is the story pass.
  if (new URL(req.url).searchParams.get('style') === 'badge') return badgeImage(data, cache, null);
  return passImage(data, cache, new URL(siteUrl).host, null);
}
