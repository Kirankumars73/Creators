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
      intensity={0.45}
      scale={1.3}
      frame={3.5}
      glare={0.8}
      tiltMax={29}
      edgeSparkle={0.9}
      hoverScale={1.03}
      radius={9}
      width={310}
    />
  );
}
