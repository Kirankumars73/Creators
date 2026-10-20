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
  /** The member's photo in the private bucket, or null. Never a URL: the route reads the file. */
  photoPath: string | null;
};

// next/og has no complex-script shaping (Task 19 spike): Indic names would render broken.
const INDIC = /[ऀ-෿]/;

const JOINED = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Public-safe fields for an active member's pass; never the email. A `public` (by-id) request
 * also respects the member-wall opt-out; members always get their own pass.
 */
export function toPassData(row: MemberRow, opts: { public?: boolean } = {}): PassData | null {
  if (row.status !== 'active') return null;
  if (opts.public && !row.show_on_wall) return null;
  const room = brand.rooms[row.role];
  return {
    headline: INDIC.test(row.display_name) ? `@${row.instagram}` : row.display_name,
    instagram: row.instagram,
    role: row.role,
    roomName: room.name,
    laneLabel: room.label,
    joined: JOINED.format(new Date(row.created_at)).replaceAll('/', '.'),
    // Their own pass always shows it; a shared one only if they switched it on.
    photoPath: row.photo_path && (!opts.public || row.photo_public) ? row.photo_path : null,
  };
}
