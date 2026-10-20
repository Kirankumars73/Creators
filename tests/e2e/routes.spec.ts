import { expect, test } from '@playwright/test';

for (const path of ['/', '/creators', '/code', '/join']) {
  test(`${path} renders with exactly one h1`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('the home headline is his line from his bio', async ({ page }) => {
  await page.goto('/');
  // The letters are aria-hidden spans (they react to the pointer); the name is the sentence, once.
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName("WE'D RATHER SHOW THAN TELL.");
});

test('admin (the edit suite) stays ink-dark from the first byte', async ({ page }) => {
  await page.goto('/admin');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(10, 10, 11)');
});

for (const path of ['/', '/creators', '/code', '/privacy', '/join']) {
  test(`${path} is the light wall from the first byte`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#EEF2F8');
  });
}

test('/me sends signed-out visitors to /join with a real redirect', async ({ request }) => {
  const res = await request.get('/me', { maxRedirects: 0 });
  expect([303, 307]).toContain(res.status());
  expect(res.headers()['location']).toMatch(/\/join$/);
});

test('/admin is a real 404 for anyone who is not an admin', async ({ request, page }) => {
  expect((await request.get('/admin')).status()).toBe(404);
  expect((await request.get('/admin/export')).status()).toBe(404);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /this frame isn’t in the film/i })).toBeVisible();
});

test('robots.txt keeps crawlers out of /admin and /me', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Disallow: /admin');
  expect(body).toContain('Disallow: /me');
});

test('sitemap lists the public pages', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body).toContain('<loc>http://localhost:3100/</loc>');
  expect(body).toContain('<loc>http://localhost:3100/creators</loc>');
  expect(body).toContain('<loc>http://localhost:3100/code</loc>');
});

test('/code carries all seven articles', async ({ page }) => {
  await page.goto('/code');
  await expect(page.locator('[data-article]')).toHaveCount(7);
});

test('/privacy exists, says what is collected, and is linked from the footer (Google OAuth needs it)', async ({ page }) => {
  const res = await page.goto('/privacy');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  for (const phrase of ['Google', 'Instagram', 'Supabase', 'never post', 'delete']) await expect(page.locator('main')).toContainText(phrase);
  // The admin panel lists everyone who signed in with their email: the page must say so.
  await expect(page.locator('main')).toContainText('The admins');
  await expect(page.locator('main')).toContainText('your email address');
  await expect(page.locator('main')).not.toContainText('Your email is not shown');
  await page.goto('/');
  await expect(page.locator('footer').getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy');
});

test.describe('member pages (/m/<handle>)', () => {
  test('the shell renders and, with no database, says the page didn’t load — not that nobody exists', async ({ page }) => {
    const res = await page.goto('/m/anu.shoots');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('link', { name: 'All members' })).toHaveAttribute('href', '/creators');
    await expect(page.getByText('This page didn’t load. Refresh in a minute.')).toBeVisible();
  });

  test('a handle that could never exist is the not-found page', async ({ page }) => {
    await page.goto('/m/not%20a%20handle!');
    await expect(page.getByRole('heading', { name: /this frame isn’t in the film/i })).toBeVisible();
  });

  test('the dev previews are 404 in production', async ({ request }) => {
    for (const path of ['/dev/profile', '/dev/join', '/dev/admin']) expect((await request.get(path)).status(), path).toBe(404);
  });
});
