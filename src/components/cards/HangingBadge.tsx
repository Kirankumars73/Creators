'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { hasWebGL2 } from './LazyInView';
import { MemberLanyard } from './MemberLanyard';

/** The badge's card is 1.6 wide by 2.25 tall. */
const CARD_RATIO = 1.6 / 2.25;

type Geometry = { anchor: number; size: number };

/**
 * The member's badge hanging from the very top of the page, free to swing across the whole
 * window, behind everything else. It is drawn into `#badge-layer`, a full-window layer at the
 * page root, so nothing narrower (the content column) can clip it. Where it hangs is measured
 * from this column: on a wide screen it hangs over the spacer beside the name, sized to fit it,
 * so at rest it never touches the text; on a phone it hangs in the middle. Until it is ready, and
 * without WebGL, the column shows `fallback`: the plain portrait card.
 */
export function HangingBadge({ instagram, role, fallback }: { instagram: string; role: Parameters<typeof MemberLanyard>[0]['role']; fallback: ReactNode }) {
  const spacer = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);

  useEffect(() => {
    if (!hasWebGL2()) return;
    // After the first paint, so the three.js download never competes with the headline.
    const t = window.setTimeout(() => setLayer(document.getElementById('badge-layer')), 250);
    return () => window.clearTimeout(t);
  }, []);

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

  const live = !!layer && !!geo;
  return (
    <div ref={spacer} className="min-h-[30rem] lg:min-h-[34rem]">
      {live ? null : fallback}
      {live ? createPortal(<MemberLanyard instagram={instagram} role={role} anchor={geo.anchor} size={geo.size} />, layer) : null}
    </div>
  );
}
