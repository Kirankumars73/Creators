'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';

/**
 * §7: the lane-colored pass, straight into a story where the phone allows it, else a download.
 * The PNG is fetched when the button mounts, so the tap spends its user gesture on share()
 * itself (iOS refuses share() after an awaited fetch). Only a closed share sheet is quiet;
 * any other refusal falls back to the download.
 */
export function SavePassButton({ instagram }: { instagram: string | null }) {
  const [state, setState] = useState<'idle' | 'working' | 'failed'>('idle');
  const pass = useRef<Promise<Blob> | null>(null);
  const name = instagram ? `kootam-pass-${instagram}.png` : 'kootam-pass.png';

  const load = () =>
    fetch('/api/pass/me', { cache: 'no-store' }).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.blob();
    });

  useEffect(() => {
    const p = load();
    p.catch(() => {
      // retried on tap
    });
    pass.current = p;
  }, []);

  function download(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    // Revoking straight after click() can cancel the download in Safari.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function save() {
    setState('working');
    try {
      const blob = await (pass.current ?? load()).catch(() => (pass.current = load()));
      const file = new File([blob], name, { type: 'image/png' });
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: brand.name });
        } catch (err) {
          if (!(err instanceof DOMException && err.name === 'AbortError')) download(blob);
        }
      } else {
        download(blob);
      }
      setState('idle');
    } catch {
      setState('failed');
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="ghost" onClick={save} disabled={state === 'working'} aria-busy={state === 'working'}>
        Save my pass
      </Button>
      {state === 'failed' ? (
        <p role="alert" className="font-mono text-sm text-chalk">
          Couldn’t render your pass. Try again in a moment.
        </p>
      ) : (
        <p className="font-mono text-[0.8125rem] text-chalk-dim">Story-sized. Post it, tag the room.</p>
      )}
    </div>
  );
}
