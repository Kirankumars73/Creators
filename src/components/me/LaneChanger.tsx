'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LANES, brand, type Lane } from '@/config/brand';
import type { ChangeReason } from '@/lib/members/role-change';

type LaneChangerProps = {
  current: Lane;
  changeLane(input: { role: Lane; roleOtherText?: string }): Promise<{ ok: true } | { ok: false; reason: ChangeReason }>;
};

const PROBLEMS: Record<ChangeReason, string> = {
  used: 'You’ve already used your one move.',
  inactive: 'Your pass is on hold. Message Gowtham on Instagram.',
  same: 'You’re already in that room.',
  invalid: 'Tell us what you do in 2 to 60 characters.',
  unauthenticated: 'Your sign-in expired. Sign in again.',
  no_member: 'We couldn’t find your pass.',
  unknown: 'Couldn’t move you just now. Try again.',
};

export function LaneChanger({ current, changeLane }: LaneChangerProps) {
  const router = useRouter();
  const id = useId();
  const [next, setNext] = useState<Lane | null>(null);
  const [otherText, setOtherText] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const options = LANES.filter((l) => l !== current);

  async function move() {
    if (!next) return;
    setPending(true);
    setProblem(null);
    const result = await changeLane(next === 'other' ? { role: next, roleOtherText: otherText } : { role: next });
    setPending(false);
    if (result.ok) router.refresh();
    else setProblem(PROBLEMS[result.reason]);
  }

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-5 border-t border-rule pt-10">
      <h2 id={`${id}-h`} className="text-subhead text-chalk">
        Wrong lane?
      </h2>
      <p className="text-body max-w-xl text-chalk-dim">
        You can move once. You’ll stay in {brand.rooms[current].name} on WhatsApp until you leave it there.
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">Move to</legend>
        {options.map((lane) => (
          <label key={lane} data-lane={lane} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="radio"
              name={`${id}-lane`}
              value={lane}
              checked={next === lane}
              onChange={() => setNext(lane)}
              className="size-5 accent-[var(--lane)]"
            />
            <span className="font-display text-[1.5rem] uppercase text-chalk">{brand.rooms[lane].name}</span>
            <span className="text-label text-chalk-dim">{brand.rooms[lane].label}</span>
          </label>
        ))}
      </fieldset>
      {next === 'other' ? (
        <label className="flex max-w-xl flex-col gap-2">
          <span className="text-label text-chalk-dim">What do you do?</span>
          <input
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="min-h-12 border-0 border-b border-chalk-dim bg-graphite px-3 font-mono text-chalk"
          />
        </label>
      ) : null}
      {problem ? (
        <p role="alert" className="border-l-[3px] border-rosso bg-graphite px-4 py-3 font-mono text-sm text-chalk">
          {problem}
        </p>
      ) : null}
      <div>
        <Button variant="ghost" onClick={move} disabled={!next || pending} aria-busy={pending}>
          {next ? `Move to ${brand.rooms[next].name}` : 'Pick a room'}
        </Button>
      </div>
    </section>
  );
}
