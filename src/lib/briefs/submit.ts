import { z } from 'zod';

// Brand briefs from the public landing page. No sign-in, so two cheap bot guards: a honeypot
// field people never see, and a render timestamp — a form completed in under MIN_FILL_MS was
// not typed by a person. Both are answered with a fake success so bots learn nothing.

export const MIN_FILL_MS = 3000;

export type BriefInsert = { brand: string; contact_name: string; email: string; phone: string | null; brief: string | null };

export type BriefResult =
  | { ok: true }
  | { ok: false; error: 'invalid'; fieldErrors?: Record<string, string> }
  | { ok: false; error: 'unavailable' };

export type BriefDeps = {
  insert(row: BriefInsert): Promise<{ errorCode: string | null }>;
  now(): number;
};

const blankToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);

export const briefSchema = z.object({
  brand: z.string().trim().min(2, 'Your brand or organisation, at least 2 characters.').max(80, 'Keep the brand name under 80 characters.'),
  contact_name: z.string().trim().min(2, 'Who should we reply to?').max(60, 'Keep the name under 60 characters.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'That email is too long.')
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'We need an email we can reply to.'),
  phone: z.preprocess(blankToNull, z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Digits, spaces and + only — or leave it blank.').nullable()),
  brief: z.preprocess(blankToNull, z.string().trim().max(1500, 'Keep it under 1,500 characters — the details can follow by email.').nullable()),
});

export async function submitBriefCore(deps: BriefDeps, input: unknown): Promise<BriefResult> {
  if (!input || typeof input !== 'object') return { ok: false, error: 'invalid' };
  const raw = input as Record<string, unknown>;

  const honeypot = typeof raw.website === 'string' && raw.website.trim() !== '';
  const started = Number(raw.t);
  const tooFast = !Number.isFinite(started) || deps.now() - started < MIN_FILL_MS;
  if (honeypot || tooFast) return { ok: true };

  const parsed = briefSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message;
    return { ok: false, error: 'invalid', fieldErrors };
  }

  const { errorCode } = await deps.insert(parsed.data);
  if (errorCode) {
    console.error('[briefs] insert failed', errorCode);
    return { ok: false, error: 'unavailable' };
  }
  return { ok: true };
}
