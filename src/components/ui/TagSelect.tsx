import { useId } from 'react';

type TagSelectProps = {
  label: string;
  options: readonly string[];
  value: readonly string[];
  onChange(next: string[]): void;
};

export function TagSelect({ label, options, value, onChange }: TagSelectProps) {
  const labelId = useId();
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2">
      <p id={labelId} className="text-label text-chalk-dim">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value.includes(o)}
            onClick={() => toggle(o)}
            className="min-h-11 border border-chalk-dim px-3 font-mono text-sm text-chalk transition-colors duration-[var(--dur-cut)] ease-cut hover:border-chalk aria-pressed:border-lane aria-pressed:bg-lane aria-pressed:text-ink"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
