'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Lane } from '@/config/brand';
import { useJoinDraft } from '@/lib/join/draft';
import { fetchInvite as defaultFetchInvite, type InviteClientResult } from '@/lib/join/invite-client';
import type { InAppInfo } from '@/lib/join/in-app-browser';
import type { RenderTask } from '@/lib/join/render-progress';
import { resolveStep, type JoinStep } from '@/lib/join/step';
import type { MemberInput } from '@/lib/members/schema';
import type { SubmitResult } from '@/lib/members/submit';
import { DetailsForm } from './DetailsForm';
import { LanePicker } from './LanePicker';
import { RenderBar } from './RenderBar';
import { ExportSequence } from './Reveal';
import { SignIn } from './SignIn';
import { StepTimeline } from './StepTimeline';

export type JoinFlowProps = {
  initial: { step: JoinStep; lane: Lane | null };
  user: { name: string | null } | null;
  /** Only what the browser needs about an existing member — never their email. */
  member: { id: string; role: Lane; instagram: string } | null;
  inApp: InAppInfo;
  currentUrl: string;
  authError: boolean;
  submitMember(input: unknown): Promise<SubmitResult>;
  fetchInvite?(): Promise<InviteClientResult>;
};

const STEP_NO: Record<JoinStep, number> = { signin: 1, lane: 2, details: 3, reveal: 4 };
const STEP_NAME: Record<JoinStep, string> = {
  signin: 'sign in',
  lane: 'pick your lane',
  details: 'a few details',
  reveal: 'your links',
};
const HEADINGS: Partial<Record<JoinStep, string>> = {
  signin: 'Start with Google.',
  lane: 'Pick your lane.',
  details: 'A few details.',
};

const subscribeNothing = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

function urlFor(step: JoinStep, lane: Lane | null): string {
  if (step === 'details' && lane) return `/join?step=details&lane=${lane}`;
  return `/join?step=${step}`;
}

export function JoinFlow({
  initial,
  user,
  member,
  inApp,
  currentUrl,
  authError,
  submitMember,
  fetchInvite = defaultFetchInvite,
}: JoinFlowProps) {
  const isClient = useIsClient();
  const [draft, patchDraft, clearDraft] = useJoinDraft();
  const [step, setStep] = useState<JoinStep>(initial.step);
  const [lane, setLane] = useState<Lane | null>(initial.lane ?? member?.role ?? null);
  const [flood, setFlood] = useState<Lane | null>(null);
  const [otherText, setOtherText] = useState('');
  const [returning] = useState(initial.step === 'reveal');
  // Returning members start on the reveal: hand the render bar a factory so the request
  // starts in the browser when the bar mounts (never during the server render).
  const [task, setTask] = useState<RenderTask<InviteClientResult> | null>(() => (initial.step === 'reveal' ? fetchInvite : null));
  const joined = useRef(member !== null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Back / forward re-derive the step from the URL; the session still decides.
  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search);
      const next = resolveStep(
        { step: sp.get('step') ?? undefined, lane: sp.get('lane') ?? undefined },
        { signedIn: user !== null, hasMember: joined.current },
      );
      setStep(next.step);
      if (next.lane) setLane(next.lane);
      if (next.step === 'lane') setFlood(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [user]);

  // Move focus to the new step's heading so keyboard and screen-reader users land in the right place.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  function go(next: JoinStep, nextLane: Lane | null, mode: 'push' | 'replace') {
    const url = urlFor(next, nextLane);
    if (mode === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
    setStep(next);
  }

  function onLaneCommit(chosen: Lane, text?: string) {
    setLane(chosen);
    if (text) setOtherText(text);
    patchDraft({ lane: chosen, ...(text ? { roleOtherText: text } : {}) });
    go('details', chosen, 'push');
  }

  async function onSubmit(input: MemberInput): Promise<SubmitResult> {
    const result = await submitMember(input);
    // The row exists only now — and only now may the links be asked for.
    if (result.ok) {
      joined.current = true;
      setTask(fetchInvite());
    }
    return result;
  }

  function onDone() {
    clearDraft();
    go('reveal', lane, 'replace');
  }

  const accent = flood ?? lane;
  const revealLane = lane ?? member?.role ?? 'other';
  const title = HEADINGS[step];

  return (
    <div data-lane={accent ?? undefined} className="flex w-full flex-col gap-10">
      <StepTimeline step={step} lane={lane} />
      <p role="status" aria-live="polite" className="sr-only">
        Step {STEP_NO[step]} of 4: {STEP_NAME[step]}.
      </p>
      {title ? (
        <h2 ref={heading} tabIndex={-1} className="text-subhead text-chalk outline-none">
          {title}
        </h2>
      ) : null}

      {step === 'signin' ? <SignIn inApp={inApp} currentUrl={currentUrl} error={authError} /> : null}

      {step === 'lane' ? (
        <LanePicker value={lane} onCommit={onLaneCommit} onFlood={setFlood} initialOtherText={draft.roleOtherText} />
      ) : null}

      {step === 'details' && lane && isClient ? (
        <DetailsForm
          lane={lane}
          otherText={otherText || draft.roleOtherText}
          user={{ name: user?.name ?? null }}
          draft={draft}
          onDraft={patchDraft}
          onSubmit={onSubmit}
          onDone={onDone}
        />
      ) : null}

      {step === 'reveal' ? (
        task ? (
          <ExportSequence task={task} lane={revealLane} returning={returning} onRetry={() => setTask(fetchInvite())} />
        ) : (
          <RenderBar progress={0} frames={0} />
        )
      ) : null}
    </div>
  );
}
