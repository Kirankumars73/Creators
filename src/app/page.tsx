import { CodeTeaser } from '@/components/film/CodeTeaser';
import { EndCredits } from '@/components/film/EndCredits';
import { Hero } from '@/components/film/Hero';
import { Inside } from '@/components/film/Inside';
import { JoinGate } from '@/components/film/JoinGate';
import { RollCall } from '@/components/film/RollCall';
import { TheRoom } from '@/components/film/TheRoom';
import { ScrollFilm } from '@/components/film/ScrollFilm';
import { WhosInside } from '@/components/film/WhosInside';
import { GateWeave } from '@/components/texture/GateWeave';

export default function Home() {
  return (
    <ScrollFilm>
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
    </ScrollFilm>
  );
}
