'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { Star } from '@/components/brand/Star';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

type DeliverableChipProps = {
  index: '01' | '02';
  title: string;
  body: string;
  href: string | null;
  locked: boolean;
  laneTag?: string;
  /** Stagger position: chips drop in 300ms apart. */
  order?: number;
  onOpen?(): void;
};

const SETTLE = { type: 'spring', stiffness: 180, damping: 22 } as const;

/** An exported file landing in the bin: one WhatsApp room, one button. */
export function DeliverableChip({ index, title, body, href, locked, laneTag, order = 0, onOpen }: DeliverableChipProps) {
  const reduced = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      onOpen?.();
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.article
      data-lane={index === '01' ? 'community' : undefined}
      initial={reduced ? { opacity: 0 } : { x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={reduced ? { duration: 0.15 } : { ...SETTLE, delay: order * 0.3 }}
      className={`relative border bg-graphite p-5 transition-colors duration-[var(--dur-cut)] ease-cut md:p-6 ${
        locked ? 'border-rule opacity-60' : 'border-lane'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="flex items-center gap-3">
          <Star size={14} />
          <span className="font-mono text-sm tracking-[0.14em] text-chalk-dim">{index}</span>
          <span className="font-display text-[1.75rem] uppercase leading-none text-chalk">{title}</span>
        </p>
        {laneTag ? <span className="text-label border border-lane px-2 py-1 text-chalk">{laneTag}</span> : null}
      </div>
      <p className="text-body mt-3 text-chalk-dim">{body}</p>
      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={copy}
          disabled={locked}
          className="min-h-11 px-3 font-mono text-sm tracking-[0.08em] text-chalk-dim underline underline-offset-4 hover:text-chalk disabled:no-underline disabled:opacity-60"
        >
          {copied ? 'Copied' : 'Copy link'}
        </button>
        {locked || !href ? (
          <a
            role="link"
            aria-disabled="true"
            aria-label={`Open WhatsApp: ${title} (opens after 01)`}
            className="inline-flex min-h-12 items-center gap-2 border border-rule px-5 font-display text-[1.5rem] uppercase text-chalk-mute"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="7" width="10" height="7" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            Open WhatsApp
          </a>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onOpen}
            aria-label={`Open WhatsApp: ${title}`}
            className="inline-flex min-h-12 items-center border border-lane bg-lane px-5 font-display text-[1.5rem] uppercase text-ink"
          >
            Open WhatsApp
          </a>
        )}
      </div>
    </motion.article>
  );
}
