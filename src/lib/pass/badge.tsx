/* eslint-disable @next/next/no-img-element -- next/og renders these <img> tags itself; next/image does not apply */
import 'server-only';
import { ImageResponse } from 'next/og';
import { brand, type Lane } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { mlImage, ogFonts } from '@/lib/og/assets';
import type { PassData } from './data';

const LANE_COLOR: Record<Lane, string> = { creator: TOKENS.rosso, editor: TOKENS.lumen, other: TOKENS.mint };
const LANE_INK: Record<Lane, string> = { creator: TOKENS.paper, editor: TOKENS.print, other: TOKENS.print };

// The same shape as the lanyard's card (1.6 × 2.25), so the picture fills it edge to edge.
export const BADGE_WIDTH = 800;
export const BADGE_HEIGHT = 1125;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('')
    .toUpperCase();

/**
 * The face of the hanging badge on a member's page: their photo fills the card and fades into
 * the name, handle and room at the bottom. With no photo, the room's colour and their initials.
 */
export async function badgeImage(pass: PassData, cacheControl: string, photo?: Buffer | null) {
  const lane = LANE_COLOR[pass.role];
  const [fonts, wordmarkMl] = await Promise.all([ogFonts(), mlImage('wordmark', 56)]);
  const size = pass.headline.length > 16 ? 76 : pass.headline.length > 11 ? 92 : 112;

  return new ImageResponse(
    (
      <div style={{ width: BADGE_WIDTH, height: BADGE_HEIGHT, display: 'flex', position: 'relative', background: lane, color: '#ffffff', fontFamily: 'Geist Mono' }}>
        {photo ? (
          <img
            src={`data:image/jpeg;base64,${photo.toString('base64')}`}
            width={BADGE_WIDTH}
            height={BADGE_HEIGHT}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: BADGE_WIDTH, height: BADGE_HEIGHT, objectFit: 'cover', objectPosition: '50% 22%' }}
          />
        ) : (
          <div style={{ position: 'absolute', top: 120, left: 0, width: BADGE_WIDTH, display: 'flex', justifyContent: 'center', fontFamily: 'Anton', fontSize: 380, lineHeight: 1, color: LANE_INK[pass.role], opacity: 0.9 }}>
            {initials(pass.headline.replace(/^@/, ''))}
          </div>
        )}
        {/* The fade: clear at the top, deep ink where the words sit. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: BADGE_WIDTH,
            height: 700,
            background: 'linear-gradient(to top, rgba(8,12,24,0.96) 0%, rgba(8,12,24,0.86) 34%, rgba(8,12,24,0.45) 68%, rgba(8,12,24,0) 100%)',
          }}
        />
        {/* A light fade from the top, so the wordmark reads even over a bright sky. */}
        {photo ? <div style={{ position: 'absolute', left: 0, top: 0, width: BADGE_WIDTH, height: 280, background: 'linear-gradient(to bottom, rgba(8,12,24,0.62), rgba(8,12,24,0))' }} /> : null}
        <div style={{ position: 'absolute', top: 44, left: 48, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'Anton', fontSize: 52, lineHeight: 0.9, letterSpacing: -1, color: '#ffffff' }}>{brand.wordmark.latin}</div>
          {wordmarkMl ? <img src={wordmarkMl.src} width={wordmarkMl.width} height={wordmarkMl.height} alt="" style={{ marginTop: 4 }} /> : null}
        </div>
        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 56, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '10px 22px', background: lane, color: LANE_INK[pass.role], fontSize: 26, letterSpacing: 3 }}>{pass.roomName}</div>
          <div style={{ display: 'flex', marginTop: 26, fontFamily: 'Anton', fontSize: size, lineHeight: 0.94, textTransform: 'uppercase' }}>{pass.headline}</div>
          <div style={{ display: 'flex', marginTop: 18, fontSize: 32, color: 'rgba(255,255,255,0.86)' }}>@{pass.instagram}</div>
        </div>
      </div>
    ),
    { width: BADGE_WIDTH, height: BADGE_HEIGHT, fonts, headers: { 'Cache-Control': cacheControl } },
  );
}
