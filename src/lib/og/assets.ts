import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import manifest from '@/assets/ml/manifest.json';
import type { MlKey } from '@/i18n/ml';

// Fonts and pre-rendered Malayalam for next/og. Paths are listed in
// next.config.ts → outputFileTracingIncludes so they ship with the functions.
const read = (path: string) => readFile(join(process.cwd(), path));

export async function ogFonts() {
  const [anton, mono] = await Promise.all([read('src/assets/fonts/Anton-Regular.ttf'), read('src/assets/fonts/GeistMono-Medium.ttf')]);
  return [
    { name: 'Anton', data: anton, weight: 400 as const, style: 'normal' as const },
    { name: 'Geist Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ];
}

type Rendered = { src: string; width: number; height: number };

/** A Chromium-shaped Malayalam string as a data URL, scaled to `height` px; null if not rendered. */
export async function mlImage(key: MlKey, height: number): Promise<Rendered | null> {
  const meta = (manifest as Record<string, { width: number; height: number } | undefined>)[key];
  if (!meta) return null;
  const png = await read(`src/assets/ml/${key}.png`);
  return {
    src: `data:image/png;base64,${png.toString('base64')}`,
    width: Math.round((meta.width / meta.height) * height),
    height,
  };
}
