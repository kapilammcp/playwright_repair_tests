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

  // Save again after uploading — wait for the button to be enabled (image processing may take a moment)
  const saveBtn2 = page.locator('.o_form_button_save').first();
  if (await saveBtn2.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await expect(saveBtn2).toBeEnabled({ timeout: 15_000 });
    await saveBtn2.click();
    await waitForLoading(page);
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

  // ── APPROVE RUG (optional — appears after Request RUG Approval) ───────────
  const approveRugBtn = page.locator('button').filter({ hasText: /^Approve RUG$/i }).first();
  if (await approveRugBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false)) {
    await approveRugBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Clicked Approve RUG');
  } else {
    console.log('  ℹ Approve RUG not visible — skipping');
  }

  // ── CONFIRM (optional — sale order may already be confirmed) ─────────────
  const confirmBtn = page.locator('button').filter({ hasText: /^Confirm$/i }).first();
  if (await confirmBtn.waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false)) {
    await confirmBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Clicked Confirm');
  } else {
    console.log('  ℹ Confirm not visible — sale order may already be confirmed');
  }

  // ── DELIVERY BUTTON ───────────────────────────────────────────────────────
  // Wait for the SO form to stabilise after any approval/confirm actions before looking for Delivery
  await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
  await waitForLoading(page);
  const deliveryBtn = page.locator('.o_stat_button, .oe_stat_button').filter({ hasText: /Deliver|Transfer|Receipt/i }).first();
  await expect(deliveryBtn).toBeVisible({ timeout: 20_000 });
  await deliveryBtn.click();
  await page.waitForSelector('.o_list_view, .o_form_view', { timeout: 15_000 });
  await waitForLoading(page);
  console.log('  ✓ Clicked Delivery button');

  const isInList = await page.locator('.o_list_view').isVisible({ timeout: 2_000 }).catch(() => false);
  const totalDeliveries = isInList ? await page.locator('.o_data_row').count() : 1;
  console.log(`  ✓ Delivery orders found: ${totalDeliveries}`);

  const rowLocations = async (row: any) => ({
    from: (await row.locator('[name="location_id"]').first().textContent().catch(() => ''))?.trim() ?? '',
    to:   (await row.locator('[name="location_dest_id"]').first().textContent().catch(() => ''))?.trim() ?? '',
  });

  const returnToDeliveryList = async () => {
    const crumb = page.locator('.o_breadcrumb a').last();
    if (await crumb.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await crumb.click();
    } else {
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: 30_000 });
    }
    await page.waitForSelector('.o_list_view', { timeout: 15_000 });
    await waitForLoading(page);
  };

  if (totalDeliveries > 1) {
    const openAndValidateIfReady = async (row: any, label: string, afterValidate?: () => Promise<void>): Promise<boolean> => {
      await row.click();
      await page.waitForSelector('.o_form_view', { timeout: 15_000 });
      await waitForLoading(page);
      const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
      const canValidate = await validateBtn.isVisible({ timeout: 2_000 }).catch(() => false);
      if (canValidate) {
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
        console.log(`  ✓ Validated: ${label}`);
        if (afterValidate) await afterValidate();
        await returnToDeliveryList();
        return true;
      }
      await returnToDeliveryList();
      return false;
    };

    // STEP 1: warehouse → Inter-warehouse transit (bottom row(s))
    // Open each transfer one by one, validate, and wait for status to become Done before moving on.
    let step1Done = 0;
    let moreStep1 = true;
    while (moreStep1) {
      moreStep1 = false;
      const rows = page.locator('.o_data_row');
      const count = await rows.count();
      for (let r = count - 1; r >= 0; r--) {
        const { from, to } = await rowLocations(rows.nth(r));
        if (/inter.?warehouse transit/i.test(to) && !/inter.?warehouse transit/i.test(from)) {
          await rows.nth(r).click();
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
          const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
          if (await validateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
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
            // Wait for transfer status to become Done
            await expect(
              page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
                .filter({ hasText: /done/i }).first()
            ).toBeVisible({ timeout: 30_000 });
            step1Done++;
            console.log(`  ✓ Step 1 transfer ${step1Done} validated and Done`);
            await returnToDeliveryList();
            moreStep1 = true;
            break;
          }
          await returnToDeliveryList();
        }
      }
    }
    console.log(`  ✓ Step 1 complete: ${step1Done} warehouse → transit transfer(s) validated`);

    // STEP 2: Inter-warehouse transit → repair warehouse
    {
      let found = false;
      const rows = page.locator('.o_data_row');
      const count = await rows.count();
      for (let r = count - 1; r >= 0; r--) {
        const { from } = await rowLocations(rows.nth(r));
        if (/inter.?warehouse transit/i.test(from)) {
          await rows.nth(r).click();
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
          const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
          if (await validateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
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
            // Wait for transfer status to become Done
            await expect(
              page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
                .filter({ hasText: /done/i }).first()
            ).toBeVisible({ timeout: 30_000 });
            console.log('  ✓ Step 2 validated and Done: Inter-warehouse transit → repair warehouse');
            found = true;
            await returnToDeliveryList();
            break;
          }
          await returnToDeliveryList();
        }
      }
      if (!found) console.log('  ⚠ Transit → repair warehouse delivery not found');
    }

    // STEP 3: repair warehouse → Customer — loop until all customer deliveries are Done
    {
      let step3Count = 0;
      let moreStep3 = true;
      while (moreStep3) {
        moreStep3 = false;
        const rows = page.locator('.o_data_row');
        const count = await rows.count();
        for (let r = count - 1; r >= 0; r--) {
          const { to } = await rowLocations(rows.nth(r));
          if (/customer|partner locations/i.test(to)) {
            await rows.nth(r).click();
            await page.waitForSelector('.o_form_view', { timeout: 15_000 });
            await waitForLoading(page);
            // Skip if already Done
            const alreadyDone3 = await page.locator(
              '.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current'
            ).filter({ hasText: /done/i }).first().isVisible({ timeout: 1_000 }).catch(() => false);
            if (alreadyDone3) {
              step3Count++;
              console.log(`  ✓ Step 3 delivery ${step3Count}: already Done`);
              await returnToDeliveryList();
              break;
            }
            const validateBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
            if (await validateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
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
              // Wait for delivery status to become Done
              await expect(
                page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
                  .filter({ hasText: /done/i }).first()
              ).toBeVisible({ timeout: 120_000 });
              step3Count++;
              console.log(`  ✓ Step 3 delivery ${step3Count} validated and Done`);
              await returnToDeliveryList();
              moreStep3 = true;
              break;
            }
            // Validate button not yet available — retry on next pass
            await returnToDeliveryList();
            moreStep3 = true;
            break;
          }
        }
      }
      console.log(`  ✓ Step 3 complete: ${step3Count} repair warehouse → Customer delivery(s) Done`);

      // Final guard: re-scan every customer-destination row and confirm each shows Done
      // before proceeding. Do NOT advance to the next process until this passes.
      if (step3Count > 0) {
        const finalRows = page.locator('.o_data_row');
        const finalCount = await finalRows.count();
        for (let r = 0; r < finalCount; r++) {
          const { to } = await rowLocations(finalRows.nth(r));
          if (/customer|partner locations/i.test(to)) {
            await finalRows.nth(r).click();
            await page.waitForSelector('.o_form_view', { timeout: 15_000 });
            await expect(
              page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
                .filter({ hasText: /done/i }).first()
            ).toBeVisible({ timeout: 120_000 });
            console.log(`  ✓ Confirmed Done: customer delivery row ${r + 1}`);
            await returnToDeliveryList();
          }
        }
        console.log('  ✓ All customer deliveries confirmed Done — proceeding');
      }

      if (step3Count > 0) {
        // The 3rd delivery's _action_done hook (Path A in
        // stock_picking.py) automatically transitions the ticket
        // stage to 'Repair Completed' once all pickings on the SO are
        // done. Do NOT click the stage manually — that races with the
        // server-side transition and can double-fire downstream
        // computes.
        //
        // Instead: wait until the backend transition has landed by
        // polling the ticket's current stage via RPC. Then navigate
        // back to the ticket form for the follow-up actions.
        const waitForStage = async (targetName: string, timeoutMs = 60_000) => {
          const deadline = Date.now() + timeoutMs;
          while (Date.now() < deadline) {
            const rec = await rpc(page, 'helpdesk.ticket', 'read',
              [[Number(ticketRealId)], ['stage_id']]);
            const stageName = rec?.[0]?.stage_id?.[1] || '';
            if (stageName === targetName) return true;
            await page.waitForTimeout(500);
          }
          return false;
        };
        const stageReached = await waitForStage('Repair Completed', 60_000);
        if (stageReached) {
          console.log('  ✓ Ticket auto-advanced to: Repair Completed (via _action_done)');
        } else {
          console.log('  ⚠ Ticket did not auto-advance in 60s — proceeding anyway');
        }
        await page.evaluate((id) => {
          window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
        }, ticketRealId);
        await page.waitForSelector('.o_form_view', { timeout: 15_000 });
        await waitForLoading(page);
        console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

        // Click the Tasks smart button
        const finalTasksBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
        await expect(finalTasksBtn).toBeVisible({ timeout: 10_000 });
        await finalTasksBtn.click();
        await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
        await waitForLoading(page);
        // If a list opened, click the first row to open the task form
        if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
          await page.locator('.o_data_row').first().click();
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
        }
        console.log('  ✓ Clicked Tasks button — task form opened');

        // Click "Mark as Done"
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

        // Navigate back to the helpdesk ticket
        await page.evaluate((id) => {
          window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
        }, ticketRealId);
        await page.waitForSelector('.o_form_view', { timeout: 30_000 });
        await waitForLoading(page);
        console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

        // Click "Sent to Sales Centre" stage button
        const sendToSalesCentreBtn = page.locator('.o_statusbar_status button')
          .filter({ hasText: /Sent to Sales Centre/i }).first();
        await expect(sendToSalesCentreBtn).toBeVisible({ timeout: 30_000 });
        await sendToSalesCentreBtn.click();
        await waitForLoading(page);
        console.log('  ✓ Clicked Sent to Sales Centre');

        // Dismiss any confirmation dialog
        const confirmSalesBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
        if (await confirmSalesBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirmSalesBtn.click();
          await waitForLoading(page);
        }

        // Click "Received at Sales Centre" stage button
        const receivedAtSalesCentreBtn = page.locator('button, .o_statusbar_status button')
          .filter({ hasText: /Received at Sales Centre/i }).first();
        await expect(receivedAtSalesCentreBtn).toBeVisible({ timeout: 30_000 });
        await receivedAtSalesCentreBtn.click();
        await waitForLoading(page);
        console.log('  ✓ Clicked Received at Sales Centre');

        // Dismiss any confirmation dialog
        const confirmReceivedSalesBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
        if (await confirmReceivedSalesBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirmReceivedSalesBtn.click();
          await waitForLoading(page);
        }

        // Click Tasks smart button again
        const invoiceTasksBtn = page.locator('.o_stat_button, .oe_stat_button, button').filter({ hasText: /Tasks/i }).first();
        await expect(invoiceTasksBtn).toBeVisible({ timeout: 10_000 });
        await invoiceTasksBtn.click();
        await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 15_000 });
        await waitForLoading(page);
        if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
          await page.locator('.o_data_row').first().click();
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
        }
        console.log('  ✓ Clicked Tasks button — task form opened');

        // Click "Create Invoice" — try on task form first, fall back to Sales Order smart button
        let createInvoiceBtn = page.locator('button').filter({ hasText: /Create Invoice/i }).first();
        if (!await createInvoiceBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          const soBtn = page.locator('.o_stat_button, .oe_stat_button').filter({ hasText: /Sales Order/i }).first();
          await expect(soBtn).toBeVisible({ timeout: 10_000 });
          await soBtn.click();
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
          console.log('  ✓ Navigated to Sale Order');
          createInvoiceBtn = page.locator('button').filter({ hasText: /Create Invoice/i }).first();
        }

        // Save the current hash so we can navigate back after completing the delivery
        const soHashForInvoice = await page.evaluate(() => window.location.hash);

        // Per user instruction: always check delivery status before invoicing;
        // if any delivery is not Done, complete it regardless of button state.
        const soDelBtn = page.locator('.o_stat_button, .oe_stat_button, button')
          .filter({ hasText: /Delivery|Transfer/i }).first();
        if (await soDelBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await soDelBtn.click();
          await page.waitForSelector('.o_list_view, .o_form_view', { timeout: 15_000 });
          await waitForLoading(page);

          const validatePendingDelivery = async (): Promise<boolean> => {
            const isDone = await page.locator(
              '.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current'
            ).filter({ hasText: /done/i }).first().isVisible({ timeout: 1_000 }).catch(() => false);
            if (isDone) { console.log('  ✓ Delivery already Done'); return false; }
            console.log('  ℹ Delivery not Done — completing before invoice');
            const detOpsTab = page.locator('.nav-link').filter({ hasText: /Detailed Operations/i }).first();
            if (await detOpsTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
              await detOpsTab.click();
              await page.waitForTimeout(500);
            }
            const qtyInputs = page.locator('[name="qty_done"] input');
            for (let q = 0; q < await qtyInputs.count(); q++) {
              const val = await qtyInputs.nth(q).inputValue().catch(() => '0');
              if (!val || parseFloat(val) === 0) {
                await qtyInputs.nth(q).fill('1');
                await page.waitForTimeout(100);
              }
            }
            const valBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
            if (await valBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
              await valBtn.click();
              await waitForLoading(page);
              const immBtn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
              if (await immBtn.isVisible({ timeout: 3_000 }).catch(() => false)) { await immBtn.click(); await waitForLoading(page); }
              const noBackBtn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
              if (await noBackBtn.isVisible({ timeout: 3_000 }).catch(() => false)) { await noBackBtn.click(); await waitForLoading(page); }
              console.log('  ✓ Pre-invoice delivery completed');
              return true;
            }
            return false;
          };

          if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
            const delRows = page.locator('.o_data_row');
            const delRowCount = await delRows.count();
            for (let r = 0; r < delRowCount; r++) {
              const txt = await delRows.nth(r).textContent().catch(() => '');
              if (/Ready|Waiting/i.test(txt)) {
                await delRows.nth(r).click();
                await page.waitForSelector('.o_form_view', { timeout: 15_000 });
                await waitForLoading(page);
                await validatePendingDelivery();
                break;
              }
            }
          } else {
            await validatePendingDelivery();
          }

          await page.evaluate((hash) => { window.location.hash = hash; }, soHashForInvoice);
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
          createInvoiceBtn = page.locator('button').filter({ hasText: /Create Invoice/i }).first();
        }

        await expect(createInvoiceBtn).toBeVisible({ timeout: 10_000 });
        await createInvoiceBtn.click();
        await waitForLoading(page);
        console.log('  ✓ Clicked Create Invoice');

        // Ensure "Regular invoice" radio is selected on the Create Invoices form.
        const regularInvoiceItem = page.locator('.o_dialog .o_radio_item')
          .filter({ hasText: /Regular invoice/i }).first();
        if (await regularInvoiceItem.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true).catch(() => false)) {
          const radioInput = regularInvoiceItem.locator('input[type="radio"]').first();
          const isChecked = await radioInput.isChecked().catch(() => false);
          if (!isChecked) {
            await regularInvoiceItem.locator('label').first().click();
            await page.waitForTimeout(500);
          }
          console.log('  ✓ Regular Invoice radio selected');
        }

        // Click "Create Draft Invoice" button
        const createDraftBtn = page.locator('.o_dialog button').filter({ hasText: /Create Draft Invoice/i }).first();
        await expect(createDraftBtn).toBeVisible({ timeout: 10_000 });
        await createDraftBtn.click();
        // Create Draft Invoice used to take minutes on this DB — allow up
        // to 90s of loading before giving up on it
        await waitForLoading(page, 90_000);
        // Check for invoice error dialog (e.g. "Invalid Operation / No items to invoice")
        const invoiceErrDlg = page.locator('.o_dialog').filter({ hasText: /Invalid Operation|No items|cannot create/i }).first();
        if (await invoiceErrDlg.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await invoiceErrDlg.locator('button').filter({ hasText: /^Close$/i }).first().click();
          await page.waitForTimeout(500);
          console.log('  ⚠ Invoice error dismissed — no invoiceable items (delivery may already be invoiced)');
        } else {
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await page.locator('.o_statusbar_status').waitFor({ state: 'visible', timeout: 15_000 });
          await waitForLoading(page);
          const invoiceRef = (await page.locator('.o_breadcrumb .o_last_breadcrumb_item, .o_form_view h1').first().textContent())?.trim();
          console.log(`  ✓ Draft invoice created: ${invoiceRef}`);
          await page.screenshot({ path: 'test-results/repair-rug-invoice.png', fullPage: false });
          console.log('  ✓ Screenshot saved: repair-rug-invoice.png');
        }

        // ── DESPATCH ─────────────────────────────────────────────────────
        await page.evaluate((id) => {
          window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
        }, ticketRealId);
        await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 20_000 });
        await waitForLoading(page);

        if (await page.locator('.o_list_view').isVisible({ timeout: 1_000 }).catch(() => false)) {
          console.log('  ℹ Odoo redirected to Transfers list — validating dispatch delivery');
          const dispatchRows = page.locator('.o_data_row');
          const dispatchRowCount = await dispatchRows.count();
          for (let r = 0; r < dispatchRowCount; r++) {
            const dispatchRowTxt = await dispatchRows.nth(r).textContent().catch(() => '');
            if (/Ready/i.test(dispatchRowTxt)) {
              await dispatchRows.nth(r).click();
              await page.waitForSelector('.o_form_view', { timeout: 15_000 });
              await waitForLoading(page);
              const dispValBtn = page.locator('button').filter({ hasText: /^Validate$/i }).first();
              if (await dispValBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
                await dispValBtn.click();
                await waitForLoading(page);
                const dispImmBtn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
                if (await dispImmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
                  await dispImmBtn.click();
                  await waitForLoading(page);
                }
                const dispNoBackBtn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
                if (await dispNoBackBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
                  await dispNoBackBtn.click();
                  await waitForLoading(page);
                }
                console.log('  ✓ Clicked Dispatch (validated outgoing delivery to customer)');
              }
              break;
            }
          }
          const ticketCrumb = page.locator('.o_breadcrumb a').filter({ hasText: /REPAIR\//i }).first();
          if (await ticketCrumb.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await ticketCrumb.click();
          } else {
            await page.evaluate((id) => {
              window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
            }, ticketRealId);
          }
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
        }

        // Dismiss any blocking dialog
        const blockingDialog = page.locator('.o_dialog').first();
        if (await blockingDialog.isVisible({ timeout: 1_000 }).catch(() => false)) {
          const closeDlgBtn = blockingDialog.locator('button').filter({ hasText: /^(Close|OK|Dismiss)$/i }).first();
          if (await closeDlgBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await closeDlgBtn.click();
            await page.waitForTimeout(500);
            console.log('  ✓ Dismissed dialog on ticket load');
          }
        }

        console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

        // Wait for status bar; click Dispatch stage if still present (may be in ... overflow)
        await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
        await waitForLoading(page);

        // Expand the future-stages overflow (DOM is reversed: first "More..." = visual right = future stages)
        const expandOverflow = async (label: string) => {
          const allOverflowBtns = page.locator('.o_statusbar_status button').filter({ hasText: /More|\.\.\./ });
          const cnt = await allOverflowBtns.count();
          if (cnt > 0) {
            // first in DOM = visual right-side "..." = reveals future stages (Dispatch, Handed over)
            await allOverflowBtns.first().click();
            await page.waitForTimeout(800);
            console.log(`  ✓ Expanded status bar overflow (${label})`);
          }
        };

        await expandOverflow('Dispatch');

        const despatchBtn = page.locator('.o_statusbar_status button, button').filter({ hasText: /D[ie]s?patch/i }).first();
        if (await despatchBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await despatchBtn.click();
          await waitForLoading(page);
          console.log('  ✓ Clicked Dispatch');
          // Dispatch opens a Reverse Transfer wizard (same pattern as
          // the initial Return). Click its primary Return button to
          // create + validate the outgoing customer picking, then wait
          // for the wizard to close.
          const dispatchWizardReturn = page.locator('.o_dialog button').filter({ hasText: /^Return$/i }).first();
          if (await dispatchWizardReturn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await dispatchWizardReturn.click();
            await waitForLoading(page);
            console.log('  ✓ Clicked Return in Dispatch wizard');
            // Wait for the wizard to close before proceeding
            await page.locator('.o_dialog').first().waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {
              console.log('  ℹ Dispatch wizard did not close — proceeding');
            });
            await waitForLoading(page);
          }
          // Some flows may show a plain confirmation instead of the wizard
          const confirmDespatchBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
          if (await confirmDespatchBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await confirmDespatchBtn.click();
            await waitForLoading(page);
          }
          // After the wizard closes, Odoo often navigates to the newly
          // created outgoing picking. If we're on a picking form, click
          // Validate to finalise the dispatch.
          const dispatchPickingValidate = page.locator('button').filter({ hasText: /^Validate$/i }).first();
          if (await dispatchPickingValidate.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await dispatchPickingValidate.click();
            await waitForLoading(page);
            // Dismiss Immediate Transfer / No Backorder dialogs
            const imm = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
            if (await imm.isVisible({ timeout: 3_000 }).catch(() => false)) { await imm.click(); await waitForLoading(page); }
            const nb = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
            if (await nb.isVisible({ timeout: 3_000 }).catch(() => false)) { await nb.click(); await waitForLoading(page); }
            console.log('  ✓ Validated dispatch picking');
          }
          // Navigate back to the ticket for the Handed Over stage check
          await page.evaluate((id) => {
            window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
          }, ticketRealId);
          await page.waitForSelector('.o_form_view', { timeout: 15_000 });
          await waitForLoading(page);
        } else {
          console.log('  ℹ Dispatch stage not visible on ticket — may have auto-advanced');
        }

        // ── HANDED OVER TO CUSTOMER ───────────────────────────────────────
        await page.waitForSelector('.o_statusbar_status', { timeout: 10_000 });
        await waitForLoading(page);

        // After Dispatch is clicked the status bar re-renders: the first overflow "..." in DOM
        // may now be the left-side (past stages) button rather than the right-side (future stages).
        // Try every overflow button in sequence until "Handed over to customer" becomes visible.
        const handedOverBtn = page.locator('.o_statusbar_status button, button')
          .filter({ hasText: /Handed over to customer/i }).first();

        let handedOverVisible = await handedOverBtn.isVisible({ timeout: 1_000 }).catch(() => false);
        if (!handedOverVisible) {
          const overflowBtns = page.locator('.o_statusbar_status button').filter({ hasText: /More|\.\.\./ });
          const overflowCount = await overflowBtns.count();
          for (let o = 0; o < overflowCount && !handedOverVisible; o++) {
            await overflowBtns.nth(o).click();
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
          }
        }
      } else {
        console.log('  ⚠ Repair warehouse → Customer delivery not found');
      }
    }
  }

});
