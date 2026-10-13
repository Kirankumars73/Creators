#!/usr/bin/env node
// §8 test 9, strengthened (plan Departure 10): build with sentinel secrets, then prove
// none of them — nor any WhatsApp invite URL — reached the client bundle or the
// prerendered HTML/RSC output.
import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const path = join(dir, e.name);
    if (e.isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** Every (file, needle) pair where `needle` occurs in a file under `dirs` (optionally only `exts`). */
export async function scanForLeaks(dirs, needles, exts) {
  const hits = [];
  for (const dir of dirs) {
    for await (const file of walk(dir)) {
      if (exts && !exts.includes(extname(file))) continue;
      const body = await readFile(file, 'utf8');
      for (const needle of needles) if (body.includes(needle)) hits.push({ file, needle });
    }
  }
  return hits;
}

const SENTINELS = {
  WA_COMMUNITY_URL: 'https://chat.whatsapp.com/LEAKSENTINELCOMMUNITY',
  WA_CREATORS_URL: 'https://chat.whatsapp.com/LEAKSENTINELCREATORS',
  WA_EDITORS_URL: 'https://chat.whatsapp.com/LEAKSENTINELEDITORS',
  WA_OTHER_URL: 'https://chat.whatsapp.com/LEAKSENTINELOTHER',
  SUPABASE_SERVICE_ROLE_KEY: 'LEAKSENTINELSERVICEROLEKEY',
};

async function main() {
  const env = {
    ...process.env,
    ...SENTINELS,
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3100',
    NEXT_PUBLIC_SUPABASE_URL: 'https://leaksentinel.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key-is-allowed',
    ADMIN_EMAILS: 'leaksentinel-admin@example.com',
  };
  console.log('check:leaks — building with sentinel secrets…');
  const build = spawnSync('pnpm', ['build'], { env, stdio: ['ignore', 'ignore', 'inherit'] });
  if (build.status !== 0) {
    console.error('check:leaks — build failed.');
    process.exit(1);
  }

  const values = [...Object.values(SENTINELS), 'LEAKSENTINEL', 'chat.whatsapp.com', 'leaksentinel-admin@example.com'];
  const names = Object.keys(SENTINELS).concat('ADMIN_EMAILS');
  const hits = [
    // The browser bundle: no values, and not even the variable names.
    ...(await scanForLeaks(['.next/static'], [...values, ...names])),
    // Prerendered pages and RSC payloads: no values.
    ...(await scanForLeaks(['.next/server/app'], values, ['.html', '.rsc', '.body', '.meta'])),
  ];
  for (const h of hits) console.error(`LEAK  ${h.needle}  in  ${h.file}`);
  if (hits.length) {
    console.error(`check:leaks — ${hits.length} leak(s).`);
    process.exit(1);
  }
  console.log('check:leaks — clean: no secret, sentinel or invite URL in client or prerendered output.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
