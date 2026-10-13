import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublicConfig } from '@/lib/supabase/config';

// Keeps the Supabase session cookie fresh on routes that read it.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cfg = supabasePublicConfig();
  if (!cfg) return response;

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
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/join/:path*', '/me', '/admin/:path*', '/api/:path*', '/auth/:path*'],
};
