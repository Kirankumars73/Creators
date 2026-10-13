'use client';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { ClipBlock } from '@/components/brand/ClipBlock';
import { activeIndex, clipFractions } from '@/lib/film/scrub';
import { formatTimecode } from '@/lib/timecode';
import { useScrollFilm } from './ScrollFilm';
import { SECTIONS } from './sections';

/**
 * §6.2 — the NLE timeline at the bottom of the screen is the site's only navigation.
 * Clips are real buttons; the playhead is moved with transforms straight from ScrollTrigger,
 * so scrolling never re-renders React per frame.
 */
export function Scrubber() {
  const film = useScrollFilm();
  const [fractions, setFractions] = useState<number[]>(() => SECTIONS.map(() => 1 / SECTIONS.length));
  const [startFrames, setStartFrames] = useState<number[]>(() => SECTIONS.map(() => 0));
  const [active, setActive] = useState(0);
  const [measured, setMeasured] = useState(false);
  const tops = useRef<number[]>([]);
  const playhead = useRef<HTMLDivElement>(null);
  const hairline = useRef<HTMLDivElement>(null);

  // Measure section lengths whenever the page reflows (fonts landing, viewport changes).
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const els = SECTIONS.map((s) => document.getElementById(s.id));
      tops.current = els.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : 0));
      setFractions(clipFractions(els.map((el) => el?.offsetHeight ?? 0), 0.09));
      // "Timecode" of a section = how many screens in it starts, at 25 frames a screen.
      setStartFrames(tops.current.map((top) => Math.round((top / window.innerHeight) * 25)));
      setMeasured(true);
    });
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    film.add(() => {
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (playhead.current) playhead.current.style.transform = `translateX(${self.progress * 100}%)`;
          if (hairline.current) hairline.current.style.transform = `scaleX(${self.progress})`;
          const idx = activeIndex(window.scrollY + window.innerHeight * 0.35, tops.current);
          setActive((prev) => (prev === idx ? prev : idx));
        },
      });
    });
  }, [film]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden border-t border-rule bg-carbon/90 backdrop-blur-[12px]"
    >
      {/* Invisible until measured: clips resizing from equal widths would count as layout shift. */}
      <div className={`relative hidden h-14 items-center gap-px px-2 md:flex ${measured ? '' : 'invisible'}`}>
        {SECTIONS.map((s, i) => (
          <div key={s.id} className="group relative flex min-w-0 items-center" style={{ flexBasis: `${(fractions[i] ?? 0) * 100}%` }}>
            <ClipBlock
              as="button"
              label={`${s.n} ${s.label}`}
              active={i === active}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => film.scrollTo(s.id)}
              className="h-10 w-full text-left hover:opacity-100 focus-visible:opacity-100"
            />
            <span
              aria-hidden="true"
              className="text-label pointer-events-none absolute bottom-full left-0 mb-1 hidden bg-ink px-2 py-1 tabular-nums text-chalk group-focus-within:block group-hover:block"
            >
              {formatTimecode(startFrames[i] ?? 0)}
            </span>
          </div>
        ))}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-2 right-2">
          <div ref={playhead} className="h-full w-full">
            <span className="absolute inset-y-0 left-0 w-[2px] bg-rosso" />
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div aria-hidden="true" className="h-[3px] w-full bg-rule">
          <div ref={hairline} className="h-full origin-left scale-x-0 bg-rosso" />
        </div>
        <p data-scrub-current className="text-label px-4 py-2 text-chalk">
          {SECTIONS[active]?.label}
        </p>
      </div>
    </nav>
  );
}
