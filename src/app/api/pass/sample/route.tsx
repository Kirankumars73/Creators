import { brand, type Lane } from '@/config/brand';
import { PASS } from '@/config/landing';
import { isLane } from '@/lib/join/step';
import { passImage } from '@/lib/pass/image';
import { siteUrl } from '@/lib/site';

// GET /api/pass/sample?lane=creator|editor|other — an example pass for the landing page. Made-up
// name, no photo, nothing from the database; cached for a day.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('lane');
  const lane: Lane = isLane(q) ? q : 'creator';
  const room = brand.rooms[lane];
  return passImage(
    { headline: PASS.sample.name, instagram: PASS.sample.handle, role: lane, roomName: room.name, laneLabel: room.label, joined: '14.10.2026', photoPath: null },
    'public, max-age=3600, s-maxage=86400',
    new URL(siteUrl).host,
    null,
  );
}
