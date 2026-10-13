import { expect, test } from '@playwright/test';

test.describe('sharing (§12)', () => {
  for (const path of ['/opengraph-image', '/code/opengraph-image', '/icon', '/apple-icon']) {
    test(`${path} is a PNG`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('image/png');
    });
  }

  test('the home page carries Open Graph and Twitter cards in en_IN', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'en_IN');
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\/opengraph-image/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('The Code has its own share image — it is the page people screenshot', async ({ page }) => {
    await page.goto('/code');
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /\/code\/opengraph-image/);
    await expect(page).toHaveTitle('The Code · Creators Kootam');
  });
});
