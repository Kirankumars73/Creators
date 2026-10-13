import { expect, test } from '@playwright/test';

const ms = (v: string) => v.split(',').map((s) => (s.trim().endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000));

test('first visit: the slate plays, and every part of it is timed to finish within 1.6s of first paint', async ({ page }) => {
  await page.goto('/');
  const slate = page.locator('[data-cold-open]');
  await expect(slate).toBeVisible();
  // The contract, read from the CSS itself: no animation inside the cold open ends after 1600ms.
  const ends = await page.evaluate(() =>
    [document.querySelector('[data-cold-open]'), ...document.querySelectorAll('[data-cold-open] *')].flatMap((el) => {
      const cs = getComputedStyle(el as Element);
      if (cs.animationName === 'none') return [];
      return [{ delay: cs.animationDelay, duration: cs.animationDuration }];
    }),
  );
  expect(ends.length).toBeGreaterThan(0);
  for (const { delay, duration } of ends) {
    const d = ms(delay);
    const t = ms(duration);
    d.forEach((di, i) => expect(di + (t[i] ?? t[0]!)).toBeLessThanOrEqual(1601));
  }
  await expect(slate).toBeHidden();
  await expect(page.locator('h1')).toBeVisible();
});

test('a second visit in the same session never shows it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cold-open]')).toBeHidden();
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
  await expect(page.locator('[data-cold-open]')).toBeHidden();
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
