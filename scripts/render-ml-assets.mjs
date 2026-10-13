#!/usr/bin/env node
// next/og (Satori) can't shape Malayalam: conjuncts break and vowel signs land on the
// wrong side (Task 19 spike). So every fixed Malayalam string is rendered once by
// Chromium — which shapes it correctly — into a transparent PNG that OG images and the
// member pass place as an image.
//
// Re-run after editing src/i18n/ml.ts:  pnpm render:ml
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { ML } from '../src/i18n/ml.ts';

const OUT = 'src/assets/ml';
// The same PNGs, served to browsers for decorative marks (wordmark, slate): pages that show
// only those never download the 200KB Malayalam font.
const PUBLIC_OUT = 'public/brand/ml';
const FONT = pathToFileURL(join(process.cwd(), 'src/assets/fonts/AnekMalayalam-SemiBold.ttf')).href;
const SIZE = 96; // CSS px; images are captured at 2x
const CHALK = '#F2F3F5';

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 2400, height: 400 } });
const manifest = {};
for (const [key, entry] of Object.entries(ML)) {
  if (!entry.ml) continue;
  await page.setContent(`<!doctype html><meta charset="utf-8">
    <style>@font-face{font-family:Anek;src:url(${FONT})}
    html,body{margin:0;background:transparent}
    span{display:inline-block;font:600 ${SIZE}px/1.3 Anek;color:${CHALK};padding:0 4px;white-space:nowrap}</style>
    <span lang="ml">${entry.ml}</span>`);
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator('span');
  const box = await el.boundingBox();
  await el.screenshot({ path: join(OUT, `${key}.png`), omitBackground: true });
  manifest[key] = { text: entry.ml, width: Math.round(box.width), height: Math.round(box.height), fontSize: SIZE };
  console.log(`${key}: ${Math.round(box.width)}×${Math.round(box.height)}`);
}
await browser.close();
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
mkdirSync(PUBLIC_OUT, { recursive: true });
for (const key of Object.keys(manifest)) copyFileSync(join(OUT, `${key}.png`), join(PUBLIC_OUT, `${key}.png`));
