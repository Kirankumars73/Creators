import { brand, type Lane } from '@/config/brand';
import { MlMark } from './MlMark';

type WordmarkProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  lane?: Lane;
  className?: string;
};

const SIZES = {
  xs: 'text-[1.125rem]',
  sm: 'text-[1.5rem]',
  md: 'text-[2.75rem]',
  lg: 'text-[4.5rem]',
  xl: 'text-[clamp(4.5rem,16vw,9rem)]',
} as const;

/**
 * CREATORS over കൂട്ടം — two scripts, one lockup (§4.0). The Malayalam is set
 * wide and heavy so it carries the same visual weight as the Anton line,
 * never reading as a subtitle.
 */
export function Wordmark({ size = 'md', lane, className = '' }: WordmarkProps) {
  const mark = <MlMark mlKey="wordmark" />;
  return (
    <span data-lane={lane} className={`inline-flex flex-col items-stretch ${SIZES[size]} ${className}`}>
      <span className="sr-only">{brand.name}</span>
      <span aria-hidden="true" className="font-display uppercase leading-[0.86] tracking-[-0.02em] text-chalk">
        {brand.wordmark.latin}
      </span>
      <span aria-hidden="true" className={`wordmark-ml text-center ${lane ? 'text-lane' : 'text-chalk'}`}>
        {mark ?? <span className="font-display uppercase">KOOTAM</span>}
      </span>
    </span>
  );
}
