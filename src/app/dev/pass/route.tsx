import sharp from 'sharp';
import { brand, type Lane } from '@/config/brand';
import { isLane } from '@/lib/join/step';
import { passImage } from '@/lib/pass/image';

// Dev-only: a sample pass per lane, for eyeballing the design. 404 in production.
// ?photo=1 adds a generated sample photo (a gradient, never a real person).
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const q = new URL(req.url).searchParams;
  const lane: Lane = isLane(q.get('lane')) ? (q.get('lane') as Lane) : 'editor';
  const room = brand.rooms[lane];
  const photo = q.get('photo')
    ? await sharp(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FD4B8"/><stop offset="1" stop-color="#2346C8"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><circle cx="400" cy="330" r="120" fill="#EEF2F8"/><rect x="190" y="480" width="420" height="520" rx="210" fill="#EEF2F8"/></svg>',
        ),
      )
        .jpeg()
        .toBuffer()
    : null;
  return passImage(
    { headline: q.get('name') ?? 'Gowtham Das', instagram: 'the.gowtham_das', role: lane, roomName: room.name, laneLabel: room.label, joined: '14.10.2026', photoPath: null },
    'no-store',
    'creatorskootam.in',
    photo,
  );
}
