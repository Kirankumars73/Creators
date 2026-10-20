'use client';

import { useId, useState, type KeyboardEvent } from 'react';

type ComboboxProps = {
  label: string;
  options: readonly string[];
  /** Other names an option answers to, e.g. Ernakulam ← Kochi. */
  aliases?: Partial<Record<string, readonly string[]>>;
  value: string;
  onChange(value: string): void;
  error?: string;
  placeholder?: string;
};

/** WAI-ARIA 1.2 combobox with a filtered listbox popup. */
export function Combobox({ label, options, aliases = {}, value, onChange, error, placeholder }: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const errId = `${id}-err`;
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = query.trim().toLowerCase();
  const names = (o: string) => [o, ...(aliases[o] ?? [])].map((n) => n.toLowerCase());
  const filtered = q && query !== value ? options.filter((o) => names(o).some((n) => n.includes(q))) : options;
  const optionId = (i: number) => `${id}-opt-${i}`;

  function choose(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
    setActive(-1);
  }

  function reconcile() {
    // Leaving the field: accept an exact (case-insensitive) match, otherwise restore the last choice.
    const exact = options.find((o) => names(o).includes(q));
    if (exact) choose(exact);
    else {
      setQuery(value);
      setOpen(false);
      setActive(-1);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter' && open && active >= 0 && filtered[active]) {
      e.preventDefault();
      choose(filtered[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-chalk-dim">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={reconcile}
          onKeyDown={onKeyDown}
          className="peer block min-h-12 w-full rounded-none border-0 border-b border-chalk-dim bg-graphite px-3 py-3 text-base text-chalk outline-none placeholder:text-chalk-mute aria-invalid:border-rosso"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-lane transition-transform duration-[180ms] ease-cut peer-focus:scale-x-100"
        />
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        hidden={!open || filtered.length === 0}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-auto border border-rule bg-carbon py-1"
      >
        {filtered.map((o, i) => (
          <li
            key={o}
            id={optionId(i)}
            role="option"
            aria-selected={o === value}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(o)}
            className={`flex min-h-11 cursor-pointer items-center border-l-[3px] px-3 text-chalk ${
              i === active ? 'border-lane bg-graphite' : 'border-transparent'
            }`}
          >
            {o}
          </li>
        ))}
      </ul>
      {error ? (
        <p id={errId} className="border-l-2 border-rosso pl-2 text-[0.875rem] font-medium text-chalk">
          {error}
        </p>
      ) : null}
    </div>
  );
}
