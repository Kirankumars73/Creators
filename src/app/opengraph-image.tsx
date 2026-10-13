import { brand } from '@/config/brand';
import { OG_SIZE, ogPoster } from '@/lib/og/poster';

export const alt = `${brand.name} — We'd rather show than tell.`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogPoster({ title: ["WE'D RATHER", 'SHOW THAN TELL.'], kicker: `${brand.rooms.community.name} · ${brand.region}` });
}
