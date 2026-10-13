import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// One-time setup: sign in as the creator test account (show_on_wall off) and save the session:
//   pnpm exec playwright codegen --save-storage=.auth/creator.json "$BASE_URL/join"
const CREATOR_STATE = '.auth/creator.json';

test.beforeAll(() => {
  if (!process.env.BASE_URL) throw new Error('Set BASE_URL to the deployed origin.');
});

test('POST /api/invite without a session is 401', async ({ request }) => {
  const res = await request.post('/api/invite');
  expect(res.status()).toBe(401);
});

test.describe('signed in as the creator test account', () => {
  test.skip(!existsSync(CREATOR_STATE), `Missing ${CREATOR_STATE} — see the comment at the top of this file.`);
  test.use({ storageState: CREATOR_STATE });

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
