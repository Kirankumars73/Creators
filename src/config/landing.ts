// Every string on the landing page that isn't a brand name or a room. Components import;
// they never hardcode copy. Anything that makes a promise on Gowtham's behalf is marked
// [ASK GOUTHAM] so he can read it before launch.

import type { Lane } from './brand';

/** Anchors on `/`, in page order. The top nav and the dock link to these. */
export const SECTIONS = [
  { id: 'top', n: '00', label: 'TOP' },
  { id: 'the-room', n: '01', label: 'THE ROOM' },
  { id: 'lanes', n: '02', label: 'LANES' },
  { id: 'how', n: '03', label: 'HOW IT WORKS' },
  { id: 'inside', n: '04', label: 'INSIDE' },
  { id: 'pass', n: '05', label: 'THE PASS' },
  { id: 'brands', n: '06', label: 'FOR BRANDS & AGENCIES' },
  { id: 'roll-call', n: '07', label: 'ROLL CALL' },
  { id: 'the-code', n: '08', label: 'THE CODE' },
  { id: 'faq', n: '09', label: 'FAQ' },
  { id: 'join', n: '10', label: 'JOIN' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function sectionEyebrow(id: SectionId): string {
  const s = SECTIONS.find((x) => x.id === id)!;
  return `${s.n} / ${s.label}`;
}

export const NAV_LINKS = [
  { href: '/#lanes', label: 'Who it’s for' },
  { href: '/#how', label: 'How it works' },
  { href: '/#brands', label: 'For brands' },
  { href: '/creators', label: 'Directory' },
  { href: '/code', label: 'The Code' },
] as const;

export const HERO = {
  tag: 'Kerala’s creator kootam · 2026',
  headline: ["WE'D RATHER", 'SHOW THAN', 'TELL.'] as const,
  sub: 'One room for Kerala’s content creators, video editors and everyone who makes the frame — and the brands who need them. Find your editor. Find your DOP. Find your next collab.',
  primary: 'Join as a creator',
  secondary: 'I’m a brand',
  empty: 'Scene 01 · Take 01 — the room is opening. Be the first one in.',
  sticker: 'CREATORS ★ EDITORS ★ KERALA ★ KOOTAM ★ ',
} as const;

/** Crafts on the velocity ticker. */
export const CRAFTS = [
  'Reels', 'Short films', 'Fashion', 'Food', 'Travel', 'Comedy', 'Tech', 'Colour grading',
  'Sound design', 'Motion', 'VFX', 'Photography', 'Styling', 'Writing', 'DOP', 'Thumbnails',
] as const;

export const MANIFESTO = {
  lines: [
    'Creators burn out making everything alone.',
    'Editors get cropped out of the credits.',
    'Everyone’s shooting. Nobody’s talking to each other.',
  ],
  close: 'So we made a room.',
} as const;

export const STATS_FIXED = [
  { value: '14', label: 'Districts', note: 'Kasaragod to Thiruvananthapuram' },
  { value: '3', label: 'Lanes', note: 'Creators · Editors · Everyone else' },
  // [ASK GOUTHAM] confirm joining stays free.
  { value: '₹0', label: 'To join', note: 'Google sign-in, 30 seconds' },
] as const;

export const LANE_CTA: Record<Lane, string> = {
  creator: 'Join the creators',
  editor: 'Join the editors',
  other: 'Tell us your craft',
};

export const STEPS = [
  { n: '01', title: 'Sign in', copy: 'Google, one tap. We read your name, email and photo — nothing else, and we never post.', icon: 'key' },
  { n: '02', title: 'Pick your lane', copy: 'Creator, editor, or something else. The lane decides your room.', icon: 'lanes' },
  { n: '03', title: 'Tell us your craft', copy: 'Name, handle, district, what you do. Thirty seconds, no essays.', icon: 'pen' },
  { n: '04', title: 'Sign The Code', copy: 'Seven rules. Credit the editor. Pay people. Ask before you use it.', icon: 'star' },
  { n: '05', title: 'Get your pass', copy: 'A member card in your lane’s colour, made to post on your story.', icon: 'pass' },
  { n: '06', title: 'Enter the kootam', copy: 'Two WhatsApp links: the community first, then your lane’s room.', icon: 'chat' },
  { n: '07', title: 'Find your people', copy: 'Editors for creators. Work for editors. A DOP for Saturday.', icon: 'search' },
  { n: '08', title: 'Make it. Credit it.', copy: 'Ship the thing, tag the whole crew, post it in the weekly drop.', icon: 'film' },
] as const;

export type StepIcon = (typeof STEPS)[number]['icon'];

export const INSIDE = {
  title: ['WHAT HAPPENS', 'IN THE ROOM'],
  sub: 'Not another group where people drop links and leave. Four rituals keep it moving — and a board for brand work.',
  lookingFor: {
    name: 'LOOKING FOR',
    copy: 'Creators needing editors, editors needing work. One thread, one format, so nothing gets buried.',
    // Illustrations of the post format, not real posts — the card says so.
    examples: [
      { lane: 'creator', text: 'Editor for a 30s food reel', meta: 'Kochi · paid · this week' },
      { lane: 'editor', text: 'Colourist free for two projects', meta: 'Thrissur · DaVinci · remote' },
      { lane: 'other', text: 'DOP for a Saturday short-film shoot', meta: 'Kozhikode · own kit' },
    ] as { lane: Lane; text: string; meta: string }[],
  },
  weeklyDrop: { name: 'WEEKLY DROP', copy: 'Every Friday, everyone posts what they shipped. Nobody scrolls past.' },
  cutRoom: { name: 'THE CUT ROOM', copy: 'Put up a rough cut. Get it torn apart — kindly.' },
  gear: { name: 'GEAR & GRIEF', copy: 'What you bought, what broke, what you’d never buy again.', tags: ['Bought', 'Broke', 'Never again'] },
  briefs: { name: 'BRAND BRIEFS', copy: 'Brands post a brief. The right lane sees it. You say yes or no.' },
} as const;

export const HUB = {
  title: ['ONE ROOM.', 'EVERY CRAFT.'],
  copy: 'Kerala’s creator scene runs on forwarded numbers and a friend-of-a-cousin who edits. The kootam puts all of it in one place: the people who shoot, the people who cut, everyone who makes the frame better — and the brands who need them.',
  left: ['Creators', 'Editors', 'DOPs', 'Writers', 'Photographers'],
  right: ['Designers', 'Stylists', 'Sound', 'VFX', 'Brands'],
} as const;

export const PASS = {
  title: ['ONE PASS.', 'YOUR CREATOR', 'IDENTITY.'],
  copy: 'Every member gets a pass in their lane’s colour. Save it, post it, and the whole of Kerala knows which room you’re in.',
  points: [
    { title: 'Your lane, handle and district', copy: 'Everything a collaborator needs, on one card.' },
    { title: 'Made to post', copy: 'Sized for your story. Free distribution for the kootam, a flex for you.' },
    { title: 'Signed The Code', copy: 'Every pass means its owner credits people and pays them.' },
  ],
  cta: 'Get your pass',
  sample: { name: 'YOUR NAME', handle: 'yourhandle', city: 'ERNAKULAM' },
} as const;

export const BRANDS = {
  title: ['BRANDS,', 'MEET THE PEOPLE', 'WHO MAKE', 'KERALA’S FEED.'],
  copy: 'Tell us what you’re making. We’ll put the brief in front of the right lane — creators who shoot, editors who cut — and they answer you directly. No middle layer.',
  // [ASK GOUTHAM] these are promises about how briefs are handled.
  points: ['Every size: nano to big', 'Paid or barter — your call, their yes', 'Credit-first: the whole crew gets tagged'],
  formTitle: 'Post a brief',
  formNote: 'Goes to the kootam team. We reply by email.',
  sent: 'Brief received. We’ll read it and reply to you by email.',
} as const;

export const ROLL_CALL = {
  title: ['THE', 'ROLL CALL'],
  sub: 'Real members who said yes to being seen. Your next editor is probably on this wall.',
  empty: 'ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.',
  unreachable: 'ROLL CALL — signal lost. Refresh in a minute.',
  search: 'Search name or handle',
  none: 'Nobody on the wall matches that.',
  more: 'See the whole directory',
} as const;

export const CODE_SHELF = {
  title: ['THE CODE'],
  sub: 'Seven rules everyone signs before they get in. Kerala is small. Credit loudly.',
  more: 'Read all seven',
} as const;

// [ASK GOUTHAM] read every answer: they speak for him.
export const FAQ = [
  {
    q: 'What is Creators Kootam?',
    a: 'A WhatsApp community for Kerala’s content creators, video editors and everyone else who makes the frame — writers, DOPs, designers, sound, VFX, stylists. One community for announcements, plus a room for each lane.',
  },
  {
    q: 'Who can join?',
    a: 'Anyone 13 or over who makes things: reels, short films, edits, grades, posters, sound. Big following or none — the room is about the work.',
  },
  { q: 'Is it free?', a: 'Yes. Joining is free and staying is free.' },
  {
    q: 'Do I have to live in Kerala?',
    a: 'No. Kerala is home, but if you make things with Kerala — or from the Gulf, Bengaluru or anywhere else — pick “Outside Kerala” and come in.',
  },
  {
    q: 'How do I get into the WhatsApp groups?',
    a: 'Sign in with Google, pick your lane, fill a 30-second form and sign The Code. You get two links: the community first (that’s where announcements land), then your lane’s room.',
  },
  {
    q: 'Why Google sign-in?',
    a: 'So every member is a real person, and the invite links never leak into the open. We read your name, email and profile photo — nothing else — and we never post anything.',
  },
  {
    q: 'Will my email or number be public?',
    a: 'No. If you choose to be on the member wall, it shows your display name, Instagram handle and lane. Untick the box and you’re not on it at all.',
  },
  {
    q: 'Can I change my lane later?',
    a: 'Once, from your pass page. After that, message us and we’ll sort it.',
  },
  {
    q: 'I’m a brand. How do I work with creators here?',
    a: 'Post a brief on this page. We read every one and put it in front of the right lane; creators who want it reply to you directly.',
  },
] as const;

export const FINAL = {
  headline: ['TAKE', 'YOUR', 'PLACE.'],
  primary: 'Join the kootam',
  secondary: 'Post a brief',
  note: 'Google sign-in · 30 seconds · No spam, ever',
} as const;

export const DOCK = {
  title: 'Ready to take your place?',
  sub: 'Free. 30 seconds. Kerala’s makers are inside.',
  creator: 'Creator',
  editor: 'Editor',
  brand: 'Brand',
  close: 'Hide',
} as const;

export const FOOTER = {
  blurb: 'Kerala’s room for the people who make the frames — and the brands who need them.',
  columns: [
    {
      title: 'Community',
      links: [
        { href: '/join', label: 'Join the kootam' },
        { href: '/me', label: 'Your pass' },
        { href: '/creators', label: 'Directory' },
        { href: '/code', label: 'The Code' },
      ],
    },
    {
      title: 'On this page',
      links: [
        { href: '/#how', label: 'How it works' },
        { href: '/#inside', label: 'Inside the room' },
        { href: '/#brands', label: 'For brands' },
        { href: '/#faq', label: 'FAQ' },
      ],
    },
  ],
} as const;
