import { brand } from '@/config/brand';
import { describePerson, filterPeople } from '@/lib/admin/people';
import { listPeople } from '@/lib/admin/queries';
import { parseAdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';
import { toCsv } from '@/lib/csv';

const COLUMNS = ['email', 'name', 'what_they_are', 'display_name', 'instagram', 'city', 'tags', 'portfolio_url', 'show_on_wall', 'status', 'signed_up', 'last_sign_in', 'joined'];

// The same people, filters and columns as the admin table.
export async function GET(req: Request) {
  if (!(await getAdminEmail())) return new Response('Not found', { status: 404 });
  const q = parseAdminQuery(Object.fromEntries(new URL(req.url).searchParams));
  try {
    const rows = filterPeople(await listPeople(), q).map((p) => ({
      email: p.email,
      name: p.name ?? '',
      what_they_are: describePerson(p, (lane) => brand.rooms[lane].name),
      display_name: p.member?.display_name ?? '',
      instagram: p.member?.instagram ?? '',
      city: p.member?.city ?? '',
      tags: p.member?.tags ?? [],
      portfolio_url: p.member?.portfolio_url ?? '',
      show_on_wall: p.member?.show_on_wall ?? '',
      status: p.member?.status ?? '',
      signed_up: p.signedUpAt,
      last_sign_in: p.lastSignInAt ?? '',
      joined: p.member?.created_at ?? '',
    }));
    const day = new Date().toISOString().slice(0, 10);
    // The BOM makes Excel read UTF-8, so Malayalam names survive.
    return new Response(`﻿${toCsv(rows, COLUMNS)}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="creators-kootam-people-${day}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/export]', err);
    return new Response('Unavailable', { status: 503 });
  }
}
