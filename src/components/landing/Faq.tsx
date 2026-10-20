import { brand } from '@/config/brand';
import { FAQ } from '@/config/landing';
import { WallHeading } from './WallHeading';

/**
 * Plain <details>: keyboard, screen readers and no-JS all work for free. Where the browser
 * supports it, the answer slides open (::details-content + interpolate-size, in globals.css).
 */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto grid max-w-[90rem] grid-cols-1 gap-12 px-4 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(0,24rem)_1fr]">
      <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
        <WallHeading id="faq-title" title="Questions" />
        <div className="flex flex-col items-start">
          <p className="text-body text-chalk-dim">Something we missed? Ask us.</p>
          <a href={brand.instagramUrl} className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk">
            Instagram @{brand.founder.instagram}
          </a>
          {brand.contact ? (
            <a href={`mailto:${brand.contact}`} className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk">
              {brand.contact}
            </a>
          ) : null}
        </div>
      </div>
      <div>
        {FAQ.map((f, i) => (
          <details key={f.q} name="faq" className="faq border-b-2 border-chalk/15" open={i === 0}>
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[clamp(1.125rem,1.7vw,1.375rem)] font-semibold text-chalk [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden="true" className="faq-icon relative grid size-9 shrink-0 place-items-center rounded-full bg-rosso text-paper">
                <span className="absolute h-[2px] w-3.5 bg-current" />
                <span className="absolute h-3.5 w-[2px] bg-current" />
              </span>
            </summary>
            <p className="text-body max-w-[62ch] pb-7 text-chalk-dim">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
