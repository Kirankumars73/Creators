import 'server-only';
import { ImageResponse } from 'next/og';
import { brand, type Lane } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { mlImage, ogFonts } from '@/lib/og/assets';
import type { PassData } from './data';

const LANE_COLOR: Record<Lane, string> = { creator: TOKENS.rosso, editor: TOKENS.lumen, other: TOKENS.mint };
const STAR = 'M12 1.2L14.81 8.73L22.84 9.08L16.55 14.08L18.7 21.82L12 17.39L5.3 21.82L7.45 14.08L1.16 9.08L9.19 8.73Z';
const STRIPES = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="56"><defs><pattern id="s" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="28" height="56" fill="${TOKENS.chalk}"/></pattern></defs><rect width="1080" height="56" fill="${TOKENS.ink}"/><rect width="1080" height="56" fill="url(#s)"/></svg>`,
).toString('base64')}`;

function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  const s = { position: 'absolute' as const, width: 36, height: 36, borderColor: TOKENS.rule, borderStyle: 'solid' as const };
  const side = {
    tl: { top: 96, left: 40, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 96, right: 40, borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 40, left: 40, borderBottomWidth: 2, borderLeftWidth: 2, borderTopWidth: 0, borderRightWidth: 0 },
    br: { bottom: 40, right: 40, borderBottomWidth: 2, borderRightWidth: 2, borderTopWidth: 0, borderLeftWidth: 0 },
  }[at];
  return <div style={{ ...s, ...side }} />;
}

/** The 1080×1920 member pass: story-sized, lane-colored, poster-built (§7, §12). */
export async function passImage(pass: PassData, cacheControl: string, host: string) {
  const lane = LANE_COLOR[pass.role];
  const [fonts, wordmarkMl] = await Promise.all([ogFonts(), mlImage('wordmark', 120)]);
  const headlineSize = pass.headline.length > 18 ? 104 : 136;

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: 'flex', flexDirection: 'column', background: TOKENS.ink, color: TOKENS.chalk, fontFamily: 'Geist Mono', position: 'relative' }}>
        <img src={STRIPES} width={1080} height={56} alt="" />
        <Corner at="tl" />
        <Corner at="tr" />
        <Corner at="bl" />
        <Corner at="br" />
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '120px 104px 112px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'Anton', fontSize: 150, lineHeight: 0.86, letterSpacing: -3 }}>{brand.wordmark.latin}</div>
            {wordmarkMl ? (
              <img src={wordmarkMl.src} width={wordmarkMl.width} height={wordmarkMl.height} alt="" style={{ marginTop: 8 }} />
            ) : (
              <div style={{ fontFamily: 'Anton', fontSize: 110, lineHeight: 1 }}>KOOTAM</div>
            )}
          </div>

          <div style={{ display: 'flex', marginTop: 140, fontSize: 30, letterSpacing: 4, color: TOKENS['chalk-dim'] }}>MEMBER PASS</div>
          <div style={{ display: 'flex', marginTop: 24, fontFamily: 'Anton', fontSize: headlineSize, lineHeight: 0.92, textTransform: 'uppercase' }}>
            {pass.headline}
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 40, color: TOKENS['chalk-dim'] }}>@{pass.instagram}</div>

          <div style={{ display: 'flex', flexGrow: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 30, letterSpacing: 4, color: TOKENS.chalk }}>
            <div style={{ width: 22, height: 22, background: lane }} />
            {pass.laneLabel}
          </div>
          <div style={{ display: 'flex', marginTop: 20, fontFamily: 'Anton', fontSize: 196, lineHeight: 0.86, color: lane, letterSpacing: -4 }}>
            {pass.roomName}
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 56 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <svg key={i} width={34} height={34} viewBox="0 0 24 24">
                <path d={STAR} fill={TOKENS.mustard} />
              </svg>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 56, fontSize: 26, letterSpacing: 3, color: TOKENS['chalk-dim'] }}>
            <span>JOINED {pass.joined}</span>
            <span>{brand.region}</span>
            <span>{host.toUpperCase()}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts, headers: { 'Cache-Control': cacheControl } },
  );
}
