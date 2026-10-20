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

/** What a member picked while joining. A file is shrunk in their browser before it is sent. */
export type PhotoChoice = { kind: 'file'; file: File } | { kind: 'google' };
/** The pick, plus whether they chose to show it publicly (off unless they tick it). */
export type JoinPhoto = { choice: PhotoChoice; show: boolean };

export type SendPhotoResult = { ok: true } | { ok: false; reason: string };

/** Plain-words reasons a photo didn't go through, shared by /me and the join form. */
export const PHOTO_PROBLEMS: Record<string, string> = {
  not_an_image: 'That file isn’t a photo we can use. Pick a jpeg, png or webp picture.',
  too_big: 'That photo is too large. Pick one under 6 MB.',
  no_google_photo: 'Your Google account doesn’t have a photo.',
  unavailable: 'Google didn’t answer. Try again, or upload a photo.',
  unauthenticated: 'Your sign-in expired. Sign in again.',
  inactive: 'Your pass is on hold. Message us on Instagram.',
  network: 'That didn’t go through. Check your connection and try again.',
};
export const PHOTO_FALLBACK = 'That didn’t save. Try again.';
export const photoProblemText = (reason: string): string => PHOTO_PROBLEMS[reason] ?? PHOTO_FALLBACK;

/** Sends a photo to /api/photo/me. Never throws: a network failure is reason "network". */
export async function sendPhoto(choice: PhotoChoice, fetchImpl: typeof fetch = fetch): Promise<SendPhotoResult> {
  try {
    let init: RequestInit;
    if (choice.kind === 'google') {
      init = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'google' }) };
    } else {
      const form = new FormData();
      form.append('file', await shrinkPhoto(choice.file), 'photo.jpg');
      init = { method: 'POST', body: form };
    }
    const res = await fetchImpl('/api/photo/me', init);
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, reason: body.error ?? 'unknown' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
