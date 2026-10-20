import { createHash } from 'node:crypto';

/** A short, stable tag for whatever went into a response, so a browser can ask "has it changed?". */
export function etagOf(...parts: (string | Uint8Array | null | undefined)[]): string {
  const h = createHash('sha1');
  for (const p of parts) h.update(p ?? '').update('\0');
  return `"${h.digest('hex').slice(0, 20)}"`;
}

/** True when the request already has this exact version (If-None-Match), so a 304 will do. */
export function hasVersion(req: Request, etag: string): boolean {
  const sent = req.headers.get('if-none-match');
  return !!sent && sent.split(',').some((t) => t.trim().replace(/^W\//, '') === etag);
}

/**
 * Member images change when someone uploads a new photo, so browsers always check (max-age=0, a
 * cheap 304 when nothing changed) and the shared cache holds a copy for only a few seconds.
 */
export const IMAGE_CACHE = 'public, max-age=0, s-maxage=10, must-revalidate';
