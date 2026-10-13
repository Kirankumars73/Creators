import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import manifest from '@/assets/ml/manifest.json';
import type { MlKey } from '@/i18n/ml';

// Fonts and pre-rendered Malayalam for next/og. Every path is a literal so the build traces
// exactly these files (a variable path makes Turbopack ship the whole project with each
// function). Adding a Malayalam image? Render it (pnpm render:ml) and add its line below.

export async function ogFonts() {
  const [anton, mono] = await Promise.all([
    readFile(join(process.cwd(), 'src/assets/fonts/Anton-Regular.ttf')),
    readFile(join(process.cwd(), 'src/assets/fonts/GeistMono-Medium.ttf')),
  ]);
  return [
    { name: 'Anton', data: anton, weight: 400 as const, style: 'normal' as const },
    { name: 'Geist Mono', data: mono, weight: 500 as const, style: 'normal' as const },
  ];
}

const ML_FILES: Partial<Record<MlKey, () => Promise<Buffer>>> = {
  wordmark: () => readFile(join(process.cwd(), 'src/assets/ml/wordmark.png')),
  name: () => readFile(join(process.cwd(), 'src/assets/ml/name.png')),
  youreIn: () => readFile(join(process.cwd(), 'src/assets/ml/youreIn.png')),
};

type Rendered = { src: string; width: number; height: number };

/** A Chromium-shaped Malayalam string as a data URL, scaled to `height` px; null if not rendered. */
export async function mlImage(key: MlKey, height: number): Promise<Rendered | null> {
  const meta = (manifest as Record<string, { width: number; height: number } | undefined>)[key];
  const load = ML_FILES[key];
  if (!meta || !load) return null;
  const png = await load();
  return {
    src: `data:image/png;base64,${png.toString('base64')}`,
    width: Math.round((meta.width / meta.height) * height),
    height,
  };
}
