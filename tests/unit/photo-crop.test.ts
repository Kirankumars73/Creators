import { describe, expect, test } from 'vitest';
import { CROP_RATIO, MAX_ZOOM, clampView, cropRect, initialView } from '@/lib/photos/crop';

describe('cropRect: which part of the photo fills the 4:5 frame', () => {
  test('a landscape photo: full height, a 4:5 slice of the width', () => {
    const r = cropRect(4000, 3000, { zoom: 1, cx: 0.5, cy: 0.5 });
    expect(r.h).toBe(3000);
    expect(r.w / r.h).toBeCloseTo(CROP_RATIO);
    expect(r.x).toBeCloseTo((4000 - r.w) / 2);
  });

  test('a tall photo: full width, and the slice can be moved up and down', () => {
    const top = cropRect(1000, 3000, { zoom: 1, cx: 0.5, cy: 0 });
    const bottom = cropRect(1000, 3000, { zoom: 1, cx: 0.5, cy: 1 });
    expect(top.w).toBe(1000);
    expect(top.y).toBe(0);
    expect(bottom.y + bottom.h).toBeCloseTo(3000);
  });

  test('zooming in shows a smaller part, still 4:5', () => {
    const a = cropRect(4000, 3000, { zoom: 1, cx: 0.5, cy: 0.5 });
    const b = cropRect(4000, 3000, { zoom: 2, cx: 0.5, cy: 0.5 });
    expect(b.w).toBeCloseTo(a.w / 2);
    expect(b.w / b.h).toBeCloseTo(CROP_RATIO);
  });

  test('never reaches outside the photo, however far it is dragged', () => {
    for (const [cx, cy] of [[-5, -5], [9, 9], [0, 1], [1, 0]] as [number, number][]) {
      const r = cropRect(3000, 4000, { zoom: 3, cx, cy });
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(3000 + 1e-6);
      expect(r.y + r.h).toBeLessThanOrEqual(4000 + 1e-6);
    }
  });

  test('an image already 4:5 at zoom 1 is the whole image', () => {
    expect(cropRect(800, 1000, { zoom: 1, cx: 0.5, cy: 0.5 })).toEqual({ x: 0, y: 0, w: 800, h: 1000 });
  });
});

describe('clampView', () => {
  test('keeps zoom between 1 and the maximum, and the centre where the frame still fits', () => {
    const v = clampView(4000, 3000, { zoom: 99, cx: -1, cy: 2 });
    expect(v.zoom).toBe(MAX_ZOOM);
    const r = cropRect(4000, 3000, v);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y + r.h).toBeLessThanOrEqual(3000 + 1e-6);
  });

  test('starts centred and zoomed out', () => {
    expect(initialView(4000, 3000)).toMatchObject({ zoom: 1, cx: 0.5 });
  });
});
