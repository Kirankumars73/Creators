/** Canonical origin, no trailing slash. Inlined at build (NEXT_PUBLIC_). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
