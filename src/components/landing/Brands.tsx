import { Star } from '@/components/brand/Star';
import { BRANDS } from '@/config/landing';
import { BriefForm } from './BriefForm';

/** For brands and agencies: the wall goes dark here, and the brief form sits beside the promise. */
export function Brands() {
  return (
    <section id="brands" aria-labelledby="brands-title" data-surface="night" className="bg-ink text-chalk">
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-14 px-4 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-20">
        <div className="flex flex-col gap-8">
          <h2 id="brands-title" className="font-display text-[clamp(2.75rem,7vw,5.5rem)] uppercase leading-[0.94] tracking-[-0.01em]">
            {BRANDS.title}
          </h2>
          <p className="text-body max-w-[48ch] text-chalk-dim md:text-[1.125rem]">{BRANDS.copy}</p>
          <ul className="flex flex-col gap-3">
            {BRANDS.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-lg font-semibold">
                <Star size={16} /> {p}
              </li>
            ))}
          </ul>
        </div>
        <BriefForm />
      </div>
    </section>
  );
}
