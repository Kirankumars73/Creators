import { describe, expect, test } from 'vitest';
import { activeIndex, clipFractions } from '@/lib/film/scrub';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('clipFractions — clip widths proportional to scroll length', () => {
  test('proportional', () => expect(clipFractions([100, 100, 200])).toEqual([0.25, 0.25, 0.5]));
  test('a short section stays wide enough to click', () => {
    const f = clipFractions([1000, 10]);
    expect(f[1]).toBeGreaterThanOrEqual(0.06);
    expect(Math.abs(sum(f) - 1)).toBeLessThan(1e-9);
  });
  test('several tiny sections all get the minimum and the rest share what is left', () => {
    const f = clipFractions([5000, 1, 1, 1]);
    expect(f.slice(1)).toEqual([0.06, 0.06, 0.06]);
    expect(f[0]).toBeCloseTo(0.82);
  });
  test('nothing measured yet → equal clips', () => expect(clipFractions([0, 0, 0, 0])).toEqual([0.25, 0.25, 0.25, 0.25]));
});

describe('activeIndex', () => {
  const tops = [0, 800, 1600];
  test('at the top', () => expect(activeIndex(0, tops)).toBe(0));
  test('inside the second section', () => expect(activeIndex(850, tops)).toBe(1));
  test('past the end', () => expect(activeIndex(5000, tops)).toBe(2));
  test('above the first section', () => expect(activeIndex(-50, tops)).toBe(0));
});
