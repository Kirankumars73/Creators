// Mirror of the :root color tokens in src/app/globals.css, for places CSS
// variables can't reach (viewport theme-color, next/og images). A unit test
// keeps the two in lockstep — change both or neither.
export const TOKENS = {
  ink: '#0A0A0B',
  carbon: '#121215',
  graphite: '#1E1E24',
  rule: '#2E2E37',
  chalk: '#F2F3F5',
  'chalk-dim': '#9B9BA3',
  'chalk-mute': '#85858F',
  rosso: '#E4261C',
  'rosso-deep': '#9E1009',
  mustard: '#F2B705',
  lumen: '#C6F24E',
  mint: '#7FD4B8',
  focus: '#7FD4B8',
  wall: '#EEF2F8',
  'wall-shade': '#E1E7F1',
  'wall-rule': '#C3CCDA',
  paper: '#FFFFFF',
  print: '#101828',
  'print-dim': '#3B4558',
  'print-mute': '#586275',
  neelam: '#2346C8',
} as const satisfies Record<string, `#${string}`>;

export type TokenName = keyof typeof TOKENS;
