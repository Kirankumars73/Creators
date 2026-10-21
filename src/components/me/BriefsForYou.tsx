import { brand } from '@/config/brand';
import type { MemberBrief } from '@/lib/briefs/repo';

const WHEN = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

/**
 * /me: briefs brands sent through your "Work with me" page. The team reads them first and has the
 * brand's contact details; you see who it is from and what they asked, never their email or phone.
 */
export function BriefsForYou({ briefs }: { briefs: MemberBrief[] }) {
  return (
    <section id="briefs" aria-labelledby="briefs-for-you" className="flex flex-col gap-5 bg-carbon p-6 shadow-[0_14px_30px_-22px_var(--print)] md:p-8">
      <h2 id="briefs-for-you" className="font-display text-[2rem] uppercase leading-none text-chalk">
        Briefs for you {briefs.length ? <span className="font-sans text-base font-semibold text-rosso-deep">({briefs.length})</span> : null}
      </h2>
      {briefs.length === 0 ? (
        <p className="text-body max-w-[52ch] text-chalk-dim">Nothing yet. When a brand sends a brief from your page, it shows up here.</p>
      ) : (
        <>
          <p className="text-body max-w-[52ch] text-chalk-dim">
            The {brand.name} team has each brand’s contact details and will put you in touch.
          </p>
          <ul className="flex flex-col gap-3">
            {briefs.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 border-l-4 border-rosso bg-wall p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-semibold text-chalk">
                    {b.brand} <span className="text-base font-normal text-chalk-dim">· {b.contact_name}</span>
                  </p>
                  <p className="text-sm text-chalk-mute">{WHEN.format(new Date(b.created_at))}</p>
                </div>
                {b.brief ? <p className="text-body whitespace-pre-line text-chalk">{b.brief}</p> : <p className="text-sm text-chalk-mute">No message.</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
