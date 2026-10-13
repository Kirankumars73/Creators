import { expect, test } from '@playwright/test';

test('first visit: the slate plays, then gets out of the way inside 1.7s', async ({ page }) => {
  await page.goto('/');
  const slate = page.locator('[data-cold-open]');
  await expect(slate).toBeVisible();
  await expect(slate).toBeHidden({ timeout: 1700 });
  await expect(page.locator('h1')).toBeVisible();
});

test('a second visit in the same session never shows it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cold-open]')).toBeHidden({ timeout: 1700 });
  await page.reload();
  expect(await page.locator('[data-cold-open]').isVisible()).toBe(false);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('skips it entirely', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('[data-cold-open]').isVisible()).toBe(false);
  });
});

test('the cold open causes no layout shift', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1900);
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!e.hadRecentInput) total += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), 100);
      }),
  );
  expect(cls).toBe(0);
});
