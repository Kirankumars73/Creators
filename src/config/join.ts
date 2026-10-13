// Fixed option lists for the join form (§7 step 3).

export const DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
  'Outside Kerala',
] as const;

export type District = (typeof DISTRICTS)[number];

export const TAGS = {
  creator: ['reels', 'fashion', 'food', 'travel', 'comedy', 'tech'],
  editor: ['premiere', 'after effects', 'davinci', 'capcut', 'final cut', 'color', 'sound', 'motion'],
} as const;
