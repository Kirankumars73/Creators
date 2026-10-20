import type { Metadata, Viewport } from 'next';
import { Directory } from '@/components/landing/Directory';
import { WallHeading } from '@/components/landing/WallHeading';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { SiteNav } from '@/components/landing/SiteNav';
import { Button } from '@/components/ui/Button';
import { brand } from '@/config/brand';
import { TOKENS } from '@/config/tokens';
import { getMemberCounts, getMemberWall } from '@/lib/wall/cached';

const DESCRIPTION = `Kerala's content creators, video editors and makers in ${brand.name} — find your next editor, DOP or collab.`;

export const metadata: Metadata = {
  title: 'Members',
  description: DESCRIPTION,
  openGraph: { type: 'website', locale: 'en_IN', siteName: brand.name, title: 'Members', description: DESCRIPTION },
};

// The public pages are the wall: light, so the browser chrome matches it.
export const viewport: Viewport = { themeColor: TOKENS.wall, colorScheme: 'light' };

/** Everyone on the member wall, filterable — the public members page. */
export default async function CreatorsPage() {
  const [counts, wall] = await Promise.all([getMemberCounts(), getMemberWall()]);
  return (
    <div data-surface="wall" className="limewash min-h-dvh text-chalk">
      <SiteNav />
      <main id="main" className="mx-auto max-w-[90rem] px-4 pb-28 pt-32 md:px-10 md:pt-40">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <WallHeading as="h1" id="members-title" title="Find your people" sub="Members who chose to be listed: their name, handle and room. Tap a name to open their Instagram." />
          <Button href="/join" className="self-start lg:self-auto">
            Get on the wall
          </Button>
        </div>
        <Directory wall={wall} counts={counts} />
      </main>
      <SiteFooter />
    </div>
  );
}
