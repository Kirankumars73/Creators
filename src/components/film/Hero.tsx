import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';

// §6.1. His own words, lifted from his bio.
const HEADLINE = ["WE'D RATHER", 'SHOW THAN', 'TELL.'] as const;

export function Hero() {
  return (
    <section
      id="cold-open"
      className="relative flex min-h-dvh flex-col justify-end overflow-hidden px-4 pb-28 pt-24 md:px-10 md:pb-32"
    >
      <h1 className="text-hero text-chalk">
        {HEADLINE.map((line) => (
          <span key={line} className="block">
            {line}
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
    </section>
  );
}
