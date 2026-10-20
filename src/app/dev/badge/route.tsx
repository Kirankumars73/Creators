import sharp from 'sharp';
import { brand, type Lane } from '@/config/brand';
import { isLane } from '@/lib/join/step';
import { badgeImage } from '@/lib/pass/badge';

// Dev-only: the hanging badge's face, with a generated sample photo (never a real person). 404 in production.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const q = new URL(req.url).searchParams;
  const lane: Lane = isLane(q.get('lane')) ? (q.get('lane') as Lane) : 'editor';
  const room = brand.rooms[lane];
  const photo = q.get('photo') === '0'
    ? null
    : await sharp(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9AA7B8"/><stop offset="1" stop-color="#2A3446"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><circle cx="400" cy="330" r="130" fill="#D8DEE8"/><rect x="170" y="480" width="460" height="560" rx="230" fill="#D8DEE8"/></svg>',
        ),
      )
        .jpeg()
        .toBuffer();
  return badgeImage(
    { headline: q.get('name') ?? 'Thomas Martin', instagram: '_thomas.martin__', role: lane, roomName: room.name, laneLabel: room.label, joined: '14.10.2026', photoPath: null },
    'no-store',
    photo,
  );
}
