import type { Lane } from '@/config/brand';

/**
 * Stands in for the hanging badge while its picture and 3D code load: the card's shape in the
 * room's colour, softly pulsing, so the page never shows a half-built badge popping in.
 */
export function BadgeSkeleton({ role }: { role: Lane }) {
  return (
    <div data-lane={role} role="status" aria-label="Loading the member badge" className="mx-auto flex w-full max-w-[15rem] flex-col items-center">
      <span aria-hidden="true" className="h-16 w-5 rounded-sm bg-lane/50" />
      <span aria-hidden="true" className="aspect-[1.6/2.25] w-full animate-pulse rounded-[0.8rem] bg-lane/25 ring-1 ring-lane/40" />
    </div>
  );
}
