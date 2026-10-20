'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from 'react';
import { CROP_OUT, MAX_ZOOM, clampView, cropRect, initialView, type CropView } from '@/lib/photos/crop';

type PhotoCropperProps = {
  file: File;
  /** The photo cropped to 4:5 and re-encoded, ready to send. */
  onDone(cropped: File): void;
  onCancel(): void;
};

const FRAME_W = 320; // CSS px of the preview; the canvas is drawn at 2x for sharpness

/**
 * Asks how a photo should be framed before it goes anywhere: drag to move it, pinch, scroll or
 * use the slider to zoom. Every photo is kept and shown as 4:5, so this is where they choose which
 * part of it that is, rather than leaving it to a guess.
 */
export function PhotoCropper({ file, onDone, onCancel }: PhotoCropperProps) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState<CropView>({ zoom: 1, cx: 0.5, cy: 0.4 });
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        if (dead) return bitmap.close();
        bitmapRef.current = bitmap;
        setView(initialView(bitmap.width, bitmap.height));
        setReady(true);
      } catch {
        if (!dead) setFailed(true);
      }
    })();
    return () => {
      dead = true;
      bitmapRef.current?.close();
      bitmapRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    const bmp = bitmapRef.current;
    const el = canvas.current;
    if (!ready || !bmp || !el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const r = cropRect(bmp.width, bmp.height, view);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bmp, r.x, r.y, r.w, r.h, 0, 0, el.width, el.height);
  }, [ready, view]);

  // Keep the page behind still while the dialog is open, and give focus back when it closes.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('input, button')?.focus();
    return () => {
      document.documentElement.style.overflow = '';
      opener?.focus?.();
    };
  }, []);

  const update = useCallback((next: Partial<CropView>) => {
    const bmp = bitmapRef.current;
    if (!bmp) return;
    setView((v) => clampView(bmp.width, bmp.height, { ...v, ...next }));
  }, []);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a!.x - b!.x, a!.y - b!.y), zoom: viewRef.current.zoom };
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const prev = pointers.current.get(e.pointerId);
    const bmp = bitmapRef.current;
    if (!prev || !bmp) return;
    const now = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, now);
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      update({ zoom: pinch.current.zoom * (dist / Math.max(1, pinch.current.dist)) });
      return;
    }
    // One finger or the mouse: the photo follows it, so the crop window moves the other way.
    const r = cropRect(bmp.width, bmp.height, viewRef.current);
    const frame = e.currentTarget.getBoundingClientRect();
    const k = r.w / frame.width; // photo pixels per screen pixel
    update({ cx: viewRef.current.cx - ((now.x - prev.x) * k) / bmp.width, cy: viewRef.current.cy - ((now.y - prev.y) * k) / bmp.height });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    update({ zoom: viewRef.current.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08) });
  }

  function onFrameKey(e: KeyboardEvent<HTMLDivElement>) {
    const bmp = bitmapRef.current;
    if (!bmp) return;
    const r = cropRect(bmp.width, bmp.height, viewRef.current);
    const stepX = (r.w * 0.06) / bmp.width;
    const stepY = (r.h * 0.06) / bmp.height;
    const v = viewRef.current;
    if (e.key === 'ArrowLeft') update({ cx: v.cx - stepX });
    else if (e.key === 'ArrowRight') update({ cx: v.cx + stepX });
    else if (e.key === 'ArrowUp') update({ cy: v.cy - stepY });
    else if (e.key === 'ArrowDown') update({ cy: v.cy + stepY });
    else if (e.key === '+' || e.key === '=') update({ zoom: v.zoom * 1.1 });
    else if (e.key === '-') update({ zoom: v.zoom / 1.1 });
    else return;
    e.preventDefault();
  }

  async function finish() {
    const bmp = bitmapRef.current;
    if (!bmp) return;
    const out = document.createElement('canvas');
    out.width = CROP_OUT.width;
    out.height = CROP_OUT.height;
    const ctx = out.getContext('2d');
    if (!ctx) return onCancel();
    ctx.imageSmoothingQuality = 'high';
    const r = cropRect(bmp.width, bmp.height, viewRef.current);
    ctx.drawImage(bmp, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/jpeg', 0.9));
    if (blob) onDone(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
    else onCancel();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
      return;
    }
    if (e.key !== 'Tab') return;
    const els = [...(panel.current?.querySelectorAll<HTMLElement>('input, button, [tabindex="0"]') ?? [])].filter((x) => !x.hasAttribute('disabled'));
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  return (
    <div data-surface="wall" data-lenis-prevent="" className="fixed inset-0 z-[95] grid place-items-center overflow-y-auto bg-print/70 p-4 backdrop-blur-sm" onKeyDown={onKeyDown}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`${id}-t`} className="flex w-full max-w-[26rem] flex-col gap-4 bg-carbon p-5 text-chalk shadow-2xl sm:p-6">
        <h2 id={`${id}-t`} className="font-display text-[1.75rem] uppercase leading-none">
          Frame your photo
        </h2>
        {failed ? (
          <p className="text-body text-chalk-dim">We couldn’t open that picture. Pick a jpeg, png or webp photo.</p>
        ) : (
          <>
            <p className="text-sm text-chalk-dim">Drag to move it. Pinch, scroll or use the slider to zoom. This is how it will look everywhere.</p>
            <div
              role="group"
              aria-label="Photo frame. Arrow keys move the photo, plus and minus zoom."
              tabIndex={0}
              onKeyDown={onFrameKey}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              style={{ touchAction: 'none', width: `min(${FRAME_W}px, 100%)` }}
              className="relative mx-auto aspect-[4/5] cursor-grab touch-none overflow-hidden bg-graphite outline-offset-4 active:cursor-grabbing"
            >
              <canvas ref={canvas} width={FRAME_W * 2} height={FRAME_W * 2.5} className="size-full" aria-hidden="true" />
              {/* The thirds, as a guide for placing a face. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,transparent_33%,rgb(255_255_255/0.35)_33%,rgb(255_255_255/0.35)_calc(33%+1px),transparent_calc(33%+1px),transparent_66%,rgb(255_255_255/0.35)_66%,rgb(255_255_255/0.35)_calc(66%+1px),transparent_calc(66%+1px)),linear-gradient(to_bottom,transparent_33%,rgb(255_255_255/0.35)_33%,rgb(255_255_255/0.35)_calc(33%+1px),transparent_calc(33%+1px),transparent_66%,rgb(255_255_255/0.35)_66%,rgb(255_255_255/0.35)_calc(66%+1px),transparent_calc(66%+1px))]" />
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold">
              Zoom
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={view.zoom}
                onChange={(e) => update({ zoom: Number(e.target.value) })}
                className="h-11 flex-1 accent-[var(--rosso)]"
              />
            </label>
          </>
        )}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="inline-flex min-h-11 items-center px-3 font-semibold text-chalk-dim underline underline-offset-4 hover:text-chalk">
            Cancel
          </button>
          {failed ? null : (
            <button
              type="button"
              disabled={!ready}
              onClick={() => void finish()}
              className="inline-flex min-h-11 items-center bg-rosso px-5 font-display text-[1.375rem] uppercase leading-none text-paper hover:bg-rosso-deep disabled:opacity-50"
            >
              Use this photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
