import { test, expect } from '@playwright/test';
import { BASE_URL, dismissAnyModal, fillMany2one, fillMany2oneByLabel } from '../helpers/odoo';
import * as fs from 'fs';
import * as path from 'path';

test('Stock Adjustment & Sale order creation', async ({ page }) => {
  test.setTimeout(300_000);
  // Navigate to the backend home (app grid)
  await page.goto(`${BASE_URL}/web`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.o_home_menu, .o_app', { timeout: 30_000 });
  await dismissAnyModal(page);
  await page.waitForTimeout(1_000);
  console.log('  ✓ Odoo main dashboard opened');

  // Open the Inventory app
  const inventoryApp = page.locator('.o_app').filter({ hasText: /^Inventory$/i }).first();
  await expect(inventoryApp).toBeVisible({ timeout: 10_000 });
  await inventoryApp.click();
  await page.waitForSelector('.o_main_navbar', { timeout: 20_000 });
  await page.waitForTimeout(1_500);
  console.log('  ✓ Inventory app opened');

  // Click "Products" top-nav menu to open dropdown
  const productsMenu = page.locator('.o_menu_sections').getByText('Products', { exact: true }).first();
  await expect(productsMenu).toBeVisible({ timeout: 10_000 });
  await productsMenu.click();
  await page.waitForTimeout(600);

  // Select "Products" from the dropdown
  const productsSubmenu = page.locator('.o_dropdown_menu, .dropdown-menu')
    .getByText('Products', { exact: true }).first();
  await expect(productsSubmenu).toBeVisible({ timeout: 5_000 });
  await productsSubmenu.click();
  await page.waitForSelector('.o_list_view, .o_kanban_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ Products list opened');

  // Clear all active search filters
  const filterTags = page.locator('.o_searchview_facet .o_delete');
  const filterCount = await filterTags.count();
  for (let i = 0; i < filterCount; i++) {
    await filterTags.first().click();
    await page.waitForTimeout(300);
  }
  if (filterCount > 0) console.log(`  ✓ Cleared ${filterCount} active filter(s)`);
  else console.log('  ℹ No active filters to clear');

  // Read product reference from Product.txt
  const productCode = fs.readFileSync(
    path.join(__dirname, '..', 'Product.txt'), 'utf-8'
  ).trim();
  console.log(`  ✓ Product code read from file: ${productCode}`);

  // Type the product code into the search bar and press Enter
  const searchInput = page.locator('.o_searchview input').first();
  await searchInput.click();
  await searchInput.fill(productCode);
  await searchInput.press('Enter');
  await page.waitForSelector('.o_list_view, .o_kanban_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log(`  ✓ Search applied for: ${productCode}`);

  // Open the product record
  const productRow = page.locator('.o_list_view .o_data_row').first();
  await expect(productRow).toBeVisible({ timeout: 10_000 });
  await productRow.click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await page.waitForTimeout(2_000);
  console.log(`  ✓ Product form opened: ${productCode}`);

  // Click the "On Hand" stat button (in the control panel header)
  const onHandBtn = page.locator('button, a, div[class*="stat"]').filter({ hasText: /On Hand/i }).first();
  await expect(onHandBtn).toBeVisible({ timeout: 12_000 });
  await onHandBtn.click();
  await page.waitForSelector('.o_list_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ On Hand stock list opened');

  // Click "New" to add a record
  const newBtn = page.getByRole('button', { name: 'New' }).first();
  await expect(newBtn).toBeVisible({ timeout: 8_000 });
  await newBtn.click();
  await page.waitForTimeout(1_000);
  console.log('  ✓ New record row created');

  // Select "BR-EK/Stock" from Location dropdown
  await fillMany2one(page, 'location_id', 'BR-EK/Stock');
  console.log('  ✓ Location set to: BR-EK/Stock');
  await page.waitForTimeout(600);

  // Read serial number from Serial.txt, increment by 1, use incremented value
  const rawSerial = fs.readFileSync(
    path.join(__dirname, '..', 'Serial.txt'), 'utf-8'
  ).trim();
  const snMatch = rawSerial.match(/^([\s\S]*?)(\d+)$/);
  if (!snMatch) throw new Error(`Cannot parse serial number: ${rawSerial}`);
  const serialNumber = `${snMatch[1]}${String(parseInt(snMatch[2], 10) + 1).padStart(snMatch[2].length, '0')}`;
  console.log(`  ✓ Serial number: ${rawSerial} → ${serialNumber}`);

  // Enter serial number in Lot/Serial Number field — create if not exists
  const lotInput = page.locator('[name="lot_id"] input').first();
  await lotInput.click();
  await lotInput.fill('');
  await lotInput.type(serialNumber, { delay: 60 });
  await page.waitForSelector('.o-autocomplete--dropdown-menu, .ui-autocomplete', { timeout: 8_000 });
  const exactLot = page.locator('.o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item').filter({ hasText: new RegExp(`^${serialNumber}$`, 'i') }).first();
  if (await exactLot.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await exactLot.click();
    console.log(`  ✓ Lot/Serial Number selected: ${serialNumber}`);
  } else {
    const createOption = page.locator('.o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item').filter({ hasText: new RegExp(`Create.*${serialNumber}`, 'i') }).first();
    await expect(createOption).toBeVisible({ timeout: 5_000 });
    await createOption.click();
    console.log(`  ✓ Lot/Serial Number created: ${serialNumber}`);
  }
  await page.waitForTimeout(800);

  // Save the new row
  const saveBtn = page.locator('.o_form_button_save, .o_list_button_save').first();
  if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await saveBtn.click();
  } else {
    await page.locator('.o_control_panel').click();
  }
  await page.waitForTimeout(1_000);
  console.log('  ✓ Record saved');

  // Click the Inventory Adjustment icon (pencil) on the new row
  const newRow = page.locator('.o_data_row').filter({ hasText: serialNumber }).first();
  await expect(newRow).toBeVisible({ timeout: 8_000 });
  const adjustIcon = newRow.locator('.fa-pencil, .o_icon_button .fa-pencil-square-o, button.o_inventory_quantity').first();
  await expect(adjustIcon).toBeVisible({ timeout: 5_000 });
  await adjustIcon.click();
  await page.waitForTimeout(1_000);
  console.log('  ✓ Inventory adjustment icon clicked');

  await page.screenshot({ path: 'test-results/stock-sale.png', fullPage: false });
  console.log('  ✓ Screenshot saved to test-results/stock-sale.png');

  // Write the incremented serial back to Serial.txt
  fs.writeFileSync(path.join(__dirname, '..', 'Serial.txt'), serialNumber, 'utf-8');
  console.log(`  ✓ Serial.txt saved: ${serialNumber}`);

  // ── SALE ORDER CREATION ──────────────────────────────────────────────────

  // Go back to home menu and open the Sales app
  await page.goto(`${BASE_URL}/web`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.o_home_menu, .o_app', { timeout: 30_000 });
  await dismissAnyModal(page);
  await page.waitForTimeout(1_000);

  const salesApp = page.locator('.o_app').filter({ hasText: /^Sales$/i }).first();
  await expect(salesApp).toBeVisible({ timeout: 10_000 });
  await salesApp.click();
  await page.waitForSelector('.o_main_navbar', { timeout: 20_000 });
  await page.waitForTimeout(1_500);
  console.log('  ✓ Sales app opened');

  // Orders → Sales Orders
  const ordersMenu = page.locator('.o_menu_sections').getByText('Orders', { exact: true }).first();
  await expect(ordersMenu).toBeVisible({ timeout: 10_000 });
  await ordersMenu.click();
  await page.waitForTimeout(600);

  const salesOrdersItem = page.locator('.o_dropdown_menu, .dropdown-menu')
    .getByText('Sales Orders', { exact: true }).first();
  await expect(salesOrdersItem).toBeVisible({ timeout: 5_000 });
  await salesOrdersItem.click();
  await page.waitForSelector('.o_list_view, .o_kanban_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ Sales Orders list opened');

  // Create a new sale order
  await page.getByRole('button', { name: 'New' }).first().click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await page.waitForTimeout(1_000);
  console.log('  ✓ New sale order form opened');

  // Select customer: PlayWright Customer
  await fillMany2one(page, 'partner_id', 'PlayWright Customer');
  console.log('  ✓ Customer set to: PlayWright Customer');
  await dismissAnyModal(page);
  await page.waitForTimeout(600);

  // Select Quotation Type: sales
  await fillMany2oneByLabel(page, 'Quotation Type', 'sales');
  console.log('  ✓ Quotation Type set to: sales');
  await page.waitForTimeout(600);

  // Click "Other Info" tab
  const otherInfoTab = page.locator('.o_notebook .nav-link').filter({ hasText: /Other Info/i }).first();
  await expect(otherInfoTab).toBeVisible({ timeout: 8_000 });
  await otherInfoTab.click();
  await page.waitForTimeout(800);
  console.log('  ✓ Other Info tab opened');

  // Select warehouse: Branch Warehouse - Ekala(BR-EK)
  await fillMany2one(page, 'warehouse_id', 'Branch Warehouse - Ekala');
  console.log('  ✓ Warehouse set to: Branch Warehouse - Ekala(BR-EK)');
  await page.waitForTimeout(600);

  // Click "Order Lines" tab
  const orderLinesTab = page.locator('.o_notebook .nav-link').filter({ hasText: /Order Lines/i }).first();
  await expect(orderLinesTab).toBeVisible({ timeout: 8_000 });
  await orderLinesTab.click();
  await page.waitForTimeout(800);
  console.log('  ✓ Order Lines tab opened');

  // Click "Add a product"
  const addProductLink = page.locator('.o_field_one2many .o_list_footer, .o_field_one2many')
    .getByText('Add a product', { exact: true }).first();
  await expect(addProductLink).toBeVisible({ timeout: 8_000 });
  await addProductLink.click();
  await page.waitForTimeout(800);
  console.log('  ✓ Add a product clicked');

  // Fill the product field with the code from Product.txt
  const orderLineProductInput = page.locator('.o_field_one2many .o_data_row.o_selected_row [name="product_id"] input').first();
  await orderLineProductInput.click();
  await orderLineProductInput.fill('');
  await orderLineProductInput.type(productCode, { delay: 60 });
  await page.waitForSelector('.o-autocomplete--dropdown-menu, .ui-autocomplete', { timeout: 8_000 });
  const productOption = page.locator('.o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item')
    .filter({ hasText: new RegExp(productCode, 'i') }).first();
  await expect(productOption).toBeVisible({ timeout: 5_000 });
  await productOption.click();
  await page.waitForTimeout(1_000);
  console.log(`  ✓ Product selected: ${productCode}`);

  // Save the sale order
  const soSaveBtn = page.locator('.o_form_button_save').first();
  if (await soSaveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await soSaveBtn.click();
    await page.waitForSelector('.o_form_button_save', { state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
  await page.waitForTimeout(1_000);

  await page.screenshot({ path: 'test-results/sale-order.png', fullPage: false });
  console.log('  ✓ Sale order saved — screenshot: test-results/sale-order.png');

  // ── CONFIRM SALE ORDER ───────────────────────────────────────────────────

  // Scroll the Odoo content container (not window) back to the top so the
  // status bar with the Confirm button becomes visible
  await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('.o_content, .o_main_content, .o_action_manager');
    if (el) el.scrollTop = 0;
  });
  await page.waitForTimeout(600);

  const confirmBtn = page.locator('button').filter({ hasText: /^Confirm$/ }).first();
  await expect(confirmBtn).toBeVisible({ timeout: 10_000 });
  await confirmBtn.click();
  await page.waitForTimeout(2_000);
  await dismissAnyModal(page);
  console.log('  ✓ Sale order confirmed');

  // ── OPEN DELIVERY SMART BUTTON ───────────────────────────────────────────

  const deliveryBtn = page.locator('.o_statusbar_buttons, .oe_button_box')
    .locator('button, a')
    .filter({ hasText: /Delivery|Deliveries/i })
    .first();
  await expect(deliveryBtn).toBeVisible({ timeout: 12_000 });
  await deliveryBtn.click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await page.waitForTimeout(1_500);
  console.log('  ✓ Delivery form opened');

  // ── ENABLE SERIAL NUMBERS COLUMN VIA COLUMN-SETTINGS ICON ───────────────

  // Click the ⇌ (optional columns) icon in the Operations list header
  const colSettingsIcon = page.locator('.o_list_optional_columns, button.o_optional_columns_dropdown_toggle').first();
  await expect(colSettingsIcon).toBeVisible({ timeout: 8_000 });
  await colSettingsIcon.click();
  await page.waitForTimeout(600);
  console.log('  ✓ Column settings dropdown opened');

  // Tick "Serial Numbers (lot_ids)" if not already checked
  const lotIdsCheckbox = page.locator('.o_optional_columns_dropdown .dropdown-item')
    .filter({ hasText: /Serial Numbers/i })
    .locator('input[type="checkbox"]')
    .first();
  await expect(lotIdsCheckbox).toBeVisible({ timeout: 5_000 });
  const isChecked = await lotIdsCheckbox.isChecked();
  if (!isChecked) {
    await lotIdsCheckbox.click();
    await page.waitForTimeout(600);
    console.log('  ✓ Serial Numbers (lot_ids) column enabled');
  } else {
    console.log('  ℹ Serial Numbers (lot_ids) column was already enabled');
  }

  // Close the dropdown by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // ── SET SERIAL NUMBER ON THE MOVE LINE ───────────────────────────────────

  // Fill lot_ids on the product move row
  const moveRow = page.locator('.o_field_one2many[name="move_ids_without_package"] .o_data_row, .o_field_one2many[name="move_line_ids"] .o_data_row').first();
  await moveRow.click();
  await page.waitForTimeout(500);

  const lotCell = moveRow.locator('[name="lot_ids"] input, [name="lot_id"] input').first();
  await lotCell.click();
  await lotCell.fill('');
  await lotCell.type(serialNumber, { delay: 60 });
  await page.waitForSelector('.o-autocomplete--dropdown-menu, .ui-autocomplete', { timeout: 8_000 });
  const serialOption = page.locator('.o-autocomplete--dropdown-menu .o-autocomplete--dropdown-item')
    .filter({ hasText: new RegExp(serialNumber, 'i') }).first();
  await expect(serialOption).toBeVisible({ timeout: 5_000 });
  await serialOption.click();
  await page.waitForTimeout(800);
  console.log(`  ✓ Serial number set on delivery line: ${serialNumber}`);

  // Save the delivery
  const deliverySaveBtn = page.locator('.o_form_button_save').first();
  if (await deliverySaveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await deliverySaveBtn.click();
    await page.waitForTimeout(1_000);
  }

  await page.screenshot({ path: 'test-results/delivery.png', fullPage: false });
  console.log('  ✓ Delivery saved — screenshot: test-results/delivery.png');
});
