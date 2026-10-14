import { CraftArt } from '@/components/brand/CraftArt';
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
 * A 9:16 film gate for the creators and editors rooms — showing its craft (a viewfinder, a
 * timeline) behind the copy, never an empty frame — or the mint slate for everyone else (§6.4).
 */
export function LaneFrame({ lane, mode = 'static', selected = false, size = 'card', className = '' }: LaneFrameProps) {
  const room = brand.rooms[lane];
  const Title = mode === 'static' ? 'h3' : 'p';
  const compact = mode === 'radio' && size === 'card';

  if (lane === 'other') {
    return (
      <article
        data-lane="other"
        className={`relative flex h-full flex-col justify-center gap-3 border border-dashed bg-carbon p-5 md:p-6 ${
          selected ? 'border-lane' : 'border-mint'
        } ${className}`}
      >
        <p className="text-label flex items-center gap-2 text-chalk-dim">
          <span aria-hidden="true" className="inline-block size-2 bg-lane" />
          {room.label}
        </p>
        <Title className="font-display text-[1.75rem] uppercase leading-none text-lane md:text-[2.25rem]">{room.name}?</Title>
        <p className="font-mono text-sm leading-relaxed text-chalk">{room.copy}</p>
      </article>
    );
  }

  return (
    <article
      data-lane={lane}
      className={`relative flex flex-col justify-between border bg-carbon p-4 transition-colors duration-[180ms] ease-cut md:p-6 ${selected ? 'border-lane' : 'border-rule'} ${
        size === 'card' ? 'aspect-[9/16]' : 'h-full'
      } ${className}`}
    >
      <CraftArt
        craft={lane === 'creator' ? 'viewfinder' : 'timeline'}
        labels={false}
        className={`absolute inset-0 h-full w-full transition-opacity duration-[180ms] ${selected ? 'opacity-90' : 'opacity-60'}`}
      />
      {/* Clean ground for the label (top) and the title and copy (bottom); the craft shows between. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-carbon from-40% to-transparent" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-carbon from-35% to-transparent" />
      <CropMarks offset={size === 'card' ? 6 : 0} tone={selected ? 'lane' : 'rule'} />
      <p className="text-label relative flex items-center gap-2 text-chalk-dim">
        <span aria-hidden="true" className="inline-block size-2 shrink-0 bg-lane" />
        {room.label}
      </p>
      <div className="relative">
        <Title
          className={
            size === 'full'
              ? 'text-hero text-lane'
              : 'font-display text-[clamp(1.75rem,7vw,3.5rem)] uppercase leading-[0.86] tracking-[-0.02em] text-lane'
          }
        >
          {room.name}
        </Title>
        <p className={`text-body mt-4 text-chalk ${compact ? 'hidden md:block' : ''}`}>{room.copy}</p>
        {compact ? <p className="mt-2 font-mono text-[0.8125rem] leading-snug text-chalk-dim md:hidden">{room.tagline}</p> : null}
      </div>
    </article>
  );
}
