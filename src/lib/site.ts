/** Canonical origin, no trailing slash. Inlined at build (NEXT_PUBLIC_). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

const HOST = /^[a-z0-9.-]+(:\d{1,5})?$/i;
const LOCAL = /^(localhost|127\.0\.0\.1)(:|$)/;

/** The origin this request actually arrived on (production, preview or local), else `fallback`. */
export function requestOrigin(headers: Headers, fallback: string): string {
  const host = (headers.get('x-forwarded-host') ?? headers.get('host') ?? '').split(',')[0]!.trim();
  if (!host || !HOST.test(host)) return fallback;
  const forwarded = headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwarded === 'http' || forwarded === 'https' ? forwarded : LOCAL.test(host) ? 'http' : 'https';
  return `${proto}://${host}`;
}
