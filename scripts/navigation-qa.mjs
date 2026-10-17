// Browser plugin not available; reuse existing UI-workspace test-only Playwright.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

const require = createRequire(resolve(process.env.AXONYX_UI_QA_PACKAGE || '../axonyx-ui/package.json'));
const { chromium } = require('playwright');
const base = process.env.AXONYX_UI_BASE_URL || 'http://127.0.0.1:3114';
const browser = await chromium.launch();
try {
  for (const width of [320, 390, 820, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      for (const path of ['/', '/docs/installation', '/components/data-table']) {
        const response = await page.goto(base + path);
        assert.equal(response.status(), 200);
        assert.match(await page.title(), /Axonyx UI/);
        const home = path === '/';
        const nav = page.locator(home ? '.fp-header nav' : '.site-nav__links');
        if (!home && await page.locator('.site-nav__toggle').isVisible()) {
          await page.locator('.site-nav__toggle').click();
          assert.equal(await page.locator('.site-nav__toggle').getAttribute('aria-expanded'), 'true');
        }
        const link = nav.locator('a[href="https://axonyx.dev"]');
        assert.equal(await link.count(), 1);
        assert.equal(await link.isVisible(), true, `${path} ${width}px: main site link must be visible`);
        await link.focus();
        assert.ok(await link.evaluate(node => document.activeElement === node));
        assert.ok(await link.evaluate(node => {
          const rect = node.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && rect.height > 0;
        }), `${path} ${width}px: link must fit inside viewport`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} ${width}px: page overflow`);
        if (width === 320 || width === 1440) {
          const name = home ? 'home' : path.includes('installation') ? 'docs' : 'components';
          await page.screenshot({ path: resolve(tmpdir(), `axonyx-framework-link-${name}-${width}.png`) });
        }
        assert.deepEqual(errors, []);
        console.log(`PASS framework navigation ${path} ${width}px`);
      }
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
