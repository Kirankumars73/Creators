import { expect, test } from '@playwright/test';

const INSTAGRAM_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.134 Mobile Safari/537.36 Instagram 339.0.0.38.119 Android (34/14; 450dpi; 1080x2340; samsung; SM-A546E; a54x; s5e8835; en_IN; 625217640)';

test.describe('from the Instagram app', () => {
  test.use({ userAgent: INSTAGRAM_ANDROID });

  test('/join offers the way out to Chrome instead of a Google button that will fail', async ({ page }) => {
    await page.goto('/join');
    await expect(page.getByRole('link', { name: /open in chrome/i })).toHaveAttribute('href', /^intent:\/\/.+\/join#Intent;scheme=http/);
    await expect(page.getByRole('button', { name: /continue with google/i })).toHaveCount(0);
  });
});

// The e2e server has no Supabase on purpose, like a fresh clone or a preview without env: sign-in
// can't work there, so the page says so (the Google button itself is covered in sign-in.test.tsx).
test('a copy with no Supabase says sign-in is not set up and points to the live site — no dead button', async ({ page }) => {
  await page.goto('/join');
  await expect(page.getByRole('status').filter({ hasText: 'Sign-in' })).toContainText('Sign-in isn’t set up on this copy of the site.');
  await expect(page.getByRole('link', { name: 'creators-kootam.vercel.app' })).toHaveAttribute('href', 'https://creators-kootam.vercel.app/join');
  await expect(page.getByRole('button', { name: /continue with google/i })).toHaveCount(0);
});

test('a signed-out visitor asking for the reveal is sent back to sign-in', async ({ page }) => {
  await page.goto('/join?step=reveal');
  await expect(page.getByRole('status').filter({ hasText: 'Sign-in' })).toContainText('Sign-in isn’t set up');
});
