import Link from 'next/link';
import { Star } from '@/components/brand/Star';
import { Wordmark } from '@/components/brand/Wordmark';
import { brand } from '@/config/brand';
import { t } from '@/i18n/ml';

const STARS = 7;

export function EndCredits() {
  const signoff = t('footerSignoff');
  const credits = [
    { role: 'A COMMUNITY BY', name: brand.founder.fullName },
    { role: 'FOUNDED IN', name: brand.region },
    ...(brand.siteBy ? [{ role: 'SITE BY', name: brand.siteBy }] : []),
  ];
  return (
    <footer className="relative overflow-hidden">
      <div className="flex flex-col items-center px-4 pb-20 pt-28 text-center md:pt-40">
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
          {brand.contact ? (
            <a href={`mailto:${brand.contact}`} className="text-label inline-flex min-h-11 items-center text-chalk-dim hover:text-chalk">
              Contact
            </a>
          ) : null}
        </nav>
        <p className={`mt-10 text-chalk-dim ${signoff.ml ? 'text-ml text-lg' : 'text-body'}`}>
          {signoff.ml ?? signoff.en}
        </p>
      </div>
      <Marquee />
    </footer>
  );
}

function Marquee() {
  const run = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="overflow-hidden bg-rosso py-3">
      <span className="sr-only">Kootam</span>
      <div aria-hidden="true" className="flex w-max gap-6 font-display text-[2rem] uppercase leading-none text-chalk">
        {run.map((i) => (
          <span key={i} className="flex items-center gap-6">
            KOOTAM <Star size="0.6em" />
          </span>
        ))}
      </div>
    </div>
  );
}
