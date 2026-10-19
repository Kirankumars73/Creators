import { Star } from '@/components/brand/Star';
import { BRANDS, sectionEyebrow } from '@/config/landing';
import { BriefForm } from './BriefForm';
import { SectionHead } from './SectionHead';

/** For brands and agencies: what they get, and the brief form right beside it. */
export function Brands() {
  return (
    <section id="brands" aria-labelledby="brands-title" className="relative overflow-hidden border-y border-rule">
      <div aria-hidden="true" className="brands-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-[90rem] grid-cols-1 gap-14 px-4 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHead id="brands-title" eyebrow={sectionEyebrow('brands')} title={BRANDS.title} accent={2} sub={BRANDS.copy} />
          <ul className="flex flex-col gap-3">
            {BRANDS.points.map((p) => (
              <li key={p} className="flex items-center gap-3 font-subhead text-lg font-bold text-chalk">
                <Star size={16} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:pt-16">
          <BriefForm />
        </div>
      </div>
    </section>
  );
}
