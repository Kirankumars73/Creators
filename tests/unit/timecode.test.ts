import { describe, expect, test } from 'vitest';
import { formatTimecode, padCount, toDigits } from '@/lib/timecode';

describe('formatTimecode', () => {
  test('zero is all zeros', () => expect(formatTimecode(0)).toBe('00:00:00:00'));
  test('37 frames at 25fps is the cold-open end value', () => expect(formatTimecode(37)).toBe('00:00:01:12'));
  test('rolls over into hours', () => expect(formatTimecode(25 * 3600 + 1)).toBe('01:00:00:01'));
  test('respects a custom frame rate', () => expect(formatTimecode(30, 24)).toBe('00:00:01:06'));
  test('negative and fractional frames clamp to whole non-negative frames', () => {
    expect(formatTimecode(-5)).toBe('00:00:00:00');
    expect(formatTimecode(37.9)).toBe('00:00:01:12');
  });
});

describe('padCount', () => {
  test('pads to six digits by default', () => expect(padCount(147)).toBe('000147'));
  test('takes a width', () => expect(padCount(7, 3)).toBe('007'));
});

describe('toDigits', () => {
  test('splits into fixed-width digits', () => expect(toDigits(147, 6)).toEqual([0, 0, 0, 1, 4, 7]));
  test('clamps rather than overflowing the width', () => expect(toDigits(1_234_567, 6)).toEqual([9, 9, 9, 9, 9, 9]));
});
