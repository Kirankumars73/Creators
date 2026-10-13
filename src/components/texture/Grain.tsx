'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion/reduced-motion';

const TILE = 128;
const FRAMES = 6;
const FPS = 12; // real grain is chunky — and 12fps leaves the frame budget alone (§4.3, §10.5)

/**
 * Film grain (§4.3): six noise tiles generated once, drawn as a pattern at a random
 * offset 12 times a second. DPR is pinned to 1 so phones paint 1/9th the pixels — and the
 * grain gets chunkier, which is the point. Gone entirely under reduced motion.
 */
export function Grain() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const patterns = Array.from({ length: FRAMES }, () => {
      const tile = document.createElement('canvas');
      tile.width = tile.height = TILE;
      const t = tile.getContext('2d')!;
      const img = t.createImageData(TILE, TILE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      t.putImageData(img, 0, 0);
      return ctx.createPattern(tile, 'repeat')!;
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = 0;
    let frame = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (document.hidden || t - last < 1000 / FPS) return;
      last = t;
      frame = (frame + 1) % FRAMES;
      ctx.save();
      ctx.translate(-Math.random() * TILE, -Math.random() * TILE);
      ctx.fillStyle = patterns[frame]!;
      ctx.fillRect(0, 0, canvas.width + TILE, canvas.height + TILE);
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <canvas
      ref={ref}
      data-grain=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.045] mix-blend-overlay"
    />
  );
}
