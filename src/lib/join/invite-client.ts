import type { InviteOk } from '@/lib/invite/handler';

export type InviteClientResult = { status: 200; body: InviteOk } | { status: number; error: string };

/** POST /api/invite from the browser. Status 0 means the network failed. */
export async function fetchInvite(): Promise<InviteClientResult> {
  try {
    const res = await fetch('/api/invite', { method: 'POST', cache: 'no-store' });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 200) return { status: 200, body: body as InviteOk };
    return { status: res.status, error: typeof body.error === 'string' ? body.error : 'unknown' };
  } catch {
    return { status: 0, error: 'network' };
  }
}

export function isInviteOk(r: InviteClientResult): r is { status: 200; body: InviteOk } {
  return r.status === 200;
}
