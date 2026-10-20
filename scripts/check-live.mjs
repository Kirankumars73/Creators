#!/usr/bin/env node
// After a deploy: is the live site serving the CURRENT stylesheet? A stale restored build cache
// once shipped new markup with the old CSS, which turned the light site dark. This fetches the
// page, finds its stylesheet and looks for rules the current code must have (and classes it must not).
//   pnpm check:live [https://creators-kootam.vercel.app]
import { pathToFileURL } from 'node:url';

const MUST_HAVE = [
  ['the wall colour tokens (--wall)', /--wall:#/],
  ['the wall surface rules', /\[data-surface="?wall"?\]\s*\{/],
  ['the night surface rules', /\[data-surface="?night"?\]\s*\{/],
  ['the wall-writing styles', /\.wall-writing/],
];
const MUST_NOT_HAVE = [['a class removed from the code (.reel-craft)', /\.reel-craft/]];

/** @returns {string[]} what is wrong with this stylesheet; empty when it is current. */
export function findStaleStyles(css) {
  return [...MUST_HAVE.filter(([, re]) => !re.test(css)).map(([name]) => name), ...MUST_NOT_HAVE.filter(([, re]) => re.test(css)).map(([name]) => name)];
}

async function main() {
  const base = (process.argv[2] ?? process.env.BASE_URL ?? 'https://creators-kootam.vercel.app').replace(/\/+$/, '');
  const html = await (await fetch(`${base}/?cb=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } })).text();
  const hrefs = [...new Set([...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]))];
  if (!hrefs.length) {
    console.error('check:live — no stylesheet found on the page.');
    process.exit(1);
  }
  const css = (await Promise.all(hrefs.map(async (h) => (await fetch(new URL(h, base))).text()))).join('\n');
  const problems = findStaleStyles(css);
  if (problems.length) {
    console.error(`check:live — ${base} is serving a STALE stylesheet (${css.length} bytes). Missing or wrong:`);
    for (const p of problems) console.error(`  - ${p}`);
    console.error('Redeploy without the build cache (Vercel → Deployments → ⋯ → Redeploy → untick "Use existing Build Cache").');
    process.exit(1);
  }
  console.log(`check:live — ${base} serves the current stylesheet (${css.length} bytes).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main();
