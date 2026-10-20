'use client';

import { motion } from 'motion/react';
import type { Lane } from '@/config/brand';
import type { JoinStep } from '@/lib/join/step';

const STEPS: { id: JoinStep; word: string }[] = [
  { id: 'signin', word: 'Sign in' },
  { id: 'lane', word: 'Pick your room' },
  { id: 'details', word: 'Your details' },
  { id: 'reveal', word: 'Your links' },
];

/**
 * Where you are in joining: four numbered stops on a line that fills as you go (after React
 * Bits' Stepper). Done stops get a tick; the room stop takes your room's colour once chosen.
 */
export function StepTimeline({ step, lane }: { step: JoinStep; lane: Lane | null }) {
  const at = STEPS.findIndex((s) => s.id === step);
  return (
    <nav aria-label="Join progress" data-lane={lane ?? undefined}>
      <ol className="relative grid grid-cols-4">
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-5 h-[3px] bg-rule" />
        <motion.span
          aria-hidden="true"
          className="absolute left-[12.5%] top-5 h-[3px] origin-left bg-rosso"
          initial={false}
          animate={{ width: `${(at / (STEPS.length - 1)) * 75}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
        {STEPS.map((s, i) => {
          const done = i < at;
          const current = i === at;
          const fill = done || current ? (s.id === 'lane' && lane ? 'bg-lane text-print' : 'bg-rosso text-paper') : 'bg-carbon text-chalk-mute';
          return (
            <li key={s.id} aria-current={current ? 'step' : undefined} className="relative flex flex-col items-center gap-2 text-center">
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{ scale: current ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className={`relative z-10 grid size-10 place-items-center rounded-full border-[3px] font-display text-lg leading-none ${fill} ${
                  current ? 'border-chalk' : done ? 'border-transparent' : 'border-rule'
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M3 8.5 6.5 12 13 4.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </motion.span>
              <span className={`text-xs font-semibold sm:text-sm ${current ? 'text-chalk' : 'text-chalk-mute'}`}>
                <span className="sr-only">Step {i + 1}: </span>
                {s.word}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
