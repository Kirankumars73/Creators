import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Odometer } from '@/components/brand/Odometer';
import { LANES, brand } from '@/config/brand';
import { listMembers, statusCounts, type AdminMember } from '@/lib/admin/queries';
import { parseAdminQuery, type AdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';
import { setMemberStatus } from './actions';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

const JOINED = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <div data-surface="bay" className="min-h-dvh bg-surface">
      <main className="flex flex-col gap-10 px-4 py-10 md:px-10">
        <h1 className="text-title text-chalk">Admin</h1>
        <Suspense fallback={<p className="text-label text-chalk-mute">Loading…</p>}>
          <AdminBoard searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

function href(q: AdminQuery, patch: Partial<AdminQuery>, base = '/admin') {
  const next = { ...q, ...patch };
  const sp = new URLSearchParams();
  if (next.view !== 'all') sp.set('view', next.view);
  if (next.lane !== 'all') sp.set('lane', next.lane);
  if (next.q) sp.set('q', next.q);
  if (next.sort !== 'new') sp.set('sort', next.sort);
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}

async function AdminBoard({ searchParams }: { searchParams: PageProps<'/admin'>['searchParams'] }) {
  if (!(await getAdminEmail())) notFound();
  const q = parseAdminQuery(await searchParams);
  const [members, counts] = await Promise.all([listMembers(q), statusCounts()]);
  const tallies = [
    ['Active', counts.active],
    ['Creators', counts.creators],
    ['Editors', counts.editors],
    ['Other', counts.other],
    ['Flagged', counts.flagged],
    ['Removed', counts.removed],
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

      <nav aria-label="Views" className="flex gap-2">
        {(['all', 'other'] as const).map((view) => (
          <Link
            key={view}
            href={href(q, { view })}
            aria-current={q.view === view ? 'page' : undefined}
            className="text-label inline-flex min-h-11 items-center border border-rule px-4 text-chalk-dim aria-[current=page]:border-chalk aria-[current=page]:text-chalk"
          >
            {view === 'all' ? 'All' : 'Other queue'}
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-4">
        {q.view === 'other' ? <input type="hidden" name="view" value="other" /> : null}
        <label className="flex flex-col gap-2">
          <span className="text-label text-chalk-dim">Search name or handle</span>
          <input name="q" defaultValue={q.q} className="min-h-11 border-0 border-b border-chalk-dim bg-graphite px-3 text-chalk" />
        </label>
        {q.view === 'all' ? (
          <label className="flex flex-col gap-2">
            <span className="text-label text-chalk-dim">Lane</span>
            <select name="lane" defaultValue={q.lane} className="min-h-11 border-0 border-b border-chalk-dim bg-graphite px-3 text-chalk">
              <option value="all">All lanes</option>
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
            <option value="new">Newest first</option>
            <option value="old">Oldest first</option>
          </select>
        </label>
        <button className="text-label min-h-11 border border-chalk-dim px-4 text-chalk hover:border-chalk">Filter</button>
        <a href={href(q, {}, '/admin/export')} className="text-label inline-flex min-h-11 items-center border border-lane px-4 text-chalk">
          Export CSV
        </a>
      </form>

      {members.length === 0 ? (
        <p className="font-mono text-sm text-chalk-dim">No members match. {q.q ? 'Try a shorter search.' : ''}</p>
      ) : (
        <div className="overflow-x-auto border border-rule">
          <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
            <caption className="sr-only">{q.view === 'other' ? 'Members who chose something else' : 'Members'}</caption>
            <thead className="text-label bg-carbon text-chalk-dim">
              <tr>
                {q.view === 'other' ? <th scope="col" className="px-3 py-3">What they do</th> : null}
                <th scope="col" className="px-3 py-3">Name</th>
                <th scope="col" className="px-3 py-3">Handle</th>
                <th scope="col" className="px-3 py-3">Lane</th>
                {q.view === 'all' ? <th scope="col" className="px-3 py-3">Other</th> : null}
                <th scope="col" className="px-3 py-3">City</th>
                <th scope="col" className="px-3 py-3">Tags</th>
                <th scope="col" className="px-3 py-3">Joined</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <Row key={m.id} m={m} view={q.view} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Row({ m, view }: { m: AdminMember; view: AdminQuery['view'] }) {
  const actions = [
    m.status === 'active' ? (['flagged', 'Flag'] as const) : null,
    m.status !== 'removed' ? (['removed', 'Remove'] as const) : null,
    m.status !== 'active' ? (['active', 'Restore'] as const) : null,
  ].filter(Boolean) as (readonly ['active' | 'flagged' | 'removed', string])[];
  return (
    <tr className="border-t border-rule align-top text-chalk">
      {view === 'other' ? <td className="text-body px-3 py-3 font-semibold">{m.role_other_text}</td> : null}
      <td className="px-3 py-3">{m.display_name}</td>
      <td className="px-3 py-3 font-mono">
        <a href={`https://instagram.com/${m.instagram}`} className="underline underline-offset-4">
          @{m.instagram}
        </a>
      </td>
      <td className="px-3 py-3">
        <span data-lane={m.role} className="text-label inline-flex border-l-[3px] border-lane bg-graphite px-2 py-1">
          {brand.rooms[m.role].short}
        </span>
      </td>
      {view === 'all' ? <td className="px-3 py-3 text-chalk-dim">{m.role_other_text ?? ''}</td> : null}
      <td className="px-3 py-3">{m.city}</td>
      <td className="px-3 py-3 text-chalk-dim">{m.tags.join(', ')}</td>
      <td className="px-3 py-3 font-mono text-chalk-dim">{JOINED.format(new Date(m.created_at))}</td>
      <td className="text-label px-3 py-3">{m.status}</td>
      <td className="px-3 py-3">
        <div className="flex gap-2">
          {actions.map(([status, label]) => (
            <form key={status} action={setMemberStatus}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="status" value={status} />
              <button className="text-label min-h-11 border border-rule px-3 text-chalk hover:border-chalk">{label}</button>
            </form>
          ))}
        </div>
      </td>
    </tr>
  );
}
