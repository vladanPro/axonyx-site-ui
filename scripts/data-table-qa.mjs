// Test-only tooling comes from the UI workspace, never from the deployed app.
// Browser plugin not available; use the existing Playwright dev dependency.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.AXONYX_UI_QA_PACKAGE || '../axonyx-ui/package.json'));
const { chromium } = require('playwright');
const base = process.env.AXONYX_UI_BASE_URL || 'http://127.0.0.1:3112';
const expectedCode = readFileSync('app/components/data-table/ContentInventory.asx', 'utf8').replace(/\r/g, '').trim();
const browser = await chromium.launch();
try {
  for (const width of [1280, 390]) {
    for (const javaScriptEnabled of [true, false]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, javaScriptEnabled });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        const response = await page.goto(base + '/components/data-table');
        assert.equal(response.status(), 200);
        assert.match(await page.title(), /Axonyx UI/);
        await page.getByRole('heading', { name: 'DataTable', exact: true }).waitFor();
        const example = page.locator('.ax-component-example').first();
        const root = example.locator('[data-ax-data-table]');
        const titles = () => root.locator('tbody tr:visible td:first-child').allTextContents();
        if (javaScriptEnabled) {
          assert.deepEqual(await titles(), ['Alpha', 'Echo']);
          await root.getByRole('searchbox', { name: 'Search posts' }).fill('Published');
          assert.deepEqual(await titles(), ['Alpha', 'Bravo']);
          await root.getByRole('button', { name: 'Next', exact: true }).click();
          assert.deepEqual(await titles(), ['Charlie']);
          await root.getByRole('button', { name: 'Title', exact: true }).focus();
          await page.keyboard.press('Enter');
          assert.deepEqual(await titles(), ['Alpha', 'Bravo']);
          await page.keyboard.press('Space');
          assert.deepEqual(await titles(), ['Charlie', 'Bravo']);
          await root.getByRole('searchbox').fill('no matching row');
          assert.equal(await root.locator('[data-ax-table-empty]').isVisible(), true);
          assert.equal(await root.getByRole('button', { name: 'Next', exact: true }).isDisabled(), true);
          await root.getByRole('searchbox').fill('');
          assert.equal(await page.locator('a[href="/components/data-table"][aria-current="page"]').count(), 1);
        } else {
          assert.equal(await root.locator('tbody tr:visible').count(), 5);
          assert.equal(await root.getByRole('searchbox').count(), 0);
        }
        await example.locator('summary').click();
        const code = await example.locator('pre code').textContent();
        assert.equal(code.replace(/\r/g, '').trim(), expectedCode, 'copyable source must match the actual component');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
        if (javaScriptEnabled) {
          await page.screenshot({ path: `${process.env.TEMP || '/tmp'}/axonyx-catalog-data-table-${width}.png`, fullPage: false });
        }
        console.log(`PASS catalog DataTable ${width}px ${javaScriptEnabled ? 'JS' : 'no-JS'}`);
      } finally { await page.close(); }
    }
  }
} finally { await browser.close(); }
