'use server';

// Dev-only stub for the /dev/photo preview: answers "ok" and saves nothing.
export async function stubOk(): Promise<{ ok: true }> {
  return { ok: true };
}
