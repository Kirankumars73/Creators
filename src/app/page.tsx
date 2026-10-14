import { CodeTeaser } from '@/components/film/CodeTeaser';
import { EndCredits } from '@/components/film/EndCredits';
import { Hero } from '@/components/film/Hero';
import { Inside } from '@/components/film/Inside';
import { JoinGate } from '@/components/film/JoinGate';
import { RollCall } from '@/components/film/RollCall';
import { TheRoom } from '@/components/film/TheRoom';
import { ScrollFilm } from '@/components/film/ScrollFilm';
import { Scrubber } from '@/components/film/Scrubber';
import { WhosInside } from '@/components/film/WhosInside';
import { getMemberCounts, getMemberWall } from '@/lib/wall/cached';

export default async function Home() {
  const [counts, wall] = await Promise.all([getMemberCounts(), getMemberWall()]);
  return (
    <ScrollFilm>
      <Scrubber />
      <main>
        <Hero counts={counts} />
        <TheRoom />
        <WhosInside />
        <CodeTeaser />
        <Inside />
        <RollCall wall={wall} counts={counts} />
        <JoinGate />
      </main>
      <EndCredits />
      {/* Room for the scrubber so it never sits on the last line of the credits. */}
      <div aria-hidden="true" className="h-10 md:h-14" />
    </ScrollFilm>
  );
}
