import { Star } from '@/components/brand/Star';
import { CircularText } from '@/components/fx/CircularText';
import { Button } from '@/components/ui/Button';
import { FINAL, HERO } from '@/config/landing';

/** The gate: full-bleed rosso, the biggest type on the page, one way in (and one for brands). */
export function FinalCta() {
  return (
    <section id="join" aria-labelledby="join-title" data-on="rosso" className="relative overflow-hidden bg-rosso">
      <div aria-hidden="true" className="final-stripes pointer-events-none absolute inset-0 opacity-[0.07]" />
      <div className="relative mx-auto flex max-w-[90rem] flex-col gap-10 px-4 py-24 md:px-10 md:py-32 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-10">
          <h2 id="join-title" className="text-hero text-chalk">
            {FINAL.headline.map((l, i) => (
              <span key={l} className={`block ${i === 1 ? 'text-hollow-chalk' : ''}`}>
                {l}
                {i < FINAL.headline.length - 1 ? ' ' : null}
              </span>
            ))}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <span data-magnet="80" className="inline-flex transition-transform duration-300 ease-pan">
              <Button href="/join" variant="ink">
                {FINAL.primary} <span aria-hidden="true">→</span>
              </Button>
            </span>
            <Button href="/#brands" variant="ghost">
              {FINAL.secondary}
            </Button>
          </div>
          <p className="text-label inline-flex self-start bg-ink px-3 py-2 text-chalk">{FINAL.note}</p>
        </div>
        <div className="hidden self-end lg:block">
          <CircularText id="final-ring" text={HERO.sticker} size={180} className="rounded-full bg-ink text-chalk">
            <Star size={44} />
          </CircularText>
        </div>
      </div>
    </section>
  );
}
