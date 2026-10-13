'use client';

import { useEffect, useRef } from 'react';
import { toDigits } from '@/lib/timecode';

type OdometerProps = {
  value: number;
  digits: number;
  /** Spoken before the number, e.g. "Members". */
  label?: string;
  /** Roll up from zero the first time it scrolls into view (never when already on screen). */
  rollIn?: boolean;
  className?: string;
};

const DIGIT_STRIP = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Counter whose digits roll individually. Server markup shows the real value,
 * so no-JS and first paint are correct; rolling only ever happens off-screen → on-screen
 * or on a live value change.
 */
export function Odometer({ value, digits, label, rollIn = true, className = '' }: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !rollIn || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.dataset.rolled = 'false';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        delete el.dataset.rolled;
        io.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rollIn]);

  return (
    <span ref={ref} className={`odometer inline-flex tabular-nums ${className}`}>
      <span className="sr-only">{label ? `${label} ${value}` : String(value)}</span>
      {toDigits(value, digits).map((d, i) => (
        <span key={i} aria-hidden="true" className="inline-block h-[1em] overflow-hidden leading-none">
          <span
            className="odometer-strip flex flex-col"
            style={{ transform: `translateY(${-d}em)`, transitionDelay: `${i * 35}ms` }}
          >
            {DIGIT_STRIP.map((n) => (
              <span key={n} className="block h-[1em] leading-none">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
