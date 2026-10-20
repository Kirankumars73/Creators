import type { Lane } from '@/config/brand';
import { TOKENS } from '@/config/tokens';

/** The colour each room is drawn in on the heavy cards (they can't read CSS variables). */
export const LANE_TINT: Record<Lane, { tint: string; strap: string; metal: 'gold' | 'silver' | 'graphite'; ink: string }> = {
  creator: { tint: TOKENS.rosso, strap: TOKENS.rosso, metal: 'silver', ink: TOKENS.paper },
  editor: { tint: TOKENS.lumen, strap: TOKENS['lumen-ink'], metal: 'graphite', ink: TOKENS.print },
  other: { tint: TOKENS.mint, strap: TOKENS['mint-ink'], metal: 'gold', ink: TOKENS.print },
};
