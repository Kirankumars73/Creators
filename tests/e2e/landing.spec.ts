import { expect, test } from '@playwright/test';

test.describe('landing with Supabase unreachable (Review Focus 5)', () => {
  test('the hero still says its line, shows no fake count, and the console stays clean', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(/WE'D RATHER\s+SHOW THAN\s+TELL\./);
    await expect(page.locator('#cold-open .odometer')).toHaveCount(0);
    await page.waitForTimeout(1800);
    expect(errors).toEqual([]);
  });

  test('three reel cards sit behind the type, out of the way of clicks', async ({ page }) => {
    await page.goto('/');
    const reels = page.locator('#cold-open [data-reel]');
    await expect(reels).toHaveCount(3);
    expect(await reels.first().evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)).toBe('none');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the headline is fully visible without waiting on a wipe', async ({ page }) => {
    await page.goto('/');
    const clip = await page.locator('h1 [data-wipe]').first().evaluate((el) => getComputedStyle(el).clipPath);
    expect(['none', 'auto', '']).toContain(clip);
  });
});
