// Every string on the public pages that isn't a brand name or a room. Components import;
// they never hardcode copy. Anything that makes a promise on Gowtham's behalf is marked
// [ASK GOUTHAM]; `pnpm check:launch` blocks until brand.landingReviewed.

/** Anchors on `/`, in page order. */
export const SECTIONS = ['top', 'the-room', 'how', 'inside', 'pass', 'brands', 'roll-call', 'the-code', 'faq', 'join'] as const;
export type SectionId = (typeof SECTIONS)[number];

export const NAV_LINKS = [
  { href: '/#how', label: 'How to join' },
  { href: '/#inside', label: 'Inside' },
  { href: '/#brands', label: 'For brands' },
  { href: '/creators', label: 'Members' },
  { href: '/code', label: 'The Code' },
] as const;

export const HERO = {
  headline: ["WE'D RATHER", 'SHOW THAN TELL.'] as const,
  sub: 'Kerala’s room for content creators, video editors and everyone else who makes the frame. Find an editor, a DOP, your next collab. Brands find you here too.',
  primary: 'Join the kootam',
  secondary: 'I’m a brand',
  members: (n: number) => (n === 1 ? '1 maker is already inside.' : `${n} makers are already inside.`),
  empty: 'The room just opened. Be one of the first in.',
  postersLabel: 'Pick your room',
} as const;

/** The rotating end of "Find your …" under the hero headline. */
export const FIND = { lead: 'Find your', words: ['editor.', 'DOP.', 'colourist.', 'sound designer.', 'next collab.', 'people.'] } as const;

/** Crafts on the velocity ticker under the hero. */
export const CRAFTS = [
  'Reels', 'Short films', 'Fashion', 'Food', 'Travel', 'Comedy', 'Tech', 'Colour grading',
  'Sound design', 'Motion', 'VFX', 'Photography', 'Styling', 'Writing', 'DOP', 'Thumbnails',
] as const;

export const MANIFESTO = {
  title: 'Why a room',
  lines: ['Creators burn out making everything alone.', 'Editors get cropped out of the credits.', 'Everyone’s shooting. Nobody’s talking to each other.'],
  close: 'So we made a room.',
} as const;

export const HOW = {
  title: 'Joining takes about a minute',
  cta: 'Start with step one',
  steps: [
    { title: 'Sign in with Google', copy: 'We see your name, email and profile photo. Nothing else, and we never post.' },
    { title: 'Pick your room', copy: 'Content creators, editors, or something else. It decides which group you land in.' },
    { title: 'Tell us about your work', copy: 'Your name, Instagram handle, district and what you do.' },
    { title: 'Agree to The Code', copy: 'Seven rules about credit, pay and asking first.' },
    { title: 'Open WhatsApp', copy: 'The community first, where announcements land, then your room.' },
  ],
} as const;

export const INSIDE = {
  title: 'What happens inside',
  sub: 'Not another group where people drop links and leave. Four habits keep it moving.',
  items: [
    { name: 'Weekly drop', copy: 'Every Friday, everyone posts what they shipped that week. Nobody scrolls past.' },
    { name: 'The cut room', copy: 'Put up a rough cut and get it torn apart, kindly, by people who edit for a living.' },
    { name: 'Looking for', copy: 'Creators who need editors, editors who need work, a DOP for Saturday. One thread, one format.' },
    { name: 'Gear and grief', copy: 'What you bought, what broke, what you’d never buy again.' },
  ],
  // An example of the "Looking for" format — the page says it's an example.
  example: { label: 'A post in Looking for', text: 'Need an editor for a 30-second food reel. Kochi, paid, this week.' },
} as const;

export const PASS = {
  title: 'Your member pass',
  copy: 'Everyone who joins gets a pass in their room’s colour, sized for an Instagram story. Post it, and people know which room to find you in.',
  points: ['Your name, handle and room on one card', 'Save it straight from the join page', 'It means you agreed to credit people and pay them'],
  sample: { name: 'Your name', handle: 'yourhandle' },
} as const;

export const BRANDS = {
  title: 'Brands, meet Kerala’s makers',
  copy: 'Tell us what you’re making. We put the brief in front of the right room, and the creators and editors who want it reply to you directly.',
  // [ASK GOUTHAM] these are promises about how briefs are handled.
  points: ['Creators of every size, in every district', 'Paid or barter: you set the terms, they decide', 'Every collab credits the whole crew'],
  formTitle: 'Post a brief',
  formNote: 'It comes to the kootam team. We reply by email.',
  sent: 'Brief received. We’ll read it and reply by email.',
} as const;

export const ROLL_CALL = {
  title: 'Who’s on the wall',
  sub: 'Members who chose to be listed. Tap a name to open their page.',
  empty: 'Nobody’s on the wall yet. Join and be the first name on it.',
  unreachable: 'The member list didn’t load. Refresh in a minute.',
  search: 'Search by name or handle',
  none: 'Nobody on the wall matches that.',
  more: 'See every member',
} as const;

export const CODE_SHELF = {
  title: 'The Code',
  sub: 'Seven rules everyone agrees to before they join. Kerala is small. Credit loudly.',
  more: 'Read all seven rules',
} as const;

// [ASK GOUTHAM] read every answer: they speak for him.
export const FAQ = [
  {
    q: 'What is Creators Kootam?',
    a: 'A WhatsApp community for Kerala’s content creators, video editors and everyone else who makes the frame: writers, DOPs, designers, sound, VFX, stylists. One community for announcements, plus a room for each kind of work.',
  },
  { q: 'Who can join?', a: 'Anyone 13 or over who makes things: reels, short films, edits, grades, posters, sound. Big following or none, the room is about the work.' },
  { q: 'Is it free?', a: 'Yes. Joining is free and staying is free.' },
  {
    q: 'Do I have to live in Kerala?',
    a: 'No. Kerala is home, but if you make things with Kerala, from the Gulf, Bengaluru or anywhere else, pick “Outside Kerala” and come in.',
  },
  {
    q: 'How do I get into the WhatsApp groups?',
    a: 'Sign in with Google, pick your room, fill a short form and agree to The Code. You get two links: the community first, where announcements land, then your room.',
  },
  {
    q: 'Why Google sign-in?',
    a: 'So every member is a real person and the invite links never leak. We see your name, email and profile photo, nothing else, and we never post anything.',
  },
  {
    q: 'Will my email or number be public?',
    a: 'No. If you choose to be on the wall, it shows your name, Instagram handle and room. Untick the box and you’re not on it at all.',
  },
  { q: 'Can I change my room later?', a: 'Once, from your pass page. After that, message us and we’ll sort it.' },
  {
    q: 'I’m a brand. How do I work with creators here?',
    a: 'Post a brief on this page. We read every one and put it in front of the right room; the people who want it reply to you directly.',
  },
] as const;

export const FINAL = {
  headline: ['TAKE YOUR', 'PLACE.'],
  primary: 'Join the kootam',
  secondary: 'Post a brief',
  note: 'Sign in with Google. It takes about a minute.',
} as const;

export const DOCK = {
  title: 'Ready to join?',
  sub: 'Free, and it takes about a minute.',
  cta: 'Join the kootam',
  close: 'Hide',
} as const;

export const FOOTER = {
  blurb: 'Kerala’s room for the people who make the frames, and the brands who need them.',
  columns: [
    {
      title: 'Community',
      links: [
        { href: '/join', label: 'Join the kootam' },
        { href: '/me', label: 'Your pass' },
        { href: '/creators', label: 'Members' },
        { href: '/code', label: 'The Code' },
      ],
    },
    {
      title: 'On this page',
      links: [
        { href: '/#how', label: 'How to join' },
        { href: '/#inside', label: 'What happens inside' },
        { href: '/#brands', label: 'For brands' },
        { href: '/#faq', label: 'Questions' },
      ],
    },
  ],
} as const;
