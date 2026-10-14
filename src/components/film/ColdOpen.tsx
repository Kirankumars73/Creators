'use client';

import { useEffect, useRef, useState } from 'react';
import { SlateStripes } from '@/components/brand/SlateStripes';
import { brand } from '@/config/brand';
import { MlMark } from '@/components/brand/MlMark';
import { formatTimecode } from '@/lib/timecode';

const END_FRAME = 37; // 00:00:01:12 at 25fps (§6.0)
const HARD_CAP_MS = 1600;

/**
 * §6.0 — the slate. First visit only (a pre-paint script hides it on repeat visits and under
 * reduced motion). The whole sequence is CSS keyframes on transform/opacity; JS only ticks
 * the timecode and removes the overlay at the 1.6s hard cap. The hero renders underneath
 * from the first byte — nothing waits on this.
 */
export function ColdOpen() {
  const [gone, setGone] = useState(false);
  const timecode = useRef<HTMLSpanElement>(null);

  // The intro (slate + headline wipe) happens once. Mark it done on <html> when its time is
  // up — or the moment the visitor leaves the page — so a client-side return to `/` (Next keeps
  // the route alive and re-shows it, which restarts CSS animations) never replays it.
  useEffect(() => {
    const html = document.documentElement;
    const finish = () => html.classList.add('no-cold-open', 'intro-done');
    const done = setTimeout(finish, html.classList.contains('no-cold-open') ? 900 : 2200);
    return () => {
      clearTimeout(done);
      finish();
    };
  }, []);

  useEffect(() => {
    if (document.documentElement.classList.contains('no-cold-open')) return;
    try {
      sessionStorage.setItem('ck:cold-open', '1');
    } catch {
      // blocked storage: it may play again next time, which is fine
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const frame = Math.min(END_FRAME, Math.floor((now - start) / 40));
      if (timecode.current) timecode.current.textContent = formatTimecode(frame);
      if (frame < END_FRAME) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const cap = setTimeout(() => setGone(true), HARD_CAP_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cap);
    };
  }, []);

  if (gone) return null;
  const lines: [string, React.ReactNode][] = [
    ['PROD.', <>CREATORS <MlMark mlKey="wordmark" className="text-[1.25em]" /></>],
    ['SCENE', '01    TAKE 01'],
    ['ROLL', `${brand.region} / ${brand.year}`],
  ];

  return (
    <div data-cold-open="" aria-hidden="true" className="cold-open fixed inset-0 z-[55]">
      <div className="co-half co-top" />
      <div className="co-half co-bottom" />
      <div className="co-flash absolute inset-0 bg-chalk" />
      <div className="co-slate absolute inset-0 grid place-items-center px-6">
        <div className="w-full max-w-sm">
          <div className="co-arm">
            <SlateStripes className="h-9 border-2 border-chalk" band={18} />
          </div>
          <SlateStripes className="h-9 border-x-2 border-chalk" band={18} />
          <dl className="border-2 border-chalk bg-ink p-5 font-mono text-sm uppercase tracking-[0.14em] text-chalk">
            {lines.map(([k, v], i) => (
              <div key={k} className="co-line flex gap-4 py-1" style={{ animationDelay: `${120 + i * 170}ms` }}>
                <dt className="w-16 shrink-0 text-chalk-dim">{k}</dt>
                <dd className="whitespace-pre">{v}</dd>
              </div>
            ))}
            <p className="mt-4 border-t border-rule pt-3 text-right tabular-nums text-chalk-dim">
              <span ref={timecode}>{formatTimecode(0)}</span>
            </p>
          </dl>
        </div>
      </div>
    </div>
  );
}
