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
import { GateWeave } from '@/components/texture/GateWeave';

export default function Home() {
  return (
    <ScrollFilm>
      {/* Fixed layers sit outside <main>: the gate-weave transform would otherwise trap them. */}
      <Scrubber />
      <GateWeave>
        <Hero />
        <TheRoom />
        <WhosInside />
        <CodeTeaser />
        <Inside />
        <RollCall />
        <JoinGate />
      </GateWeave>
      <EndCredits />
      {/* Room for the scrubber so it never sits on the last line of the credits. */}
      <div aria-hidden="true" className="h-10 md:h-14" />
    </ScrollFilm>
  );
}
