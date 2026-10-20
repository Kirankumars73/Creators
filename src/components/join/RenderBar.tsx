/** A progress bar, not a spinner: the pass "renders" while the invite request is out. */
export function RenderBar({ progress }: { progress: number; frames?: number }) {
  const pct = Math.round(progress * 100);
  return (
    <div
      role="progressbar"
      aria-label="Rendering your pass"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="flex max-w-xl flex-col gap-3"
    >
      <p className="flex items-baseline justify-between text-lg font-semibold text-chalk">
        Making your pass
        <span aria-hidden="true" className="tabular-nums text-chalk-dim">
          {pct}%
        </span>
      </p>
      <div aria-hidden="true" className="h-3 w-full overflow-hidden rounded-full bg-graphite">
        <div className="h-full rounded-full bg-lane transition-[width] duration-200 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
