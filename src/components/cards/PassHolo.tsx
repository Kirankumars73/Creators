'use client';

import dynamic from 'next/dynamic';
import type { Lane } from '@/config/brand';

const HoloCard = dynamic(() => import('@/components/bits/HoloCard'), { ssr: false });

/** A card as a collectible: real holographic foil that sparkles as it tilts, kept light so the words still read. */
export function PassHolo({ src, alt, lane }: { src: string; alt: string; lane?: Lane }) {
  return (
    <HoloCard
      image={src}
      alt={alt}
      preset={lane === 'editor' ? 'glitter' : lane === 'other' ? 'cosmos' : 'shards'}
      intensity={0.11}
      scale={1.6}
      frame={3.5}
      glare={0.25}
      tiltMax={29}
      edgeSparkle={0.12}
      hoverScale={1.03}
      radius={9}
      width={310}
    />
  );
}
