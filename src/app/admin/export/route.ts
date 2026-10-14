import { parseAdminQuery } from '@/lib/auth/admin';
import { getAdminEmail } from '@/lib/auth/require-admin';
import { listMembers } from '@/lib/admin/queries';
import { toCsv } from '@/lib/csv';

const COLUMNS = ['display_name', 'instagram', 'role', 'role_other_text', 'city', 'tags', 'portfolio_url', 'show_on_wall', 'status', 'created_at'];

// Email stays out of the export: Instagram is how the room reaches people.
export async function GET(req: Request) {
  if (!(await getAdminEmail())) return new Response('Not found', { status: 404 });
  const q = parseAdminQuery(Object.fromEntries(new URL(req.url).searchParams));
  try {
    const rows = await listMembers(q);
    const day = new Date().toISOString().slice(0, 10);
    // The BOM makes Excel read UTF-8, so Malayalam names survive.
    return new Response(`﻿${toCsv(rows as unknown as Record<string, unknown>[], COLUMNS)}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="creators-kootam-members-${day}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/export]', err);
    return new Response('Unavailable', { status: 503 });
  }
}
