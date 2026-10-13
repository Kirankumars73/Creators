import manifest from '@/assets/ml/manifest.json';
import type { MlKey } from '@/i18n/ml';
import { t } from '@/i18n/ml';

type Meta = { text: string; width: number; height: number };

/**
 * A fixed Malayalam string drawn from its Chromium-shaped PNG as a CSS mask, so it takes
 * `currentColor` like text. For decorative marks (wordmark, slate): the page avoids the
 * 200KB Anek download. Height follows the font size: 1em of the parent = the PNG's line box.
 * Returns null when the string has no rendered image yet.
 */
export function MlMark({ mlKey, className = '' }: { mlKey: MlKey; className?: string }) {
  const meta = (manifest as Record<string, Meta | undefined>)[mlKey];
  const ml = t(mlKey).ml;
  if (!meta || !ml || meta.text !== ml) return null;
  return (
    <span
      data-ml-mark=""
      lang="ml"
      className={`inline-block bg-current align-middle ${className}`}
      style={{
        height: '1em',
        aspectRatio: `${meta.width} / ${meta.height}`,
        WebkitMaskImage: `url(/brand/ml/${mlKey}.png)`,
        maskImage: `url(/brand/ml/${mlKey}.png)`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    >
      <span className="sr-only">{ml}</span>
    </span>
  );
}
