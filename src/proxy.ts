import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { adminEmailsFromEnv } from '@/lib/env.server';
import { supabasePublicConfig } from '@/lib/supabase/config';

// Rewriting to a path no route owns serves the not-found page with a real 404.
const notFound = (request: NextRequest) => NextResponse.rewrite(new URL('/__not-found', request.url));

/**
 * Keeps the Supabase session cookie fresh on routes that read it, and answers /admin with a
 * true 404 for anyone who isn't an admin — before a byte of the page streams. (The page and
 * every admin action check again.) A broken Supabase config never takes pages down.
 */
export async function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  let response = NextResponse.next({ request });
  const cfg = supabasePublicConfig();
  if (!cfg) return isAdminPath ? notFound(request) : response;

  try {
    const supabase = createServerClient(cfg.url, cfg.anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet, headers) => {
          for (const { name, value } of toSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    if (isAdminPath && !isAdminUser(data.user, adminEmailsFromEnv())) return notFound(request);
  } catch (err) {
    console.error('[proxy] session refresh skipped', err);
    return isAdminPath ? notFound(request) : NextResponse.next({ request });
  }
  return response;
}

export const config = {
  matcher: ['/join/:path*', '/me', '/admin/:path*', '/api/:path*', '/auth/:path*'],
};
