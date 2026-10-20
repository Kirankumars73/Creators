import type { Metadata, Viewport } from 'next';
import { Star } from '@/components/brand/Star';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { CODE_ARTICLES } from '@/config/code';
import { t } from '@/i18n/ml';

const CODE_DESCRIPTION = `The charter of ${brand.name}. Credit the editor. Every time.`;

export const metadata: Metadata = {
  title: 'The Code',
  description: CODE_DESCRIPTION,
  openGraph: { type: 'article', locale: 'en_IN', siteName: brand.name, title: 'The Code', description: CODE_DESCRIPTION },
  twitter: { card: 'summary_large_image', title: 'The Code', description: CODE_DESCRIPTION },
};

// The public pages are the wall: light, so the browser chrome matches it.
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export default function CodePage() {
  const eyebrow = t('codeEyebrow');
  const footer = t('codeFooter');
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-28 pt-28 md:px-10 md:pt-36">
        <header>
          {/* The eyebrow is the Malayalam line (§4.2); its English fallback would just repeat the title. */}
          {eyebrow.ml ? (
            <p lang="ml" className="text-ml text-lg text-chalk-dim">
              {eyebrow.ml}
            </p>
          ) : null}
          <h1 className="text-hero mt-4 text-chalk">The Code</h1>
        </header>
        <ol className="mt-16 flex flex-col">
          {CODE_ARTICLES.map((a) => (
            <li
              key={a.n}
              data-article={a.n}
              className="grid grid-cols-1 items-end gap-2 border-t border-rule py-10 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-10"
            >
              <span className="halation-rosso font-display text-[clamp(6rem,22vw,11.25rem)] leading-[0.8] text-rosso">
                {a.n}
              </span>
              <p className="text-subhead max-w-3xl pb-2 text-chalk">{a.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-10">
          <p className="flex items-center gap-3">
            <Star size={16} />
            <span className={footer.ml ? 'text-ml text-lg text-chalk' : 'text-body text-chalk-dim'}>{footer.ml ?? footer.en}</span>
          </p>
          <Button href="/join">Sign it. Join the kootam.</Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
