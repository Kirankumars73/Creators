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

test.describe('section title cards (§6.3)', () => {
  test('THE ROOM opens with its title card, which cuts away to the content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-cold-open]')).toBeHidden();
    const card = page.locator('#the-room [data-section-card]');
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('02 — THE ROOM');
    await page.locator('#the-room').scrollIntoViewIfNeeded();
    await expect(card).toBeHidden({ timeout: 3000 });
    await expect(page.getByText('So we made a room.')).toBeVisible();
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('no card at all, the words are simply there', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#the-room')).toContainText('So we made a room.');
      await expect(page.locator('[data-section-card]')).toHaveCount(0);
    });
  });
});

test.describe('scroll reveals actually reveal (regression: hydration double-registration)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('THE ROOM lines end fully opaque once scrolled in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-cold-open]')).toBeHidden();
    await page.locator('#the-room').scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.locator('#the-room [data-reveal]').evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity)), { timeout: 3000 })
      .toEqual(['1', '1', '1', '1']);
  });

  test('the title card waits for its section instead of firing at page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-cold-open]')).toBeHidden();
    await page.waitForTimeout(600);
    const card = page.locator('#the-room [data-section-card]');
    expect(await card.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
    await page.locator('#the-room').scrollIntoViewIfNeeded();
    // It must actually cover the section mid-cut (regression: parked CSS transform read as px offset).
    await expect.poll(() => card.evaluate((el) => Math.round(el.getBoundingClientRect().left)), { timeout: 1500, intervals: [50] }).toBe(0);
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).display), { timeout: 3000 }).toBe('none');
  });
});
