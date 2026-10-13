import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import { CODE_ARTICLES } from '@/config/code';
import { sectionTitle } from './sections';

export function CodeTeaser() {
  return (
    <section id="the-code" className="relative px-4 py-28 md:px-10 md:py-40">
      <h2 className="text-label text-chalk-mute">{sectionTitle('the-code')}</h2>
      <ol className="mt-12 flex max-w-4xl flex-col gap-10">
        {CODE_ARTICLES.slice(0, 3).map((a) => (
          <li key={a.n} className="flex items-start gap-4 md:gap-6">
            <span className="flex shrink-0 items-center gap-2 font-display text-[2.5rem] leading-none text-rosso md:text-[3.5rem]">
              <Star size="0.6em" />
              {a.n}
            </span>
            <p className="text-subhead pt-1 text-chalk">{a.text}</p>
          </li>
        ))}
      </ol>
      <Link
        href="/code"
        className="text-label mt-14 inline-flex min-h-11 items-center gap-2 border-b border-chalk-dim text-chalk hover:border-chalk"
      >
        Read all seven <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
