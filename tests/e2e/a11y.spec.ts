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

    for (const path of ['/', '/creators', '/code', '/join', '/admin']) {
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

  test('Tab goes skip link → home → main nav → sign in / join → hero calls to action, always with a visible focus ring', async ({ page }) => {
    await page.goto('/');
    const seen: string[] = [];
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const cs = getComputedStyle(el);
        return { name: (el.getAttribute('aria-label') || el.innerText || '').trim(), outline: cs.outlineStyle, width: cs.outlineWidth };
      });
      expect(info.outline, `focus ring on "${info.name}"`).not.toBe('none');
      seen.push(info.name);
    }
    expect(seen.slice(0, 9).map((s) => s.toUpperCase())).toEqual([
      'SKIP TO CONTENT',
      'CREATORS KOOTAM — HOME',
      'WHO IT’S FOR',
      'HOW IT WORKS',
      'FOR BRANDS',
      'DIRECTORY',
      'THE CODE',
      'SIGN IN',
      'JOIN',
    ]);
    expect(seen[9]).toMatch(/JOIN AS A CREATOR/i);
    expect(seen[10]).toMatch(/I’M A BRAND/i);
  });
});

test.describe('reflow and touch targets on a phone', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ['/', '/creators', '/code', '/join']) {
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
