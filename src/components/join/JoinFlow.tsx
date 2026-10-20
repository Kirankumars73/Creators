'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Lane } from '@/config/brand';
import { useJoinDraft } from '@/lib/join/draft';
import { fetchInvite as defaultFetchInvite, type InviteClientResult } from '@/lib/join/invite-client';
import type { InAppInfo } from '@/lib/join/in-app-browser';
import type { RenderTask } from '@/lib/join/render-progress';
import { resolveStep, type JoinStep } from '@/lib/join/step';
import type { MemberInput } from '@/lib/members/schema';
import { photoProblemText, sendPhoto as defaultSendPhoto, type JoinPhoto, type SendPhotoResult } from '@/lib/photos/client';
import type { SubmitResult } from '@/lib/members/submit';
import dynamic from 'next/dynamic';
import { PassPreview } from './PassPreview';
import { RenderBar } from './RenderBar';
import { SignIn } from './SignIn';

// Each step ships as its own chunk: a signed-out visitor downloads only the sign-in step.
const LanePicker = dynamic(() => import('./LanePicker').then((m) => m.LanePicker));
const DetailsForm = dynamic(() => import('./DetailsForm').then((m) => m.DetailsForm));
const ExportSequence = dynamic(() => import('./Reveal').then((m) => m.ExportSequence), {
  loading: () => <RenderBar progress={0} frames={0} />,
});
const SavePassButton = dynamic(() => import('./SavePassButton').then((m) => m.SavePassButton));
import { StepTimeline } from './StepTimeline';

export type JoinFlowProps = {
  initial: { step: JoinStep; lane: Lane | null };
  user: { name: string | null } | null;
  /** Only what the browser needs about an existing member — never their email. */
  member: { id: string; role: Lane; instagram: string } | null;
  inApp: InAppInfo;
  currentUrl: string;
  authError: boolean;
  /** Supabase settings present; false shows an honest "not set up here" instead of the button. */
  signInConfigured?: boolean;
  submitMember(input: unknown): Promise<SubmitResult>;
  fetchInvite?(): Promise<InviteClientResult>;
  /** The signed-in account's Google photo, offered as the pass photo. */
  googlePhotoUrl?: string | null;
  /** The "show my photo" switch (a server action); used only if they ticked it. */
  setPhotoPublic?(value: boolean): Promise<{ ok: boolean }>;
  /** Injectable for tests; the real one posts to /api/photo/me. */
  sendPhoto?(choice: JoinPhoto['choice']): Promise<SendPhotoResult>;
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
  lane: 'Pick your room.',
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
  signInConfigured = true,
  submitMember,
  fetchInvite = defaultFetchInvite,
  googlePhotoUrl = null,
  setPhotoPublic,
  sendPhoto = defaultSendPhoto,
}: JoinFlowProps) {
  const isClient = useIsClient();
  const [draft, patchDraft, clearDraft] = useJoinDraft();
  const [step, setStep] = useState<JoinStep>(initial.step);
  // Each arrival at a step is a new visit: coming Back mid-transition must mount a fresh step,
  // not revive the one still animating out (which would keep its old choice).
  const [visit, setVisit] = useState(0);
  const [lane, setLane] = useState<Lane | null>(initial.lane ?? member?.role ?? null);
  const [flood, setFlood] = useState<Lane | null>(null);
  const [otherText, setOtherText] = useState('');
  const [handle, setHandle] = useState<string | null>(member?.instagram ?? null);
  // The photo picked in the details step: shown on the pass preview, uploaded after joining.
  const [photo, setPhoto] = useState<JoinPhoto | null>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
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
      setVisit((v) => v + 1);
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
    setVisit((v) => v + 1);
  }

  function onLaneCommit(chosen: Lane, text?: string) {
    setLane(chosen);
    if (text) setOtherText(text);
    patchDraft({ lane: chosen, ...(text ? { roleOtherText: text } : {}) });
    go('details', chosen, 'push');
  }

  async function onSubmit(input: MemberInput, picked: JoinPhoto | null = null): Promise<SubmitResult> {
    const result = await submitMember(input);
    // The row exists only now — and only now may the links be asked for.
    if (result.ok) {
      joined.current = true;
      setHandle(input.instagram);
      // The photo is stored against the member record, so it goes up only now. It can never
      // stop someone joining: if it fails they are in, and told where to add it.
      if (picked) {
        const sent = await sendPhoto(picked.choice);
        if (!sent.ok) {
          setPhotoNote(`You’re in, but your photo didn’t upload. ${photoProblemText(sent.reason)} You can add it from your pass page.`);
        } else if (picked.show && setPhotoPublic) {
          const shown = await setPhotoPublic(true).catch(() => ({ ok: false }));
          if (!shown.ok) setPhotoNote('You’re in and your photo is on your pass, but we couldn’t switch it on for your page. You can do that from your pass page.');
        }
      }
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
    <MotionConfig reducedMotion="user">
      <div data-lane={accent ?? undefined} className="grid w-full grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-16">
        <div className="flex min-w-0 flex-col gap-10">
          <StepTimeline step={step} lane={lane} />
          <p role="status" aria-live="polite" className="sr-only">
            Step {STEP_NO[step]} of 4: {STEP_NAME[step]}.
          </p>
          {/* Each step comes into focus as the last one blurs away. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${step}-${visit}`}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.32, ease: [0.33, 1, 0.68, 1] }}
              className="flex flex-col gap-8"
            >
              {title ? (
                <h2 ref={heading} tabIndex={-1} className="font-display text-[clamp(2rem,4.5vw,3.25rem)] uppercase leading-[0.94] text-chalk outline-none">
                  {title}
                </h2>
              ) : null}

              {step === 'signin' ? <SignIn inApp={inApp} currentUrl={currentUrl} error={authError} configured={signInConfigured} /> : null}

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
                  googlePhotoUrl={googlePhotoUrl}
                  onPhoto={setPhoto}
                />
              ) : null}

              {step === 'reveal' ? (
                task ? (
                  <ExportSequence
                    task={task}
                    lane={revealLane}
                    returning={returning}
                    onRetry={() => setTask(fetchInvite())}
                    footer={
                      <>
                        <SavePassButton instagram={handle} />
                        {photoNote ? (
                          <p role="status" className="max-w-xl border-l-[3px] border-mustard bg-graphite px-4 py-3 text-[0.9375rem] font-medium text-chalk">
                            {photoNote}
                          </p>
                        ) : null}
                      </>
                    }
                  />
                ) : (
                  <RenderBar progress={0} frames={0} />
                )
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside aria-label="Your pass preview" className="hidden lg:block">
          <div className="sticky top-28">
            <PassPreview lane={accent ?? null} name={draft.displayName ?? user?.name} handle={draft.instagram ?? handle} photo={photo} googlePhotoUrl={googlePhotoUrl} />
          </div>
        </aside>
      </div>
    </MotionConfig>
  );
}
