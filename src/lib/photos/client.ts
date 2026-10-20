/**
 * Shrinks a photo in the browser before it's sent: phone photos are often 4–10 MB, which is
 * slow on mobile data and can exceed the host's request limit. The long side is capped at 1600px
 * and re-encoded as jpeg (which also drops EXIF here, before it leaves the phone). The server
 * checks and re-encodes again; this is only about speed. Falls back to the original file if the
 * browser can't decode it.
 */
export async function shrinkPhoto(file: File, maxSide = 1600): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== 'function') return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}
