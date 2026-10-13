import { ImageResponse } from 'next/og';
import { TOKENS } from '@/config/tokens';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// At 32px the stacked wordmark is mush; the mustard star from his poster reads.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ ...size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: TOKENS.ink }}>
        <svg width={26} height={26} viewBox="0 0 24 24">
          <path d="M12 1.2L14.81 8.73L22.84 9.08L16.55 14.08L18.7 21.82L12 17.39L5.3 21.82L7.45 14.08L1.16 9.08L9.19 8.73Z" fill={TOKENS.mustard} />
        </svg>
      </div>
    ),
    size,
  );
}
