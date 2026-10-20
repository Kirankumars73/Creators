import { NextResponse, type NextRequest } from 'next/server';
import { sameOrigin } from '@/lib/photos/http';
import { createServerSupabase } from '@/lib/supabase/server';

// POST /auth/signout — a plain <form method="post">, so it works without JavaScript too. Origin is
// checked first: another site must not be able to sign someone out. Whatever happens, they end up
// on the home page.
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[auth/signout]', err);
  }
  return NextResponse.redirect(new URL('/', request.url), 303);
}
