type SlateStripesProps = { className?: string; band?: number };

/** Clapperboard hatching. Decorative. */
export function SlateStripes({ className = 'h-6', band = 14 }: SlateStripesProps) {
  return (
    <span
      aria-hidden="true"
      className={`block ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(-45deg, var(--chalk) 0 ${band}px, var(--ink) ${band}px ${band * 2}px)`,
      }}
    />
  );
}
