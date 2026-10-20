import type { Viewport } from 'next';
import Link from 'next/link';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { Button } from '@/components/ui/Button';
import { TOKENS } from '@/config/tokens';

export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export default function NotFound() {
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto flex min-h-[70dvh] max-w-[90rem] flex-col items-start justify-center gap-6 px-4 pb-16 pt-32 md:px-10">
        <p className="font-display text-[clamp(7rem,28vw,20rem)] leading-[0.8] text-rosso">404</p>
        <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-[0.94] tracking-[-0.01em]">Cut. This frame isn’t in the film.</h1>
        <p className="text-body max-w-[46ch] text-chalk-dim">That page doesn’t exist, or it moved. Head back to the start.</p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Button href="/">Back to the start</Button>
          <Link href="/creators" className="wall-link inline-flex min-h-11 items-center font-display text-[1.5rem] uppercase">
            See the members
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
