import { test, expect } from '@playwright/test';
import { loginAndSelectCompany } from '../helpers/odoo';

test('login and select company', async ({ page }) => {
  await loginAndSelectCompany(page);

  await expect(page.locator('.o_main_navbar')).toBeVisible();
  console.log(`  ✓ Logged in as ${process.env.ODOO_EMAIL || ''}`);

  const backendUrl = page.url().split('?')[0];
  await page.goto(`${backendUrl}?debug=1`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.o_main_navbar', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ Developer mode activated');

  await page.screenshot({ path: 'test-results/login-company.png', fullPage: false });
  console.log('  ✓ Screenshot saved to test-results/login-company.png');

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  console.log('  ✓ Session saved to playwright/.auth/user.json');
});
