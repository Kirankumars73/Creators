// Every brand string, room name and the founder's name lives here.
// Malayalam lives in src/i18n/ml.ts. Components import; they never hardcode.

export const LANES = ['creator', 'editor', 'other'] as const;
export type Lane = (typeof LANES)[number];

export const brand = {
  name: 'Creators Kootam',
  titleTemplate: '%s · Creators Kootam',
  description:
    'A room for the people who make the frames. Creators who shoot it. Editors who cut it. Kerala, 2026.',
  wordmark: { latin: 'CREATORS' },
  rooms: {
    community: { name: 'CREATORS KOOTAM' },
    creator: { name: 'FRAME KOOTAM', label: 'LANE 01 · CREATORS', short: 'LANE 01' },
    editor: { name: 'CUT KOOTAM', label: 'LANE 02 · EDITORS', short: 'LANE 02' },
    other: { name: 'SOMETHING ELSE', label: 'LANE 03 · OTHER', short: 'LANE 03' },
  },
  // [ASK GOUTHAM] the brief spells him both "Gowtham" and "Goutham"; this follows his handle.
  founder: {
    fullName: 'GOWTHAM DAS THEKKINKATTIL',
    slateName: 'GOWTHAM DAS',
    shortName: 'Gowtham',
    instagram: 'thegowthamdas',
  },
  // [ASK] filled in before launch; `pnpm check:launch` fails while null.
  siteBy: null as string | null,
  contact: null as string | null,
  region: 'KERALA',
  year: 2026,
} as const;
