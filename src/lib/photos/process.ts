import sharp from 'sharp';

// One photo per member, kept as a 4:5 jpeg. The pass, the member page and the directory all
// crop from this one file.
export const PHOTO_WIDTH = 800;
export const PHOTO_HEIGHT = 1000;
export const MAX_INPUT_BYTES = 6 * 1024 * 1024;
// Decoding is what costs memory; a small file can still be a huge image. 50 megapixels covers any phone.
const MAX_PIXELS = 50_000_000;
const ALLOWED = new Set(['jpeg', 'png', 'webp']);

export type PhotoError = 'not_an_image' | 'too_big';

/**
 * Validates and re-encodes an uploaded photo. The type is read from the bytes (never trusted
 * from a name or header); only still jpeg/png/webp pass (no svg, no animation); EXIF is applied
 * (so phone photos come out upright) and then dropped, which removes location and camera data.
 */
export async function processPhoto(input: Uint8Array): Promise<{ ok: true; jpeg: Buffer } | { ok: false; error: PhotoError }> {
  if (input.byteLength > MAX_INPUT_BYTES) return { ok: false, error: 'too_big' };
  if (input.byteLength === 0) return { ok: false, error: 'not_an_image' };
  try {
    const img = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: 'error' });
    const meta = await img.metadata();
    if (!meta.format || !ALLOWED.has(meta.format) || (meta.pages ?? 1) > 1) return { ok: false, error: 'not_an_image' };
    if ((meta.width ?? 0) * (meta.height ?? 0) > MAX_PIXELS) return { ok: false, error: 'too_big' };
    const jpeg = await img
      .rotate() // apply the EXIF orientation, then forget it
      .resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: 'cover', position: 'attention' })
      .flatten({ background: '#ffffff' }) // transparent PNGs land on white, not black
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return { ok: true, jpeg };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    // sharp refuses an over-limit image with "Input image exceeds pixel limit".
    return { ok: false, error: /pixel limit/i.test(message) ? 'too_big' : 'not_an_image' };
  }
}
