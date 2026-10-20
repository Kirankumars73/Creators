import { MAX_INPUT_BYTES } from './process';

// The Google profile photo is the one remote image the server will ever fetch. Fetching a URL
// from a database field is a classic way to make a server request things on someone's behalf
// (SSRF), so the rules are strict: https only, Google's own image hosts only, default port, no
// credentials in the URL, no redirects, a short timeout and a size cap.
const HOST = /^lh\d+\.googleusercontent\.com$/;

export function isGoogleAvatarUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  return u.protocol === 'https:' && HOST.test(u.hostname) && u.port === '' && u.username === '' && u.password === '';
}

/** Google serves avatars as `…=s96-c`; ask for a big square instead. */
export function upsizeGoogleAvatar(url: string): string {
  return /=s\d+(-c)?$/.test(url) ? url.replace(/=s\d+(-c)?$/, '=s800-c') : `${url}=s800-c`;
}

export type GoogleAvatarResult = { ok: true; bytes: Uint8Array } | { ok: false; error: 'unavailable' | 'too_big' };

export async function fetchGoogleAvatar(url: string, fetchImpl: typeof fetch = fetch): Promise<GoogleAvatarResult> {
  if (!isGoogleAvatarUrl(url)) return { ok: false, error: 'unavailable' };
  try {
    const res = await fetchImpl(upsizeGoogleAvatar(url), { redirect: 'error', signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (res.status !== 200) return { ok: false, error: 'unavailable' };
    if (Number(res.headers.get('content-length') ?? 0) > MAX_INPUT_BYTES) return { ok: false, error: 'too_big' };
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.length > MAX_INPUT_BYTES ? { ok: false, error: 'too_big' } : { ok: true, bytes };
  } catch {
    return { ok: false, error: 'unavailable' };
  }
}
