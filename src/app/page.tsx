import { ScrollFilm } from '@/components/film/ScrollFilm';
import { ClickSpark } from '@/components/fx/ClickSpark';
import { PointerFx } from '@/components/fx/PointerFx';
import { Brands } from '@/components/landing/Brands';
import { CodeShelf } from '@/components/landing/CodeShelf';
import { CraftTicker } from '@/components/landing/CraftTicker';
import { Directory } from '@/components/landing/Directory';
import { Faq } from '@/components/landing/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Hub } from '@/components/landing/Hub';
import { InsideBento } from '@/components/landing/InsideBento';
import { Lanes } from '@/components/landing/Lanes';
import { Manifesto } from '@/components/landing/Manifesto';
import { PassShowcase } from '@/components/landing/PassShowcase';
import { SectionHead } from '@/components/landing/SectionHead';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { StartDock } from '@/components/landing/StartDock';
import { Stats } from '@/components/landing/Stats';
import { ROLL_CALL, sectionEyebrow } from '@/config/landing';
import { getMemberCounts, getMemberWall } from '@/lib/wall/cached';

export default async function Home() {
  const [counts, wall] = await Promise.all([getMemberCounts(), getMemberWall()]);
  return (
    <ScrollFilm>
      <SiteNav />
      <main id="main">
        <Hero counts={counts} wall={wall} />
        <CraftTicker />
        <Manifesto />
        <Stats counts={counts} />
        <Lanes />
        <HowItWorks />
        <InsideBento />
        <Hub />
        <PassShowcase />
        <Brands />
        <section id="roll-call" aria-labelledby="roll-call-title" className="relative mx-auto max-w-[90rem] px-4 py-24 md:px-10 md:py-36">
          <SectionHead id="roll-call-title" eyebrow={sectionEyebrow('roll-call')} title={ROLL_CALL.title} accent={1} sub={ROLL_CALL.sub} />
          <Directory wall={wall} counts={counts} limit={12} />
        </section>
        <CodeShelf />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <StartDock />
      <PointerFx />
      <ClickSpark />
    </ScrollFilm>
  );
}
