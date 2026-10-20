/** The shape every photo is kept in, and shown in: 4 wide by 5 tall. */
export const CROP_RATIO = 4 / 5;
export const CROP_OUT = { width: 800, height: 1000 } as const;

export type CropView = {
  /** 1 = the photo just covers the frame; larger zooms in. */
  zoom: number;
  /** Where the middle of the frame points on the photo, as 0..1 of its width and height. */
  cx: number;
  cy: number;
};

export const MAX_ZOOM = 4;

/** Pixels of the photo that fill a frame at this view: a source rectangle in photo pixels. */
export function cropRect(photoW: number, photoH: number, view: CropView): { x: number; y: number; w: number; h: number } {
  // At zoom 1 the largest 4:5 rectangle that fits inside the photo.
  const baseW = Math.min(photoW, photoH * CROP_RATIO);
  const w = baseW / clamp(view.zoom, 1, MAX_ZOOM);
  const h = w / CROP_RATIO;
  const x = clamp(view.cx * photoW - w / 2, 0, photoW - w);
  const y = clamp(view.cy * photoH - h / 2, 0, photoH - h);
  return { x, y, w, h };
}

/** Keeps the view inside the photo: no empty edges, whatever was dragged or zoomed. */
export function clampView(photoW: number, photoH: number, view: CropView): CropView {
  const zoom = clamp(view.zoom, 1, MAX_ZOOM);
  const r = cropRect(photoW, photoH, { ...view, zoom });
  return { zoom, cx: (r.x + r.w / 2) / photoW, cy: (r.y + r.h / 2) / photoH };
}

/** A starting view: centred, a little above the middle (faces sit in the top half). */
export function initialView(photoW: number, photoH: number): CropView {
  return clampView(photoW, photoH, { zoom: 1, cx: 0.5, cy: 0.4 });
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
