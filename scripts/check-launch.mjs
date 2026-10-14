#!/usr/bin/env node
// Everything a human still owes before launch, as a list. `pnpm check:launch` exits 1 while
// any remain. Run it with the production env (it reads .env.local if present).
import { pathToFileURL } from 'node:url';

const WA_REQUIRED = ['WA_COMMUNITY_URL', 'WA_CREATORS_URL', 'WA_EDITORS_URL'];
const WA_INVITE = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+(\?[A-Za-z0-9=_&-]*)?$/;
const REQUIRED = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

/** @returns {string[]} e.g. ['ml:wordmark', 'code:04', 'brand:siteBy', 'env:WA_COMMUNITY_URL'] */
export function findLaunchBlockers({ ml, articles, brand, env, stills }) {
  const out = [];
  for (const [key, entry] of Object.entries(ml)) if (!entry.confirmed) out.push(`ml:${key}`);
  for (const a of articles) if (a.draft) out.push(`code:${a.n}`);
  if (!brand.siteBy) out.push('brand:siteBy');
  if (!brand.contact) out.push('brand:contact');
  if (!brand.founderConfirmed) out.push('brand:founder');
  if (!stills.length) out.push('reels:stills');
  for (const key of WA_REQUIRED) {
    const v = (env[key] ?? '').trim();
    if (!WA_INVITE.test(v) || /PENDING/i.test(v)) out.push(`env:${key}`);
  }
  if (!(env.ADMIN_EMAILS ?? '').trim()) out.push('env:ADMIN_EMAILS');
  for (const key of REQUIRED) {
    const v = (env[key] ?? '').trim();
    if (!v || (key === 'NEXT_PUBLIC_SITE_URL' && /localhost|127\.0\.0\.1/.test(v))) out.push(`env:${key}`);
  }
  return out;
}

const EXPLAIN = {
  ml: 'Malayalam string not yet confirmed by a native speaker (src/i18n/ml.ts; then pnpm render:ml)',
  code: 'The Code article is a draft — Gowtham approves or rewrites it (src/config/code.ts)',
  'brand:siteBy': 'Name for the SITE BY credit (src/config/brand.ts)',
  'brand:contact': 'Contact address for the footer (src/config/brand.ts)',
  'brand:founder': 'Gowtham confirms the spelling of his name (src/config/brand.ts founderConfirmed)',
  'reels:stills': '9–12 stills from his grid for the hero reel cards (public/reels + src/config/reels.ts)',
  env: 'Production env value missing or a placeholder',
};

async function main() {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // no local env file
  }
  const [{ ML }, { CODE_ARTICLES }, { brand }, { REEL_STILLS }] = await Promise.all([
    import('../src/i18n/ml.ts'),
    import('../src/config/code.ts'),
    import('../src/config/brand.ts'),
    import('../src/config/reels.ts'),
  ]);
  const blockers = findLaunchBlockers({ ml: ML, articles: CODE_ARTICLES, brand, env: process.env, stills: REEL_STILLS });
  for (const b of blockers) {
    const why = EXPLAIN[b] ?? EXPLAIN[b.split(':')[0]] ?? '';
    console.error(`BLOCKER  ${b.padEnd(24)} ${why}`);
  }
  if (blockers.length) {
    console.error(`check:launch — ${blockers.length} item(s) before launch.`);
    process.exit(1);
  }
  console.log('check:launch — nothing outstanding. Ship it.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
