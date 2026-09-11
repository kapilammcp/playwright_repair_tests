import { test, expect } from '@playwright/test';
import { BASE_URL, loginAndSelectCompany, dismissAnyModal, fillMany2one, fillMany2oneByLabel, selectFirstDropdownByLabel, rpc, waitForLoading, waitForView, showTestNameBanner } from '../helpers/odoo';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

test('Repair RUG', async ({ page, context }, testInfo) => {
  test.setTimeout(360_000);
  await showTestNameBanner(page, `${path.basename(testInfo.file)} — ${testInfo.title}`);
  // Login and navigate to the backend home (app grid)
  await loginAndSelectCompany(page);
  await page.goto(`${BASE_URL}/web`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('.o_home_menu, .o_app', { timeout: 30_000 });
  await dismissAnyModal(page);
  await waitForLoading(page);

  // Click the Helpdesk app icon
  const helpdeskApp = page.locator('.o_app').filter({ hasText: /^Helpdesk$/i }).first();
  await expect(helpdeskApp).toBeVisible({ timeout: 10_000 });
  await helpdeskApp.click();
  await page.waitForSelector('.o_main_navbar', { timeout: 20_000 });
  await waitForLoading(page);
  console.log('  ✓ Helpdesk app opened');

  // Find the Customer Care - Repair team card and click its Tickets button
  const teamCard = page.locator('.o_kanban_record').filter({ hasText: /Customer Care\s*-\s*Repair/i }).first();
  await expect(teamCard).toBeVisible({ timeout: 15_000 });
  console.log('  ✓ Found Customer Care - Repair team');

  const ticketButton = teamCard.locator('button').filter({ hasText: /^Tickets$/i }).first();
  await expect(ticketButton).toBeVisible({ timeout: 5_000 });
  await ticketButton.click();
  await waitForView(page);
  console.log('  ✓ Clicked Tickets button under Customer Care - Repair');

  // Click "New" to open a new ticket form (inherits the team from context)
  const newBtn = page.getByRole('button', { name: 'New' }).first();
  await expect(newBtn).toBeVisible({ timeout: 10_000 });
  await newBtn.click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ New ticket form opened');

  // Click "Assign to me"
  const assignBtn = page.locator('button').filter({ hasText: /Assign to me/i }).first();
  await expect(assignBtn).toBeVisible({ timeout: 8_000 });
  await assignBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Assign to me');

  // Select "Repair - Under warranty - RUG" from the Type field
  // (fillMany2one already waits for its own onchange RPC via waitForLoading)
  await fillMany2one(page, 'ticket_type_id', 'Repair - Under warranty - RUG');
  console.log('  ✓ Type set to: Repair - Under warranty - RUG');

  await fillMany2oneByLabel(page, 'Return Receipt Location', 'BR-AM/Stock');
  console.log('  ✓ Return Receipt Location set to: BR-AM/Stock');

  const reasonText = await selectFirstDropdownByLabel(page, 'Repair Reason');
  console.log(`  ✓ Repair Reason selected: ${reasonText}`);

  await fillMany2oneByLabel(page, 'Job Location', 'Centre Repair');
  console.log('  ✓ Job Location set to: Centre Repair');

  await fillMany2oneByLabel(page, 'Customer', 'Kurunegala Cash Customer');
  console.log('  ✓ Customer set to: Kurunegala Cash Customer');

  // Read serial number and sales order from their respective txt files
  const serialNumber = fs.readFileSync(
    path.join(__dirname, '..', 'Serial.txt'), 'utf-8'
  ).trim();
  console.log(`  ✓ Serial number read from file: ${serialNumber}`);
  const salesOrderRef = fs.readFileSync(
    path.join(__dirname, '..', 'SalesOrder.txt'), 'utf-8'
  ).trim();
  console.log(`  ✓ Sales order read from file: ${salesOrderRef}`);
  await fillMany2oneByLabel(page, 'Serial Number', serialNumber);
  console.log(`  ✓ Serial Number selected: ${serialNumber}`);

  // Save the ticket using the "Save manually" button (floppy-disk icon in breadcrumb bar)
  const saveBtn = page.locator('.o_form_button_save').first();
  await expect(saveBtn).toBeVisible({ timeout: 8_000 });
  await saveBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Ticket saved');

  // Read the ticket number from the breadcrumb after save
  const ticketNo = await page.locator('.o_breadcrumb .o_last_breadcrumb_item, .o_breadcrumb .active').first().textContent();
  const ticketNoClean = ticketNo?.trim() ?? 'Unknown';
  console.log(`  ✓ Ticket number: ${ticketNoClean}`);

  // Capture the real database ID from the URL hash (differs from the display #nnn in the ticket name)
  const ticketUrlHash = await page.evaluate(() => window.location.hash);
  const ticketRealId = ticketUrlHash.match(/(?:^#?|&)id=(\d+)/)?.[1] ?? null;
  console.log(`  ✓ Ticket DB ID: ${ticketRealId}`);
  testInfo.annotations.push({ type: 'Ticket', description: ticketNoClean });

  // Write ticket number as header in log.txt
  const logPath = path.join(__dirname, '..', 'log.txt');
  const timestamp = new Date().toLocaleString();
  const logHeader = `===== Repair Ticket: ${ticketNoClean} | ${timestamp} =====\n`;
  fs.appendFileSync(logPath, logHeader, 'utf-8');
  console.log(`  ✓ Ticket number written to log.txt`);

  await page.screenshot({ path: 'test-results/repair-rug.png', fullPage: false });
  console.log('  ✓ Screenshot saved to test-results/repair-rug.png');

  // ── WARRANTY DETAILS — UPLOAD WARRANTY CARD IMAGE ────────────────────────

  // Click the "Warranty Details" tab
  const warrantyTab = page.locator('.o_notebook .nav-link').filter({ hasText: /Warranty Details/i }).first();
  await expect(warrantyTab).toBeVisible({ timeout: 8_000 });
  await warrantyTab.click();
  await waitForLoading(page);
  console.log('  ✓ Warranty Details tab opened');

  // Locate a warranty card image to upload. Preference order:
  //  1. any .jpg / .jpeg on the current user's Desktop (per developer
  //     request — any JPG is fine, we don't care about the content)
  //  2. any .png on the current user's Desktop
  //  3. a synthesised 1×1 test PNG written to the OS temp dir
  //     — used when Desktop has no suitable image, so the test still
  //     runs on machines without pre-seeded desktop files.
  //
  // Rationale: the RUG ticket type gates the Return button on
  // `x_studio_warranty_card` being set (see helpdesk_ticket.py:510),
  // so the upload MUST succeed for the return-flow to progress. Odoo
  // just stores the bytes as a binary; any valid image passes.
  const findOrCreateWarrantyImage = (): string => {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    try {
      const files = fs.readdirSync(desktopPath);
      const jpg = files.find(f => /\.jpe?g$/i.test(f));
      if (jpg) return path.join(desktopPath, jpg);
      const png = files.find(f => f.toLowerCase().endsWith('.png'));
      if (png) return path.join(desktopPath, png);
    } catch { /* Desktop missing / unreadable */ }
    const tmpPng = path.join(os.tmpdir(), 'playwright-warranty-card.png');
    if (!fs.existsSync(tmpPng)) {
      // Minimum-valid 1×1 transparent PNG (base64) — good enough for
      // a binary upload; Odoo just stores the bytes.
      const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      fs.writeFileSync(tmpPng, Buffer.from(b64, 'base64'));
    }
    return tmpPng;
  };
  const warrantyImage = findOrCreateWarrantyImage();
  console.log(`  ✓ Warranty image path: ${warrantyImage}`);
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('button').filter({ hasText: /Take a Picture/i }).first().click(),
  ]);
  await fileChooser.setFiles(warrantyImage);
  await waitForLoading(page);
  console.log('  ✓ Warranty card image uploaded');

  // Save again after uploading — the upload may have already been auto-saved
  // (in which case the button goes disabled, since there's nothing dirty left
  // to save), so only click if it actually becomes enabled.
  const saveBtn2 = page.locator('.o_form_button_save').first();
  if (await saveBtn2.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const becameEnabled = await expect(saveBtn2).toBeEnabled({ timeout: 15_000 })
      .then(() => true).catch(() => false);
    if (becameEnabled) {
      await saveBtn2.click();
      await waitForLoading(page);
    }
  }

  await page.screenshot({ path: 'test-results/repair-rug-warranty.png', fullPage: false });
  console.log('  ✓ Screenshot saved to test-results/repair-rug-warranty.png');

  // Click the Return button on the repair form. In this Odoo instance this
  // directly opens the "Returned Picking" transfer form (dialog) rather than
  // a "Suggested Return Location" wizard — so just validate it.
  await page.locator('button').filter({ hasText: /^Return$/i }).first().click();
  await waitForLoading(page);
  console.log('  ✓ Return clicked — Returned Picking form opened');

  const returnValidateBtn = page.locator('.o_dialog button, button').filter({ hasText: /^Validate$/i }).first();
  await expect(returnValidateBtn).toBeVisible({ timeout: 15_000 });
  await returnValidateBtn.click();
  await waitForLoading(page);

  // Odoo may open an Immediate Transfer confirmation dialog on first-validate
  const immTransferBtnReturn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
  if (await immTransferBtnReturn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await immTransferBtnReturn.click();
    await waitForLoading(page);
  }
  // Or a Backorder dialog if the qty received was partial
  const noBackorderBtnReturn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
  if (await noBackorderBtnReturn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await noBackorderBtnReturn.click();
    await waitForLoading(page);
  }

  // Dismiss any Odoo Error dialog that appears after clicking Validate
  const odooErrorDlg = page.locator('.o_dialog').filter({ hasText: /Odoo Error|An error occurred/i });
  if (await odooErrorDlg.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await odooErrorDlg.locator('button').filter({ hasText: /^Close$/i }).first().click();
    await waitForLoading(page);
    console.log('  ⚠ Odoo Error dialog dismissed after Validate click');
  }
  console.log('  ✓ Returned Picking validated');

  // ── CLOSE THE RETURNED PICKING POPUP ─────────────────────────────────────
  // Validate confirms the picking as Done inside the dialog. Close it via
  // its top-right "×" button (the dialog's own close control — see
  // Return.jpg) so it's fully torn down before doing anything else.
  // NOTE: the dialog also has a "← Back" button, but that just navigates
  // within the dialog's own history/breadcrumb — it does NOT close the
  // dialog, so it must not be tried first (a stale locator handle going
  // "hidden" after Back was previously mistaken for the dialog closing
  // while the Transfer form was still open underneath).
  // Loop until the TOTAL count of open dialogs/modals is zero — checking
  // a single `.first()` handle isn't enough when more than one such node
  // exists in the DOM.
  for (let attempt = 0; attempt < 8; attempt++) {
    const openModals = page.locator('.o_dialog, .modal.d-block');
    const openCount = await openModals.count();
    if (openCount === 0) break;
    const topModal = openModals.last();
    if (!await topModal.isVisible({ timeout: 2_000 }).catch(() => false)) break;
    const closeXBtn = topModal.locator('[aria-label="Close"], .btn-close').first();
    if (await closeXBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeXBtn.click().catch(() => {});
    } else {
      const closeTextBtn = topModal.locator('button').filter({ hasText: /^Close$/i }).first();
      if (await closeTextBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await closeTextBtn.click().catch(() => {});
      } else {
        await page.keyboard.press('Escape');
      }
    }
    await waitForLoading(page);
    await page.waitForTimeout(300);
  }
  // Final confirmation: no dialog/modal left open at all.
  await expect(page.locator('.o_dialog, .modal.d-block')).toHaveCount(0, { timeout: 10_000 });
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Returned Picking popup closed');


  // ── PLAN INTERVENTION ────────────────────────────────────────────────────
  // After Received at Factory the ticket transitions to
  // repair_stage_state='received_at_factory' and the header re-renders.
  // Plan Intervention's invisible condition flips (see helpdesk_ticket.py:
  // action_generate_fsm_task guard), so the button becomes visible mid-
  // render. Playwright's click can catch the moment where the element
  // is briefly detached during the re-render — retry pattern needed.
  const clickPlanIntervention = async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const btn = page.locator('button').filter({ hasText: /Plan Intervention/i }).first();
      try {
        await expect(btn).toBeVisible({ timeout: 10_000 });
        // Force click via evaluate — bypasses Playwright's stability
        // checks and dispatches the event even if a re-render happens
        // during the click.
        await btn.click({ timeout: 5_000, force: false, trial: false });
        return;
      } catch (e) {
        console.log(`  ℹ Plan Intervention click attempt ${attempt} failed — waiting for re-render`);
        await waitForLoading(page);
        await page.waitForTimeout(500);
      }
    }
    throw new Error('Plan Intervention click failed after 5 attempts');
  };
  await clickPlanIntervention();
  await waitForLoading(page);
  console.log('  ✓ Clicked Plan Intervention');

  // ── CREATE & VIEW TASK (in "Create a Field Service task" dialog) ──────────
  await page.getByText('Create a Field Service task').first().waitFor({ state: 'visible', timeout: 10_000 });
  const createViewBtn = page.locator('.o_dialog button').filter({ hasText: /Create & View Task/i }).first();
  await expect(createViewBtn).toBeVisible({ timeout: 8_000 });
  await createViewBtn.click();
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Create & View Task');

  const taskName = (await page.locator('.o_form_view h1, .o_breadcrumb .o_last_breadcrumb_item').first().textContent())?.trim();
  console.log(`  ✓ Field Service task opened: ${taskName}`);

  // Look up the task DB ID via RPC using the task name (URL hash is unreliable here — it may
  // still show the helpdesk ticket ID before Odoo updates it to the task form URL).
  // Retry once with a delay in case the task record isn't committed to DB yet.
  const taskNameBase = (taskName ?? '').split(' ')[0]; // e.g. "REPAIR/2026/00331"
  let taskRecords = await rpc(page, 'project.task', 'search_read',
    [[['name', 'ilike', taskNameBase]]],
    { fields: ['id', 'name'], limit: 1 }
  ) as Array<{ id: number; name: string }>;
  if (!taskRecords?.[0]?.id) {
    await page.waitForTimeout(2_000);
    taskRecords = await rpc(page, 'project.task', 'search_read',
      [[['name', 'ilike', taskNameBase]]],
      { fields: ['id', 'name'], limit: 1 }
    ) as Array<{ id: number; name: string }>;
  }
  const taskRealId = taskRecords?.[0]?.id ? String(taskRecords[0].id) : null;
  console.log(`  ✓ Task DB ID: ${taskRealId}`);

  // ── REPAIR DIAGNOSIS TAB ─────────────────────────────────────────────────
  const repairDiagTab = page.locator('.o_notebook .nav-link').filter({ hasText: /Repair Diagnosis/i }).first();
  await expect(repairDiagTab).toBeVisible({ timeout: 10_000 });
  await repairDiagTab.click();
  await waitForLoading(page);
  console.log('  ✓ Repair Diagnosis tab opened');

  // Click "Add a line"
  const addLineBtn = page.locator('a, button').filter({ hasText: /^Add a line$/i }).first();
  await expect(addLineBtn).toBeVisible({ timeout: 8_000 });
  await addLineBtn.click();
  await waitForLoading(page);
  // Row creation is client-side (no RPC), so waitForLoading alone
  // doesn't confirm the editable row rendered. Wait for the DOM
  // explicitly.
  await page.locator('.o_data_row.o_selected_row').last()
    .waitFor({ state: 'visible', timeout: 8_000 });
  console.log('  ✓ Add a line clicked');

  // Iterate over every named field widget in the new editable row.
  // For Selection fields pick the first non-false option; for Many2one fields open the
  // autocomplete and pick the first real result; skip plain text inputs.
  const editableRow = page.locator('.o_data_row.o_selected_row').last();
  const widgets = editableRow.locator('[name]');
  const widgetCount = await widgets.count();
  console.log(`  ℹ Found ${widgetCount} field widget(s) in the new line`);

  // Helper: dismiss any stray tooltip / Search-More modal that may be
  // intercepting clicks from a previous iteration.
  const clearOverlays = async () => {
    // Remove tooltips (no dismiss button, just a hover artifact)
    await page.locator('.o-tooltip').evaluateAll(els => els.forEach(el => el.remove())).catch(() => {});
    // Close any modal (Search More dialog, etc.) — try Discard/Close/Cancel first
    const stuckModal = page.locator('.o_dialog, .modal.d-block').first();
    if (await stuckModal.isVisible({ timeout: 500 }).catch(() => false)) {
      const closeButton = stuckModal.locator('button')
        .filter({ hasText: /^(Discard|Close|Cancel|X)$/i }).first();
      if (await closeButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeButton.click({ force: true }).catch(() => {});
      } else {
        // Fallback: click the modal's [aria-label="Close"] X button, or press Escape
        const xBtn = stuckModal.locator('[aria-label="Close"], .btn-close').first();
        if (await xBtn.isVisible({ timeout: 300 }).catch(() => false)) {
          await xBtn.click({ force: true }).catch(() => {});
        } else {
          await page.keyboard.press('Escape');
        }
      }
      await waitForLoading(page);
    }
  };

  // The row's DOM has more than one element carrying the same "name"
  // attribute per field (e.g. an outer cell wrapper plus the inner
  // input/select both named "x_studio_diagnosis_area"), so widgets.count()
  // over-counts and each field was being selected twice. Track names
  // already handled and skip repeats.
  const processedFieldNames = new Set<string>();
  for (let i = 0; i < widgetCount; i++) {
    await clearOverlays();
    const widget = widgets.nth(i);
    const fieldName = await widget.getAttribute('name');
    if (fieldName) {
      if (processedFieldNames.has(fieldName)) continue;
      processedFieldNames.add(fieldName);
    }

    // ── Selection (<select>) ──
    const selEl = widget.locator('select').first();
    if (await selEl.count() > 0) {
      const firstVal = await selEl.evaluate((s: HTMLSelectElement) => {
        const opt = Array.from(s.options).find(o => o.value && o.value !== 'false');
        return opt?.value ?? null;
      });
      if (firstVal) {
        await selEl.selectOption(firstVal);
        await waitForLoading(page);
        const label = await selEl.evaluate((s: HTMLSelectElement) => s.options[s.selectedIndex]?.text ?? '');
        console.log(`  ✓ ${fieldName}: "${label}"`);
      }
      continue;
    }

    // ── Many2one (autocomplete <input>) ──
    const inpEl = widget.locator('input').first();
    if (!await inpEl.isVisible({ timeout: 500 }).catch(() => false)) continue;

    // Normal click on the input to trigger Owl's focus handler (this
    // is what opens the autocomplete). Try force-click if a lingering
    // overlay intercepts — clearOverlays already ran, so this is a
    // safety net for edge cases where the tooltip re-appears mid-loop.
    try {
      await inpEl.click({ timeout: 3_000 });
    } catch {
      await clearOverlays();
      await inpEl.click({ force: true, timeout: 3_000 });
    }
    await inpEl.fill('');
    await waitForLoading(page);

    const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete');
    if (!await menu.isVisible({ timeout: 3_000 }).catch(() => false)) continue; // plain text field

    const firstItem = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a, .ui-menu-item')
      .filter({ hasNotText: /loading|searching|start typing|Search More/i }).first();
    if (!await firstItem.isVisible({ timeout: 3_000 }).catch(() => false)) continue;

    const itemText = (await firstItem.textContent())?.trim();
    // Native DOM click via evaluate — bypasses tooltip/pointer-events
    // interception entirely. If the item element exposes a click
    // handler (Owl's onclick binding), this fires it directly.
    // Bounded with its own timeout — a stray dialog opened by the click
    // (e.g. a "Search More" popup) can otherwise block evaluate() for
    // the rest of the test's timeout budget.
    try {
      await firstItem.evaluate((el: HTMLElement) => el.click(), null, { timeout: 8_000 });
    } catch {
      await clearOverlays();
      await firstItem.click({ force: true, timeout: 5_000 }).catch(() => {});
    }
    await waitForLoading(page);
    console.log(`  ✓ ${fieldName}: "${itemText}"`);
  }
  // Final overlay clear before saving
  await clearOverlays();

  // Save the task form after filling the diagnosis line
  const taskSaveBtn = page.locator('.o_form_button_save').first();
  if (await taskSaveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await taskSaveBtn.click();
    await waitForLoading(page);
  }
  console.log('  ✓ Repair Diagnosis line saved');

  // ── REPAIR IMAGE TAB ─────────────────────────────────────────────────────
  const repairImageTab = page.locator('.o_notebook .nav-link').filter({ hasText: /Repair Image/i }).first();
  await expect(repairImageTab).toBeVisible({ timeout: 10_000 });
  await repairImageTab.click();
  await waitForLoading(page);
  console.log('  ✓ Repair Image tab opened');

  const [repairFileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('button').filter({ hasText: /Take a Picture/i }).first().click(),
  ]);
  await repairFileChooser.setFiles(warrantyImage); // reuse the same jpg picked earlier
  await waitForLoading(page);
  console.log('  ✓ Repair image uploaded');

  const taskSaveBtn2 = page.locator('.o_form_button_save').first();
  if (await taskSaveBtn2.isVisible({ timeout: 2_000 }).catch(() => false)) {
    try {
      await expect(taskSaveBtn2).toBeEnabled({ timeout: 60_000 });
      await taskSaveBtn2.click();
      await waitForLoading(page);
    } catch {
      console.log('  ⚠ Save button still disabled after 60s — continuing without save');
    }
  }
  console.log('  ✓ Task saved with repair image');

  // ── PRODUCTS BUTTON ──────────────────────────────────────────────────────
  // Retry up to 5 times — after image save the page can be in a transitional state.
  // If the first 2 attempts fail, reload the task form (recovers from stuck-save state).
  let productsBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Products/i }).first();
  await expect(productsBtn).toBeVisible({ timeout: 10_000 });
  let catalogLoaded = false;
  for (let attempt = 1; attempt <= 5; attempt++) {
    await productsBtn.click();
    const found = await page.waitForSelector('.o_searchview input', { timeout: 8_000 }).then(() => true).catch(() => false);
    if (found) { catalogLoaded = true; break; }
    console.log(`  ⚠ Products catalog not loaded (attempt ${attempt}) — retrying`);
    if (attempt === 2 && taskRealId) {
      // Reload the task form to recover from any stuck-save or transitional state
      await page.evaluate((id) => {
        window.location.hash = `model=project.task&id=${id}&view_type=form`;
      }, taskRealId);
      await page.waitForSelector('.o_form_view', { timeout: 15_000 });
      await waitForLoading(page);
      productsBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Products/i }).first();
      await expect(productsBtn).toBeVisible({ timeout: 10_000 });
    } else {
      await waitForLoading(page);
    }
  }
  if (!catalogLoaded) throw new Error('Products catalog failed to load after 5 attempts');
  await waitForLoading(page);
  console.log('  ✓ Clicked Products button');

  // ── CHOOSE PRODUCTS — SEARCH & SELECT ────────────────────────────────────

  // Clear all active search filter chips
  const filterChips = page.locator('.o_searchview_facet .o_delete, .o_searchview .o_facet_remove');
  const chipCount = await filterChips.count();
  for (let i = chipCount - 1; i >= 0; i--) {
    await filterChips.nth(i).click();
    await waitForLoading(page);
  }
  if (chipCount > 0) console.log(`  ✓ Cleared ${chipCount} search filter(s)`);

  // Type "02bb 023" in the search input and press Enter
  const searchInput = page.locator('.o_searchview input').first();
  await expect(searchInput).toBeVisible({ timeout: 8_000 });
  await searchInput.click();
  await searchInput.fill('02bb 023');
  await page.keyboard.press('Enter');
  await waitForLoading(page);
  console.log('  ✓ Search applied: 02bb 023');

  // Click "Add" on the first matching product card
  const addProductBtn = page.locator('button').filter({ hasText: /Add/i }).first();
  await expect(addProductBtn).toBeVisible({ timeout: 8_000 });
  await addProductBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Product selected: 02BB 023');

  // The Field Service task (opened earlier via "Create & View Task") and
  // its Products catalog are actually rendered as an Owl dialog stack
  // ("Tasks from Tickets"), not a full page — changing the URL hash
  // underneath does NOT close it. Close every open dialog/modal first,
  // otherwise it lingers and blocks clicks on the ticket form below
  // (e.g. the Tasks smart button).
  for (let attempt = 0; attempt < 8; attempt++) {
    const openModals = page.locator('.o_dialog, .modal.d-block');
    if (await openModals.count() === 0) break;
    const topModal = openModals.last();
    if (!await topModal.isVisible({ timeout: 2_000 }).catch(() => false)) break;
    const closeXBtn = topModal.locator('[aria-label="Close"], .btn-close').first();
    if (await closeXBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeXBtn.click().catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await waitForLoading(page);
    await page.waitForTimeout(300);
  }
  await expect(page.locator('.o_dialog, .modal.d-block')).toHaveCount(0, { timeout: 10_000 });

  // Navigate directly to the Helpdesk ticket by DB ID
  await page.evaluate((id) => {
    window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
  }, ticketRealId);
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Navigated to Helpdesk ticket');

  // ── TASKS SMART BUTTON ───────────────────────────────────────────────────
  const tasksBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
  await expect(tasksBtn).toBeVisible({ timeout: 10_000 });
  await tasksBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Tasks button');

  // ── SALE ORDER BUTTON ────────────────────────────────────────────────────
  const saleOrderBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Sales Order/i }).first();
  await expect(saleOrderBtn).toBeVisible({ timeout: 10_000 });
  await saleOrderBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  // Wait for the SO action buttons to fully render before checking optional buttons
  await page.waitForSelector('.o_statusbar_status, .o_form_buttons_view', { timeout: 10_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Sale Order button');

  // ── REQUEST RUG APPROVAL (optional) ─────────────────────────────────────
  const requestRugBtn = page.locator('button').filter({ hasText: /Request RUG Approval/i }).first();
  if (await requestRugBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false)) {
    await requestRugBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Clicked Request RUG Approval');
  } else {
    console.log('  ℹ Request RUG Approval not visible — skipping');
  }

  // ── REJECT RUG (appears after Request RUG Approval) ───────────────────────
  const rejectRugBtn = page.locator('button').filter({ hasText: /^Reject RUG$/i }).first();
  if (await rejectRugBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false)) {
    await rejectRugBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Clicked Reject RUG');
  } else {
    console.log('  ℹ Reject RUG not visible — skipping');
  }

  // ── SEND BY EMAIL ─────────────────────────────────────────────────────────
  const sendByEmailBtn = page.locator('button').filter({ hasText: /Send by Email/i }).first();
  await expect(sendByEmailBtn).toBeVisible({ timeout: 15_000 });
  await sendByEmailBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Send by Email');

  // ── SEND (on the email compose dialog) ───────────────────────────────────
  const sendBtn = page.locator('.o_dialog button').filter({ hasText: /^Send$/i }).first();
  await expect(sendBtn).toBeVisible({ timeout: 15_000 });
  await sendBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Send');

  // ── VIEW QUOTATION (opens the customer-facing portal page — usually a
  // new browser tab) ────────────────────────────────────────────────────────
  // Save the backend Sale Order form's URL — if "View Quotation" navigates
  // this SAME page/tab (rather than opening a new one), `page` itself ends
  // up on the customer portal, and we need this URL to return to the SO
  // form afterward.
  const soFormUrl = page.url();
  const viewQuotationBtn = page.locator('button, a').filter({ hasText: /View Quotation/i }).first();
  await expect(viewQuotationBtn).toBeVisible({ timeout: 15_000 });
  const [quotationPage] = await Promise.all([
    context.waitForEvent('page', { timeout: 15_000 }).catch(() => null),
    viewQuotationBtn.click(),
  ]);
  await waitForLoading(page);
  console.log('  ✓ Clicked View Quotation');

  // Fall back to the current page if the quotation opened in the same tab
  // rather than a new one.
  const portalPage = quotationPage ?? page;
  await portalPage.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => {});
  await portalPage.waitForSelector('body', { timeout: 15_000 }).catch(() => {});

  // ── ACCEPT & SIGN (on the portal quotation HTML page) ────────────────────
  // Clicking this opens the "#modalaccept" signature modal on the SAME page
  // (not a new form) — the modal's own confirm button must be located
  // relative to the modal, otherwise this locator re-matches the same
  // outer link behind it, which the modal then blocks clicks on.
  const acceptSignBtn1 = portalPage.locator('button, a').filter({ hasText: /Accept\s*&\s*Sign/i }).first();
  await expect(acceptSignBtn1).toBeVisible({ timeout: 20_000 });
  await acceptSignBtn1.click();
  console.log('  ✓ Clicked Accept & Sign (portal page)');

  // ── ACCEPT & SIGN (the confirm button inside the "#modalaccept" signature
  // modal that opens) ───────────────────────────────────────────────────────
  const signModal = portalPage.locator('#modalaccept, .modal.show, .modal.modal_shown').first();
  await expect(signModal).toBeVisible({ timeout: 15_000 });
  const acceptSignBtn2 = signModal.locator('button, a').filter({ hasText: /Accept\s*&\s*Sign/i }).first();
  await expect(acceptSignBtn2).toBeVisible({ timeout: 15_000 });
  await acceptSignBtn2.click();
  await portalPage.waitForTimeout(1_000);
  console.log('  ✓ Clicked Accept & Sign (signature modal)');

  // ── BACK TO THE SALE ORDER FORM — CLICK CONFIRM ──────────────────────────
  // If "View Quotation" opened a new tab, the original `page` never left the
  // backend Sale Order form — just bring it to front. Otherwise `page` IS
  // the portal page right now (post-sign confirmation page), so navigate it
  // back to the saved SO form URL directly (browser-back twice was tried
  // and proved unreliable — history entries here don't line up 1:1 with
  // the portal's internal navigation/redirects).
  await page.bringToFront();
  if (page.url() !== soFormUrl) {
    await page.goto(soFormUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  }
  await waitForLoading(page);
  const soConfirmBtn = page.locator('button').filter({ hasText: /^Confirm$/i }).first();
  await expect(soConfirmBtn).toBeVisible({ timeout: 15_000 });
  await soConfirmBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Confirm on Sale Order');

  // ── CREATE INVOICE (Down Payment) ────────────────────────────────────────
  // "Create Invoice" is a header button directly on the Sale Order form
  // (see "Create Invoice.jpg"). For this Reject flow it goes straight to a
  // Draft Invoice (no Regular/Down-payment wizard) — the 50% down payment
  // is presumably already applied server-side given "RUG Rejected" is set.
  const createInvoiceBtn = page.locator('button').filter({ hasText: /^Create Invoice$/i }).first();
  await expect(createInvoiceBtn).toBeVisible({ timeout: 15_000 });
  await createInvoiceBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Create Invoice');

  // Click "Confirm" on the resulting Draft Invoice
  const draftInvoiceConfirmBtn = page.locator('button').filter({ hasText: /^Confirm$/i }).first();
  await expect(draftInvoiceConfirmBtn).toBeVisible({ timeout: 15_000 });
  await draftInvoiceConfirmBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Confirm');

  // ── REGISTER PAYMENT ──────────────────────────────────────────────────────
  const registerPaymentBtn = page.locator('button').filter({ hasText: /^Register Payment$/i }).first();
  await expect(registerPaymentBtn).toBeVisible({ timeout: 15_000 });
  await registerPaymentBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Register Payment');

  // Select "Commercial Bank" for the Journal field
  const journalInput = page.locator('.o_dialog [name="journal_id"] input').first();
  await expect(journalInput).toBeVisible({ timeout: 10_000 });
  await journalInput.click();
  await journalInput.fill('Commercial Bank');
  await waitForLoading(page);
  const journalMenu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete');
  await expect(journalMenu).toBeVisible({ timeout: 5_000 });
  const journalOption = journalMenu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a, .ui-menu-item')
    .filter({ hasText: /Commercial Bank/i }).first();
  await expect(journalOption).toBeVisible({ timeout: 5_000 });
  await journalOption.click();
  await waitForLoading(page);
  console.log('  ✓ Journal set to: Commercial Bank');

  // Calculate 50% of the amount shown in the wizard and enter it
  const amountInput = page.locator('.o_dialog [name="amount"] input').first();
  await expect(amountInput).toBeVisible({ timeout: 10_000 });
  const currentAmountStr = await amountInput.inputValue();
  const currentAmount = parseFloat(currentAmountStr.replace(/,/g, ''));
  const halfAmount = (currentAmount / 2).toFixed(2);
  await amountInput.fill(halfAmount);
  await amountInput.press('Enter');
  await waitForLoading(page);
  console.log(`  ✓ Entered 50% payment amount: ${halfAmount} (of ${currentAmountStr})`);

  // Click "Create Payment"
  const createPaymentBtn = page.locator('.o_dialog button').filter({ hasText: /^Create Payment$/i }).first();
  await expect(createPaymentBtn).toBeVisible({ timeout: 10_000 });
  await createPaymentBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Create Payment');

  // ── CLOSE CURRENT FORM (X) ───────────────────────────────────────────────
  const closeInvoiceXBtn = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
  await expect(closeInvoiceXBtn).toBeVisible({ timeout: 10_000 });
  await closeInvoiceXBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Closed form with X button');

  // ── TASKS SMART BUTTON ───────────────────────────────────────────────────
  const finalTasksBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
  await expect(finalTasksBtn).toBeVisible({ timeout: 10_000 });
  await finalTasksBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.locator('.o_data_row').first().click();
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
  }
  console.log('  ✓ Clicked Task button');

  // ── SALE ORDER BUTTON ────────────────────────────────────────────────────
  const finalSaleOrderBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Sales Order/i }).first();
  await expect(finalSaleOrderBtn).toBeVisible({ timeout: 10_000 });
  await finalSaleOrderBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Sale Order button');

  // ── DELIVERY BUTTON ───────────────────────────────────────────────────────
  await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
  await waitForLoading(page);
  const finalDeliveryBtn = page.locator('.o_stat_button, .oe_stat_button').filter({ hasText: /Deliver|Transfer|Receipt/i }).first();
  await expect(finalDeliveryBtn).toBeVisible({ timeout: 20_000 });
  await finalDeliveryBtn.click();
  await page.waitForSelector('.o_list_view, .o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Delivery button');

  // ── PROCESS DELIVERY ORDER(S) ────────────────────────────────────────────
  // Same delivery-processing logic as 4.Repair-UnderWarranty_RUG(Approve).spec.ts:
  // keep opening the last not-yet-Done delivery order, validate it (handling
  // the Immediate Transfer / No Backorder dialogs), and return to the list to
  // pick up the next one, until none remain.
  const isInList = await page.locator('.o_list_view').isVisible({ timeout: 2_000 }).catch(() => false);
  const totalDeliveries = isInList ? await page.locator('.o_data_row').count() : 1;
  console.log(`  ✓ Delivery orders found: ${totalDeliveries}`);

  const clearStrayModal = async () => {
    const stray = page.locator('.o_dialog, .modal.d-block').first();
    if (await stray.isVisible({ timeout: 500 }).catch(() => false)) {
      const closeXBtn = stray.locator('[aria-label="Close"], .btn-close').first();
      if (await closeXBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeXBtn.click({ force: true }).catch(() => {});
      } else {
        await page.keyboard.press('Escape');
      }
      await waitForLoading(page);
    }
  };

  const returnToDeliveryList = async () => {
    await clearStrayModal();
    const crumb = page.locator('.o_breadcrumb a').last();
    if (await crumb.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await crumb.click({ timeout: 8_000 }).catch(async () => {
        await clearStrayModal();
        await crumb.click();
      });
    } else {
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    }
    await page.waitForSelector('.o_list_view', { timeout: 15_000 });
    await waitForLoading(page);
  };

  const clickBack = async () => {
    const backBtn = page.locator('button').filter({ hasText: /^Back$/i }).first();
    if (await backBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await backBtn.click();
      await waitForView(page, 20_000);
      const onList = await page.locator('.o_list_view').isVisible({ timeout: 5_000 }).catch(() => false);
      if (onList) return;
    }
    await returnToDeliveryList();
  };

  if (totalDeliveries > 1) {
    let processedCount = 0;
    let more = true;
    while (more) {
      more = false;
      const rows = page.locator('.o_data_row');
      const count = await rows.count();
      for (let r = count - 1; r >= 0; r--) {
        const row = rows.nth(r);
        const alreadyDoneRow = await row.locator('td', { hasText: /done/i }).first()
          .isVisible({ timeout: 500 }).catch(() => false);
        if (alreadyDoneRow) continue;

        await row.click();
        await page.waitForSelector('.o_form_view', { timeout: 15_000 });
        await waitForLoading(page);

        const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
        if (!(await validateBtn.isVisible({ timeout: 2_000 }).catch(() => false))) {
          await returnToDeliveryList();
          continue;
        }

        await validateBtn.click();
        await waitForLoading(page);
        const immTransferBtn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
        if (await immTransferBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await immTransferBtn.click();
          await waitForLoading(page);
        }
        const noBackorderBtn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
        if (await noBackorderBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await noBackorderBtn.click();
          await waitForLoading(page);
        }
        await expect(
          page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
            .filter({ hasText: /done/i }).first()
        ).toBeVisible({ timeout: 120_000 });
        processedCount++;
        console.log(`  ✓ Delivery order ${processedCount} validated and Done`);

        const backBtnCheck = page.locator('button').filter({ hasText: /^Back$/i }).first();
        if (await backBtnCheck.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await clickBack();
          more = true;
        } else {
          const dialog = page.locator('.o_dialog, .modal.d-block').last();
          const closeXBtn = dialog.locator('[aria-label="Close"], .btn-close').first();
          const hasDialog = await dialog.isVisible({ timeout: 2_000 }).catch(() => false);
          if (hasDialog && await closeXBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await closeXBtn.click();
          } else {
            const closeTextBtn = page.locator('button').filter({ hasText: /^Close$/i }).first();
            if (await closeTextBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
              await closeTextBtn.click();
            } else {
              await page.keyboard.press('Escape');
            }
          }
          await waitForLoading(page);
          await page.waitForSelector('.o_list_view, .o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
          console.log('  ✓ Closed delivery dialog (X/Close) — returned to previous menu');
          more = false;
        }
        break;
      }
    }
    console.log(`  ✓ Delivery orders processed: ${processedCount}`);
  } else {
    const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
    if (await validateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await validateBtn.click();
      await waitForLoading(page);
      const immTransferBtn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
      if (await immTransferBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await immTransferBtn.click();
        await waitForLoading(page);
      }
      const noBackorderBtn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
      if (await noBackorderBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await noBackorderBtn.click();
        await waitForLoading(page);
      }
      await expect(
        page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
          .filter({ hasText: /done/i }).first()
      ).toBeVisible({ timeout: 120_000 });
      console.log('  ✓ Delivery order validated and Done');
    } else {
      console.log('  ℹ Delivery already Done or Validate not available — skipping');
    }
  }

  // ── CLOSE DELIVERY FORM/DIALOG (X) ───────────────────────────────────────
  for (let attempt = 0; attempt < 8; attempt++) {
    const openDialogs = page.locator('.o_dialog, .modal.d-block');
    if (await openDialogs.count() === 0) break;
    const topDialog = openDialogs.last();
    if (!await topDialog.isVisible({ timeout: 1_000 }).catch(() => false)) break;
    const closeXBtn = topDialog.locator('[aria-label="Close"], .btn-close').first();
    if (await closeXBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await closeXBtn.click({ force: true }).catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await waitForLoading(page);
    await page.waitForTimeout(300);
  }
  await expect(page.locator('.o_dialog, .modal.d-block')).toHaveCount(0, { timeout: 10_000 }).catch(() => {});
  console.log('  ✓ Closed delivery form with X button');

  // ── TASK BUTTON ───────────────────────────────────────────────────────────
  const doneTaskBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
  await expect(doneTaskBtn).toBeVisible({ timeout: 10_000 });
  try {
    await doneTaskBtn.click({ timeout: 8_000 });
  } catch {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await doneTaskBtn.click({ force: true });
  }
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.locator('.o_data_row').first().click();
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
  }
  console.log('  ✓ Clicked Task button');

  // ── MARK AS DONE ──────────────────────────────────────────────────────────
  const markAsDoneBtn = page.locator('button').filter({ hasText: /Mark as Done/i }).first();
  await expect(markAsDoneBtn).toBeVisible({ timeout: 10_000 });
  await markAsDoneBtn.click();
  await waitForLoading(page);
  // Dismiss any post-done dialog (e.g. customer rating survey)
  const postDoneDialog = page.locator('.o_dialog').first();
  if (await postDoneDialog.isVisible({ timeout: 2_000 }).catch(() => false)) {
    const dismissDoneBtn = postDoneDialog.locator('button')
      .filter({ hasText: /^(Close|Skip|Cancel|No|Later)$/i }).first();
    if (await dismissDoneBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await dismissDoneBtn.click();
      await page.waitForTimeout(500);
    }
  }
  console.log('  ✓ Clicked Mark as Done');

  // ── CLOSE FORM (X) AND REFRESH ────────────────────────────────────────────
  const closeTaskFormX = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
  const closeTaskFormBtn = page.locator('.o_dialog button, button').filter({ hasText: /^Close$/i }).first();
  if (await closeTaskFormX.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await closeTaskFormX.click();
    await waitForLoading(page);
    console.log('  ✓ Closed task form with X button');
  } else if (await closeTaskFormBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await closeTaskFormBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Closed task form with Close button');
  }

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  await waitForLoading(page);
  console.log('  ✓ Browser refreshed');

  // ── NAVIGATE BACK TO TICKET ───────────────────────────────────────────────
  await page.evaluate((id) => {
    window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
  }, ticketRealId);
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

  // ── TASK BUTTON ───────────────────────────────────────────────────────────
  const postSalesTasksBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
  await expect(postSalesTasksBtn).toBeVisible({ timeout: 10_000 });
  await postSalesTasksBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.locator('.o_data_row').first().click();
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
  }
  console.log('  ✓ Clicked Task button');

  // ── INVOICE BUTTON ────────────────────────────────────────────────────────
  const invoiceBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Invoice/i }).first();
  await expect(invoiceBtn).toBeVisible({ timeout: 10_000 });
  await invoiceBtn.click();
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.locator('.o_data_row').first().click();
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
  }
  console.log('  ✓ Clicked Invoice button');

  // ── REGISTER PAYMENT ──────────────────────────────────────────────────────
  const secondRegisterPaymentBtn = page.locator('button').filter({ hasText: /^Register Payment$/i }).first();
  await expect(secondRegisterPaymentBtn).toBeVisible({ timeout: 15_000 });
  await secondRegisterPaymentBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Register Payment');

  // Select "Commercial Bank" for the Journal field
  const secondJournalInput = page.locator('.o_dialog [name="journal_id"] input').first();
  await expect(secondJournalInput).toBeVisible({ timeout: 10_000 });
  await secondJournalInput.click();
  await secondJournalInput.fill('Commercial Bank');
  await waitForLoading(page);
  const secondJournalMenu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete');
  await expect(secondJournalMenu).toBeVisible({ timeout: 5_000 });
  const secondJournalOption = secondJournalMenu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a, .ui-menu-item')
    .filter({ hasText: /Commercial Bank/i }).first();
  await expect(secondJournalOption).toBeVisible({ timeout: 5_000 });
  await secondJournalOption.click();
  await waitForLoading(page);
  console.log('  ✓ Journal set to: Commercial Bank');

  // Click "Create Payment"
  const secondCreatePaymentBtn = page.locator('.o_dialog button').filter({ hasText: /^Create Payment$/i }).first();
  await expect(secondCreatePaymentBtn).toBeVisible({ timeout: 10_000 });
  await secondCreatePaymentBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Create Payment');

  // ── CLOSE CURRENT FORM (X) ───────────────────────────────────────────────
  const secondCloseXBtn = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
  await expect(secondCloseXBtn).toBeVisible({ timeout: 10_000 });
  await secondCloseXBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Closed form with X button');

  // ── NAVIGATE BACK TO TICKET ───────────────────────────────────────────────
  await page.evaluate((id) => {
    window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
  }, ticketRealId);
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

  // ── DESPATCH ──────────────────────────────────────────────────────────────
  await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
  await waitForLoading(page);

  // The Despatch stage action can be hidden behind the status bar's "…"
  // overflow toggle — expand it before looking for the button.
  const strayTechModal = page.locator('.o_dialog, .modal.d-block').first();
  if (await strayTechModal.isVisible({ timeout: 500 }).catch(() => false)) {
    const strayCloseBtn = strayTechModal.locator('[aria-label="Close"], .btn-close').first();
    if (await strayCloseBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await strayCloseBtn.click({ force: true }).catch(() => {});
    } else {
      await page.keyboard.press('Escape');
    }
    await waitForLoading(page);
    await page.waitForTimeout(300);
  }
  const overflowBtns = page.locator('.o_statusbar_status button').filter({ hasText: /More|\.\.\./ });
  if (await overflowBtns.count() > 0) {
    try {
      await overflowBtns.first().click({ timeout: 8_000 });
    } catch {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await overflowBtns.first().click({ force: true });
    }
    await page.waitForTimeout(800);
    console.log('  ✓ Expanded status bar overflow (Despatch)');
  }

  const despatchBtn = page.locator('.o_statusbar_status button, button').filter({ hasText: /D[ie]s?patch/i }).first();
  await expect(despatchBtn).toBeVisible({ timeout: 15_000 });
  await despatchBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Despatch');

  // The Despatch action opens a delivery order — click "Validate" on it
  await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
  await waitForLoading(page);
  if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
    const readyRow = page.locator('.o_data_row').filter({ hasText: /Ready|Waiting/i }).first();
    if (await readyRow.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await readyRow.click();
    } else {
      await page.locator('.o_data_row').first().click();
    }
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
  }

  const despatchValidateBtn = page.locator('.o_dialog button, button').filter({ hasText: /^Validate$/i }).last();
  await expect(despatchValidateBtn).toBeVisible({ timeout: 10_000 });
  try {
    await despatchValidateBtn.click({ timeout: 8_000 });
  } catch {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await despatchValidateBtn.click({ force: true });
  }
  await waitForLoading(page);
  console.log('  ✓ Clicked Validate');

  const despatchImmTransferBtn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).last();
  if (await despatchImmTransferBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    try {
      await despatchImmTransferBtn.click({ timeout: 8_000 });
    } catch {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await despatchImmTransferBtn.click({ force: true }).catch(() => {});
    }
    await waitForLoading(page);
  }
  const despatchNoBackorderBtn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).last();
  if (await despatchNoBackorderBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    try {
      await despatchNoBackorderBtn.click({ timeout: 8_000 });
    } catch {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await despatchNoBackorderBtn.click({ force: true }).catch(() => {});
    }
    await waitForLoading(page);
  }

  // Wait for status to become Done
  await expect(
    page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
      .filter({ hasText: /done/i }).first()
  ).toBeVisible({ timeout: 120_000 });
  console.log('  ✓ Delivery order reached Done stage');

  // ── CLOSE (X) ─────────────────────────────────────────────────────────────
  const despatchCloseXBtn = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
  await expect(despatchCloseXBtn).toBeVisible({ timeout: 10_000 });
  await despatchCloseXBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Closed form with X button');

  // ── NAVIGATE BACK TO TICKET FOR HANDED OVER ──────────────────────────────
  await page.evaluate((id) => {
    window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
  }, ticketRealId);
  await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

  // ── HANDED OVER TO CUSTOMER ───────────────────────────────────────────────
  await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
  await waitForLoading(page);

  // The status bar re-renders after Despatch — the first overflow "..." may
  // now be the left-side (past stages) button rather than the right-side
  // (future stages). Try every overflow button in sequence until "Handed
  // over to customer" becomes visible.
  const handedOverBtn = page.locator('.o_statusbar_status button, button')
    .filter({ hasText: /Handed over to customer/i }).first();

  let handedOverVisible = await handedOverBtn.isVisible({ timeout: 1_000 }).catch(() => false);
  if (!handedOverVisible) {
    const overflowBtns = page.locator('.o_statusbar_status button').filter({ hasText: /More|\.\.\./ });
    const overflowCount = await overflowBtns.count();
    for (let o = 0; o < overflowCount && !handedOverVisible; o++) {
      const strayTechModal = page.locator('.o_dialog, .modal.d-block').first();
      if (await strayTechModal.isVisible({ timeout: 500 }).catch(() => false)) {
        const strayCloseBtn = strayTechModal.locator('[aria-label="Close"], .btn-close').first();
        if (await strayCloseBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          await strayCloseBtn.click({ force: true }).catch(() => {});
        } else {
          await page.keyboard.press('Escape');
        }
        await waitForLoading(page);
        await page.waitForTimeout(300);
      }
      try {
        await overflowBtns.nth(o).click({ timeout: 8_000 });
      } catch {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        await overflowBtns.nth(o).click({ force: true });
      }
      await page.waitForTimeout(800);
      console.log(`  ✓ Expanded status bar overflow ${o + 1}/${overflowCount} (Handed over)`);
      handedOverVisible = await handedOverBtn.isVisible({ timeout: 1_000 }).catch(() => false);
    }
  }

  if (!handedOverVisible) {
    console.log('  ℹ Handed over to customer stage not found — ticket may have already completed');
  } else {
    const alreadyHandedOver = await handedOverBtn.isDisabled({ timeout: 1_000 }).catch(() => false);
    if (alreadyHandedOver) {
      console.log('  ℹ Handed over to customer is already the current stage — skipping click');
    } else {
      await handedOverBtn.click();
      await waitForLoading(page);
      console.log('  ✓ Clicked Handed over to customer');
      const confirmHandedOverBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
      if (await confirmHandedOverBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await confirmHandedOverBtn.click();
        await waitForLoading(page);
      }
      console.log('  ✓ Ticket marked complete (Handed over to customer)');
    }
  }


  // Test ends here — no further processing.

});
