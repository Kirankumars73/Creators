'use client';

import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Star } from '@/components/brand/Star';
import { Button } from '@/components/ui/Button';
import { brand, type Lane } from '@/config/brand';
import { t } from '@/i18n/ml';
import { useCommunityOpened, markCommunityOpened } from '@/lib/join/chip-store';
import { isInviteOk, type InviteClientResult } from '@/lib/join/invite-client';
import { useRenderProgress } from '@/lib/join/render-progress';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';
import { DeliverableChip } from './DeliverableChip';
import { RenderBar } from './RenderBar';

type RevealProps = {
  result: InviteClientResult;
  lane: Lane;
  /** Already a member before this visit: both chips open straight away. */
  returning: boolean;
  onRetry?(): void;
  /** Slot under the chips (SAVE MY PASS). */
  footer?: ReactNode;
};

const LANE_ROOM_COPY: Record<Lane, string> = {
  creator: 'Your room. Only creators.',
  editor: 'Your room. Only editors.',
  other: 'Your room.',
};

/** Render bar while the request is out, then the reveal. */
export function ExportSequence({
  task,
  lane,
  returning,
  onRetry,
  footer,
}: Omit<RevealProps, 'result'> & { task: Promise<InviteClientResult> }) {
  const render = useRenderProgress(task);
  if (!render.done) return <RenderBar progress={render.progress} frames={render.frames} />;
  const result: InviteClientResult = render.result ?? { status: 0, error: 'network' };
  return <Reveal result={result} lane={lane} returning={returning} onRetry={onRetry} footer={footer} />;
}

export function Reveal({ result, lane, returning, onRetry, footer }: RevealProps) {
  if (!isInviteOk(result)) return <RevealProblem status={result.status} onRetry={onRetry} />;
  return <RevealOk links={result.body} lane={lane} returning={returning} footer={footer} />;
}

function RevealOk({
  links,
  lane,
  returning,
  footer,
}: {
  links: { community: string; lane: string | null };
  lane: Lane;
  returning: boolean;
  footer?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const opened = useCommunityOpened();
  const unlocked = returning || opened;
  const [cut, setCut] = useState(!reduced);
  const youreIn = t('youreIn');

  useEffect(() => {
    // One frame of black between the render and the result: the hard cut.
    const id = setTimeout(() => setCut(false), 40);
    return () => clearTimeout(id);
  }, []);

  return (
    <div data-lane={lane} className="relative flex flex-col gap-10">
      {cut ? <div aria-hidden="true" className="fixed inset-0 z-50 bg-ink" /> : null}
      <header className="relative">
        <span aria-hidden="true" className="star-flick absolute -left-2 -top-6">
          <Star size={18} />
        </span>
        <span aria-hidden="true" className="star-flick absolute -top-3 right-[18%] [animation-delay:120ms]">
          <Star size={12} />
        </span>
        <h2 className="text-title halation-rosso text-lane">Export complete.</h2>
        <p className="text-ml mt-5 text-[clamp(1.5rem,3.6vw,2.75rem)] font-semibold text-chalk" lang="ml">
          {youreIn.ml ?? youreIn.en}
        </p>
        {youreIn.ml ? <p className="text-body mt-1 italic text-chalk-dim">{youreIn.en}</p> : null}
      </header>

      <div className="flex flex-col gap-5">
        <DeliverableChip
          index="01"
          order={0}
          title={brand.rooms.community.name}
          body="Everyone’s here. Announcements land in this one. Join it first."
          href={links.community}
          locked={false}
          onOpen={markCommunityOpened}
        />
        {links.lane ? (
          <DeliverableChip
            index="02"
            order={1}
            title={brand.rooms[lane].name}
            laneTag={brand.rooms[lane].short}
            body={LANE_ROOM_COPY[lane]}
            href={unlocked ? links.lane : null}
            locked={!unlocked}
          />
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.3, duration: 0.15 }}
            data-lane="other"
            className="border border-dashed border-mint bg-carbon p-5 font-mono text-sm leading-relaxed text-chalk"
          >
            We&apos;re building your room. For now you&apos;re in the main kootam — {brand.founder.shortName} will reach out.
          </motion.p>
        )}
      </div>

      <p className="font-mono text-[0.8125rem] text-chalk-dim">Links not opening? Make sure WhatsApp is installed on this device.</p>
      {footer}
    </div>
  );
}

const PROBLEMS: Record<number, { title: string; body: ReactNode; retry?: boolean }> = {
  401: { title: 'Sign in again.', body: 'Your sign-in expired. Your details are saved.' },
  403: {
    title: 'Your pass is on hold.',
    body: (
      <>
        Message{' '}
        <a href={brand.instagramUrl} className="underline underline-offset-4">
          @{brand.founder.instagram}
        </a>{' '}
        on Instagram.
      </>
    ),
  },
  404: { title: 'We couldn’t find your pass.', body: 'Go back a step and fill in your details.' },
  429: { title: 'Too many tries.', body: 'Wait ten minutes, then refresh.' },
};
const NETWORK = { title: 'The links didn’t load.', body: 'Check your connection and try again.', retry: true };

function RevealProblem({ status, onRetry }: { status: number; onRetry?(): void }) {
  const p = PROBLEMS[status] ?? NETWORK;
  return (
    <div role="alert" className="flex flex-col items-start gap-4 border-l-[3px] border-rosso bg-graphite p-6">
      <h2 className="font-display text-[2rem] uppercase leading-none text-chalk">{p.title}</h2>
      <p className="text-body text-chalk">{p.body}</p>
      {status === 401 ? (
        <Button href="/join" variant="ghost">
          Sign in
        </Button>
      ) : null}
      {status === 404 ? (
        <Button href="/join?step=lane" variant="ghost">
          Back to your lane
        </Button>
      ) : null}
      {'retry' in p && p.retry && onRetry ? (
        <Button variant="ghost" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
