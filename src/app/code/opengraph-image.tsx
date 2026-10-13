import { brand } from '@/config/brand';
import { OG_SIZE, ogPoster } from '@/lib/og/poster';

export const alt = `The Code — the charter of ${brand.name}.`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogPoster({ title: ['THE CODE.', 'CREDIT THE EDITOR.'], kicker: `${brand.rooms.community.name} · SEVEN RULES` });
}
