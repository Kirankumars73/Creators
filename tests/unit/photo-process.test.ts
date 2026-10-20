import sharp from 'sharp';
import { describe, expect, test } from 'vitest';
import { MAX_INPUT_BYTES, PHOTO_HEIGHT, PHOTO_WIDTH, processPhoto } from '@/lib/photos/process';

const solid = (w: number, h: number, format: 'jpeg' | 'png' | 'webp' = 'jpeg') =>
  sharp({ create: { width: w, height: h, channels: 3, background: '#c6f24e' } })[format]().toBuffer();

describe('processPhoto: what we keep from an upload', () => {
  test('any jpeg, png or webp becomes a 4:5 jpeg of a fixed size', async () => {
    for (const format of ['jpeg', 'png', 'webp'] as const) {
      const r = await processPhoto(await solid(1600, 900, format));
      expect(r.ok, format).toBe(true);
      if (!r.ok) continue;
      const meta = await sharp(r.jpeg).metadata();
      expect([meta.format, meta.width, meta.height], format).toEqual(['jpeg', PHOTO_WIDTH, PHOTO_HEIGHT]);
    }
  });

  test('small photos are not blown up past what they hold, but still come out 4:5', async () => {
    const r = await processPhoto(await solid(300, 300));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const meta = await sharp(r.jpeg).metadata();
    expect(meta.width! / meta.height!).toBeCloseTo(0.8, 2);
  });

  test('hidden data goes: EXIF (location, camera) is stripped from what we keep', async () => {
    const tagged = await sharp(await solid(400, 200)).withExif({ IFD0: { Copyright: 'someone', ImageDescription: 'GPS 9.93,76.26' } }).jpeg().toBuffer();
    expect((await sharp(tagged).metadata()).exif).toBeDefined();
    const r = await processPhoto(tagged);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect((await sharp(r.jpeg).metadata()).exif).toBeUndefined();
  });

  test('a phone photo flagged as sideways is accepted (orientation is applied, then dropped)', async () => {
    const sideways = await sharp(await solid(400, 200)).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    const r = await processPhoto(sideways);
    expect(r.ok).toBe(true);
    if (r.ok) expect((await sharp(r.jpeg).metadata()).orientation).toBeUndefined();
  });

  test('the real type is checked, not the name: text, svg and junk are refused', async () => {
    for (const bytes of [Buffer.from('not an image at all'), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), Buffer.alloc(0)]) {
      expect(await processPhoto(bytes)).toEqual({ ok: false, error: 'not_an_image' });
    }
  });

  test('animated gifs are refused too (only still photos)', async () => {
    const gif = await sharp(await solid(50, 50), { animated: false }).gif().toBuffer();
    expect(await processPhoto(gif)).toEqual({ ok: false, error: 'not_an_image' });
  });

  test('too big in bytes, or in pixels, is refused before it is decoded', async () => {
    expect(await processPhoto(Buffer.alloc(MAX_INPUT_BYTES + 1))).toEqual({ ok: false, error: 'too_big' });
    const huge = await sharp({ create: { width: 12000, height: 12000, channels: 3, background: '#000' } }).png({ compressionLevel: 9 }).toBuffer();
    expect(await processPhoto(huge)).toEqual({ ok: false, error: 'too_big' });
  });

  test('a truncated jpeg is refused without throwing', async () => {
    const whole = await solid(800, 600);
    const r = await processPhoto(whole.subarray(0, 200));
    expect(r.ok).toBe(false);
  });
});
