import { RevealOnScroll } from './RevealOnScroll';
import { SectionCard } from './SectionCard';
import { sectionTitle } from './sections';

// §6.3 — his grievance, stated plainly. The typography is the design.
const LINES = [
  { text: 'Creators burn out making everything alone.', tone: 'text-chalk' },
  { text: 'Editors get cropped out of the credits.', tone: 'text-rosso' },
  { text: "Everyone's shooting. Nobody's talking to each other.", tone: 'text-chalk' },
] as const;

export function TheRoom() {
  return (
    <section id="the-room" className="relative px-4 py-28 md:px-10 md:py-40">
      <SectionCard id="the-room" />
      <h2 className="text-label text-chalk-mute">{sectionTitle('the-room')}</h2>
      <RevealOnScroll className="text-subhead mt-12 flex max-w-4xl flex-col gap-5">
        {LINES.map((l) => (
          <p key={l.text} data-reveal="" className={l.tone}>
            {l.text}
          </p>
        ))}
        <p data-reveal="" className="mt-8 text-rosso">
          So we made a room.
        </p>
      </RevealOnScroll>
    </section>
  );
}
