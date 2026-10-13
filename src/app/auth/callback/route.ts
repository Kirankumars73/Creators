import { NextResponse, type NextRequest } from 'next/server';
import { safeNextPath } from '@/lib/auth/next-path';
import { createServerSupabase } from '@/lib/supabase/server';

// Google → Supabase → here. Swap the one-time code for a session cookie, then continue.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));

  if (code) {
    try {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      // `next` is a vetted same-site path; append it to our own origin rather than resolving it.
      if (!error) return NextResponse.redirect(new URL(`${url.origin}${next}`));
      console.error('[auth/callback] code exchange failed', error.message);
    } catch (err) {
      console.error('[auth/callback]', err);
    }
  }
  return NextResponse.redirect(new URL('/join?error=auth', url.origin));
}
