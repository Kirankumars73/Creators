#!/usr/bin/env node
// Visual check helper: node scripts/shoot.mjs <url> <outdir> [width,width…] [--reduced]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const [url, outdir = 'shots', widthsArg = '390,1440'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const reduced = process.argv.includes('--reduced');
if (!url) {
  console.error('usage: node scripts/shoot.mjs <url> <outdir> [390,1440] [--reduced]');
  process.exit(2);
}
mkdirSync(outdir, { recursive: true });
const browser = await chromium.launch();
for (const w of widthsArg.split(',').map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const file = join(outdir, `${new URL(url).pathname.replaceAll('/', '_') || 'root'}-${w}${reduced ? '-rm' : ''}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${file}  horizontal-overflow=${overflow}px`);
  await page.close();
}
await browser.close();
