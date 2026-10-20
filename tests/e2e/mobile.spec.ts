import { expect, test } from '@playwright/test';

// Phones are as important as desktops here: most visitors arrive from an Instagram bio on one.
// These run with touch emulation on the production build, at the narrowest and the most
// common widths.
const PAGES = ['/', '/join', '/creators', '/code', '/privacy', '/m/anu.shoots', '/no-such-page'];
const SIZES = [
  { w: 320, h: 640 },
  { w: 360, h: 740 },
  { w: 390, h: 844 },
  { w: 412, h: 915 },
];

for (const { w, h } of SIZES) {
  test.describe(`phone ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

    for (const path of PAGES) {
      test(`${path} never scrolls sideways`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
        });
        expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      });
    }

    test('the first screen shows the headline and the way in', async ({ page }) => {
      await page.goto('/');
      const h1 = (await page.locator('h1').boundingBox())!;
      expect(h1.y + Math.min(h1.height, 60)).toBeLessThan(h);
      const join = (await page.getByRole('link', { name: 'Join', exact: true }).first().boundingBox())!;
      expect(join.y).toBeLessThan(h);
      expect(join.height).toBeGreaterThanOrEqual(44);
    });

    test('the floating join bar: its button sits fully inside the bar, rounded to match, with no corner marks poking out', async ({ page }) => {
      await page.goto('/');
      await page.locator('#how').scrollIntoViewIfNeeded();
      const dock = page.getByRole('complementary', { name: 'Join' });
      await expect(dock).toHaveAttribute('data-shown');
      // The bar slides up over ~0.4s: wait until it has stopped, then measure bar and button in
      // the same instant, so a half-finished slide can't make them disagree.
      await expect.poll(() => dock.evaluate((el) => getComputedStyle(el).transform), { timeout: 4000 }).toBe('none');
      const button = dock.getByRole('link', { name: 'Join the kootam' });
      const { bar, b } = await dock.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const q = el.querySelector('a[href="/join"]')!.getBoundingClientRect();
        return { bar: { x: r.x, y: r.y, width: r.width, height: r.height }, b: { x: q.x, y: q.y, width: q.width, height: q.height } };
      });
      expect(b.x, 'left edge').toBeGreaterThanOrEqual(bar.x - 0.5);
      expect(b.x + b.width, 'right edge').toBeLessThanOrEqual(bar.x + bar.width + 0.5);
      expect(b.y, 'top edge').toBeGreaterThanOrEqual(bar.y - 0.5);
      expect(b.y + b.height, 'bottom edge').toBeLessThanOrEqual(bar.y + bar.height + 0.5);
      expect(await button.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThan(20);
      expect(await button.locator('svg').count(), 'corner marks').toBe(0);
      expect(bar.x + bar.width, 'bar stays on screen').toBeLessThanOrEqual(w + 0.5);
    });

    test('the menu opens, locks the page, and a tapped link closes it and lands under the bar', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /menu/i }).tap();
      const dialog = page.getByRole('dialog', { name: 'Menu' });
      await expect(dialog).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
      await dialog.getByRole('link', { name: 'For brands' }).tap();
      await expect(dialog).toHaveCount(0);
      await expect.poll(() => page.locator('#brands').evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 4000 }).toBeLessThanOrEqual(100);
    });
  });
}

test.describe('phone form fields', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  // Below 16px, iOS Safari zooms the page in when a field is tapped and doesn't zoom back out.
  test('every form field is at least 16px (no zoom-on-focus on iPhone)', async ({ page }) => {
    for (const path of ['/', '/creators']) {
      await page.goto(path);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]), select, textarea')]
          .filter((el) => el.getBoundingClientRect().width > 2 && getComputedStyle(el).visibility !== 'hidden')
          .map((el) => ({ el: el.getAttribute('name') || el.getAttribute('aria-label') || el.tagName, px: parseFloat(getComputedStyle(el).fontSize) }))
          .filter((x) => x.px < 16),
      );
      expect(small, path).toEqual([]);
    }
  });

  test('the brief form’s fields and button are comfortable to tap', async ({ page }) => {
    await page.goto('/#brands');
    const form = page.locator('#brands form');
    for (const label of ['Brand / organisation', 'Your name', 'Email']) {
      expect((await form.getByLabel(label).boundingBox())!.height, label).toBeGreaterThanOrEqual(44);
    }
    expect((await form.getByRole('button', { name: /send the brief/i }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('the hero’s three rooms swipe sideways inside their own row, and each opens /join', async ({ page }) => {
    await page.goto('/');
    const row = page.locator('#top ul').first();
    const before = await row.evaluate((el) => el.scrollLeft);
    await row.evaluate((el) => el.scrollBy({ left: 260, behavior: 'instant' }));
    expect(await row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
    for (const room of ['creator', 'editor', 'other']) await expect(page.locator(`#top [data-poster="${room}"]`)).toHaveAttribute('href', '/join');
  });
});

test.describe('a phone held sideways', () => {
  test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });

  test('the headline is still on the first screen (the big കൂട്ടം does not push it away)', async ({ page }) => {
    await page.goto('/');
    expect((await page.locator('h1').boundingBox())!.y).toBeLessThan(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});
