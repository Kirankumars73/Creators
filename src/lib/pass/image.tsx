import 'server-only';
import { ImageResponse } from 'next/og';
import { brand, type Lane } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { mlImage, ogFonts } from '@/lib/og/assets';
import type { PassData } from './data';

const LANE_COLOR: Record<Lane, string> = { creator: TOKENS.rosso, editor: TOKENS.lumen, other: TOKENS.mint };
const STRIPES = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="56"><defs><pattern id="s" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="28" height="56" fill="${TOKENS.chalk}"/></pattern></defs><rect width="1080" height="56" fill="${TOKENS.ink}"/><rect width="1080" height="56" fill="url(#s)"/></svg>`,
).toString('base64')}`;

const initialsOf = (name: string) =>
  name
    .replace(/^@/, '')
    .split(/[\s._]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('')
    .toUpperCase();

const INK_ON: Record<Lane, string> = { creator: TOKENS.paper, editor: TOKENS.print, other: TOKENS.print };

/**
 * The 1080×1920 member pass, story-sized: the member's photo large across the top (or their
 * initials on the room's colour), fading into a deep panel with their name and handle, and a bold
 * block in the room's colour carrying the room name. Same family as the badge on their page.
 */
export async function passImage(pass: PassData, cacheControl: string, host: string, photo?: Buffer | null) {
  const lane = LANE_COLOR[pass.role];
  const ink = INK_ON[pass.role];
  const [fonts, wordmarkMl] = await Promise.all([ogFonts(), mlImage('wordmark', 110)]);
  const headlineSize = pass.headline.length > 18 ? 96 : pass.headline.length > 12 ? 124 : 150;
  const PHOTO_H = 1440;
  // Two-word rooms set on two lines, so they step down to leave room for the footer line.
  const roomSize = pass.roomName.length > 10 ? 120 : 168;

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: 'flex', flexDirection: 'column', background: '#080c18', color: '#ffffff', fontFamily: 'Geist Mono', position: 'relative' }}>
        {/* The picture, or the room's colour with their initials. */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: PHOTO_H, display: 'flex', background: lane }}>
          {photo ? (
            <img src={`data:image/jpeg;base64,${photo.toString('base64')}`} width={1080} height={PHOTO_H} alt="" style={{ width: 1080, height: PHOTO_H, objectFit: 'cover', objectPosition: '50% 20%' }} />
          ) : (
            <div style={{ display: 'flex', width: 1080, justifyContent: 'center', paddingTop: 250, fontFamily: 'Anton', fontSize: 560, lineHeight: 1, color: ink, opacity: 0.92 }}>{initialsOf(pass.headline)}</div>
          )}
        </div>
        {/* Fades: from the top (so the wordmark reads) and into the panel below the picture. */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 420, background: 'linear-gradient(to bottom, rgba(8,12,24,0.7), rgba(8,12,24,0))' }} />
        <div style={{ position: 'absolute', top: PHOTO_H - 820, left: 0, width: 1080, height: 880, background: 'linear-gradient(to bottom, rgba(8,12,24,0), rgba(8,12,24,0.88) 55%, #080c18)' }} />

        <img src={STRIPES} width={1080} height={56} alt="" style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{ position: 'absolute', top: 120, left: 80, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'Anton', fontSize: 132, lineHeight: 0.86, letterSpacing: -3 }}>{brand.wordmark.latin}</div>
          {wordmarkMl ? <img src={wordmarkMl.src} width={wordmarkMl.width} height={wordmarkMl.height} alt="" style={{ marginTop: 6 }} /> : <div style={{ fontFamily: 'Anton', fontSize: 96, lineHeight: 1 }}>KOOTAM</div>}
        </div>
        <div style={{ position: 'absolute', top: 132, right: 80, display: 'flex', padding: '14px 30px', background: '#ffffff', color: TOKENS.print, fontSize: 30, letterSpacing: 5 }}>MEMBER PASS</div>

        {/* Name and handle over the fade. */}
        <div style={{ position: 'absolute', left: 80, right: 80, bottom: 510, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '10px 26px', background: lane, color: ink, fontSize: 30, letterSpacing: 4 }}>{pass.laneLabel}</div>
          <div style={{ display: 'flex', marginTop: 30, fontFamily: 'Anton', fontSize: headlineSize, lineHeight: 0.92, textTransform: 'uppercase' }}>{pass.headline}</div>
          <div style={{ display: 'flex', marginTop: 24, fontSize: 44, color: 'rgba(255,255,255,0.86)' }}>@{pass.instagram}</div>
        </div>

        {/* The room, in its own colour. */}
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: 1080, height: 440, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 80px 52px', background: lane, color: ink }}>
          <div style={{ display: 'flex', fontFamily: 'Anton', fontSize: roomSize, lineHeight: 0.9, letterSpacing: -2 }}>{pass.roomName}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, letterSpacing: 3 }}>
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
