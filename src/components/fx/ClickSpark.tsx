'use client';

import { useEffect, useRef } from 'react';

const SPARKS = 8;
const DURATION = 420;
const RADIUS = 22;

/**
 * A burst of mustard sparks wherever someone clicks (after React Bits' ClickSpark). One fixed,
 * click-through canvas; it only draws while a burst is alive. Off under reduced motion.
 */
export function ClickSpark() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--mustard').trim() || 'yellow';
    const bursts: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i]!;
        const p = (now - b.t) / DURATION;
        if (p >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const eased = 1 - (1 - p) ** 3;
        const dist = eased * RADIUS;
        const len = 9 * (1 - eased);
        for (let s = 0; s < SPARKS; s++) {
          const a = (Math.PI * 2 * s) / SPARKS;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a) * dist, b.y + Math.sin(a) * dist);
          ctx.lineTo(b.x + Math.cos(a) * (dist + len), b.y + Math.sin(a) * (dist + len));
          ctx.stroke();
        }
      }
      raf = bursts.length ? requestAnimationFrame(draw) : 0;
    };

    const onClick = (e: MouseEvent) => {
      bursts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
}
