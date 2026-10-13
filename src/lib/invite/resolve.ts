import type { Lane } from '@/config/brand';

export type WaLinks = { community: string; creators: string; editors: string; other: string | null };
export type LaneKey = 'creators' | 'editors' | 'other';
export type ResolvedLinks = { community: string; lane: string | null; laneKey: LaneKey | null };

/** The two links a member of `role` may see. Role always comes from the DB row, never the request. */
export function resolveInviteLinks(role: Lane, wa: WaLinks): ResolvedLinks {
  switch (role) {
    case 'creator':
      return { community: wa.community, lane: wa.creators, laneKey: 'creators' };
    case 'editor':
      return { community: wa.community, lane: wa.editors, laneKey: 'editors' };
    case 'other':
      return wa.other && wa.other !== wa.community
        ? { community: wa.community, lane: wa.other, laneKey: 'other' }
        : { community: wa.community, lane: null, laneKey: null };
  }
}
