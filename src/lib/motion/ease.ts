// §10 easing vocabulary. CSS strings for transitions/WAAPI, arrays for motion, names for GSAP.
export const EASE = {
  cut: 'cubic-bezier(.85,0,.15,1)',
  pan: 'cubic-bezier(.33,1,.68,1)',
  laneSelect: 'cubic-bezier(.76,0,.24,1)',
} as const;

export const EASE_ARR = {
  cut: [0.85, 0, 0.15, 1],
  pan: [0.33, 1, 0.68, 1],
  laneSelect: [0.76, 0, 0.24, 1],
} as const;

export const SETTLE = { type: 'spring', stiffness: 180, damping: 22 } as const;

/** Nothing animates longer than this (§10.7). */
export const MAX_MS = 700;
