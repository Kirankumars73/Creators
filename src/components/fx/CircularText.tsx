import type { ReactNode } from 'react';

type CircularTextProps = {
  text: string;
  /** Unique on the page: names the SVG path the text runs along. */
  id: string;
  /** Diameter in px. */
  size?: number;
  className?: string;
  children?: ReactNode;
};

/**
 * Text set on a circle that turns slowly (after React Bits' CircularText, done in SVG + CSS so it
 * costs no JavaScript). The ring is decorative; `children` sit in the middle. Stops under
 * reduced motion.
 */
export function CircularText({ text, id, size = 140, className = '', children }: CircularTextProps) {
  const r = size / 2 - 12;
  const c = size / 2;
  return (
    <span aria-hidden="true" className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="circular-spin absolute inset-0">
        <defs>
          <path id={id} d={`M ${c} ${c} m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 -${r * 2} 0`} />
        </defs>
        <text className="fill-current font-mono uppercase" fontSize={size * 0.085} letterSpacing={size * 0.012}>
          <textPath href={`#${id}`} textLength={Math.PI * r * 2 - 4}>
            {text}
          </textPath>
        </text>
      </svg>
      {children}
    </span>
  );
}
