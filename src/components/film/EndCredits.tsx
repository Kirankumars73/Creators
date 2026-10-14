import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import { MlMark } from '@/components/brand/MlMark';
import { Wordmark } from '@/components/brand/Wordmark';
import { brand } from '@/config/brand';
import { t } from '@/i18n/ml';
import { CreditsDrift } from './CreditsDrift';

const STARS = 7;

export function EndCredits() {
  const signoff = t('footerSignoff');
  const credits = [
    { role: 'A COMMUNITY BY', name: brand.founder.fullName },
    { role: 'FOUNDED IN', name: brand.region },
  ];
  return (
    <footer className="relative overflow-hidden">
      <CreditsDrift className="flex flex-col items-center px-4 pb-20 pt-28 text-center md:pt-40">
        <Wordmark size="md" />
        <dl className="mt-16 flex flex-col gap-10">
          {credits.map((c) => (
            <div key={c.role}>
              <dt className="text-label text-chalk-mute">{c.role}</dt>
              <dd className="mt-2 font-mono text-sm uppercase tracking-[0.14em] text-chalk">{c.name}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-14 flex gap-3" aria-hidden="true">
          {Array.from({ length: STARS }, (_, i) => (
            <Star key={i} size={14} />
          ))}
        </p>
        <nav aria-label="Footer" className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <a href={brand.instagramUrl} className="text-label inline-flex min-h-11 items-center text-chalk-dim hover:text-chalk">
            Instagram @{brand.founder.instagram}
          </a>
          <Link href="/code" className="text-label inline-flex min-h-11 items-center text-chalk-dim hover:text-chalk">
            The Code
          </Link>
          <Link href="/privacy" className="text-label inline-flex min-h-11 items-center text-chalk-dim hover:text-chalk">
            Privacy
          </Link>
          {brand.contact ? (
            <a href={`mailto:${brand.contact}`} className="text-label inline-flex min-h-11 items-center normal-case text-chalk-dim hover:text-chalk">
              {brand.contact}
            </a>
          ) : null}
        </nav>
        {/* Drawn from its pre-rendered image: the landing page never downloads the Malayalam font. */}
        <p data-ml-signoff="" className="text-body mt-10 text-chalk-dim">
          {signoff.ml ? <MlMark mlKey="footerSignoff" className="text-[1.75rem]" /> : signoff.en}
        </p>
      </CreditsDrift>
      <Marquee />
      <p className="py-5 text-center font-mono text-xs tracking-[0.14em] text-chalk-mute">{brand.copyright}</p>
    </footer>
  );
}

/** KOOTAM ★ KOOTAM ★ … — two identical runs translated -50% on a 40s CSS loop (§6.9). */
function Marquee() {
  const run = Array.from({ length: 10 }, (_, i) => i);
  const half = (key: string) => (
    <span key={key} className="flex shrink-0 items-center gap-6 pr-6">
      {run.map((i) => (
        <span key={i} className="flex items-center gap-6">
          KOOTAM <Star size="0.6em" />
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee overflow-hidden bg-rosso py-3">
      <span className="sr-only">Kootam</span>
      <div aria-hidden="true" className="marquee-track flex w-max font-display text-[2rem] uppercase leading-none text-chalk">
        {half('a')}
        {half('b')}
      </div>
    </div>
  );
}
