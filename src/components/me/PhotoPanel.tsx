'use client';

import { useId, useRef, useState } from 'react';
import type { PhotoReason, PhotoResult } from '@/lib/photos/actions';
import { shrinkPhoto } from '@/lib/photos/client';

type PhotoPanelProps = {
  hasPhoto: boolean;
  photoPublic: boolean;
  onWall: boolean;
  /** Their Google account has a profile photo we can offer. */
  hasGoogle: boolean;
  instagram: string;
  setPhotoPublic(value: boolean): Promise<PhotoResult>;
  /** Called after the photo or its switch changed, so the pass preview beside it can refresh. */
  onChanged?(): void;
};

const PROBLEMS: Partial<Record<PhotoReason | 'network', string>> = {
  not_an_image: 'That file isn’t a photo we can use. Pick a jpeg, png or webp picture.',
  too_big: 'That photo is too large. Pick one under 6 MB.',
  no_google_photo: 'Your Google account doesn’t have a photo.',
  unavailable: 'Google didn’t answer. Try again, or upload a photo.',
  unauthenticated: 'Your sign-in expired. Sign in again.',
  inactive: 'Your pass is on hold. Message us on Instagram.',
  network: 'That didn’t go through. Check your connection and try again.',
};
const FALLBACK = 'That didn’t save. Try again.';

/** /me: the photo on your pass. Upload one or use your Google photo; it stays private until you switch it on. */
export function PhotoPanel({ hasPhoto: initialHas, photoPublic: initialPublic, onWall, hasGoogle, setPhotoPublic, onChanged }: PhotoPanelProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [has, setHas] = useState(initialHas);
  const [shown, setShown] = useState(initialPublic);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState<null | 'upload' | 'google' | 'remove' | 'switch'>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function call(kind: 'upload' | 'google' | 'remove', init: RequestInit) {
    setBusy(kind);
    setProblem(null);
    try {
      const res = await fetch('/api/photo/me', init);
      if (res.ok) {
        if (kind === 'remove') {
          setHas(false);
          setShown(false);
        } else {
          setHas(true);
          setVersion((v) => v + 1);
        }
        onChanged?.();
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: PhotoReason };
        setProblem((body.error && PROBLEMS[body.error]) || FALLBACK);
      }
    } catch {
      setProblem(PROBLEMS.network!);
    } finally {
      setBusy(null);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.append('file', await shrinkPhoto(file), 'photo.jpg');
    await call('upload', { method: 'POST', body: form });
    if (input.current) input.current.value = ''; // picking the same file again should still fire
  }

  async function toggle() {
    const next = !shown;
    setShown(next); // answer the tap at once; undo if the server says no
    setBusy('switch');
    setProblem(null);
    const result = await setPhotoPublic(next);
    setBusy(null);
    if (result.ok) onChanged?.();
    else {
      setShown(!next);
      setProblem((result.reason !== 'unknown' && PROBLEMS[result.reason]) || FALLBACK);
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className="flex flex-col gap-5 bg-carbon p-6 shadow-[0_14px_30px_-22px_var(--print)] md:p-8">
      <h2 id={`${id}-h`} className="font-display text-[2rem] uppercase leading-none text-chalk">
        Your photo
      </h2>
      <p className="text-body max-w-[52ch] text-chalk-dim">
        It goes on your pass. It stays private until you choose to show it on your page and in the member list.
      </p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/5] w-40 shrink-0 overflow-hidden bg-graphite">
          {has ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/photo/me?v=${version}`} alt="Your photo" className="size-full object-cover" />
          ) : (
            <span aria-hidden="true" className="grid size-full place-items-center px-3 text-center text-sm font-semibold text-chalk-mute">
              No photo yet
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-3">
          <label
            htmlFor={`${id}-file`}
            className={`inline-flex min-h-12 cursor-pointer items-center bg-rosso px-5 font-display text-[1.375rem] uppercase leading-none text-paper hover:bg-rosso-deep ${busy ? 'pointer-events-none opacity-60' : ''}`}
          >
            {busy === 'upload' ? 'Uploading…' : has ? 'Change photo' : 'Upload a photo'}
          </label>
          <input
            ref={input}
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload a photo"
            disabled={busy !== null}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          {hasGoogle ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void call('google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'google' }) })}
              className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk disabled:opacity-60"
            >
              {busy === 'google' ? 'Getting your photo…' : 'Use my Google photo'}
            </button>
          ) : null}
          {has ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void call('remove', { method: 'DELETE' })}
              className="inline-flex min-h-11 items-center font-semibold text-chalk-dim underline underline-offset-4 hover:text-chalk disabled:opacity-60"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>

      {has ? (
        onWall ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={shown}
              aria-labelledby={`${id}-l`}
              onClick={toggle}
              disabled={busy !== null}
              className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 transition-colors duration-200 disabled:opacity-60 ${
                shown ? 'border-rosso bg-rosso' : 'border-chalk/25 bg-graphite'
              }`}
            >
              <span className={`absolute size-6 rounded-full bg-paper shadow transition-transform duration-200 ease-pan ${shown ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span id={`${id}-l`} className="font-semibold text-chalk">
              {shown ? 'Your photo is on your page and the member list' : 'Only you can see your photo'}
            </span>
          </div>
        ) : (
          <p className="text-body max-w-[52ch] text-chalk-dim">You’re not on the member wall, so your photo stays on your own pass only.</p>
        )
      ) : null}

      <p aria-live="polite" className="min-h-5 text-sm font-semibold text-rosso-deep">
        {problem}
      </p>
    </section>
  );
}
