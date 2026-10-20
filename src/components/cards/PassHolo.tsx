'use client';

import dynamic from 'next/dynamic';
import type { Lane } from '@/config/brand';

const HoloCard = dynamic(() => import('@/components/bits/HoloCard'), { ssr: false });

/** A pass image as a collectible card: real holographic foil that sparkles as it tilts. */
export function PassHolo({ src, alt, lane }: { src: string; alt: string; lane?: Lane }) {
  return (
    <HoloCard
      image={src}
      alt={alt}
      preset={lane === 'editor' ? 'stars' : lane === 'other' ? 'swirl' : 'bursts'}
      intensity={0.5}
      scale={1.4}
      frame={3.5}
      glare={0.65}
      tiltMax={29}
      edgeSparkle={0.85}
      hoverScale={1.03}
      radius={9}
      width={310}
    />
  );
}
