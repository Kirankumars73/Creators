type CropMarksProps = {
  /** Draw the marks in on hover/focus of the nearest `.group` ancestor (stroke-dashoffset, 240ms). */
  draw?: boolean;
  tone?: 'rule' | 'lane' | 'chalk';
  /** Arm length in px. */
  size?: number;
  /** Push the marks outward from the corners, in px. */
  offset?: number;
};

const CORNERS = [
  { key: 'tl', style: { top: 0, left: 0 }, rotate: 0 },
  { key: 'tr', style: { top: 0, right: 0 }, rotate: 90 },
  { key: 'br', style: { bottom: 0, right: 0 }, rotate: 180 },
  { key: 'bl', style: { bottom: 0, left: 0 }, rotate: 270 },
] as const;

const TONES = { rule: 'var(--rule)', lane: 'var(--lane)', chalk: 'var(--chalk)' } as const;

/** Print registration L-brackets at the four corners of the positioned parent. */
export function CropMarks({ draw = false, tone = 'rule', size = 14, offset = 0 }: CropMarksProps) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute" style={{ inset: -offset }}>
      {CORNERS.map((c) => (
        <svg
          key={c.key}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={draw ? 'crop-draw absolute' : 'absolute'}
          style={{ ...c.style, rotate: `${c.rotate}deg`, ['--crop-len' as string]: size * 2 }}
        >
          <path
            d={`M0.5 ${size} V0.5 H${size}`}
            fill="none"
            stroke={TONES[tone]}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ))}
    </span>
  );
}
