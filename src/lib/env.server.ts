import 'server-only';
import { z } from 'zod';
import type { WaLinks } from '@/lib/invite/resolve';

// The only module that reads secrets. `server-only` makes any client import a build error.
// WA_* must never gain a NEXT_PUBLIC_ prefix: that would be a security incident (§8 Env).

export type ServerEnv = {
  supabaseUrl: string;
  serviceRoleKey: string;
  siteUrl: string;
  adminEmails: string[];
  wa: WaLinks;
};

const WA_INVITE = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+(\?[A-Za-z0-9=_&-]*)?$/;
const waLink = z.string().regex(WA_INVITE);

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  WA_COMMUNITY_URL: waLink,
  WA_CREATORS_URL: waLink,
  WA_EDITORS_URL: waLink,
  WA_OTHER_URL: z.preprocess((v) => (v === '' ? undefined : v), waLink.optional()),
  ADMIN_EMAILS: z.string().optional(),
});

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  // Values pasted into a dashboard pick up spaces and newlines; one would 503 every invite.
  const trimmed = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
  const r = schema.safeParse(trimmed);
  if (!r.success) {
    // Name the keys, never the values.
    const keys = [...new Set(r.error.issues.map((i) => String(i.path[0])))].join(', ');
    throw new Error(`Server env is missing or invalid: ${keys}`);
  }
  const e = r.data;
  return {
    supabaseUrl: e.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: e.SUPABASE_SERVICE_ROLE_KEY,
    siteUrl: e.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ''),
    adminEmails: (e.ADMIN_EMAILS ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    wa: {
      community: e.WA_COMMUNITY_URL,
      creators: e.WA_CREATORS_URL,
      editors: e.WA_EDITORS_URL,
      other: e.WA_OTHER_URL ?? null,
    },
  };
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

/** ADMIN_EMAILS alone — admin access must not depend on the WhatsApp links being valid. */
export function adminEmailsFromEnv(raw: string | undefined = process.env.ADMIN_EMAILS): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
