'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Combobox } from '@/components/ui/Combobox';
import { Field } from '@/components/ui/Field';
import { TagSelect } from '@/components/ui/TagSelect';
import type { JoinPhoto } from '@/lib/photos/client';
import { PhotoPicker } from './PhotoPicker';
import type { Lane } from '@/config/brand';
import { DISTRICTS, DISTRICT_ALIASES, TAGS } from '@/config/join';
import type { JoinDraft } from '@/lib/join/draft';
import { INSTAGRAM_RE, memberInputSchema, normalizeInstagram, type MemberInput } from '@/lib/members/schema';
import type { SubmitResult } from '@/lib/members/submit';

type DetailsFormProps = {
  lane: Lane;
  otherText?: string;
  user: { name: string | null };
  draft: JoinDraft;
  onDraft(patch: JoinDraft): void;
  /** The second argument is the optional photo, uploaded by the flow once the member record exists. */
  onSubmit(input: MemberInput, photo: JoinPhoto | null): Promise<SubmitResult>;
  onDone(): void;
  /** Their Google profile photo, if the account has one. */
  googlePhotoUrl?: string | null;
  /** Reports the photo choice so the pass preview beside the form can show it. */
  onPhoto?(photo: JoinPhoto | null): void;
};

// One plain sentence per field: what's wrong and how to fix it.
const MESSAGES: Record<string, string> = {
  displayName: 'Use 2 to 60 characters.',
  instagram: 'That doesn’t look like an Instagram handle. Letters, numbers, dots and underscores only.',
  city: 'Pick your district, or Outside Kerala.',
  portfolioUrl: 'Paste a full link that starts with https://',
  acceptedCode: 'Tick this to join. The Code is the deal.',
  roleOtherText: 'Tell us what you do in 2 to 60 characters.',
  tags: 'Pick from the list.',
};

const FORM_ERRORS = {
  unauthenticated: 'Your sign-in expired. Sign in again and your answers will still be here.',
  unknown: 'Couldn’t save that. Nothing was lost. Try again.',
  invalid: 'Something in the form needs another look.',
} as const;

export function DetailsForm({ lane, otherText, user, draft, onDraft, onSubmit, onDone, googlePhotoUrl = null, onPhoto }: DetailsFormProps) {
  const [displayName, setDisplayName] = useState(draft.displayName ?? user.name ?? '');
  const [instagram, setInstagram] = useState(draft.instagram ?? '');
  const [city, setCity] = useState(draft.city ?? '');
  const [tags, setTags] = useState<string[]>(draft.tags ?? []);
  const [portfolioUrl, setPortfolioUrl] = useState(draft.portfolioUrl ?? '');
  const [showOnWall, setShowOnWall] = useState(draft.showOnWall ?? true);
  const [profilePublic, setProfilePublic] = useState(draft.profilePublic ?? true);
  const [acceptedCode, setAcceptedCode] = useState(false);
  const [photo, setPhotoState] = useState<JoinPhoto | null>(null);
  const setPhoto = (next: JoinPhoto | null) => {
    setPhotoState(next);
    onPhoto?.(next);
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const [focusErrors, setFocusErrors] = useState(0);

  // After a rejected submit, take keyboard and screen-reader users to the first problem.
  useEffect(() => {
    if (focusErrors) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusErrors]);

  const handle = normalizeInstagram(instagram);
  const laneTags = lane === 'other' ? [] : TAGS[lane];

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  /** Persist a field to the tab's draft and clear its error. */
  function remember<K extends keyof JoinDraft>(key: K, value: NonNullable<JoinDraft[K]>) {
    onDraft({ [key]: value } as JoinDraft);
    clearError(key);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    setFormError(null);

    const parsed = memberInputSchema.safeParse({
      role: lane,
      ...(lane === 'other' ? { roleOtherText: otherText ?? '' } : {}),
      displayName,
      instagram,
      city,
      tags,
      portfolioUrl,
      showOnWall,
      // A profile lives on the wall: off the wall means no profile either.
      profilePublic: showOnWall && profilePublic,
      acceptedCode,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form');
        next[key] ??= MESSAGES[key] ?? issue.message;
      }
      setErrors(next);
      setFocusErrors((n) => n + 1);
      return;
    }

    inFlight.current = true;
    setPending(true);
    try {
      // Off the wall means no public photo either, whatever the box said before they unticked it.
      const result = await onSubmit(parsed.data, photo ? { ...photo, show: photo.show && showOnWall } : null);
      if (result.ok) {
        onDone();
        return;
      }
      if (result.fieldErrors) {
        setErrors(Object.fromEntries(Object.keys(result.fieldErrors).map((k) => [k, MESSAGES[k] ?? FORM_ERRORS.invalid])));
        setFocusErrors((n) => n + 1);
      }
      setFormError(FORM_ERRORS[result.error]);
    } catch {
      setFormError(FORM_ERRORS.unknown);
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <form ref={form} noValidate onSubmit={submit} className="flex w-full max-w-xl flex-col gap-7">
      <Field
        label="Display name"
        name="displayName"
        autoComplete="name"
        value={displayName}
        onChange={(e) => {
          setDisplayName(e.target.value);
          remember('displayName', e.target.value);
        }}
        error={errors.displayName}
        hint="How you’ll appear on the member wall."
      />
      <Field
        label="Instagram handle"
        name="instagram"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="@yourhandle"
        value={instagram}
        onChange={(e) => {
          setInstagram(e.target.value);
          remember('instagram', e.target.value);
        }}
        error={errors.instagram}
        hint={instagram && INSTAGRAM_RE.test(handle) ? `@${handle}` : 'Paste your handle or your profile link.'}
      />
      <Combobox
        label="City / district"
        options={DISTRICTS}
        aliases={DISTRICT_ALIASES}
        value={city}
        onChange={(v) => {
          setCity(v);
          remember('city', v);
        }}
        error={errors.city}
        placeholder="Start typing: Ernakulam, Thrissur…"
      />
      {laneTags.length ? (
        <TagSelect
          label="What you do (optional)"
          options={laneTags}
          value={tags}
          onChange={(v) => {
            setTags(v);
            remember('tags', v);
          }}
        />
      ) : null}
      <Field
        label="Portfolio or reel link (optional)"
        name="portfolioUrl"
        type="url"
        inputMode="url"
        placeholder="https://"
        value={portfolioUrl}
        onChange={(e) => {
          setPortfolioUrl(e.target.value);
          remember('portfolioUrl', e.target.value);
        }}
        error={errors.portfolioUrl}
      />
      <PhotoPicker value={photo} onChange={setPhoto} googlePhotoUrl={googlePhotoUrl} canShow={showOnWall} />
      <div className="flex flex-col gap-1">
        <Checkbox
          label={
            <>
              Show me on the member wall
              <span className="mt-1 block text-[0.875rem] font-medium text-chalk-dim">Name and handle only. Never your email.</span>
            </>
          }
          checked={showOnWall}
          onChange={(v) => {
            setShowOnWall(v);
            remember('showOnWall', v);
          }}
        />
        {showOnWall ? (
          <Checkbox
            label={
              <>
                Give me a public profile page
                <span className="mt-1 block text-[0.875rem] font-medium text-chalk-dim">
                  Your district, what you do and your portfolio link, so brands and collaborators can find you. Never your email.
                </span>
              </>
            }
            checked={profilePublic}
            onChange={(v) => {
              setProfilePublic(v);
              remember('profilePublic', v);
            }}
          />
        ) : null}
        <Checkbox
          label={
            <>
              I’ve read{' '}
              <Link href="/code" target="_blank" className="underline decoration-lane underline-offset-4">
                The Code
              </Link>{' '}
              and I’m in.
            </>
          }
          checked={acceptedCode}
          onChange={(v) => {
            setAcceptedCode(v);
            clearError('acceptedCode');
          }}
          error={errors.acceptedCode}
        />
      </div>
      {formError ? (
        <p role="alert" className="border-l-[3px] border-rosso bg-graphite px-4 py-3 font-sans text-sm text-chalk">
          {formError}
          {formError === FORM_ERRORS.unauthenticated ? (
            <>
              {' '}
              {/* A plain link: a full reload lets the server re-resolve the step. */}
              <a href="/join" className="underline underline-offset-4">
                Sign in again
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      <div>
        <Button type="submit" variant="bay" disabled={pending} aria-busy={pending}>
          Render my pass
        </Button>
      </div>
    </form>
  );
}
