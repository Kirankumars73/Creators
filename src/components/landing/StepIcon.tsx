import type { StepIcon as Icon } from '@/config/landing';

const PATHS: Record<Icon, React.ReactNode> = {
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 L20 3 M17 6 L20 9 M15 8 L17 10" />
    </>
  ),
  lanes: <path d="M5 3 V21 M12 3 V21 M19 3 V21 M3 8 H7 M10 14 H14 M17 10 H21" />,
  pen: <path d="M4 20 L5 15 L16 4 L20 8 L9 19 Z M14 6 L18 10" />,
  star: <path d="M12 2.5 L14.6 9 L21.5 9.3 L16.1 13.6 L18 20.3 L12 16.5 L6 20.3 L7.9 13.6 L2.5 9.3 L9.4 9 Z" />,
  pass: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <circle cx="9" cy="11" r="2.2" />
      <path d="M6 16 H12 M15 10 H18 M15 13 H18" />
    </>
  ),
  chat: <path d="M4 5 H20 V16 H10 L5 20 V16 H4 Z M8 9 H16 M8 12 H13" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15 L21 21" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M7 4 V20 M17 4 V20 M3 8 H7 M3 12 H7 M3 16 H7 M17 8 H21 M17 12 H21 M17 16 H21" />
    </>
  ),
};

/** Line icons for the how-it-works steps, drawn in the lane colour. Decorative. */
export function StepIcon({ icon, className = '' }: { icon: Icon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className={`fill-none stroke-lane ${className}`} strokeWidth="1.5" strokeLinejoin="miter">
      {PATHS[icon]}
    </svg>
  );
}
