import type { Viewport } from 'next';
import { Brands } from '@/components/landing/Brands';
import { Directory } from '@/components/landing/Directory';
import { Faq } from '@/components/landing/Faq';
import { Hero } from '@/components/landing/Hero';
import { CodeShelf, FinalCta, HowToJoin, Inside, Manifesto, Pass } from '@/components/landing/Sections';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { StartDock } from '@/components/landing/StartDock';
import { WallHeading } from '@/components/landing/WallHeading';
import { ROLL_CALL } from '@/config/landing';
import { TOKENS } from '@/config/tokens';
import { getMemberCounts, getMemberWall } from '@/lib/wall/cached';

// The public pages are the wall: light, so the browser chrome matches it.
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

export default async function Home() {
  const [counts, wall] = await Promise.all([getMemberCounts(), getMemberWall()]);
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main">
        <Hero counts={counts} />
        <Manifesto />
        <HowToJoin />
        <Inside />
        <Pass />
        <Brands />
        <section id="roll-call" aria-labelledby="roll-call-title" className="mx-auto max-w-[90rem] px-4 py-16 md:px-10 md:py-24">
          <WallHeading id="roll-call-title" title={ROLL_CALL.title} sub={ROLL_CALL.sub} />
          <Directory wall={wall} counts={counts} limit={12} />
        </section>
        <CodeShelf />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <StartDock />
    </div>
  );
}
