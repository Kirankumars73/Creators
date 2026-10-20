type WallHeadingProps = {
  id: string;
  title: string;
  sub?: string;
  as?: 'h1' | 'h2';
  className?: string;
};

/** A section's title painted on the wall: Anton, ink, no label above it. */
export function WallHeading({ id, title, sub, as: Heading = 'h2', className = '' }: WallHeadingProps) {
  return (
    <header className={`flex max-w-3xl flex-col gap-5 ${className}`}>
      <Heading id={id} className="font-display text-[clamp(2.5rem,6.5vw,5rem)] uppercase leading-[0.94] tracking-[-0.01em] text-chalk">
        {title}
      </Heading>
      {sub ? <p className="text-body max-w-[52ch] text-chalk-dim md:text-[1.125rem]">{sub}</p> : null}
    </header>
  );
}
