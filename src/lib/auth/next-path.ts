/** Only same-site paths survive the OAuth round-trip; everything else goes to `fallback`. */
export function safeNextPath(raw: string | null | undefined, fallback = '/join'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  try {
    const base = 'http://same.invalid';
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    const out = `${url.pathname}${url.search}${url.hash}`;
    // Dot-segments resolve away ("/.//evil.com" → "//evil.com"): check what we return, not just what came in.
    if (out.startsWith('//') || out.startsWith('/\\')) return fallback;
    return out;
  } catch {
    return fallback;
  }
}
