import { test, expect } from '@playwright/test';
import { BASE_URL, dismissAnyModal, fillMany2one, fillMany2oneByLabel, selectFirstDropdownByLabel } from '../helpers/odoo';

test('Repair RUG', async ({ page }) => {
  // Navigate to the backend home (app grid)
  await page.goto(`${BASE_URL}/web`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.o_home_menu, .o_app', { timeout: 30_000 });
  await dismissAnyModal(page);
  await page.waitForTimeout(1_000);

  // Click the Helpdesk app icon
  const helpdeskApp = page.locator('.o_app').filter({ hasText: /^Helpdesk$/i }).first();
  await expect(helpdeskApp).toBeVisible({ timeout: 10_000 });
  await helpdeskApp.click();
  await page.waitForSelector('.o_main_navbar', { timeout: 20_000 });
  await page.waitForTimeout(1_500);
  console.log('  ✓ Helpdesk app opened');

  // Find the Customer Care - Repair team card and click its Tickets button
  const teamCard = page.locator('.o_kanban_record').filter({ hasText: /Customer Care\s*-\s*Repair/i }).first();
  await expect(teamCard).toBeVisible({ timeout: 15_000 });
  console.log('  ✓ Found Customer Care - Repair team');

  const ticketButton = teamCard.locator('button').filter({ hasText: /^Tickets$/i }).first();
  await expect(ticketButton).toBeVisible({ timeout: 5_000 });
  await ticketButton.click();
  await page.waitForTimeout(1_500);
  console.log('  ✓ Clicked Tickets button under Customer Care - Repair');

  // Click "New" to open a new ticket form
  const newBtn = page.getByRole('button', { name: 'New' }).first();
  await expect(newBtn).toBeVisible({ timeout: 10_000 });
  await newBtn.click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ New ticket form opened');

  // Click "Assign to me"
  const assignBtn = page.locator('button').filter({ hasText: /Assign to me/i }).first();
  await expect(assignBtn).toBeVisible({ timeout: 8_000 });
  await assignBtn.click();
  await page.waitForTimeout(600);
  console.log('  ✓ Clicked Assign to me');

  // Select "Repair - Under warranty - RUG" from the Type field
  await fillMany2one(page, 'ticket_type_id', 'Repair - Under warranty - RUG');
  console.log('  ✓ Type set to: Repair - Under warranty - RUG');
  await page.waitForTimeout(800);

  // Select "BR-AM/Stock" from Return Receipt Location (field name discovered via label)
  await fillMany2oneByLabel(page, 'Return Receipt Location', 'BR-AM/Stock');
  console.log('  ✓ Return Receipt Location set to: BR-AM/Stock');
  await page.waitForTimeout(800);

  // Select first available option from Repair Reason (field name discovered via label)
  const reasonText = await selectFirstDropdownByLabel(page, 'Repair Reason');
  console.log(`  ✓ Repair Reason selected: ${reasonText}`);

  // Select "factory repair" from Job Location
  await fillMany2oneByLabel(page, 'Job Location', 'factory repair');
  console.log('  ✓ Job Location set to: factory repair');
  await page.waitForTimeout(800);

  // Select "Kurunegala Cash Customer" from Customer
  await fillMany2oneByLabel(page, 'Customer', 'Kurunegala Cash Customer');
  console.log('  ✓ Customer set to: Kurunegala Cash Customer');
  await page.waitForTimeout(800);

  // Select Serial Number — Product is derived from the serial and only renders after this is set
  const serialNumber = '1307_002';
  await fillMany2oneByLabel(page, 'Serial Number', serialNumber);
  await page.waitForTimeout(800);
  console.log(`  ✓ Serial Number set to: ${serialNumber}`);

  const productText = (await page.locator('[name="product_id"]').first().textContent())?.trim() ?? '';
  expect(productText.length).toBeGreaterThan(0);
  console.log(`  ✓ Product auto-set from Serial Number to: ${productText}`);

  // Save the ticket using the "Save manually" button (floppy-disk icon in breadcrumb bar)
  const saveBtn = page.locator('.o_form_button_save').first();
  await expect(saveBtn).toBeVisible({ timeout: 8_000 });
  await saveBtn.click();

  // The save button becomes disabled once the record is actually persisted —
  // a stronger signal than checking for the (transient) "Invalid fields" toast.
  await expect(saveBtn).toBeDisabled({ timeout: 8_000 });
  console.log('  ✓ Ticket saved');

  await page.screenshot({ path: 'test-results/repair-rug.png', fullPage: false });
  console.log('  ✓ Screenshot saved to test-results/repair-rug.png');
});
