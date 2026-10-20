'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { PHOTO_PROBLEMS, type JoinPhoto } from '@/lib/photos/client';

const MAX_BYTES = 6 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type PhotoPickerProps = {
  value: JoinPhoto | null;
  onChange(next: JoinPhoto | null): void;
  /** The signed-in account's Google photo, if it has one (their own, shown back to them). */
  googlePhotoUrl: string | null;
  /** They're on the member wall, so "show my photo" makes sense. */
  canShow: boolean;
};

/**
 * The optional photo in the join form. A photo can't be stored until the member record exists,
 * so this only *remembers the choice*; the join flow uploads it right after the record is saved.
 * It starts private: showing it on the member page and list is a separate, unticked box.
 */
export function PhotoPicker({ value, onChange, googlePhotoUrl, canShow }: PhotoPickerProps) {
  const id = useId();
  const [problem, setProblem] = useState<string | null>(null);

  const file = value?.choice.kind === 'file' ? value.choice.file : null;
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const src = preview ?? (value?.choice.kind === 'google' ? googlePhotoUrl : null);

  function onFile(picked: File | undefined) {
    if (!picked) return;
    if (!TYPES.has(picked.type)) return setProblem(PHOTO_PROBLEMS.not_an_image!);
    if (picked.size > MAX_BYTES) return setProblem(PHOTO_PROBLEMS.too_big!);
    setProblem(null);
    onChange({ choice: { kind: 'file', file: picked }, show: value?.show ?? false });
  }

  return (
    <div className="flex flex-col gap-3">
      <span id={`${id}-l`} className="text-label text-chalk-dim">
        Photo (optional)
      </span>
      <div className="flex items-start gap-4">
        <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-graphite sm:w-28">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="Your photo" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span aria-hidden="true" className="grid size-full place-items-center px-2 text-center text-xs font-semibold text-chalk-mute">
              For your pass
            </span>
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <label htmlFor={`${id}-file`} className="inline-flex min-h-11 cursor-pointer items-center border-2 border-chalk px-4 font-display text-[1.25rem] uppercase leading-none text-chalk hover:bg-chalk hover:text-surface">
            {src ? 'Change photo' : 'Add a photo'}
          </label>
          <input
            id={`${id}-file`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Add a photo"
            className="sr-only"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = ''; // choosing the same file again should still register
            }}
          />
          {googlePhotoUrl ? (
            <button type="button" onClick={() => (setProblem(null), onChange({ choice: { kind: 'google' }, show: value?.show ?? false }))} className="wall-link inline-flex min-h-11 items-center font-semibold text-chalk">
              Use my Google photo
            </button>
          ) : null}
          {value ? (
            <button type="button" onClick={() => (setProblem(null), onChange(null))} className="inline-flex min-h-11 items-center font-semibold text-chalk-dim underline underline-offset-4 hover:text-chalk">
              Remove photo
            </button>
          ) : null}
        </div>
      </div>

      {value ? (
        canShow ? (
          <Checkbox
            label={
              <>
                Show my photo on my page and in the member list
                <span className="mt-1 block text-[0.875rem] font-medium text-chalk-dim">Off, only you see it. It still goes on your own pass.</span>
              </>
            }
            checked={value.show}
            onChange={(show) => onChange({ ...value, show })}
          />
        ) : (
          <p className="text-[0.875rem] font-medium text-chalk-dim">You’re not on the member wall, so your photo stays on your own pass.</p>
        )
      ) : null}

      <p aria-live="polite" className="min-h-4 text-[0.875rem] font-semibold text-rosso-deep">
        {problem}
      </p>
    </div>
  );
}
