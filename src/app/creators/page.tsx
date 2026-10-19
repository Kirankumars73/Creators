import type { Metadata } from 'next';
import { Directory } from '@/components/landing/Directory';
import { SectionHead } from '@/components/landing/SectionHead';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { getMemberCounts, getMemberWall } from '@/lib/wall/cached';

const DESCRIPTION = `Kerala's content creators, video editors and makers in ${brand.name} — find your next editor, DOP or collab.`;

export const metadata: Metadata = {
  title: 'Directory',
  description: DESCRIPTION,
  openGraph: { type: 'website', locale: 'en_IN', siteName: brand.name, title: 'Directory', description: DESCRIPTION },
};

/** Everyone on the member wall, filterable — the public "find creators" page. */
export default async function CreatorsPage() {
  const [counts, wall] = await Promise.all([getMemberCounts(), getMemberWall()]);
  return (
    <>
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-28 pt-32 md:px-10 md:pt-40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead as="h1" eyebrow="Directory" title={['FIND YOUR', 'PEOPLE.']} accent={1} sub="Members who chose to be seen: their name, their handle, their lane. Tap one to open their Instagram." />
          <Button href="/join" className="self-start lg:self-auto">
            Get on the wall
          </Button>
        </div>
        <Directory wall={wall} counts={counts} />
      </main>
      <SiteFooter />
    </>
  );
}
