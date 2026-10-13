/** Only same-site paths survive the OAuth round-trip; everything else goes to `fallback`. */
export function safeNextPath(raw: string | null | undefined, fallback = '/join'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  try {
    const base = 'http://same.invalid';
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
