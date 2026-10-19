import { expect, test } from '@playwright/test';

test.describe('the top nav (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('links to the page sections, the directory and the Code; a section link glides there', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const name of ['Who it’s for', 'How it works', 'For brands', 'Directory', 'The Code']) await expect(nav.getByRole('link', { name })).toBeVisible();
    await nav.getByRole('link', { name: 'For brands' }).click();
    await expect(page).toHaveURL(/#brands$/);
    // Lands just below the fixed bar, not under it.
    await expect.poll(() => page.locator('#brands').evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4000 }).toBeLessThanOrEqual(90);
    expect(await page.locator('#brands').evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(60);
  });

  test('Directory goes to its own page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Directory' }).click();
    await expect(page).toHaveURL(/\/creators$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/find your people/i);
  });

  test('the first Tab lands on a skip link that jumps past the nav', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('the menu on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens as a dialog, keeps focus inside, closes on Escape and hands focus back', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /menu/i });
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

  test('a section link closes the menu and scrolls there', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /menu/i }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'How it works' }).click();
    await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
    await expect.poll(() => page.locator('#how').evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4000 }).toBeLessThanOrEqual(90);
  });
});
