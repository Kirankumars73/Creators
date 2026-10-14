import { Odometer } from '@/components/brand/Odometer';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import type { MemberCounts } from '@/lib/wall/queries';
import { ReelCards } from './ReelCards';

// §6.1. His own words, lifted from his bio.
const HEADLINE = ["WE'D RATHER", 'SHOW THAN', 'TELL.'] as const;

export function Hero({ counts }: { counts: MemberCounts | null }) {
  return (
    <section
      id="cold-open"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-4 pb-28 pt-24 md:px-10 md:pb-32"
    >
      <ReelCards />
      <div className="relative">
        <h1 className="text-hero text-chalk">
          {HEADLINE.map((line, li) => (
            <span key={line} className="block">
              {line}
              {li < HEADLINE.length - 1 ? ' ' : null}
            </span>
          ))}
        </h1>
        <p className="text-body mt-6 max-w-[34ch] text-chalk-dim">{brand.description}</p>
        <div className="mt-10 flex flex-wrap gap-5">
          <Button href="/join" variant="poster">
            Take your place
          </Button>
          <Button href="/code" variant="ghost">
            Read the code
          </Button>
        </div>
      </div>
      {counts && counts.total > 0 ? (
        <p className="text-label absolute bottom-16 left-4 flex items-center gap-3 text-chalk-dim md:bottom-20 md:left-10">
          Members
          <span className="font-mono text-base text-chalk">
            <Odometer value={counts.total} digits={6} label="Members" />
          </span>
        </p>
      ) : null}
    </section>
  );
}
