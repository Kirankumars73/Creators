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
  // Room names match Gowtham's WhatsApp groups ("Creators kootam(Content creators)" /
  // "Creators kootam(Editors)"), so the chip someone taps names the group they land in.
  rooms: {
    community: { name: 'CREATORS KOOTAM' },
    creator: {
      name: 'CONTENT CREATORS',
      label: 'LANE 01 · CREATORS',
      short: 'LANE 01',
      tagline: 'The people who shoot it.',
      copy: "You shoot it. You style it. You post it. You've never had a room where the other people doing it are in the room.",
    },
    editor: {
      name: 'EDITORS',
      label: 'LANE 02 · EDITORS',
      short: 'LANE 02',
      tagline: 'The people who cut it.',
      copy: 'You cut it. You grade it. You sound-design it at 2am. Your name belongs in the credits and here it is in the member list.',
    },
    other: {
      name: 'SOMETHING ELSE',
      label: 'LANE 03 · OTHER',
      short: 'LANE 03',
      tagline: 'Everyone else who makes the frames.',
      copy: "Writer, designer, DOP, sound, VFX, photographer, stylist, producer. Tell us what you do and we'll put you where you belong.",
    },
  },
  // The brief spells him both "Gowtham" and "Goutham"; confirmed 2026-10-14: Gowtham.
  founderConfirmed: true as boolean,
  // [ASK GOUTHAM] /privacy speaks for him; flip once he has read and agreed with it.
  privacyReviewed: false as boolean,
  founder: {
    fullName: 'GOWTHAM DAS THEKKINKATTIL',
    shortName: 'Gowtham',
    instagram: 'thegowthamdas',
  },
  // Footer contact (decided 2026-10-14; no SITE BY credit). Shown on the footer and /privacy.
  contact: 'gowthamdas04@gmail.com' as string | null,
  copyright: '© kiran@2003',
  instagramUrl: 'https://instagram.com/thegowthamdas',
  region: 'KERALA',
  year: 2026,
} as const;
