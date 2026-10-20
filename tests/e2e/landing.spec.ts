import { expect, test } from '@playwright/test';

const SECTIONS = ['top', 'the-room', 'how', 'inside', 'pass', 'brands', 'roll-call', 'the-code', 'faq', 'join'];

test.describe('landing with Supabase unreachable (the e2e server has none)', () => {
  test('the hero says its line, invents no count, and the console stays clean', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName("WE'D RATHER SHOW THAN TELL.");
    await expect(page.locator('#top')).toContainText('The room just opened. Be one of the first in.');
    await expect(page.locator('#top')).not.toContainText(/makers are already inside/);
    await page.waitForTimeout(1800);
    expect(errors).toEqual([]);
  });

  test('the member wall says it didn’t load, rather than looking empty', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#roll-call')).toContainText('The member list didn’t load. Refresh in a minute.');
  });
});

test('opening the page already scrolled deep (/#brands) throws nothing', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#brands');
  await page.waitForTimeout(1000);
  await page.locator('#brands form').getByLabel('Your name').fill('Anjali Menon');
  expect(errors).toEqual([]);
});

test('every section is on the page, in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page.evaluate(() => [...document.querySelectorAll('main > section[id]')].map((s) => s.id));
  expect(ids).toEqual(SECTIONS);
});

test.describe('the wall', () => {
  test('the public page is the light, lime-washed wall, and the browser chrome matches it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#EEF2F8');
    const bg = await page.locator('[data-surface="wall"]').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(238, 242, 248)');
  });

  test('കൂട്ടം is painted on it from the pre-rendered wall image, brushed by the SVG filter', async ({ page }) => {
    await page.goto('/');
    const mark = page.locator('#top .wall-writing');
    await expect(mark).toBeVisible();
    await expect(mark).toHaveText('കൂട്ടം');
    expect(await mark.evaluate((el) => getComputedStyle(el).maskImage)).toContain('wordmark-wall.png');
    expect(await mark.evaluate((el) => getComputedStyle(el).filter)).toContain('#brush');
  });

  test('the headline paints at first paint and its lines have room to breathe', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const [lh, fs] = await h1.evaluate((el) => [parseFloat(getComputedStyle(el).lineHeight), parseFloat(getComputedStyle(el).fontSize)]);
    expect(lh / fs).toBeGreaterThanOrEqual(0.94);
  });

  test('the three rooms are posters pasted on the wall, each a way into joining', async ({ page }) => {
    await page.goto('/');
    const posters = page.locator('#top [data-poster]');
    await expect(posters).toHaveCount(3);
    expect(await posters.evaluateAll((els) => els.map((e) => e.getAttribute('data-poster')))).toEqual(['creator', 'editor', 'other']);
    for (const p of await posters.all()) await expect(p).toHaveAttribute('href', '/join');
    await expect(page.getByRole('link', { name: /join the content creators room/i })).toBeVisible();
  });

  test('on a phone nothing pushes the page sideways (the posters swipe inside their own row)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    for (const id of SECTIONS) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
});

test('joining is five numbered steps, because it is a sequence', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#how ol > li')).toHaveCount(5);
  await expect(page.locator('#how ol > li').first()).toContainText('Sign in with Google');
  await expect(page.locator('#how ol > li').last()).toContainText('Open WhatsApp');
});

test('the Code shelf shows three articles and leads to all seven', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#the-code li')).toHaveCount(3);
  await expect(page.locator('#the-code li').first()).toContainText('Credit the editor. Every time. In the caption, not the comments.');
  await page.getByRole('link', { name: 'Read all seven rules' }).click();
  await expect(page).toHaveURL(/\/code$/);
});

test('FAQ: native disclosure, one answer open at a time', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('#faq details');
  await expect(items.first()).toHaveAttribute('open', '');
  await items.nth(2).locator('summary').click();
  await expect(items.nth(2)).toHaveAttribute('open', '');
  await expect(items.first()).not.toHaveAttribute('open', '');
});

test.describe('the ready-to-join dock', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('rises after the hero, and once hidden stays hidden for the visit', async ({ page }) => {
    await page.goto('/');
    const dock = page.getByRole('complementary', { name: 'Join' });
    await expect(dock).not.toHaveAttribute('data-shown');
    await page.locator('#how').scrollIntoViewIfNeeded();
    await expect(dock).toHaveAttribute('data-shown');
    await dock.getByRole('button', { name: 'Hide' }).click();
    await expect(dock).toHaveCount(0);
    await page.reload();
    await page.locator('#how').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(page.getByRole('complementary', { name: 'Join' })).toHaveCount(0);
  });

  test('sinks over the final call to action', async ({ page }) => {
    await page.goto('/');
    await page.locator('#join').scrollIntoViewIfNeeded();
    await expect(page.getByRole('complementary', { name: 'Join' })).not.toHaveAttribute('data-shown');
  });
});

test.describe('the brand brief form', () => {
  test('empty submit names each missing field and focuses the first', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('#brands form');
    await page.waitForTimeout(3200); // the bot guard drops forms finished faster than a person types
    await form.getByRole('button', { name: /send the brief/i }).click();
    await expect(form.getByText('Your brand or organisation, at least 2 characters.')).toBeVisible();
    await expect(form.getByText('We need an email we can reply to.')).toBeVisible();
    await expect(form.getByLabel('Brand / organisation')).toBeFocused();
  });

  test('with no database it says so and hands over the email address instead', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('#brands form');
    await form.getByLabel('Brand / organisation').fill('Malabar Café');
    await form.getByLabel('Your name').fill('Anjali Menon');
    await form.getByLabel('Email').fill('anjali@example.com');
    await page.waitForTimeout(3200);
    await form.getByRole('button', { name: /send the brief/i }).click();
    const alert = form.getByRole('alert');
    await expect(alert).toContainText('offline');
    await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:gowthamdas04@gmail\.com/);
  });
});

test.describe('the end of the page', () => {
  test('the last wall and the footer say what they should', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'TAKE YOUR PLACE.' })).toBeVisible();
    await expect(page.locator('footer')).not.toContainText('GOWTHAM DAS');
    await expect(page.locator('footer')).toContainText('Founded in Kerala');
    await expect(page.locator('footer .marquee')).toContainText('KOOTAM');
  });

  test('the footer has the contact address, no SITE BY credit, and the copyright as its very last line', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'gowthamdas04@gmail.com' })).toHaveAttribute('href', 'mailto:gowthamdas04@gmail.com');
    await expect(footer).not.toContainText('SITE BY');
    const last = footer.locator(':scope > :last-child');
    await expect(last).toHaveText('© kiran@2003');
    const signoff = footer.locator('[data-ml-signoff] [data-ml-mark]');
    await expect(signoff).toBeVisible();
    await expect(signoff).toHaveText('നമോവാധം');
    expect(await footer.evaluate((f) => f.lastElementChild!.previousElementSibling!.classList.contains('marquee'))).toBe(true);
  });
});

test('the public pages never download the 200KB Malayalam font (performance)', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const anek = await page.evaluate(() => [...document.fonts].filter((f) => /anek/i.test(f.family) && f.status !== 'unloaded').length);
  expect(anek).toBe(0);
  await expect(page.locator('footer [data-ml-mark]').filter({ hasText: 'കൂട്ടം' })).toBeVisible();
});
