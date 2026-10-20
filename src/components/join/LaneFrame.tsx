import { CraftScene } from '@/components/brand/CraftScene';
import { CropMarks } from '@/components/brand/CropMarks';
import { brand, type Lane } from '@/config/brand';

type LaneFrameProps = {
  lane: Lane;
  /** `static` on the landing page; `radio` inside the lane picker (compact copy on phones). */
  mode?: 'static' | 'radio';
  selected?: boolean;
  /** `full` is the expanded close-up after a lane is chosen. */
  size?: 'card' | 'full';
  className?: string;
};

/**
 * A lane card (§6.4). Creators and editors get a screen on top — the same backwater shot, seen
 * through the camera or sitting above the edit — with the name and copy below it on solid
 * ground. Everyone else gets the mint slate, topped with a strip of bars.
 */
export function LaneFrame({ lane, mode = 'static', selected = false, size = 'card', className = '' }: LaneFrameProps) {
  const room = brand.rooms[lane];
  const Title = mode === 'static' ? 'h3' : 'p';
  const compact = mode === 'radio' && size === 'card';

  if (lane === 'other') {
    return (
      <article
        data-lane="other"
        className={`relative flex h-full flex-col justify-center gap-3 border border-dashed bg-carbon p-5 pt-7 md:p-6 md:pt-8 ${
          selected ? 'border-lane' : 'border-mint'
        } ${className}`}
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1.5">
          {BARS.map((b) => (
            <span key={b} className={`flex-1 ${b}`} />
          ))}
        </span>
        <p className="text-label flex items-center gap-2 text-chalk-dim">
          <span aria-hidden="true" className="inline-block size-2 bg-lane" />
          {room.label}
        </p>
        <Title className="font-display text-[1.75rem] uppercase leading-none text-lane md:text-[2.25rem]">{room.name}?</Title>
        <p className="font-sans text-sm leading-relaxed text-chalk">{room.copy}</p>
      </article>
    );
  }

  return (
    <article
      data-lane={lane}
      className={`relative flex flex-col border bg-carbon transition-colors duration-[180ms] ease-cut ${selected ? 'border-lane' : 'border-rule'} ${
        size === 'full' ? 'h-full' : ''
      } ${className}`}
    >
      <CropMarks offset={size === 'card' ? 6 : 0} tone={selected ? 'lane' : 'rule'} />
      <div data-monitor="" data-surface="night" className={`relative overflow-hidden border-b border-rule bg-ink ${size === 'full' ? 'min-h-0 flex-1' : 'aspect-[16/10]'}`}>
        <CraftScene craft={lane === 'creator' ? 'viewfinder' : 'timeline'} className="absolute inset-0 h-full w-full" />
      </div>
      <div className={compact ? 'p-3 md:p-6' : 'p-5 md:p-7'}>
        <p className="text-label flex items-center gap-2 text-chalk-dim">
          <span aria-hidden="true" className="inline-block size-2 shrink-0 bg-lane" />
          {room.label}
        </p>
        <Title
          className={
            size === 'full'
              ? 'text-hero mt-3 text-lane'
              : 'mt-3 font-display text-[clamp(1.5rem,6vw,3rem)] uppercase leading-[0.92] tracking-[-0.01em] text-lane'
          }
        >
          {room.name}
        </Title>
        <p className={`text-body mt-3 text-chalk ${compact ? 'hidden md:block' : ''}`}>{room.copy}</p>
        {compact ? <p className="mt-2 text-[0.875rem] font-medium leading-snug text-chalk-dim md:hidden">{room.tagline}</p> : null}
      </div>
    </article>
  );
}

const BARS = ['bg-chalk', 'bg-mustard', 'bg-mint', 'bg-lumen', 'bg-rosso-deep', 'bg-rosso', 'bg-graphite'];
