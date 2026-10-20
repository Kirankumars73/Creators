type StarProps = { size?: number | string; className?: string; /** A CSS color; mustard unless set. */ color?: string };

/** The mustard five-point star from his poster. Decorative. */
export function Star({ size = '1em', className, color = 'var(--mustard)' }: StarProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ fill: color }}
    >
      <path d="M12 1.2L14.81 8.73L22.84 9.08L16.55 14.08L18.7 21.82L12 17.39L5.3 21.82L7.45 14.08L1.16 9.08L9.19 8.73Z" />
    </svg>
  );
}
