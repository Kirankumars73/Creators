import { expect, test } from '@playwright/test';

test('film grain is a fixed, click-through overlay', async ({ page }) => {
  await page.goto('/');
  const grain = page.locator('canvas[data-grain]');
  await expect(grain).toHaveCount(1);
  expect(await grain.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  expect(await grain.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
});

test.describe('prefers-reduced-motion: reduce — the quiet cut (§10)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no grain, and nothing is moving once the page settles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('canvas[data-grain]')).toHaveCount(0);
    await page.waitForTimeout(2000);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length)).toBe(0);
  });
});
