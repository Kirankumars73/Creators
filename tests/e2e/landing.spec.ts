import { expect, test } from '@playwright/test';

const SECTIONS = ['top', 'the-room', 'lanes', 'how', 'inside', 'pass', 'brands', 'roll-call', 'the-code', 'faq', 'join'];

test.describe('landing with Supabase unreachable (the e2e server has none)', () => {
  test('the hero says its line, shows no fake count, and the console stays clean', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName("WE'D RATHER SHOW THAN TELL.");
    await expect(page.locator('#top .odometer')).toHaveCount(0);
    await expect(page.locator('#top')).toContainText('the room is opening');
    await page.waitForTimeout(1800);
    expect(errors).toEqual([]);
  });

  test('the stats never invent a number: no members yet reads "Day 1"', async ({ page }) => {
    await page.goto('/');
    const stats = page.getByRole('region', { name: 'The kootam in numbers' });
    await expect(stats).toContainText('Day 1');
    await expect(stats).not.toContainText(/\b0 members\b/i);
  });

  test('roll call is honest when the database is unreachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#roll-call')).toContainText('signal lost');
  });
});

test('opening the page already scrolled deep (/#brands) throws nothing (regression: onLeave firing during setup)', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#brands');
  await page.waitForTimeout(1500);
  await page.locator('#brands form').getByLabel('Your name').fill('Anjali Menon');
  expect(errors).toEqual([]);
  // …and the words it skipped past are lit, not stuck dim.
  await expect.poll(() => page.locator('#the-room [data-word]').first().evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

test('every section is on the page, in order', async ({ page }) => {
  await page.goto('/');
  const ids = await page.evaluate(() => [...document.querySelectorAll('main > section[id]')].map((s) => s.id));
  expect(ids).toEqual(SECTIONS);
});

test('the headline lines have room to breathe (line-height at least 0.94 of the size)', async ({ page }) => {
  await page.goto('/');
  const [lh, fs] = await page.locator('h1').evaluate((el) => [parseFloat(getComputedStyle(el).lineHeight), parseFloat(getComputedStyle(el).fontSize)]);
  expect(lh / fs).toBeGreaterThanOrEqual(0.94);
});

test('the headline paints at first paint: no intro, nothing hiding it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
});

test.describe('scroll-linked pieces (desktop)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the manifesto words end fully lit once scrolled into view (regression: hydration double-registration)', async ({ page }) => {
    await page.goto('/');
    await page.locator('#lanes').scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.locator('#the-room [data-word]').evaluateAll((els) => els.every((e) => getComputedStyle(e).opacity === '1')), { timeout: 4000 })
      .toBe(true);
  });

  test('how it works pins and scrubs its eight steps sideways', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#how li')).toHaveCount(8);
    await expect(page.locator('#how .how-wrap[data-pinned]')).toHaveCount(1, { timeout: 5000 });
    const x = () => page.locator('#how .how-track').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
    await page.locator('#how').scrollIntoViewIfNeeded();
    const start = await x();
    await page.mouse.wheel(0, 900);
    await expect.poll(x, { timeout: 4000 }).toBeLessThan(start - 100);
  });
});

test('three lanes, each with its craft on a screen before its name — never behind the copy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  for (const lane of ['creator', 'editor', 'other']) {
    const card = page.locator(`#lanes article[data-lane="${lane}"]`);
    const art = (await card.locator('[data-monitor] svg[data-craft-art]').boundingBox())!;
    const title = (await card.locator('h3').boundingBox())!;
    // The two lanes stack art over title; the wide "something else" card sets them side by side.
    const above = art.y + art.height <= title.y + 1;
    const beside = art.x + art.width <= title.x + 1;
    expect(above || beside, `${lane}: art sits before the title`).toBe(true);
  }
});

test('on a phone nothing pushes the page sideways', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const id of SECTIONS) await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
});

test('the pass preview recolours by lane', async ({ page }) => {
  await page.goto('/');
  const pass = page.locator('#pass .holo-pass');
  await expect(pass).toHaveAttribute('data-lane', 'editor');
  await page.locator('#pass').getByRole('button', { name: 'LANE 01' }).click();
  await expect(pass).toHaveAttribute('data-lane', 'creator');
  await expect(page.locator('#pass').getByRole('button', { name: 'LANE 01' })).toHaveAttribute('aria-pressed', 'true');
});

test('the Code shelf shows three articles and leads to all seven', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#the-code li')).toHaveCount(3);
  await expect(page.locator('#the-code li').first()).toContainText('Credit the editor. Every time. In the caption, not the comments.');
  await page.getByRole('link', { name: /read all seven/i }).click();
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

test.describe('the ready-to-start dock', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('rises after the hero, and once hidden stays hidden for the visit', async ({ page }) => {
    await page.goto('/');
    const dock = page.getByRole('complementary', { name: 'Join' });
    await expect(dock).not.toHaveAttribute('data-shown');
    await page.locator('#lanes').scrollIntoViewIfNeeded();
    await expect(dock).toHaveAttribute('data-shown');
    await dock.getByRole('button', { name: 'Hide' }).click();
    await expect(dock).toHaveCount(0);
    await page.reload();
    await page.locator('#lanes').scrollIntoViewIfNeeded();
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
  test('the gate and the credits say what they should', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#join h2')).toHaveText(/TAKE\s+YOUR\s+PLACE\./);
    await expect(page.locator('footer')).not.toContainText('GOWTHAM DAS');
    await expect(page.locator('footer')).toContainText(/FOUNDED IN KERALA/i);
    await expect(page.locator('footer .marquee')).toContainText('KOOTAM');
  });

  test('the footer has the contact address, no SITE BY credit, and the copyright as its very last line', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const contact = footer.getByRole('link', { name: 'gowthamdas04@gmail.com' });
    await expect(contact).toHaveAttribute('href', 'mailto:gowthamdas04@gmail.com');
    await expect(footer).not.toContainText('SITE BY');
    const last = footer.locator(':scope > :last-child');
    await expect(last).toHaveText('© kiran@2003');
    await expect(last).toHaveCSS('text-transform', 'none');
    const signoff = footer.locator('[data-ml-signoff] [data-ml-mark]');
    await expect(signoff).toBeVisible();
    await expect(signoff).toHaveText('നമോവാധം');
    expect(await footer.evaluate((f) => f.lastElementChild!.previousElementSibling!.classList.contains('marquee'))).toBe(true);
  });
});

test('the landing page never downloads the 200KB Malayalam font (performance)', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const anek = await page.evaluate(() => [...document.fonts].filter((f) => /anek/i.test(f.family) && f.status !== 'unloaded').length);
  expect(anek).toBe(0);
  await expect(page.locator('footer [data-ml-mark]').filter({ hasText: 'കൂട്ടം' })).toBeVisible();
});
