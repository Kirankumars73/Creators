'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BadgeSkeleton } from './BadgeSkeleton';
import { hasWebGL2 } from './LazyInView';
import { MemberLanyard } from './MemberLanyard';

/** The badge's card is 1.6 wide by 2.25 tall. */
const CARD_RATIO = 1.6 / 2.25;

type Geometry = { anchor: number; size: number };
type Phase = 'loading' | 'ready' | 'plain';

/** Loads the badge's picture (same request the badge itself makes, so it is reused) and decodes it. */
function preloadPicture(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => resolve(); // the badge copes with a missing picture; don't hold the page up
    img.src = src;
  });
}

/**
 * The member's badge hanging from the very top of the page, free to swing across the whole
 * window, behind everything else. It is drawn into `#badge-layer`, a full-window layer at the
 * page root, so nothing narrower (the content column) can clip it. Where it hangs is measured
 * from this column: on a wide screen it hangs over the spacer beside the name, sized to fit it,
 * so at rest it never touches the text; on a phone it hangs in the middle.
 *
 * It only appears once everything it needs is loaded (its picture and the 3D code), so it never
 * pops in half-built. Until then the column shows a placeholder card; without WebGL it shows
 * `fallback`, the plain portrait card.
 */
export function HangingBadge({ instagram, role, fallback }: { instagram: string; role: Parameters<typeof MemberLanyard>[0]['role']; fallback: ReactNode }) {
  const spacer = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  // Once the badge is on screen, give it a moment to draw its first frames before the page lets go.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let dead = false;
    void (async () => {
      await null; // state is set from here on, never during the effect itself
      if (dead) return;
      if (!hasWebGL2()) return setPhase('plain');
      setLayer(document.getElementById('badge-layer'));
      // Fetch the picture and the 3D code together; show the badge only when both are here.
      await Promise.all([preloadPicture(`/api/pass/by/${instagram}?style=badge`), import('@/components/bits/Lanyard')]);
      if (!dead) setPhase('ready');
    })();
    return () => {
      dead = true;
    };
  }, [instagram]);

  useEffect(() => {
    const box = spacer.current;
    if (!layer || !box) return;
    const measure = () => {
      const l = layer.getBoundingClientRect();
      const r = box.getBoundingClientRect();
      const wide = window.innerWidth >= 1024;
      // A card as tall as the column is wide allows, but never huge; on a phone, most of the width.
      const cardHeight = wide ? Math.min(470, (r.width / CARD_RATIO) * 0.92) : Math.min(400, (l.width * 0.72) / CARD_RATIO);
      setGeo({ anchor: wide ? (r.left + r.width / 2 - l.left) / l.width : 0.5, size: Math.min(0.9, cardHeight / l.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(layer);
    return () => ro.disconnect();
  }, [layer]);

  const live = phase === 'ready' && !!layer && !!geo;
  useEffect(() => {
    if (!live) return;
    const t = window.setTimeout(() => setSettled(true), 450);
    return () => window.clearTimeout(t);
  }, [live]);
  // The loading screen waits while this mark is on the page (it is in the server HTML, so it is
  // there from the first paint): until the badge is drawn, or we know it won't be (no WebGL).
  const holding = phase !== 'plain' && !settled;
  return (
    <div ref={spacer} data-page-hold={holding ? "" : undefined} className="min-h-[30rem] lg:min-h-[34rem]">
      {live ? null : phase === 'plain' ? fallback : <BadgeSkeleton role={role} />}
      {live ? createPortal(<MemberLanyard instagram={instagram} role={role} anchor={geo.anchor} size={geo.size} />, layer) : null}
    </div>
  );
}
