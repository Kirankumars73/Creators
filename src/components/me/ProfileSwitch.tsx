'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { brand } from '@/config/brand';
import type { ProfileReason } from '@/lib/members/profile';

type ProfileSwitchProps = {
  handle: string;
  initial: boolean;
  onWall: boolean;
  setProfilePublic(value: boolean): Promise<{ ok: true } | { ok: false; reason: ProfileReason }>;
};

const PROBLEMS: Record<ProfileReason, string> = {
  unauthenticated: 'Your sign-in expired. Sign in again.',
  no_member: 'We couldn’t find your pass.',
  invalid: 'That didn’t save. Try again.',
  inactive: `Your pass is on hold. Message ${brand.founder.shortName} on Instagram.`,
  off_wall: 'You’re not on the member wall, so there’s no page to show.',
  unknown: 'That didn’t save. Try again.',
};

/** /me: your public profile page, on or off, and where to find it. */
export function ProfileSwitch({ handle, initial, onWall, setProfilePublic }: ProfileSwitchProps) {
  const id = useId();
  const [on, setOn] = useState(initial);
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const path = `/m/${handle}`;

  async function toggle() {
    const next = !on;
    setOn(next); // optimistic: the switch answers the tap at once
    setPending(true);
    setProblem(null);
    const result = await setProfilePublic(next);
    setPending(false);
    if (!result.ok) {
      setOn(!next);
      setProblem(PROBLEMS[result.reason]);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-4 bg-carbon p-6 shadow-[0_14px_30px_-22px_var(--print)] md:p-8">
      <h2 id={`${id}-h`} className="font-display text-[2rem] uppercase leading-none text-chalk">
        Your profile page
      </h2>
      {onWall ? (
        <>
          <p className="text-body max-w-[52ch] text-chalk-dim">
            A page brands and collaborators can open from your bio: your name, room, district, what you do and your portfolio link. Never your email.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-labelledby={`${id}-l`}
              onClick={toggle}
              disabled={pending}
              className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-60 ${
                on ? 'border-rosso bg-rosso' : 'border-chalk/25 bg-graphite'
              }`}
            >
              <span className={`absolute size-6 rounded-full bg-paper shadow transition-transform duration-200 ease-pan ${on ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span id={`${id}-l`} className="font-semibold text-chalk">
              {on ? 'Your page is public' : 'Your page is off'}
            </span>
          </div>
          {on ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <Link href={path} className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk">
                Open your page
              </Link>
              <button type="button" onClick={copy} className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk">
                {copied ? 'Link copied' : 'Copy the link for your bio'}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-body max-w-[52ch] text-chalk-dim">{PROBLEMS.off_wall} To be listed, message @{brand.founder.instagram} on Instagram.</p>
      )}
      <p aria-live="polite" className="text-sm font-semibold text-rosso-deep">
        {problem}
      </p>
    </section>
  );
}
