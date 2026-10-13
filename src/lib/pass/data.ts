import { brand, type Lane } from '@/config/brand';
import type { MemberRow } from '@/lib/members/types';

export type PassData = {
  /** Big line on the pass: the display name, or @handle when next/og can't shape the script. */
  headline: string;
  instagram: string;
  role: Lane;
  roomName: string;
  laneLabel: string;
  joined: string;
};

// next/og has no complex-script shaping (Task 19 spike): Indic names would render broken.
const INDIC = /[ऀ-෿]/;

const JOINED = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });

/** Public-safe fields for an active member's pass; never the email. */
export function toPassData(row: MemberRow): PassData | null {
  if (row.status !== 'active') return null;
  const room = brand.rooms[row.role];
  return {
    headline: INDIC.test(row.display_name) ? `@${row.instagram}` : row.display_name,
    instagram: row.instagram,
    role: row.role,
    roomName: room.name,
    laneLabel: room.label,
    joined: JOINED.format(new Date(row.created_at)).replaceAll('/', '.'),
  };
}
