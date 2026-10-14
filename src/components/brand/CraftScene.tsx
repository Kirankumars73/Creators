// The lane screens (16:10), drawn inline. One shot runs through both: a backwater at dusk —
// framed in the creators' viewfinder, then sitting in the editors' program monitor above the
// timeline. Creators shoot it; editors cut it. No people, no photos.

import type { Craft } from './CraftArt';

export function CraftScene({ craft, className = '' }: { craft: Exclude<Craft, 'bars'>; className?: string }) {
  return (
    <svg
      data-craft-art={craft}
      aria-hidden="true"
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid meet"
      className={`font-mono ${className}`}
    >
      {craft === 'viewfinder' ? <Shoot /> : <Cut />}
    </svg>
  );
}

/** The shot itself, in a 160×100 frame. */
function Backwater() {
  return (
    <>
      <circle cx="112" cy="50" r="11" className="fill-mustard" opacity="0.9" />
      <rect x="0" y="62" width="160" height="38" className="fill-ink" />
      <line x1="0" y1="62" x2="160" y2="62" className="stroke-chalk-mute" strokeWidth="0.6" />
      <g className="stroke-mustard" strokeWidth="0.8" opacity="0.6">
        <line x1="103" y1="66" x2="121" y2="66" />
        <line x1="106" y1="70" x2="118" y2="70" />
        <line x1="108" y1="74" x2="116" y2="74" />
      </g>
      {/* Ripples stay above y≈82, clear of the viewfinder's bottom readouts. */}
      <g className="stroke-chalk-mute" strokeWidth="0.6" opacity="0.55">
        <line x1="12" y1="70" x2="40" y2="70" />
        <line x1="128" y1="70" x2="150" y2="70" />
        <line x1="24" y1="77" x2="62" y2="77" />
        <line x1="92" y1="80" x2="128" y2="80" />
        <line x1="46" y1="82" x2="68" y2="82" />
      </g>
      <path d="M0 62 C12 57 40 57 62 62" className="fill-graphite stroke-chalk-mute" strokeWidth="0.5" />
      {/* Palms on the near bank, kept below the REC readout. */}
      <g className="stroke-chalk-dim" strokeWidth="1.2" fill="none" strokeLinecap="round" transform="translate(8 10) scale(0.85)">
        <path d="M24 60 C26 48 30 36 36 26" />
        <path d="M36 26 C30 23 24 24 19 28" />
        <path d="M36 26 C42 21 49 21 55 25" />
        <path d="M36 26 C34 19 29 15 24 14" />
        <path d="M36 26 C40 18 46 15 52 15" />
        <path d="M36 26 C32 29 28 34 26 39" />
        <path d="M36 26 C42 29 46 33 48 38" />
        <path d="M46 60 C48 52 50 44 54 37" />
        <path d="M54 37 C50 35 46 36 43 39" />
        <path d="M54 37 C58 33 63 33 67 36" />
        <path d="M54 37 C53 32 50 29 46 28" />
        <path d="M54 37 C57 31 61 29 65 29" />
      </g>
      <path d="M70 67 Q80 72 94 67 L91 69.5 Q80 73 73 69.5 Z" className="fill-chalk-dim" />
      <line x1="82" y1="69" x2="80" y2="58" className="stroke-chalk-dim" strokeWidth="0.6" />
    </>
  );
}

/** Creators: the shot through the camera — thirds, corners, focus on the boat, REC. */
function Shoot() {
  return (
    <>
      <Backwater />
      <g className="stroke-chalk" strokeWidth="0.3" opacity="0.14">
        <line x1="53.3" y1="0" x2="53.3" y2="100" />
        <line x1="106.7" y1="0" x2="106.7" y2="100" />
        <line x1="0" y1="33.3" x2="160" y2="33.3" />
        <line x1="0" y1="66.7" x2="160" y2="66.7" />
      </g>
      <g className="stroke-chalk" strokeWidth="0.7" fill="none" opacity="0.75">
        <path d="M8 15 V8 H15" />
        <path d="M145 8 H152 V15" />
        <path d="M8 85 V92 H15" />
        <path d="M145 92 H152 V85" />
      </g>
      <rect x="66" y="54" width="32" height="22" fill="none" className="stroke-lane" strokeWidth="0.8" />
      <circle cx="17" cy="15" r="1.8" className="reel-rec fill-lane" />
      <text x="21" y="16.6" fontSize="4.6" className="fill-chalk">
        REC
      </text>
      <text x="142" y="16.6" fontSize="4.2" textAnchor="end" className="fill-chalk-dim">
        00:00:12:08
      </text>
      <text x="17" y="88" fontSize="3.8" className="fill-chalk-dim">
        4K · 25P
      </text>
      <text x="142" y="88" fontSize="3.8" textAnchor="end" className="fill-chalk-dim">
        ISO 800 · F2.8
      </text>
    </>
  );
}

const WAVE = [3, 6, 4, 9, 5, 7, 11, 6, 4, 8, 5, 3, 7, 10, 6, 4, 5, 8, 4, 6, 9, 5, 3, 6, 8, 4, 7, 5, 9, 4, 6, 3, 5, 8, 6, 4, 7, 9, 5, 6, 3, 7, 5, 8, 4, 6, 9, 5, 4, 7, 6, 3, 8, 5, 6, 4, 7, 5, 9, 4, 6, 3, 5];

/** Editors: the same shot in the program monitor, and the cut that made it. */
function Cut() {
  return (
    <>
      <rect x="44" y="5" width="72" height="45" className="fill-ink stroke-rule" strokeWidth="0.6" />
      <svg x="44" y="5" width="72" height="45" viewBox="0 0 160 100">
        <Backwater />
      </svg>
      <text x="80" y="56.5" fontSize="3.8" textAnchor="middle" className="fill-chalk-dim">
        00:00:24:00
      </text>
      <g className="stroke-chalk-mute" strokeWidth="0.4">
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={18 + i * 6} y1="64" x2={18 + i * 6} y2={i % 4 === 0 ? 60 : 62} />
        ))}
      </g>
      <g fontSize="3.6" className="fill-chalk-mute">
        <text x="5" y="71">V2</text>
        <text x="5" y="79.5">V1</text>
        <text x="5" y="89">A1</text>
        <text x="5" y="97">A2</text>
      </g>
      <g strokeWidth="0.4" className="stroke-chalk-mute">
        <rect x="64" y="67" width="30" height="5" className="fill-graphite" />
        <rect x="18" y="75" width="40" height="6" className="fill-graphite" />
        <rect x="59" y="75" width="32" height="6" className="fill-lane" fillOpacity="0.35" />
        <rect x="92" y="75" width="62" height="6" className="fill-graphite" />
      </g>
      <g className="fill-lane" opacity="0.8">
        {WAVE.map((h, i) => (
          <rect key={i} x={18 + i * 2.2} y={88 - h / 3} width="1.2" height={(h * 2) / 3} />
        ))}
      </g>
      <g className="fill-chalk-mute" opacity="0.6">
        {WAVE.map((h, i) => (
          <rect key={i} x={18 + i * 2.2} y={96 - h / 6} width="1.2" height={h / 3} />
        ))}
      </g>
      <line x1="76" y1="62" x2="76" y2="99" className="stroke-lane" strokeWidth="0.8" />
      <path d="M73 60 H79 L76 63.5 Z" className="fill-lane" />
    </>
  );
}
