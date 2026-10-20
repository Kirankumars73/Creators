import { z } from 'zod';
import { DISTRICTS, TAGS } from '@/config/join';

// Shared by the join form (client) and the server action: one definition of "valid".

export const INSTAGRAM_RE = /^[a-zA-Z0-9._]{1,30}$/;

// Instagram paths that are pages, not profiles.
const NOT_PROFILES = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'tv', 'accounts', 'direct']);
const IG_URL = /^(?:[a-z][a-z0-9+.-]*:\/\/)?(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/(?:_u\/)?@?([^/?#]*)/i;
// Zero-width and direction marks that ride along with copy-paste.
const INVISIBLE = /\p{Cf}/gu;

/** "@Handle", "instagram.com/handle", "https://www.instagram.com/handle/?igsh=…" → "handle". */
export function normalizeInstagram(raw: string): string {
  const trimmed = raw.replace(INVISIBLE, '').trim().replace(/^@+/, '').trim();
  const match = trimmed.match(IG_URL);
  if (!match) return trimmed.toLowerCase();
  const handle = (match[1] ?? '').toLowerCase();
  // A post/reel URL: hand back the original so the regex rejects it.
  return NOT_PROFILES.has(handle) ? trimmed : handle;
}

/** Postgres char_length counts code points; so do we. */
const chars = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((s) => {
      const n = [...s].length;
      return n >= min && n <= max;
    }, `Use ${min}–${max} characters.`);

const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const common = {
  displayName: chars(2, 60),
  instagram: z.preprocess(
    (v) => (typeof v === 'string' ? normalizeInstagram(v) : v),
    z.string().regex(INSTAGRAM_RE, 'That doesn’t look like an Instagram handle.'),
  ),
  city: z.enum(DISTRICTS),
  portfolioUrl: z.preprocess(blankToUndefined, z.url({ protocol: /^https?$/ }).max(300).optional()),
  showOnWall: z.boolean().default(true),
  // Public profile page (district, crafts, portfolio). Off unless they say yes: migration 0005.
  profilePublic: z.boolean().default(false),
  acceptedCode: z.literal(true),
};

const tagsFor = (lane: keyof typeof TAGS) =>
  z
    .array(z.enum(TAGS[lane]))
    .default([])
    .transform((tags) => [...new Set(tags)]);

export const memberInputSchema = z.discriminatedUnion('role', [
  z.strictObject({ role: z.literal('creator'), ...common, tags: tagsFor('creator') }),
  z.strictObject({ role: z.literal('editor'), ...common, tags: tagsFor('editor') }),
  z.strictObject({ role: z.literal('other'), roleOtherText: chars(2, 60), ...common, tags: z.array(z.string()).max(0).default([]) }),
]);

export type MemberInput = z.output<typeof memberInputSchema>;
