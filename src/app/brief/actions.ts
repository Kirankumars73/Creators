'use server';

import { insertBrief } from '@/lib/briefs/repo';
import { submitBriefCore, type BriefResult } from '@/lib/briefs/submit';

/** The "For brands" form. Public by design: no session check, validation and bot guards instead. */
export async function submitBrief(_prev: BriefResult | null, formData: FormData): Promise<BriefResult> {
  try {
    return await submitBriefCore({ insert: insertBrief, now: Date.now }, Object.fromEntries(formData));
  } catch (err) {
    console.error('[briefs] submitBrief', err);
    return { ok: false, error: 'unavailable' };
  }
}
