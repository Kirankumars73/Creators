'use client';

import { useActionState, useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { submitBrief } from '@/app/brief/actions';
import { Star } from '@/components/brand/Star';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { brand } from '@/config/brand';
import { BRANDS } from '@/config/landing';
import type { BriefResult } from '@/lib/briefs/submit';

// When this page started on the client: the bot guard's clock. Never in the (cached) server HTML.
let openedAt: string | undefined;
const clientStamp = () => (openedAt ??= String(Date.now()));
const subscribeNothing = () => () => {};

/**
 * The "post a brief" form. Server-validated; on any server trouble it hands over an email link
 * instead. With `forInstagram` it's the "Work with me" form on a member's page, addressed to them.
 */
export function BriefForm({ forInstagram }: { forInstagram?: string } = {}) {
  const [state, action, pending] = useActionState<BriefResult | null, FormData>(submitBrief, null);
  const started = useSyncExternalStore(subscribeNothing, clientStamp, () => '');
  const briefId = useId();
  const form = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok && state.error === 'invalid' ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (!state || state.ok) return;
    form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border border-mustard bg-carbon p-8">
        <Star size={28} className="star-flick" />
        <p className="font-display text-[2.5rem] uppercase leading-none text-chalk">Brief received.</p>
        <p className="text-body text-chalk-dim">{BRANDS.sent}</p>
      </div>
    );
  }

  const mail = brand.contact ? `mailto:${brand.contact}?subject=${encodeURIComponent(`Brand brief for ${brand.name}`)}` : null;

  return (
    <form ref={form} action={action} noValidate className="relative flex flex-col gap-5 border border-rule bg-carbon p-6 md:p-8" data-lane="community">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[2rem] uppercase leading-none text-chalk">{forInstagram ? `Brief @${forInstagram}` : BRANDS.formTitle}</h3>
        <span className="text-label text-chalk-mute">Free</span>
      </div>
      <p className="font-mono text-[0.8125rem] leading-snug text-chalk-dim">
        {/* Members' emails are never public: a brief to one member goes through the team. */}
        {forInstagram ? `It comes to the kootam team, who pass it to @${forInstagram}. You get a reply by email.` : BRANDS.formNote}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Brand / organisation" name="brand" required autoComplete="organization" maxLength={80} error={errors.brand} />
        <Field label="Your name" name="contact_name" required autoComplete="name" maxLength={60} error={errors.contact_name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" inputMode="email" maxLength={254} error={errors.email} />
        <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} error={errors.phone} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={briefId} className="text-label text-chalk-dim">
          The brief (optional)
        </label>
        <div className="relative">
          <textarea
            id={briefId}
            name="brief"
            rows={4}
            maxLength={1500}
            placeholder="What you're launching, where, how many reels, paid or barter, when."
            aria-invalid={errors.brief ? true : undefined}
            aria-describedby={errors.brief ? `${briefId}-err` : undefined}
            className="peer block w-full resize-y rounded-none border-0 border-b border-chalk-dim bg-graphite px-3 py-3 text-base text-chalk outline-none placeholder:text-chalk-mute aria-invalid:border-rosso"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-lane transition-transform duration-[180ms] ease-cut peer-focus:scale-x-100" />
        </div>
        {errors.brief ? (
          <p id={`${briefId}-err`} className="border-l-2 border-rosso pl-2 font-mono text-[0.8125rem] leading-snug text-chalk">
            {errors.brief}
          </p>
        ) : null}
      </div>

      {/* Bot guards: a field people never see, and the time the form appeared. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="t" value={started} />
      {forInstagram ? <input type="hidden" name="for_instagram" value={forInstagram} /> : null}

      {state && !state.ok && state.error === 'unavailable' ? (
        <p role="alert" className="border-l-2 border-rosso pl-3 font-mono text-[0.8125rem] leading-snug text-chalk">
          The brief board is offline right now.{' '}
          {mail ? (
            <a href={mail} className="underline underline-offset-4">
              Email it to {brand.contact}
            </a>
          ) : (
            'Try again in a few minutes.'
          )}
        </p>
      ) : null}
      <noscript>
        <p className="font-mono text-[0.8125rem] text-chalk-dim">
          This form needs JavaScript.{' '}
          {mail ? (
            <a href={mail} className="underline underline-offset-4">
              Email your brief instead.
            </a>
          ) : null}
        </p>
      </noscript>

      <Button type="submit" disabled={pending || !started} className="self-start">
        {pending ? 'Sending…' : 'Send the brief'}
      </Button>
    </form>
  );
}
