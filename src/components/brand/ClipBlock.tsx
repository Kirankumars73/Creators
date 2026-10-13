import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { Lane } from '@/config/brand';

type Base = {
  label: string;
  lane?: Lane | 'neutral';
  /** `false` dims the clip to 40%; omitted or `true` is full strength. */
  active?: boolean;
  className?: string;
  children?: ReactNode;
};

type ClipBlockProps =
  | (Base & { as?: 'div' } & Omit<ComponentPropsWithoutRef<'div'>, keyof Base>)
  | (Base & { as: 'button' } & Omit<ComponentPropsWithoutRef<'button'>, keyof Base>);

/** The timeline's atom: a clip with a 3px lane edge and a mono label. */
export function ClipBlock(props: ClipBlockProps) {
  const { label, lane = 'neutral', active, className = '', children, as, ...rest } = props;
  const classes = [
    'relative flex min-w-0 items-center gap-2 rounded-l-hairline border-l-[3px] bg-graphite px-3 py-2',
    lane === 'neutral' ? 'border-chalk-mute' : 'border-lane',
    active === false ? 'opacity-40' : 'opacity-100',
    'transition-opacity duration-[var(--dur-cut)] ease-cut',
    className,
  ].join(' ');
  const laneAttr = lane === 'neutral' ? undefined : lane;
  const content = (
    <>
      <span className="text-label truncate text-chalk">{label}</span>
      {children}
    </>
  );

  if (as === 'button') {
    return (
      <button type="button" data-lane={laneAttr} className={classes} {...(rest as ComponentPropsWithoutRef<'button'>)}>
        {content}
      </button>
    );
  }
  return (
    <div data-lane={laneAttr} className={classes} {...(rest as ComponentPropsWithoutRef<'div'>)}>
      {content}
    </div>
  );
}
