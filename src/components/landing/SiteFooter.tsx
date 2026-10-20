import Link from 'next/link';
import { MlMark } from '@/components/brand/MlMark';
import { Star } from '@/components/brand/Star';
import { Wordmark } from '@/components/brand/Wordmark';
import { brand } from '@/config/brand';
import { FOOTER } from '@/config/landing';
import { t } from '@/i18n/ml';

const LINK = 'inline-flex min-h-11 items-center text-chalk-dim hover:text-chalk';

/** Every public page ends here, in the dark: the lockup, the links, contact, the sign-off, the KOOTAM marquee, ©. */
export function SiteFooter() {
  const signoff = t('footerSignoff');
  return (
    <footer data-surface="night" className="relative overflow-hidden bg-ink text-chalk">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-12 px-4 pb-16 pt-20 md:grid-cols-2 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col items-start gap-6">
          <Wordmark size="md" />
          <p className="text-body max-w-[34ch] text-chalk-dim">{FOOTER.blurb}</p>
          <p className="text-sm text-chalk-mute">Founded in Kerala</p>
        </div>
        {FOOTER.columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col">
            <p className="mb-2 text-sm font-semibold text-chalk">{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className={LINK}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold text-chalk">Contact</p>
          <a href={brand.instagramUrl} className={LINK}>
            Instagram @{brand.founder.instagram}
          </a>
          {brand.contact ? (
            <a href={`mailto:${brand.contact}`} className={LINK}>
              {brand.contact}
            </a>
          ) : null}
          <Link href="/privacy" className={LINK}>
            Privacy
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[90rem] items-center justify-end px-4 pb-8 md:px-10">
        {/* Drawn from its pre-rendered image: the public pages never download the Malayalam font. */}
        <p data-ml-signoff="" className="text-body text-chalk-dim">
          {signoff.ml ? <MlMark mlKey="footerSignoff" className="text-[1.75rem]" /> : signoff.en}
        </p>
      </div>

      <Marquee />
      <p className="py-5 text-center text-xs text-chalk-mute">{brand.copyright}</p>
    </footer>
  );
}

/** KOOTAM ★ KOOTAM ★ … — two identical runs translated -50% on a 40s CSS loop. */
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
      <div aria-hidden="true" className="marquee-track flex w-max font-display text-[2rem] uppercase leading-none text-paper">
        {half('a')}
        {half('b')}
      </div>
    </div>
  );
}
