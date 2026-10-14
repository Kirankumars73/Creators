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

/** The names people actually type (old/English names, big towns) → the district they mean. */
export const DISTRICT_ALIASES: Partial<Record<District, readonly string[]>> = {
  Thiruvananthapuram: ['Trivandrum', 'TVM'],
  Kollam: ['Quilon'],
  Pathanamthitta: ['Thiruvalla', 'Tiruvalla', 'Adoor'],
  Alappuzha: ['Alleppey', 'Cherthala'],
  Kottayam: ['Pala'],
  Idukki: ['Munnar', 'Thodupuzha'],
  Ernakulam: ['Kochi', 'Cochin', 'Aluva', 'Kakkanad'],
  Thrissur: ['Trichur', 'Guruvayur'],
  Palakkad: ['Palghat'],
  Malappuram: ['Manjeri', 'Tirur', 'Perinthalmanna'],
  Kozhikode: ['Calicut', 'Vadakara'],
  Wayanad: ['Kalpetta', 'Sulthan Bathery'],
  Kannur: ['Cannanore', 'Thalassery', 'Tellicherry'],
  Kasaragod: ['Kasargod', 'Kasaragode', 'Kanhangad'],
  'Outside Kerala': ['Bangalore', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Dubai', 'UAE', 'Abroad'],
};

export const TAGS = {
  creator: ['reels', 'fashion', 'food', 'travel', 'comedy', 'tech'],
  editor: ['premiere', 'after effects', 'davinci', 'capcut', 'final cut', 'color', 'sound', 'motion'],
} as const;
