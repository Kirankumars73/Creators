import { useId, type ReactNode } from 'react';

type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  onChange(checked: boolean): void;
  name?: string;
  error?: string;
  id?: string;
};

export function Checkbox({ label, checked, onChange, name, error, id }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errId = `${inputId}-err`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            id={inputId}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            className="peer size-5 cursor-pointer appearance-none border border-chalk-dim bg-graphite checked:border-lane checked:bg-lane aria-invalid:border-rosso"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute inset-0 m-auto size-3.5 opacity-0 peer-checked:opacity-100"
          >
            <path d="M3 8.5l3 3 7-7" fill="none" stroke="var(--ink)" strokeWidth="2.2" />
          </svg>
        </span>
        <span className="text-body text-chalk">{label}</span>
      </label>
      {error ? (
        <p id={errId} className="border-l-2 border-rosso pl-2 text-[0.875rem] font-medium text-chalk">
          {error}
        </p>
      ) : null}
    </div>
  );
}
