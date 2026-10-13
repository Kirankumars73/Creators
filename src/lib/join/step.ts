import { LANES, type Lane } from '@/config/brand';

export type JoinStep = 'signin' | 'lane' | 'details' | 'reveal';
export const JOIN_STEPS: readonly JoinStep[] = ['signin', 'lane', 'details', 'reveal'];

export function isLane(v: unknown): v is Lane {
  return typeof v === 'string' && (LANES as readonly string[]).includes(v);
}

/** The URL may request a step; the session decides which one the visitor actually gets. */
export function resolveStep(
  q: { step?: string; lane?: string },
  s: { signedIn: boolean; hasMember: boolean },
): { step: JoinStep; lane: Lane | null } {
  if (!s.signedIn) return { step: 'signin', lane: null };
  if (s.hasMember) return { step: 'reveal', lane: null };
  const lane = isLane(q.lane) ? q.lane : null;
  if (q.step === 'details' && lane) return { step: 'details', lane };
  return { step: 'lane', lane };
}
