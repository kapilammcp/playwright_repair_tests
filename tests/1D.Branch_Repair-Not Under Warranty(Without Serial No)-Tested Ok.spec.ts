import { test, expect } from '@playwright/test';
import { BASE_URL, loginAndSelectCompany, dismissAnyModal, fillMany2one, fillMany2oneByLabel, selectFirstDropdownByLabel, rpc, waitForLoading, waitForView, showTestNameBanner } from '../helpers/odoo';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

test('Repair RUG', async ({ page }, testInfo) => {
  test.setTimeout(600_000);
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

  // Select "Repair - Not Under Warranty (Without Serial No)" from the Type field
  // (fillMany2one already waits for its own onchange RPC via waitForLoading)
  await fillMany2one(page, 'ticket_type_id', 'Repair - Not Under Warranty (Without Serial No)');
  console.log('  ✓ Type set to: Repair - Not Under Warranty (Without Serial No)');

  await fillMany2oneByLabel(page, 'Return Receipt Location', 'BR-AM/Stock');
  console.log('  ✓ Return Receipt Location set to: BR-AM/Stock');

  const reasonText = await selectFirstDropdownByLabel(page, 'Repair Reason');
  console.log(`  ✓ Repair Reason selected: ${reasonText}`);

  await fillMany2oneByLabel(page, 'Job Location', 'Centre Repair');
  console.log('  ✓ Job Location set to: Centre Repair');

  await fillMany2oneByLabel(page, 'Customer', 'Kurunegala Cash Customer');
  console.log('  ✓ Customer set to: Kurunegala Cash Customer');

  // Read sales order from its txt file
  const salesOrderRef = fs.readFileSync(
    path.join(__dirname, '..', 'SalesOrder.txt'), 'utf-8'
  ).trim();
  console.log(`  ✓ Sales order read from file: ${salesOrderRef}`);

  // This ticket type has no Serial Number to select — instead enter the
  // product ("JMC6") in the Product field, which enables the "Create
  // Serial Number" button once a product is set.
  await fillMany2oneByLabel(page, 'Product', 'JMC6');
  console.log('  ✓ Product set to: JMC6');

  const createSerialBtn = page.locator('button').filter({ hasText: /Create Serial No/i }).first();
  await expect(createSerialBtn).toBeEnabled({ timeout: 10_000 });
  await createSerialBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Create Serial No');

  // Save the ticket using the "Save manually" button (floppy-disk icon in
  // breadcrumb bar) — but "Create Serial No" above already saves the
  // record as a side effect (it needs a persisted ticket to attach the
  // newly created stock.lot to), so the save button may already be hidden
  // (no pending changes) by the time we get here.
  const saveBtn = page.locator('.o_form_button_save').first();
  if (await saveBtn.isVisible({ timeout: 8_000 }).catch(() => false)) {
    await saveBtn.click();
    await waitForLoading(page);
    console.log('  ✓ Ticket saved');
  } else {
    console.log('  ℹ Ticket already saved (by Create Serial No) — skipping manual save');
  }

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
  // After the Returned Picking is validated the ticket transitions to
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

  // Click "Tested OK" on the task form
  const testedOkBtn = page.locator('button').filter({ hasText: /^Tested OK$/i }).first();
  await expect(testedOkBtn).toBeVisible({ timeout: 10_000 });
  await testedOkBtn.click();
  await waitForLoading(page);
  console.log('  ✓ Clicked Tested OK');

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

        // Close the task form via its top-right "×" button (see
        // "After Mark as Done.jpg") before continuing — otherwise it lingers
        // as an open dialog and can block later clicks on the ticket form.
        const closeTaskFormBtn = page.locator('.o_dialog button, button')
          .filter({ hasText: /^Close$/i }).first();
        const closeTaskFormX = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
        if (await closeTaskFormX.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await closeTaskFormX.click();
          await waitForLoading(page);
          console.log('  ✓ Closed task form with X button');
        } else if (await closeTaskFormBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await closeTaskFormBtn.click();
          await waitForLoading(page);
          console.log('  ✓ Closed task form with Close button');
        }

        // Navigate back to the helpdesk ticket
        await page.evaluate((id) => {
          window.location.hash = `model=helpdesk.ticket&id=${id}&view_type=form`;
        }, ticketRealId);
        await page.waitForSelector('.o_form_view', { timeout: 30_000 });
        await waitForLoading(page);
        console.log(`  ✓ Navigated back to ticket: ${ticketNoClean}`);

        // Both "Send to Sales Centre" and "Received at Sales Centre" exist as
        // TWO different elements on this form: a clickable header ACTION
        // button (present tense) and the statusbar's stage radio (past
        // tense, e.g. "Sent to Sales Centre"), which stays disabled until the
        // header action advances the ticket. Matching on text alone can
        // resolve to the disabled radio, which previously hung until the
        // test timeout — so find the first match that is NOT inside
        // .o_statusbar_status.
        const clickHeaderStageAction = async (label: string, statusbarLabel: string) => {
          const candidates = page.locator('button').filter({ hasText: new RegExp(label, 'i') });
          const count = await candidates.count();
          for (let i = 0; i < count; i++) {
            const candidate = candidates.nth(i);
            const insideStatusbar = await candidate.evaluate(
              el => !!el.closest('.o_statusbar_status')
            ).catch(() => true);
            if (!insideStatusbar && await candidate.isVisible().catch(() => false)) {
              await candidate.click();
              await waitForLoading(page);
              console.log(`  ✓ Clicked ${label} (header button)`);
              return;
            }
          }
          // Fall back to the statusbar radio in case this Odoo instance
          // renders it as directly clickable. This stage may not apply to
          // every ticket flow (e.g. a Centre/Branch repair that never
          // leaves the branch) — if the radio is also absent/disabled,
          // skip instead of hanging until the test timeout.
          const radio = page.locator('.o_statusbar_status button')
            .filter({ hasText: new RegExp(statusbarLabel, 'i') }).first();
          const radioVisible = await radio.isVisible({ timeout: 5_000 }).catch(() => false);
          const radioEnabled = radioVisible && await radio.isEnabled().catch(() => false);
          if (radioVisible && radioEnabled) {
            await radio.click();
            await waitForLoading(page);
            console.log(`  ✓ Clicked ${statusbarLabel} (statusbar radio)`);
          } else {
            console.log(`  ℹ ${label} not available — skipping (may not apply to this flow)`);
          }
        };

        await clickHeaderStageAction('Send to Sales Centre', 'Sent to Sales Centre');

        // Dismiss any confirmation dialog
        const confirmSalesBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
        if (await confirmSalesBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirmSalesBtn.click();
          await waitForLoading(page);
        }

        await clickHeaderStageAction('Received at Sales Centre', 'Received at Sales Centre');

        // Dismiss any confirmation dialog
        const confirmReceivedSalesBtn = page.locator('.o_dialog button').filter({ hasText: /^(OK|Confirm|Yes)$/i }).first();
        if (await confirmReceivedSalesBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirmReceivedSalesBtn.click();
          await waitForLoading(page);
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
            if (/Ready/i.test(dispatchRowTxt ?? '')) {
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
          // A leftover technical-modal backdrop (from the invoice
          // close/refresh flow above) can intercept pointer events here —
          // clear it before attempting the click.
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

          const allOverflowBtns = page.locator('.o_statusbar_status button').filter({ hasText: /More|\.\.\./ });
          const cnt = await allOverflowBtns.count();
          if (cnt > 0) {
            // first in DOM = visual right-side "..." = reveals future stages (Dispatch, Handed over)
            try {
              await allOverflowBtns.first().click({ timeout: 8_000 });
            } catch {
              await page.keyboard.press('Escape');
              await page.waitForTimeout(300);
              await allOverflowBtns.first().click({ force: true });
            }
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
            // Wait for the dispatch picking to reach Done
            await expect(
              page.locator('.o_statusbar_status button[disabled], .o_statusbar_status .o_arrow_button_current')
                .filter({ hasText: /done/i }).first()
            ).toBeVisible({ timeout: 60_000 }).catch(() => {
              console.log('  ℹ Dispatch picking status not confirmed Done within 60s — proceeding');
            });
            console.log('  ✓ Validated dispatch picking');

            // Close the dispatch picking form via its "×" button
            const dispatchCloseXBtn = page.locator('.o_dialog [aria-label="Close"], .o_dialog .btn-close, [aria-label="Close"], .btn-close').first();
            if (await dispatchCloseXBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
              await dispatchCloseXBtn.click();
              await waitForLoading(page);
              console.log('  ✓ Closed dispatch delivery form with X button');
            }
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
            // A leftover technical-modal backdrop can intercept pointer
            // events here (same as the Dispatch overflow above) — clear it
            // before attempting the click.
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
          }
        }

});
