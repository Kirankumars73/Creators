import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// One-time setup: sign in as the creator test account (show_on_wall off) and save the session:
//   pnpm exec playwright codegen --save-storage=.auth/creator.json "$BASE_URL/join"
// Supabase refresh tokens are single-use, so every signed-in test writes the rotated
// session back to the file. If a run still fails with 401, re-run the codegen step.
const CREATOR_STATE = '.auth/creator.json';
const hasCreatorState = existsSync(CREATOR_STATE);

test.beforeAll(() => {
  if (!process.env.BASE_URL) throw new Error('Set BASE_URL to the deployed origin.');
});

test('POST /api/invite without a session is 401', async ({ request }) => {
  const res = await request.post('/api/invite');
  expect(res.status()).toBe(401);
});

test.describe('signed in as the creator test account', () => {
  // Fail, never skip: a green run without these checks would claim §14 was verified when it wasn't.
  test.beforeAll(() => {
    if (!hasCreatorState) throw new Error(`Missing ${CREATOR_STATE}. See the comment at the top of this file.`);
  });
  test.use({ storageState: hasCreatorState ? CREATOR_STATE : undefined });
  test.afterEach(async ({ request }) => {
    await request.storageState({ path: CREATOR_STATE });
  });

  test('the network response gives the creators lane and never the editors link (§14)', async ({ request }) => {
    const editors = process.env.WA_EDITORS_URL;
    expect(editors, 'WA_EDITORS_URL must be in .env.local').toBeTruthy();
    const res = await request.post('/api/invite');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toMatchObject({ laneKey: 'creators' });
    expect(text).not.toContain(editors!);
    expect(res.headers()['cache-control']).toContain('no-store');
  });

  test('/api/me returns their own row', async ({ request }) => {
    const res = await request.get('/api/me');
    expect(res.status()).toBe(200);
    expect((await res.json()).member).toMatchObject({ role: 'creator' });
  });

  test('the signed-in /join page source carries no invite link', async ({ page }) => {
    const res = await page.goto('/join');
    expect(await res!.text()).not.toContain('chat.whatsapp.com');
  });
});
