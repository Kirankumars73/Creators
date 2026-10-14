import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
}

async function settle(page: Page) {
  // Walk the page so every scroll reveal has played, then come back up.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

for (const reduced of [false, true]) {
  test.describe(reduced ? 'axe — reduced motion' : 'axe — default motion', () => {
    test.use({ reducedMotion: reduced ? 'reduce' : 'no-preference' });

    for (const path of ['/', '/code', '/join', '/admin']) {
      test(`${path} has no WCAG 2.1 A/AA violations`, async ({ page }) => {
        await page.goto(path);
        if (path === '/') await settle(page);
        expect(await axe(page)).toEqual([]);
      });
    }
  });
}

test.describe('keyboard', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('Tab reaches the section navigation first, then the hero calls to action, with a visible focus ring', async ({ page }) => {
    await page.goto('/');
    // The scrubber stays invisible (unfocusable) until it has measured the page after hydration.
    await expect(page.getByRole('button', { name: '01 COLD OPEN' })).toBeVisible();
    const seen: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        return { name: (el.innerText || el.getAttribute('aria-label') || '').trim(), outline: cs.outlineStyle, width: cs.outlineWidth };
      });
      expect(info.outline, `focus ring on "${info.name}"`).not.toBe('none');
      seen.push(info.name);
    }
    expect(seen.slice(0, 7)).toEqual(['01 COLD OPEN', '02 THE ROOM', "03 WHO'S INSIDE", '04 THE CODE', '05 INSIDE', '06 ROLL CALL', '07 JOIN']);
    expect(seen).toContain('TAKE YOUR PLACE');
  });
});

test.describe('reflow and touch targets on a phone', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ['/', '/code', '/join']) {
    test(`${path} reflows at 320px with no sideways scroll (1.4.10)`, async ({ page }) => {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });

    test(`${path} interactive targets are at least 44px tall`, async ({ page }) => {
      await page.goto(path);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('a[href], button, input, select, [role="radio"]')]
          .filter((el) => el.offsetParent !== null)
          .map((el) => ({ el: (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40), h: Math.round(el.getBoundingClientRect().height) }))
          .filter((x) => x.h < 44),
      );
      expect(small).toEqual([]);
    });
  }
});
