'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

/** §7: the lane-colored pass, straight into a story where the phone allows it, else a download. */
export function SavePassButton({ instagram }: { instagram: string | null }) {
  const [state, setState] = useState<'idle' | 'working' | 'failed'>('idle');
  const name = instagram ? `kootam-pass-${instagram}.png` : 'kootam-pass.png';

  async function save() {
    setState('working');
    try {
      const res = await fetch('/api/pass/me', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], name, { type: 'image/png' });
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Creators Kootam' }).catch(() => {
          // dismissed share sheet: not an error
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
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
