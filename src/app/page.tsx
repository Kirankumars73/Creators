import { CodeTeaser } from '@/components/film/CodeTeaser';
import { EndCredits } from '@/components/film/EndCredits';
import { Hero } from '@/components/film/Hero';
import { Inside } from '@/components/film/Inside';
import { JoinGate } from '@/components/film/JoinGate';
import { RollCall } from '@/components/film/RollCall';
import { TheRoom } from '@/components/film/TheRoom';
import { WhosInside } from '@/components/film/WhosInside';

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TheRoom />
        <WhosInside />
        <CodeTeaser />
        <Inside />
        <RollCall />
        <JoinGate />
      </main>
      <EndCredits />
    </>
  );
}
