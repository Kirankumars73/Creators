import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import type { Lane } from '@/config/brand';
import { CODE_ARTICLES } from '@/config/code';
import { CODE_SHELF, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

const LANES: Lane[] = ['creator', 'editor', 'other'];

/**
 * The first three articles of The Code as poster cards that stack as you scroll — each sticks a
 * little lower than the last (after React Bits' ScrollStack, done with `position: sticky`, so no
 * JavaScript and nothing to switch off for reduced motion).
 */
export function CodeShelf() {
  return (
    <section id="the-code" aria-labelledby="code-title" className="relative mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-36">
      <SectionHead id="code-title" eyebrow={sectionEyebrow('the-code')} title={CODE_SHELF.title} sub={CODE_SHELF.sub} />
      <ol className="mt-14 flex flex-col gap-6">
        {CODE_ARTICLES.slice(0, 3).map((a, i) => (
          <li
            key={a.n}
            data-lane={LANES[i]}
            className="code-card sticky grid grid-cols-1 items-end gap-4 border border-rule border-t-[3px] border-t-lane bg-carbon p-6 shadow-[0_-24px_48px_-12px_var(--ink)] md:grid-cols-[minmax(0,14rem)_1fr] md:gap-10 md:p-10"
            style={{ top: `calc(6rem + ${i * 1.5}rem)` }}
          >
            <span className="flex items-center gap-3 font-display text-[clamp(5rem,14vw,9rem)] leading-[0.8] text-lane">
              <Star size="0.32em" />
              {a.n}
            </span>
            <p className="text-subhead max-w-3xl text-chalk">{a.text}</p>
          </li>
        ))}
      </ol>
      <Link href="/code" className="text-label mt-14 inline-flex min-h-11 items-center gap-2 border-b border-chalk-dim text-chalk hover:border-chalk">
        {CODE_SHELF.more} <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
