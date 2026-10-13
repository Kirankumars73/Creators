import { ImageResponse } from 'next/og';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { mlImage, ogFonts } from '@/lib/og/assets';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// The full two-script wordmark (§4.0) fits at 180px.
export default async function AppleIcon() {
  const [fonts, ml] = await Promise.all([ogFonts(), mlImage('wordmark', 46)]);
  return new ImageResponse(
    (
      <div style={{ ...size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: TOKENS.ink, color: TOKENS.chalk }}>
        <div style={{ fontFamily: 'Anton', fontSize: 50, lineHeight: 0.86 }}>{brand.wordmark.latin}</div>
        {ml ? <img src={ml.src} width={ml.width} height={ml.height} alt="" /> : null}
        <div style={{ width: 120, height: 5, marginTop: 8, background: TOKENS.rosso, display: 'flex' }} />
      </div>
    ),
    { ...size, fonts },
  );
}
