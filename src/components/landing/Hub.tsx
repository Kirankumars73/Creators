import { Star } from '@/components/brand/Star';
import { Button } from '@/components/ui/Button';
import type { Lane } from '@/config/brand';
import { HUB } from '@/config/landing';

const W = 640;
const H = 420;
const ROW = H / (HUB.left.length + 1);
const LANES: Lane[] = ['creator', 'editor', 'other'];
const COLORS = ['var(--rosso)', 'var(--lumen)', 'var(--mint)', 'var(--mustard)'];

/**
 * Every craft wired into one room: chips on both sides, curved beams into the star in the middle,
 * a pulse of light travelling each beam (after 21st.dev's AnimatedBeam, done as SVG + CSS).
 * The diagram is decorative; the craft list is real text beside it.
 */
export function Hub() {
  const cx = W / 2;
  const cy = H / 2;
  const nodes = [
    ...HUB.left.map((label, i) => ({ label, x: 92, y: ROW * (i + 1), side: -1 })),
    ...HUB.right.map((label, i) => ({ label, x: W - 92, y: ROW * (i + 1), side: 1 })),
  ];
  return (
    <section aria-labelledby="hub-title" className="relative overflow-hidden border-y border-rule bg-carbon">
      <div className="hub-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[90rem] grid-cols-1 items-center gap-12 px-4 py-24 md:px-10 md:py-32 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative order-2 hidden sm:block lg:order-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" aria-hidden="true">
            <defs>
              <radialGradient id="hub-glow">
                <stop offset="0" stopColor="var(--rosso)" stopOpacity="0.45" />
                <stop offset="1" stopColor="var(--rosso)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r="120" fill="url(#hub-glow)" />
            {nodes.map((n, i) => {
              const sx = n.x - n.side * 58;
              const d = `M ${sx} ${n.y} C ${(sx + cx) / 2} ${n.y}, ${(sx + cx) / 2} ${cy}, ${cx - n.side * 36} ${cy}`;
              return (
                <g key={n.label}>
                  <path d={d} fill="none" className="stroke-rule" strokeWidth="1" />
                  <path
                    d={d}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    pathLength={100}
                    className="hub-beam"
                    style={{ animationDelay: `${(i * 0.37) % 3}s` }}
                  />
                </g>
              );
            })}
            {nodes.map((n, i) => (
              <g key={n.label} transform={`translate(${n.x - 58} ${n.y - 17})`} data-lane={LANES[i % 3]}>
                <rect width="116" height="34" className="fill-ink stroke-rule" strokeWidth="1" />
                <rect width="3" height="34" style={{ fill: COLORS[i % COLORS.length] }} />
                <text x="62" y="21.5" textAnchor="middle" className="fill-chalk font-mono text-[11px] uppercase tracking-[0.12em]">
                  {n.label}
                </text>
              </g>
            ))}
            <g transform={`translate(${cx - 36} ${cy - 36})`}>
              <rect width="72" height="72" className="fill-rosso" />
              <path transform="translate(14 14) scale(1.83)" d="M12 1.2L14.81 8.73L22.84 9.08L16.55 14.08L18.7 21.82L12 17.39L5.3 21.82L7.45 14.08L1.16 9.08L9.19 8.73Z" className="fill-chalk" />
            </g>
          </svg>
        </div>

        <div className="order-1 flex flex-col items-start gap-6 lg:order-2">
          <p className="text-label inline-flex items-center gap-2 border border-rule bg-ink px-3 py-1.5 text-chalk-dim">
            <Star size={11} /> One kootam
          </p>
          <h2 id="hub-title" className="text-title text-chalk">
            <span className="block">{HUB.title[0]} </span>
            <span className="text-hollow block">{HUB.title[1]}</span>
          </h2>
          <p className="text-body max-w-[48ch] text-chalk-dim">{HUB.copy}</p>
          <ul aria-label="Crafts in the room" className="flex flex-wrap gap-2">
            {[...HUB.left, ...HUB.right].map((c) => (
              <li key={c} className="text-label border border-rule px-2.5 py-1.5 text-chalk-dim">
                {c}
              </li>
            ))}
          </ul>
          <Button href="/join" className="mt-2">
            Find your people
          </Button>
        </div>
      </div>
    </section>
  );
}
