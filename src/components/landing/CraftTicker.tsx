import { Star } from '@/components/brand/Star';
import { VelocityMarquee } from '@/components/fx/VelocityMarquee';
import { CRAFTS } from '@/config/landing';

/** Two poster bands crossing at an angle, every craft in the room, surging with scroll. */
export function CraftTicker() {
  const half = Math.ceil(CRAFTS.length / 2);
  const rows = [CRAFTS.slice(0, half), CRAFTS.slice(half)];
  return (
    <div className="relative z-10 -my-4 overflow-hidden py-10" aria-label="Crafts in the kootam">
      <ul className="sr-only">
        {CRAFTS.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="flex flex-col">
        <VelocityMarquee speed={50} className="-rotate-2 bg-rosso py-3">
          {rows[0]!.map((c) => (
            <span key={c} className="flex items-center gap-5 pr-5 font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-none text-chalk">
              {c} <Star size="0.55em" color="var(--ink)" />
            </span>
          ))}
        </VelocityMarquee>
        <VelocityMarquee speed={-40} className="-mt-2 rotate-1 border-y border-rule bg-ink py-3">
          {rows[1]!.map((c) => (
            <span key={c} className="text-hollow flex items-center gap-5 pr-5 font-display text-[clamp(1.75rem,4vw,3rem)] uppercase leading-none">
              {c} <Star size="0.55em" />
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </div>
  );
}
