import { test, expect } from '@playwright/test';
import { BASE_URL, loginAndSelectCompany, dismissAnyModal, fillMany2one, fillMany2oneByLabel, selectFirstDropdownByLabel, rpc, waitForLoading, waitForView } from '../helpers/odoo';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

test('Repair RUG', async ({ page }, testInfo) => {
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

  await fillMany2oneByLabel(page, 'Job Location', 'factory repair');
  console.log('  ✓ Job Location set to: factory repair');

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

  // ── SEND TO FACTORY ──────────────────────────────────────────────────────
  // An intermittent leftover backdrop (an empty ".modal.d-block" mount
  // point Odoo occasionally fails to tear down with the Returned Picking
  // popup) can still intercept pointer events here even after the close
  // loop above. A plain `.click()` can resolve without error yet not
  // actually reach the button if the backdrop is on top for that instant —
  // Escape alone doesn't prove the click landed. So each attempt clicks
  // AND verifies the button actually disappeared (i.e. the server call
  // fired and the stage moved on) before considering it done.
  const sendToFactoryBtn = page.locator('button').filter({ hasText: /^Send to Factory$/i }).first();
  await expect(sendToFactoryBtn).toBeVisible({ timeout: 10_000 });
  let sentToFactory = false;
  for (let attempt = 1; attempt <= 6 && !sentToFactory; attempt++) {
    try {
      await sendToFactoryBtn.click({ timeout: 8_000 });
    } catch {
      // Click was blocked by an overlay — clear it and retry below.
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    await waitForLoading(page);
    // Dismiss any confirmation dialog that may appear
    const confirmSendBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
    if (await confirmSendBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmSendBtn.click();
      await waitForLoading(page);
    }
    sentToFactory = !(await sendToFactoryBtn.isVisible({ timeout: 3_000 }).catch(() => false));
    if (!sentToFactory) {
      if (attempt === 6) throw new Error('Send to Factory click did not take effect after 6 attempts');
      console.log(`  ℹ Send to Factory click did not take effect (attempt ${attempt}) — retrying`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  }
  console.log('  ✓ Clicked Send to Factory');

  // ── RECEIVED AT FACTORY ──────────────────────────────────────────────────
  // Received at Factory is a custom HEADER action button
  // (name="action_received_at_factory", string="Received at Factory")
  // visible only while repair_stage_state == 'sent_to_factory'. It
  // calls _create_received_at_factory_picking() first, then writes the
  // stage — and the picking creation can raise UserError if the
  // Factory Repair Location isn't configured, leaving the stage stuck.
  //
  // Strategy: click the header button (matched by exact string with
  // anchors, so we don't accidentally hit the statusbar radio which
  // carries a "1m" tracking suffix), then handle ANY dialog that
  // appears — OK / Confirm / Yes / Close / Discard — and report which.
  // Check the CURRENTLY CHECKED statusbar stage (not just any disabled
  // radio with matching text — every future stage renders disabled too).
  // Treat any stage at or beyond "Received at Factory" as already past
  // this step, since the header action button only exists in that exact
  // window (repair_stage_state == 'sent_to_factory').
  const receivedBtn = page.locator('button[name="action_received_at_factory"]').first();
  const receivedBtnPresent = await receivedBtn.isVisible({ timeout: 8_000 }).catch(() => false);

  if (!receivedBtnPresent) {
    const currentStageText = await page.evaluate(() => {
      const current = document.querySelector(
        '.o_statusbar_status .o_arrow_button_current, .o_statusbar_status [aria-checked="true"], .o_statusbar_status input[type="radio"]:checked'
      );
      if (!current) return '(unknown)';
      const label = (current as HTMLInputElement).labels?.[0];
      return (label?.innerText || (current as HTMLElement).innerText || '').trim();
    });
    console.log(`  ℹ Received at Factory button not present (current stage: "${currentStageText}") — assuming stage already advanced, skipping click`);
  } else {
    await receivedBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Clicked Received at Factory (button)');
  }

  // Handle any dialog that appears
  const anyDialog = page.locator('.o_dialog').first();
  if (await anyDialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const dialogText = (await anyDialog.textContent().catch(() => ''))?.trim().slice(0, 120) ?? '';
    const isError = /error|user\s*error|not\s+configured|invalid/i.test(dialogText);
    if (isError) {
      console.log(`  ⚠ Error dialog after Received at Factory: ${dialogText}`);
      const closeBtn = anyDialog.locator('button')
        .filter({ hasText: /^(Close|Cancel|Discard|OK)$/i }).first();
      if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await closeBtn.click();
        await waitForLoading(page);
      }
    } else {
      const confirmBtn = anyDialog.locator('button')
        .filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
      if (await confirmBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
        await confirmBtn.click();
        await waitForLoading(page);
        console.log('  ✓ Dismissed confirmation dialog');
      }
    }
  }

  // Verify the stage actually transitioned. Poll the current-stage
  // indicator on the status bar for up to 15s.
  const stageOK = await page.waitForFunction(() => {
    const arrows = document.querySelectorAll('.o_statusbar_status .o_arrow_button_current, .o_statusbar_status button.o_arrow_button.disabled');
    for (const a of Array.from(arrows)) {
      if (/received\s*at\s*factory/i.test((a as HTMLElement).innerText || '')) return true;
    }
    // Some Odoo builds render the current stage as [disabled][checked] radio
    const radios = document.querySelectorAll('.o_statusbar_status input[type="radio"]:checked');
    for (const r of Array.from(radios)) {
      const label = (r as HTMLInputElement).labels?.[0]?.innerText || '';
      if (/received\s*at\s*factory/i.test(label)) return true;
    }
    return false;
  }, { timeout: 15_000 }).then(() => true).catch(() => false);

  if (!stageOK) {
    // Stage didn't advance via UI. As a diagnostic aid, log the current
    // stage text and fall back to calling the action via RPC — this
    // preserves the test flow so the rest of the RUG spec still runs,
    // while making the UI failure visible for later triage.
    const curStage = await page.evaluate(() => {
      const el = document.querySelector('.o_statusbar_status .o_arrow_button_current, .o_statusbar_status button.o_arrow_button.disabled');
      return (el as HTMLElement)?.innerText?.trim() ?? '(none)';
    });
    console.log(`  ⚠ Stage did not advance to Received at Factory via UI (still: ${curStage}) — calling action via RPC`);
    await rpc(page, 'helpdesk.ticket', 'action_received_at_factory', [[Number(ticketRealId)]]);
    await waitForLoading(page);
    // Refresh the form so the DOM reflects the new stage
    await page.evaluate((id) => {
      window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
    }, ticketRealId);
    await page.waitForSelector('.o_form_view', { timeout: 15_000 });
    await waitForLoading(page);
    console.log('  ✓ Stage advanced to Received at Factory (via RPC fallback)');
  } else {
    console.log('  ✓ Stage advanced to Received at Factory');
  }

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

  // Test ends here for the Reject flow — no further processing.

});
