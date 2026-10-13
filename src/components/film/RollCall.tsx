import { sectionTitle } from './sections';

export function RollCall() {
  return (
    <section id="roll-call" className="relative px-4 py-28 md:px-10 md:py-40">
      <h2 className="text-label text-chalk-mute">{sectionTitle('roll-call')}</h2>
      <p className="mt-12 max-w-2xl font-mono text-base leading-relaxed text-chalk">
        ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.
      </p>
    </section>
  );
}
