import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import { brand } from '@/config/brand';
import { CODE_ARTICLES } from '@/config/code';
import { t } from '@/i18n/ml';

export const metadata: Metadata = {
  title: 'The Code',
  description: `The charter of ${brand.name}. Credit the editor. Every time.`,
};

export default function CodePage() {
  const eyebrow = t('codeEyebrow');
  const footer = t('codeFooter');
  return (
    <main className="px-4 pb-28 pt-10 md:px-10">
      <Link href="/" className="text-label inline-flex min-h-11 items-center gap-2 text-chalk-dim hover:text-chalk">
        <span aria-hidden="true">←</span> {brand.name}
      </Link>
      <header className="mt-16 md:mt-24">
        <p className={eyebrow.ml ? 'text-ml text-lg text-chalk-dim' : 'text-label text-chalk-mute'}>
          {eyebrow.ml ?? eyebrow.en}
        </p>
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
      <footer className="mt-10 flex items-center gap-3 border-t border-rule pt-10">
        <Star size={16} />
        <p className={footer.ml ? 'text-ml text-lg text-chalk' : 'text-body text-chalk-dim'}>{footer.ml ?? footer.en}</p>
      </footer>
    </main>
  );
}
