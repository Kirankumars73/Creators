#!/usr/bin/env node
// Enforces brief §2.1: no banned hexes (or warm neighbours of them), no banned
// font families, and no assistant branding on user-facing surfaces.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const BANNED_HEXES = ['CC785C', 'D97757', 'DA7756', 'D4A27F', 'EBDBBC', 'F0EEE6', 'FAF9F5', 'F5F4EF', 'BFB8AC'];
// "Within ~8%" made mechanical: OKLab distance under 0.08 AND a warm cast.
// Without the warmth test every near-white would trip the rule.
const NEAR_DELTA_E = 0.08;
const WARM_B = 0.002;

const HEX_RE = /#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;
const FONT_RE = /styrene|tiempos/gi;
const BRAND_RE = /\bclaude\b/gi;
const USER_FACING = /^(src|public)\//;

const SCAN_DIRS = ['src', 'public', 'supabase'];
const TEXT_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.md', '.json', '.svg', '.sql', '.html', '.txt', '.webmanifest']);

function toRgbHex(raw) {
  const h = raw.length <= 4 ? [...raw.slice(0, 3)].map((c) => c + c).join('') : raw.slice(0, 6);
  return h.toUpperCase();
}

function linear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function oklab(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => linear(parseInt(hex.slice(i, i + 2), 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const BANNED_LAB = BANNED_HEXES.map(oklab);

function classifyHex(hex) {
  if (BANNED_HEXES.includes(hex)) return 'hex';
  const lab = oklab(hex);
  if (lab[2] <= WARM_B) return null;
  const near = BANNED_LAB.some((b) => Math.hypot(lab[0] - b[0], lab[1] - b[1], lab[2] - b[2]) < NEAR_DELTA_E);
  return near ? 'near-hex' : null;
}

/** @returns {{ file: string; line: number; kind: 'hex' | 'near-hex' | 'font' | 'brand'; match: string }[]} */
export function findBans(text, file) {
  const hits = [];
  const userFacing = USER_FACING.test(file.replaceAll('\\', '/'));
  text.split('\n').forEach((content, i) => {
    const line = i + 1;
    for (const m of content.matchAll(HEX_RE)) {
      const kind = classifyHex(toRgbHex(m[1]));
      if (kind) hits.push({ file, line, kind, match: m[0] });
    }
    for (const m of content.matchAll(FONT_RE)) hits.push({ file, line, kind: 'font', match: m[0] });
    if (userFacing) {
      for (const m of content.matchAll(BRAND_RE)) hits.push({ file, line, kind: 'brand', match: m[0] });
    }
  });
  return hits;
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (TEXT_EXTS.has(extname(name))) yield path;
  }
}

function main() {
  const root = process.cwd();
  const hits = SCAN_DIRS.flatMap((d) =>
    [...walk(join(root, d))].flatMap((path) => findBans(readFileSync(path, 'utf8'), relative(root, path))),
  );
  for (const h of hits) console.error(`${h.file}:${h.line}  ${h.kind}  ${h.match}`);
  if (hits.length) {
    console.error(`check:bans — ${hits.length} banned item(s).`);
    process.exit(1);
  }
  console.log('check:bans — clean.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
