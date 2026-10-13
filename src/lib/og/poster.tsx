import 'server-only';
import { ImageResponse } from 'next/og';
import { brand, type Lane } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { mlImage, ogFonts } from './assets';

export const OG_SIZE = { width: 1200, height: 630 };
const STAR = 'M12 1.2L14.81 8.73L22.84 9.08L16.55 14.08L18.7 21.82L12 17.39L5.3 21.82L7.45 14.08L1.16 9.08L9.19 8.73Z';
const LANE: Record<Lane, string> = { creator: TOKENS.rosso, editor: TOKENS.lumen, other: TOKENS.mint };

/** A poster, not a screenshot (§12): ink field, Anton title, mustard stars, a lane rule, the wordmark. */
export async function ogPoster({ title, kicker, lane = 'creator' }: { title: string[]; kicker: string; lane?: Lane }) {
  const [fonts, ml] = await Promise.all([ogFonts(), mlImage('wordmark', 54)]);
  return new ImageResponse(
    (
      <div style={{ ...OG_SIZE, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: TOKENS.ink, color: TOKENS.chalk, fontFamily: 'Geist Mono' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 18, height: 18, background: LANE[lane] }} />
          <div style={{ fontSize: 24, letterSpacing: 4, color: TOKENS['chalk-dim'] }}>{kicker}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Anton', fontSize: 132, lineHeight: 0.88, letterSpacing: -2, textTransform: 'uppercase' }}>
          {title.map((line) => (
            <div key={line} style={{ display: 'flex' }}>
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Anton', fontSize: 64, lineHeight: 0.86 }}>{brand.wordmark.latin}</div>
            {ml ? <img src={ml.src} width={ml.width} height={ml.height} alt="" /> : null}
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <svg key={i} width={30} height={30} viewBox="0 0 24 24">
                <path d={STAR} fill={TOKENS.mustard} />
              </svg>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: LANE[lane], display: 'flex' }} />
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
