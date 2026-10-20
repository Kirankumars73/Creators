#!/usr/bin/env node
// next/og (Satori) can't shape Malayalam: conjuncts break and vowel signs land on the
// wrong side (Task 19 spike). So every fixed Malayalam string is rendered once by
// Chromium — which shapes it correctly — into a transparent PNG that OG images and the
// member pass place as an image.
//
// Re-run after editing src/i18n/ml.ts:  pnpm render:ml
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { ML } from '../src/i18n/ml.ts';

const OUT = 'src/assets/ml';
// The same PNGs, served to browsers for decorative marks (wordmark, slate): pages that show
// only those never download the 200KB Malayalam font.
const PUBLIC_OUT = 'public/brand/ml';
const PUBLIC_OUT_WALL = () => (mkdirSync(PUBLIC_OUT, { recursive: true }), PUBLIC_OUT);
const FONT = pathToFileURL(join(process.cwd(), 'src/assets/fonts/AnekMalayalam-SemiBold.ttf')).href;
const SIZE = 96; // CSS px; images are captured at 2x
const CHALK = '#F2F3F5';
// Wall-writing: the public pages paint these strings at billboard size, so they get their own
// large, heaviest/widest render from the variable font (Malayalam subset, OFL).
const WALL = ['wordmark', 'footerSignoff'];
const WALL_FONT = pathToFileURL(join(process.cwd(), 'src/assets/fonts/AnekMalayalam-Variable-malayalam.woff2')).href;
const WALL_SIZE = 360;

// CHROMIUM_PATH lets a machine without Playwright's browser download use its own Chromium.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 2400, height: 400 } });
// `--wall` re-renders only the wall-writing, leaving the signed-off small renders untouched.
const ONLY_WALL = process.argv.includes('--wall');
const manifest = ONLY_WALL ? JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8')) : {};
for (const [key, entry] of Object.entries(ML)) {
  if (!entry.ml || ONLY_WALL) continue;
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
for (const key of WALL) {
  const entry = ML[key];
  if (!entry?.ml) continue;
  await page.setViewportSize({ width: 3200, height: 900 });
  await page.setContent(`<!doctype html><meta charset="utf-8">
    <style>@font-face{font-family:AnekV;src:url(${WALL_FONT}) format("woff2");font-weight:100 800;font-stretch:75% 125%}
    html,body{margin:0;background:transparent}
    span{display:inline-block;font:800 ${WALL_SIZE}px/1.6 AnekV;font-stretch:112%;color:${CHALK};padding:0 12px;white-space:nowrap}</style>
    <span lang="ml">${entry.ml}</span>`);
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator('span');
  const box = await el.boundingBox();
  await el.screenshot({ path: join(PUBLIC_OUT_WALL(), `${key}-wall.png`), omitBackground: true });
  manifest[`${key}-wall`] = { text: entry.ml, width: Math.round(box.width), height: Math.round(box.height), fontSize: WALL_SIZE };
  console.log(`${key}-wall: ${Math.round(box.width)}×${Math.round(box.height)}`);
}
await browser.close();
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
mkdirSync(PUBLIC_OUT, { recursive: true });
// Wall renders go straight to public/ (only browsers use them); the rest are copied over.
if (!ONLY_WALL) for (const key of Object.keys(manifest).filter((k) => !k.endsWith('-wall'))) copyFileSync(join(OUT, `${key}.png`), join(PUBLIC_OUT, `${key}.png`));
