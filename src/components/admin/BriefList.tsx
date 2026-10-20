import { brand } from '@/config/brand';
import type { BriefRow } from '@/lib/briefs/repo';

const WHEN = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Brand briefs from the landing page, newest first; reply goes straight to the brand by email. */
export function BriefList({ briefs }: { briefs: BriefRow[] | null }) {
  return (
    <section aria-labelledby="briefs-title" className="flex flex-col gap-6 border-t border-rule pt-10">
      <h2 id="briefs-title" className="font-display text-[2rem] uppercase leading-none text-chalk">
        Brand briefs {briefs ? <span className="font-mono text-base text-chalk-dim">({briefs.length})</span> : null}
      </h2>
      {!briefs ? (
        <p className="font-mono text-sm text-chalk-dim">Briefs are unavailable — has migration 0004_brand_briefs been applied?</p>
      ) : briefs.length === 0 ? (
        <p className="font-mono text-sm text-chalk-dim">No briefs yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {briefs.map((b) => (
            <li key={b.id} data-lane="other" className="flex flex-col gap-2 border border-rule border-l-[3px] border-l-lane bg-carbon p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-subhead text-lg font-bold text-chalk">
                  {b.brand}
                  {b.for_instagram ? <span className="ml-2 font-mono text-sm font-normal text-lane">for @{b.for_instagram}</span> : null}
                </p>
                <p className="text-label text-chalk-mute">{WHEN.format(new Date(b.created_at))}</p>
              </div>
              <p className="font-mono text-sm text-chalk-dim">
                {b.contact_name} ·{' '}
                <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Your brief for ${brand.name} — ${b.brand}`)}`} className="text-chalk underline underline-offset-4">
                  {b.email}
                </a>
                {b.phone ? <> · {b.phone}</> : null}
              </p>
              {b.brief ? <p className="text-body whitespace-pre-line text-chalk">{b.brief}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
