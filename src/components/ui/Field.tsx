import { useId, type InputHTMLAttributes } from 'react';

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'className'>;

/**
 * Editing Bay input (§7 step 3): graphite fill, square, mono label above. The resting
 * --chalk-dim underline keeps the field boundary visible (WCAG 1.4.11); on focus a
 * 2px lane-colored bar wipes in from the left.
 */
export function Field({ label, name, error, hint, className = '', id, ...rest }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const descId = `${inputId}-desc`;
  const description = error ?? hint;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={inputId} className="text-label text-chalk-dim">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={description ? descId : undefined}
          className="peer block min-h-12 w-full rounded-none border-0 border-b border-chalk-dim bg-graphite px-3 py-3 text-base text-chalk outline-none placeholder:text-chalk-mute aria-invalid:border-rosso"
          {...rest}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-lane transition-transform duration-[180ms] ease-cut peer-focus:scale-x-100"
        />
      </div>
      {description ? (
        <p
          id={descId}
          className={`font-mono text-[0.8125rem] leading-snug ${error ? 'border-l-2 border-rosso pl-2 text-chalk' : 'text-chalk-dim'}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
