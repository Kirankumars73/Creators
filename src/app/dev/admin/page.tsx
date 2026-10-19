import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { BriefList } from '@/components/admin/BriefList';
import { buildPeople, type AuthUserLite, type MemberLite } from '@/lib/admin/people';
import { parseAdminQuery } from '@/lib/auth/admin';

export const metadata = { title: 'Admin preview', robots: { index: false } };

const g = { app_metadata: { provider: 'google' }, identities: [{ provider: 'google' }], email_confirmed_at: '2026-10-14T00:00:00Z' };
const USERS: AuthUserLite[] = [
  { id: 'u1', email: 'anu.k@example.com', created_at: '2026-10-14T05:00:00Z', last_sign_in_at: '2026-10-14T09:10:00Z', user_metadata: { full_name: 'Anu K' }, ...g },
  { id: 'u2', email: 'ravi.cuts@example.com', created_at: '2026-10-14T06:00:00Z', last_sign_in_at: '2026-10-14T06:02:00Z', user_metadata: { full_name: 'Ravi Menon' }, ...g },
  { id: 'u3', email: 'admin@example.com', created_at: '2026-10-14T07:00:00Z', last_sign_in_at: '2026-10-14T11:30:00Z', user_metadata: { full_name: 'Site Admin' }, ...g },
  { id: 'u4', email: 'meera.writes@example.com', created_at: '2026-10-14T08:00:00Z', last_sign_in_at: '2026-10-14T08:05:00Z', user_metadata: { full_name: 'Meera' }, ...g },
  { id: 'u5', email: 'just.looking@example.com', created_at: '2026-10-14T10:00:00Z', last_sign_in_at: '2026-10-14T10:00:00Z', user_metadata: { full_name: 'Arjun P' }, ...g },
];
const m = (over: Partial<MemberLite> & Pick<MemberLite, 'id' | 'user_id' | 'display_name' | 'instagram' | 'role'>): MemberLite => ({
  role_other_text: null, city: 'Kochi', tags: [], portfolio_url: null, show_on_wall: true, status: 'active', created_at: '2026-10-14T05:05:00Z', ...over,
});
const MEMBERS: MemberLite[] = [
  m({ id: 'm1', user_id: 'u1', display_name: 'Anu K', instagram: 'anu.shoots', role: 'creator', tags: ['Reels', 'Food'] }),
  m({ id: 'm2', user_id: 'u2', display_name: 'Ravi', instagram: 'ravicuts', role: 'editor', city: 'Thrissur', tags: ['DaVinci', 'Colour'], status: 'flagged', created_at: '2026-10-14T06:01:00Z' }),
  m({ id: 'm4', user_id: 'u4', display_name: 'Meera', instagram: 'meera.writes', role: 'other', role_other_text: 'Scriptwriter', city: 'Kozhikode', created_at: '2026-10-14T08:03:00Z' }),
];

const BRIEFS = [
  { id: 'b1', brand: 'Malabar Café', contact_name: 'Anjali Menon', email: 'anjali@example.com', phone: '+91 98470 12345', brief: 'Launch week in Kozhikode.\nTwo reels and a story. Paid + barter.', status: 'new' as const, created_at: '2026-10-19T10:00:00Z' },
  { id: 'b2', brand: 'Thread & Loom', contact_name: 'Sam', email: 'sam@example.com', phone: null, brief: null, status: 'new' as const, created_at: '2026-10-18T15:30:00Z' },
];

// Dev-only: the admin panel with sample people (no Supabase, no real accounts). 404 in production.
export default function DevAdmin({ searchParams }: PageProps<'/dev/admin'>) {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <div data-surface="bay" className="min-h-dvh bg-surface">
      <main className="flex flex-col gap-10 px-4 py-10 md:px-10">
        <h1 className="text-title text-chalk">Admin</h1>
        <Suspense>
          <Board searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Board({ searchParams }: { searchParams: PageProps<'/dev/admin'>['searchParams'] }) {
  return (
    <>
      <AdminPanel people={buildPeople(USERS, MEMBERS, ['admin@example.com'])} q={parseAdminQuery(await searchParams)} />
      <BriefList briefs={BRIEFS} />
    </>
  );
}
