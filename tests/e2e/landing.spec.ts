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

test.describe("WHO'S INSIDE and THE CODE (§6.4, §6.5)", () => {
  test('/code carries all seven articles, starting with crediting the editor', async ({ page }) => {
    await page.goto('/code');
    await expect(page.locator('[data-article]')).toHaveCount(7);
    await expect(page.locator('[data-article="01"]')).toContainText('Credit the editor. Every time. In the caption, not the comments.');
  });

  test('the teaser leads to the full Code', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /read all seven/i }).click();
    await expect(page).toHaveURL(/\/code$/);
  });

  test('on a phone the lanes never push the page sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const overflow = await page.locator('#whos-inside').evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('hovering a lane racks focus onto it and its lane color', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('[data-cold-open]')).toBeHidden();
    const frames = page.locator('#whos-inside [data-gate]');
    await expect(frames).toHaveCount(2);
    await frames.nth(1).hover();
    await expect.poll(() => frames.nth(0).evaluate((el) => getComputedStyle(el).filter)).toContain('blur(3px)');
    await expect.poll(() => frames.nth(1).evaluate((el) => getComputedStyle(el).filter)).not.toContain('blur(3px)');
  });
});

test('the cold-open slate credits the community, not a person', async ({ page }) => {
  await page.goto('/');
  const slate = page.locator('[data-cold-open]');
  await expect(slate).toContainText('PROD.');
  await expect(slate).not.toContainText('DIR.');
  await expect(slate).not.toContainText('GOWTHAM');
});

test('the hero cards show the craft, not a person: viewfinder, timeline, bars — and no photos', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#cold-open [data-reel]');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('img')).toHaveCount(0);
  expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute('data-craft')))).toEqual(['viewfinder', 'timeline', 'bars']);
  for (const svg of await cards.locator('svg[data-craft-art]').all()) expect(await svg.boundingBox()).not.toBeNull();
});

test.describe('the last reel (§6.6–§6.9)', () => {
  test('roll call is honest when the database is unreachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#roll-call')).toContainText('signal lost');
  });

  test('the join gate and the credits say what they should', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#join h2')).toHaveText(/TAKE\s+YOUR\s+PLACE\./);
    // The community's site, not a page about its founder: no founder credit in the footer or on the slate.
    await expect(page.locator('footer')).not.toContainText('GOWTHAM DAS');
    await expect(page.locator('footer')).toContainText('FOUNDED IN');
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
    // The sign-off is his Malayalam line, drawn from its pre-rendered image (no font download).
    const signoff = footer.locator('[data-ml-signoff] [data-ml-mark]');
    await expect(signoff).toBeVisible();
    await expect(signoff).toHaveText('നമോവാധം');
    // Below the marquee, and nothing in the page after it.
    expect(await footer.evaluate((f) => f.lastElementChild!.previousElementSibling!.classList.contains('marquee'))).toBe(true);
    const bottom = await page.evaluate(() => {
      const els = [...document.body.querySelectorAll('*')].filter((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.height > 0 && cs.position !== 'fixed' && cs.visibility !== 'hidden' && el.textContent?.trim();
      });
      return Math.max(...els.map((el) => el.getBoundingClientRect().bottom + window.scrollY));
    });
    const lastBottom = await last.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
    expect(lastBottom).toBeGreaterThanOrEqual(bottom - 1);
  });

  test('the four rituals are on the timeline', async ({ page }) => {
    await page.goto('/');
    for (const name of ['WEEKLY DROP', 'THE CUT ROOM', 'LOOKING FOR', 'GEAR & GRIEF']) await expect(page.locator('#inside')).toContainText(name);
  });
});

test('the landing page never downloads the 200KB Malayalam font (performance)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cold-open]')).toBeHidden();
  await page.evaluate(() => document.fonts.ready);
  const anek = await page.evaluate(() => [...document.fonts].filter((f) => /anek/i.test(f.family) && f.status !== 'unloaded').length);
  expect(anek).toBe(0);
  // …and the wordmark still shows കൂട്ടം, shaped by the pre-rendered image.
  await expect(page.locator('footer [data-ml-mark]').filter({ hasText: 'കൂട്ടം' })).toBeVisible();
});
