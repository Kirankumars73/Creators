#!/usr/bin/env node
// Visual check helper: node scripts/shoot.mjs <url> <outdir> [width,width…] [--reduced] [--slices]
// --slices saves one viewport-sized shot per screen down the page instead of one tall image.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const [url, outdir = 'shots', widthsArg = '390,1440'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const reduced = process.argv.includes('--reduced');
const slices = process.argv.includes('--slices');
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
  const stem = `${new URL(url).pathname.replaceAll('/', '_') || 'root'}-${w}${reduced ? '-rm' : ''}`;
  const file = join(outdir, `${stem}.png`);
  if (slices) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < height; y += 900, i++) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(250);
      await page.screenshot({ path: join(outdir, `${stem}-s${String(i).padStart(2, '0')}.png`) });
    }
  } else {
    await page.screenshot({ path: file, fullPage: true });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${file}  horizontal-overflow=${overflow}px`);
  await page.close();
}
await browser.close();
