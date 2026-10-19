import { brand } from '@/config/brand';
import { FAQ, sectionEyebrow } from '@/config/landing';
import { SectionHead } from './SectionHead';

/**
 * Plain <details>: keyboard, screen readers and no-JS all work for free. Where the browser
 * supports it, the answer slides open (::details-content + interpolate-size, in globals.css).
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative mx-auto grid max-w-[90rem] grid-cols-1 gap-12 px-4 py-24 md:px-10 md:py-36 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        <SectionHead id="faq-title" eyebrow={sectionEyebrow('faq')} title={['QUESTIONS,', 'ANSWERED.']} accent={1} />
        <div className="flex flex-col gap-1">
          <p className="text-body text-chalk-dim">Something we missed? Ask us directly.</p>
          <a href={brand.instagramUrl} className="text-label inline-flex min-h-11 items-center gap-2 self-start text-chalk underline underline-offset-4">
            Instagram @{brand.founder.instagram}
          </a>
          {brand.contact ? (
            <a href={`mailto:${brand.contact}`} className="inline-flex min-h-11 items-center self-start font-mono text-sm text-chalk underline underline-offset-4">
              {brand.contact}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-rule">
        {FAQ.map((f, i) => (
          <details key={f.q} name="faq" className="faq group border-b border-rule" open={i === 0}>
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-subhead text-[clamp(1.125rem,1.6vw,1.375rem)] font-bold text-chalk [&::-webkit-details-marker]:hidden">
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-xs font-normal text-chalk-mute">{String(i + 1).padStart(2, '0')}</span>
                {f.q}
              </span>
              <span aria-hidden="true" className="faq-icon relative grid size-8 shrink-0 place-items-center border border-rule text-rosso">
                <span className="absolute h-[2px] w-3 bg-current" />
                <span className="faq-icon-v absolute h-3 w-[2px] bg-current" />
              </span>
            </summary>
            <p className="text-body max-w-[60ch] pb-6 pl-8 text-chalk-dim">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
