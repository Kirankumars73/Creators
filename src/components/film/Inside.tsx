import { ClipBlock } from '@/components/brand/ClipBlock';
import { sectionTitle } from './sections';

// §6.6 — four rituals, laid out as clips on a stacked timeline.
const RITUALS = [
  { track: 'V1', name: 'WEEKLY DROP', copy: 'Everyone posts what they shipped. Nobody scrolls past.', width: 'md:w-[78%]' },
  { track: 'V2', name: 'THE CUT ROOM', copy: 'Put up a rough cut, get it torn apart kindly.', width: 'md:w-[64%] md:ml-[12%]' },
  { track: 'A1', name: 'LOOKING FOR', copy: 'Creators needing editors, editors needing work. One thread, one format.', width: 'md:w-[70%] md:ml-[24%]' },
  { track: 'A2', name: 'GEAR & GRIEF', copy: "What you bought, what broke, what you'd never buy again.", width: 'md:w-[56%] md:ml-[8%]' },
] as const;

export function Inside() {
  return (
    <section id="inside" className="relative px-4 py-28 md:px-10 md:py-40">
      <h2 className="text-label text-chalk-mute">{sectionTitle('inside')}</h2>
      <ol className="mt-12 flex flex-col border-y border-rule">
        {RITUALS.map((r) => (
          <li key={r.name} className="flex gap-3 border-b border-rule py-4 last:border-b-0 md:gap-6">
            <span className="text-label w-8 shrink-0 pt-2 text-chalk-mute">{r.track}</span>
            <div className={`flex w-full flex-col gap-3 ${r.width}`}>
              <ClipBlock label={r.name} />
              <p className="text-body text-chalk-dim">{r.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
