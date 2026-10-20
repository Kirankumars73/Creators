import type { PhotoReason } from './actions';

/**
 * Cookies identify the member, so a page on another site could try to post to us. Browsers
 * always send Origin on a POST/DELETE; it must be this site. (SameSite=Lax cookies already
 * stop most of this; this is the explicit second check.)
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin || origin === 'null') return false;
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const STATUS: Record<PhotoReason, number> = {
  unauthenticated: 401,
  no_member: 404,
  inactive: 403,
  invalid: 400,
  no_photo: 409,
  off_wall: 409,
  no_google_photo: 404,
  unavailable: 502,
  not_an_image: 415,
  too_big: 413,
  unknown: 500,
};

export const reasonStatus = (r: PhotoReason): number => STATUS[r];
