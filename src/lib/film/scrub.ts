/**
 * Clip widths for the timeline scrubber: proportional to each section's scroll length,
 * but never below `min` so a short section stays clickable. Sums to 1.
 */
export function clipFractions(lengths: number[], min = 0.06): number[] {
  const n = lengths.length;
  if (!n) return [];
  if (lengths.reduce((a, b) => a + b, 0) <= 0) return lengths.map(() => 1 / n);

  const pinned = new Set<number>();
  for (;;) {
    const free = lengths.map((_, i) => i).filter((i) => !pinned.has(i));
    const budget = 1 - pinned.size * min;
    const freeTotal = free.reduce((a, i) => a + lengths[i]!, 0);
    const result = lengths.map((l, i) => (pinned.has(i) ? min : freeTotal > 0 ? (budget * l) / freeTotal : budget / free.length));
    const under = free.filter((i) => result[i]! < min);
    if (!under.length) return result;
    for (const i of under) pinned.add(i);
  }
}

/** Index of the section containing `y`, given each section's top offset (ascending). */
export function activeIndex(y: number, tops: number[]): number {
  let idx = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i]! <= y) idx = i;
  return idx;
}

/**
 * Re-measure scroll triggers only for real layout changes: any width change, or a height change
 * of 150px+. A phone's URL bar showing/hiding changes height by ~50–100px on every scroll
 * reversal; refreshing then janks the scrub (ScrollTrigger ignores it for the same reason).
 */
export function shouldRefreshTriggers(prev: { w: number; h: number } | null, next: { w: number; h: number }): boolean {
  if (!prev) return true;
  return prev.w !== next.w || Math.abs(prev.h - next.h) >= 150;
}
