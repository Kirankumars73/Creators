'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { LANES, brand, type Lane } from '@/config/brand';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';
import { LaneFrame } from './LaneFrame';

type LanePickerProps = {
  value: Lane | null;
  onCommit(lane: Lane, otherText?: string): void;
  /** Fired the moment a lane is chosen, so the whole flow can take its color. */
  onFlood?(lane: Lane): void;
  initialOtherText?: string;
};

// §7 step 2: unchosen slide off (420ms, the lane-select curve), chosen cuts to close-up (520ms, pan).
const SLIDE = { duration: 0.42, ease: [0.76, 0, 0.24, 1] as const };
const EXPAND = { duration: 0.52, ease: [0.33, 1, 0.68, 1] as const };
const QUIET = { duration: 0.15 };

const charCount = (s: string) => [...s.trim()].length;

export function LanePicker({ value, onCommit, onFlood, initialOtherText = '' }: LanePickerProps) {
  const reduced = usePrefersReducedMotion();
  const hintId = useId();
  const [checked, setChecked] = useState<Lane | null>(value);
  const [chosen, setChosen] = useState<Lane | null>(null);
  const [otherText, setOtherText] = useState(initialOtherText);
  const [otherError, setOtherError] = useState<string | null>(null);
  const radios = useRef<(HTMLDivElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function commit(lane: Lane) {
    setChecked(lane);
    setChosen(lane);
    onFlood?.(lane);
    if (lane !== 'other') {
      timer.current = setTimeout(() => onCommit(lane), reduced ? 150 : 420 + 520);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>, i: number) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (step) {
      e.preventDefault();
      const j = (i + step + LANES.length) % LANES.length;
      radios.current[j]?.focus();
      setChecked(LANES[j]!);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      commit(LANES[i]!);
    }
  }

  function submitOther() {
    const n = charCount(otherText);
    if (n < 2 || n > 60) {
      setOtherError('Tell us in 2 to 60 characters.');
      return;
    }
    onCommit('other', otherText.trim());
  }

  const tabbable = checked ?? LANES[0];
  const chosenIndex = chosen ? LANES.indexOf(chosen) : -1;

  return (
    <div className="relative">
      <p id={hintId} className="sr-only">
        Use the arrow keys to choose a lane, then press Enter.
      </p>
      <div
        role="radiogroup"
        aria-label="Pick your lane"
        aria-describedby={hintId}
        className="grid grid-cols-2 items-start gap-3 md:grid-cols-[1fr_1fr_0.85fr] md:gap-5"
      >
        {LANES.map((lane, i) => {
          if (lane === chosen && !reduced) return <div key={lane} aria-hidden="true" />;
          const away = chosen !== null && lane !== chosen;
          return (
            <motion.div
              key={lane}
              ref={(el) => {
                radios.current[i] = el;
              }}
              role="radio"
              aria-checked={checked === lane}
              tabIndex={lane === tabbable ? 0 : -1}
              onClick={() => !chosen && commit(lane)}
              onKeyDown={(e) => !chosen && onKeyDown(e, i)}
              layoutId={reduced ? undefined : `lane-${lane}`}
              animate={away ? (reduced ? { opacity: 0 } : { x: i < chosenIndex ? '-110vw' : '110vw', opacity: 0 }) : { x: 0, opacity: 1 }}
              transition={reduced ? QUIET : away ? SLIDE : EXPAND}
              className={`cursor-pointer outline-offset-4 ${lane === 'other' ? 'col-span-2 self-center md:col-span-1' : ''}`}
              aria-label={`${brand.rooms[lane].name}, ${brand.rooms[lane].label}`}
              aria-describedby={`${hintId}-${lane}-copy`}
            >
              <span id={`${hintId}-${lane}-copy`} className="sr-only">
                {brand.rooms[lane].copy}
              </span>
              <LaneFrame lane={lane} mode="radio" selected={checked === lane} />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {chosen ? (
          <motion.div
            key="close-up"
            layoutId={reduced ? undefined : `lane-${chosen}`}
            initial={reduced ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={reduced ? QUIET : EXPAND}
            data-lane={chosen}
            className="fixed inset-0 z-40 flex flex-col bg-carbon p-4 md:p-10"
          >
            <LaneFrame lane={chosen} mode="radio" selected size="full" className="flex-1" />
            {chosen === 'other' ? (
              <div className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-4">
                <label htmlFor={`${hintId}-other`} className="text-label text-chalk-dim">
                  What do you do?
                </label>
                <input
                  id={`${hintId}-other`}
                  autoFocus
                  value={otherText}
                  maxLength={80}
                  onChange={(e) => {
                    setOtherText(e.target.value);
                    setOtherError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && submitOther()}
                  aria-invalid={otherError ? true : undefined}
                  aria-describedby={otherError ? `${hintId}-other-err` : undefined}
                  placeholder="DOP, photographer, writer…"
                  className="slate-input min-h-14 w-full border-0 border-b-2 border-lane bg-graphite px-4 font-mono text-xl uppercase tracking-[0.08em] text-chalk outline-none placeholder:text-chalk-mute"
                />
                {otherError ? (
                  <p id={`${hintId}-other-err`} className="border-l-2 border-rosso pl-2 font-mono text-[0.8125rem] text-chalk">
                    {otherError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-4">
                  <Button variant="bay" onClick={submitOther}>
                    Continue
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChosen(null);
                      setOtherError(null);
                    }}
                  >
                    Pick again
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
