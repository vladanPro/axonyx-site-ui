// Browser plugin not available; reuse existing UI-workspace test-only Playwright.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

const require = createRequire(resolve(process.env.AXONYX_UI_QA_PACKAGE || '../axonyx-ui/package.json'));
const { chromium } = require('playwright');
const base = process.env.AXONYX_UI_BASE_URL || 'http://127.0.0.1:3114';
const browser = await chromium.launch();

async function assertAppearance() {
  const native = await browser.newPage({ javaScriptEnabled: false });
  try {
    await native.goto(base + '/docs/installation');
    const site = native.locator('.foundry-site');
    assert.equal(await site.getAttribute('data-foundry-style'), 'legura');
    assert.equal(await site.getAttribute('data-foundry-mode'), 'light');
    assert.equal(await native.getByRole('combobox', { name: 'Palette' }).isDisabled(), true);
  } finally {
    await native.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  try {
    await page.goto(base);
    const style = page.getByRole('combobox', { name: 'Style' });
    const palette = page.getByRole('combobox', { name: 'Palette' });
    const site = page.locator('.foundry-site');
    const preview = page.locator('.foundry-pilot');
    assert.equal(await style.inputValue(), 'legura');
    assert.equal(await palette.isDisabled(), true);
    await preview.locator('button[data-finish="gold"]').first().click();
    assert.equal(await preview.getAttribute('data-foundry'), 'gold');
    assert.equal(await site.getAttribute('data-foundry'), 'bronze');
    assert.match(await preview.locator('#theme-css').inputValue(), /data-foundry="gold".*data-foundry-mode="light"/);
    await style.selectOption('classic');
    assert.equal(await palette.isEnabled(), true);
    await palette.selectOption('silver');
    assert.equal(await site.getAttribute('data-foundry-mode'), 'dark');
    await style.selectOption('legura');
    await page.goto(base + '/components/data-table');
    assert.equal(await style.inputValue(), 'legura');
    assert.equal(await palette.inputValue(), 'bronze');
    assert.equal(await palette.isDisabled(), true);
    await style.selectOption('classic');
    assert.equal(await palette.inputValue(), 'silver');
    assert.equal(await palette.isEnabled(), true);
    console.log('PASS Legura default, isolated customizer and saved palette restore');
  } finally {
    await page.close();
  }
}

try {
  await assertAppearance();
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
        const nav = page.locator('.ax-site-header__links');
        if (!home) {
          const sidebar = page.locator('.ui-sidebar-nav.ax-sidebar-nav');
          const selected = sidebar.locator('a[aria-current="page"]');
          await selected.waitFor({ state: 'attached' });
          assert.equal(await selected.count(), 1);
          assert.equal(await selected.getAttribute('href'), path);
          await page.waitForFunction(() => {
            const link = document.querySelector('.ui-sidebar-nav.ax-sidebar-nav a[aria-current="page"]');
            return link && getComputedStyle(link).borderLeftColor !== 'rgba(0, 0, 0, 0)'
              && link.getAnimations().every(animation => animation.playState !== 'running');
          });
          const style = await selected.evaluate(node => {
            const css = getComputedStyle(node);
            return { radius: css.borderRadius, padding: css.padding, shadow: css.boxShadow,
              left: css.borderLeftColor, top: css.borderTopColor };
          });
          assert.equal(style.radius, '5px');
          assert.equal(style.padding, '6px 10px');
          assert.equal(style.shadow, 'none');
          assert.notEqual(style.left, style.top);
          assert.equal(style.top, 'rgba(0, 0, 0, 0)');
        }
        if (await page.locator('.ax-site-header__toggle').isVisible()) {
          await page.locator('.ax-site-header__toggle').click();
          assert.equal(await page.locator('.ax-site-header__toggle').getAttribute('aria-expanded'), 'true');
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
