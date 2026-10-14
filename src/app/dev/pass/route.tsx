import { brand, type Lane } from '@/config/brand';
import { isLane } from '@/lib/join/step';
import { passImage } from '@/lib/pass/image';

// Dev-only: a sample pass per lane, for eyeballing the design. 404 in production.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const q = new URL(req.url).searchParams;
  const lane: Lane = isLane(q.get('lane')) ? (q.get('lane') as Lane) : 'editor';
  const room = brand.rooms[lane];
  return passImage(
    { headline: q.get('name') ?? 'Gowtham Das', instagram: 'the.gowtham_das', role: lane, roomName: room.name, laneLabel: room.label, joined: '14.10.2026' },
    'no-store',
    'creatorskootam.in',
  );
}
