import Link from 'next/link';
import { setMemberStatus } from '@/app/admin/actions';
import { Odometer } from '@/components/brand/Odometer';
import { LANES, brand } from '@/config/brand';
import { describePerson, filterPeople, tallyPeople, type AdminPerson } from '@/lib/admin/people';
import type { AdminQuery } from '@/lib/auth/admin';

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
const WHEN = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const roomName = (lane: (typeof LANES)[number]) => brand.rooms[lane].name;

const VIEWS = [
  ['all', 'Everyone'],
  ['notjoined', 'Not joined yet'],
  ['other', 'Other queue'],
] as const;

export function adminHref(q: AdminQuery, patch: Partial<AdminQuery>, base = '/admin') {
  const next = { ...q, ...patch };
  const sp = new URLSearchParams();
  if (next.view !== 'all') sp.set('view', next.view);
  if (next.lane !== 'all') sp.set('lane', next.lane);
  if (next.q) sp.set('q', next.q);
  if (next.sort !== 'new') sp.set('sort', next.sort);
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}

/** Everyone who signed in: their email, what they are, and the member controls. */
export function AdminPanel({ people, q }: { people: AdminPerson[]; q: AdminQuery }) {
  const t = tallyPeople(people);
  const rows = filterPeople(people, q);
  const tallies = [
    ['Signed in', t.signedIn],
    ['Not joined', t.notJoined],
    ['Creators', t.creators],
    ['Editors', t.editors],
    ['Something else', t.other],
    ['Flagged', t.flagged],
    ['Removed', t.removed],
  ] as const;

  return (
    <>
      <p className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm uppercase tracking-[0.14em] text-chalk-dim">
        {tallies.map(([label, n]) => (
          <span key={label} className="flex items-center gap-3">
            <span aria-hidden="true">{label}</span>
            <span className="text-chalk">
              <Odometer value={n} digits={6} label={label} rollIn={false} />
            </span>
          </span>
        ))}
      </p>

      <nav aria-label="Views" className="flex flex-wrap gap-2">
        {VIEWS.map(([view, label]) => (
          <Link
            key={view}
            href={adminHref(q, { view, lane: view === 'all' ? q.lane : 'all' })}
            aria-current={q.view === view ? 'page' : undefined}
            className="text-label inline-flex min-h-11 items-center border border-rule px-4 text-chalk-dim aria-[current=page]:border-chalk aria-[current=page]:text-chalk"
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-4">
        {q.view !== 'all' ? <input type="hidden" name="view" value={q.view} /> : null}
        <label className="flex flex-col gap-2">
          <span className="text-label text-chalk-dim">Search name, email or handle</span>
          <input name="q" defaultValue={q.q} className="min-h-11 border-0 border-b border-chalk-dim bg-graphite px-3 text-chalk" />
        </label>
        {q.view === 'all' ? (
          <label className="flex flex-col gap-2">
            <span className="text-label text-chalk-dim">Lane</span>
            <select name="lane" defaultValue={q.lane} className="min-h-11 border-0 border-b border-chalk-dim bg-graphite px-3 text-chalk">
              <option value="all">Everyone</option>
              {LANES.map((l) => (
                <option key={l} value={l}>
                  {brand.rooms[l].name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex flex-col gap-2">
          <span className="text-label text-chalk-dim">Sort</span>
          <select name="sort" defaultValue={q.sort} className="min-h-11 border-0 border-b border-chalk-dim bg-graphite px-3 text-chalk">
            <option value="new">Newest sign-in first</option>
            <option value="old">Oldest sign-in first</option>
          </select>
        </label>
        <button className="text-label min-h-11 border border-chalk-dim px-4 text-chalk hover:border-chalk">Filter</button>
        <a href={adminHref(q, {}, '/admin/export')} className="text-label inline-flex min-h-11 items-center border border-lane px-4 text-chalk">
          Export CSV
        </a>
      </form>

      {rows.length === 0 ? (
        <p className="font-mono text-sm text-chalk-dim">
          {people.length === 0 ? 'Nobody has signed in yet.' : `Nobody matches.${q.q ? ' Try a shorter search.' : ''}`}
        </p>
      ) : (
        <div className="overflow-x-auto border border-rule">
          <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
            <caption className="sr-only">Everyone who signed in</caption>
            <thead className="text-label bg-carbon text-chalk-dim">
              <tr>
                <th scope="col" className="px-3 py-3">Name</th>
                <th scope="col" className="px-3 py-3">Email</th>
                <th scope="col" className="px-3 py-3">What they are</th>
                <th scope="col" className="px-3 py-3">Handle</th>
                <th scope="col" className="px-3 py-3">City</th>
                <th scope="col" className="px-3 py-3">Tags</th>
                <th scope="col" className="px-3 py-3">Last sign-in</th>
                <th scope="col" className="px-3 py-3">Joined</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <Row key={p.userId} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Row({ p }: { p: AdminPerson }) {
  const m = p.member;
  const actions = m
    ? ([
        m.status === 'active' ? (['flagged', 'Flag'] as const) : null,
        m.status !== 'removed' ? (['removed', 'Remove'] as const) : null,
        m.status !== 'active' ? (['active', 'Restore'] as const) : null,
      ].filter(Boolean) as (readonly ['active' | 'flagged' | 'removed', string])[])
    : [];
  return (
    <tr data-person="" className="border-t border-rule align-top text-chalk">
      <td className="px-3 py-3">{m?.display_name ?? p.name ?? '—'}</td>
      <td className="px-3 py-3 font-mono">
        <a href={`mailto:${p.email}`} className="underline underline-offset-4">
          {p.email}
        </a>
      </td>
      <td className="px-3 py-3">
        <span className="flex flex-wrap items-center gap-2">
          {p.isAdmin ? <span className="text-label border border-mustard px-2 py-1 text-mustard">Admin</span> : null}
          {m ? (
            <span data-lane={m.role} className="text-label inline-flex border-l-[3px] border-lane bg-graphite px-2 py-1">
              {describePerson({ ...p, isAdmin: false }, roomName)}
            </span>
          ) : (
            <span className="text-label px-1 py-1 text-chalk-mute">Not joined yet</span>
          )}
        </span>
      </td>
      <td className="px-3 py-3 font-mono">
        {m ? (
          <a href={`https://instagram.com/${m.instagram}`} className="underline underline-offset-4">
            @{m.instagram}
          </a>
        ) : null}
      </td>
      <td className="px-3 py-3">{m?.city ?? ''}</td>
      <td className="px-3 py-3 text-chalk-dim">{m?.tags.join(', ') ?? ''}</td>
      <td className="whitespace-nowrap px-3 py-3 font-mono text-chalk-dim">{p.lastSignInAt ? WHEN.format(new Date(p.lastSignInAt)) : '—'}</td>
      <td className="whitespace-nowrap px-3 py-3 font-mono text-chalk-dim">{m ? DAY.format(new Date(m.created_at)) : '—'}</td>
      <td className="text-label px-3 py-3">{m?.status ?? '—'}</td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          {m
            ? actions.map(([status, label]) => (
                <form key={status} action={setMemberStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={status} />
                  <button className="text-label min-h-11 border border-rule px-3 text-chalk hover:border-chalk">{label}</button>
                </form>
              ))
            : null}
        </div>
      </td>
    </tr>
  );
}
