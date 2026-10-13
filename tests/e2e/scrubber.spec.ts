import { expect, test } from '@playwright/test';

test.describe('the timeline scrubber is the navigation (§6.2)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a real nav of real buttons; Enter on a clip cuts to that section', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Section navigation' });
    await expect(nav.getByRole('button')).toHaveCount(7);
    const code = nav.getByRole('button', { name: '04 THE CODE' });
    await code.focus();
    await page.keyboard.press('Enter');
    await expect.poll(async () => page.locator('#the-code').evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 3000 }).toBeLessThanOrEqual(2);
    expect(await page.locator('#the-code').evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeGreaterThanOrEqual(-2);
    await expect(code).toHaveAttribute('aria-current', 'true');
  });

  test('the first clip is current at the top of the page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '01 COLD OPEN' })).toHaveAttribute('aria-current', 'true');
  });
});

test.describe('on a phone it collapses to a hairline and a name', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('no clip buttons, just the current section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '04 THE CODE' })).toBeHidden();
    await expect(page.locator('[data-scrub-current]')).toHaveText('COLD OPEN');
  });
});
