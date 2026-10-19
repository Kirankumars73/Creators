import { Star } from '@/components/brand/Star';
import { ScrambleText } from '@/components/fx/ScrambleText';

type SectionHeadProps = {
  eyebrow: string;
  /** h2 on the landing page; h1 where the section head is the page's title. */
  as?: 'h1' | 'h2';
  /** Title lines; the line at `accent` is set hollow (outlined), poster-style. */
  title: readonly string[];
  accent?: number;
  sub?: string;
  id?: string;
  align?: 'left' | 'center';
  className?: string;
};

/** Eyebrow tag that decodes on view, then a stacked Anton title with one hollow line. */
export function SectionHead({ eyebrow, as: Heading = 'h2', title, accent, sub, id, align = 'left', className = '' }: SectionHeadProps) {
  const center = align === 'center';
  return (
    <header className={`flex flex-col gap-6 ${center ? 'items-center text-center' : 'items-start'} ${className}`}>
      <p className="text-label inline-flex items-center gap-2 border border-rule bg-carbon px-3 py-1.5 text-chalk-dim">
        <Star size={11} />
        <ScrambleText text={eyebrow} />
      </p>
      <Heading id={id} className="text-title text-chalk">
        {title.map((line, i) => (
          <span key={line} className={`block ${i === accent ? 'text-hollow' : ''}`}>
            {line}
            {/* Lines are blocks; the space keeps them separate words for screen readers. */}
            {i < title.length - 1 ? ' ' : null}
          </span>
        ))}
      </Heading>
      {sub ? <p className={`text-body max-w-[46ch] text-chalk-dim ${center ? 'mx-auto' : ''}`}>{sub}</p> : null}
    </header>
  );
}
