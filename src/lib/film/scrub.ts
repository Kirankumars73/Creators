/**
 * Re-measure scroll triggers only for real layout changes: any width change, or a height change
 * of 150px+. A phone's URL bar showing/hiding changes height by ~50–100px on every scroll
 * reversal; refreshing then janks the scrub (ScrollTrigger ignores it for the same reason).
 */
export function shouldRefreshTriggers(prev: { w: number; h: number } | null, next: { w: number; h: number }): boolean {
  if (!prev) return true;
  return prev.w !== next.w || Math.abs(prev.h - next.h) >= 150;
}
