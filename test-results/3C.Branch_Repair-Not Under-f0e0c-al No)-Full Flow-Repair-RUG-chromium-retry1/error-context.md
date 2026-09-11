# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts >> Repair RUG
- Location: tests\3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts:7:5

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: locator.click: Test timeout of 180000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /^Return$/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]: "Database neutralized for testing: no emails sent, etc."
  - generic: "▶ Running: 3C.Branch_Repair-Not Under Warranty(With Serial No)-Full Flow.spec.ts — Repair RUG"
  - banner [ref=e4]:
    - navigation [ref=e5]:
      - link "Home menu" [ref=e6] [cursor=pointer]:
        - /url: "#"
        - img
        - img "Helpdesk" [ref=e7]
        - generic [ref=e8]: Helpdesk
      - menu [ref=e9]:
        - menuitem "Overview" [ref=e10] [cursor=pointer]
        - button "Tickets" [ref=e12] [cursor=pointer]:
          - generic [ref=e13]: Tickets
        - button "Reporting" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: Reporting
        - button "Configuration" [ref=e18] [cursor=pointer]:
          - generic [ref=e19]: Configuration
        - button "Repair Diagnosis" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]: Repair Diagnosis
      - menu [ref=e23]:
        - button "Attendance" [ref=e25] [cursor=pointer]:
          - img "Attendance" [ref=e26]: 
        - generic [ref=e28]:
          - button " Guides" [ref=e29] [cursor=pointer]:
            - generic [ref=e30]: 
            - generic [ref=e31]: Guides
          - generic: "2"
        - button "Messages 115" [ref=e33] [cursor=pointer]:
          - img "Messages" [ref=e34]: 
          - generic [ref=e35]: "115"
        - button "Activities 38" [ref=e37] [cursor=pointer]:
          - img "Activities" [ref=e38]: 
          - generic [ref=e39]: "38"
        - button "Toggle Studio" [ref=e41] [cursor=pointer]:
          - img [ref=e42]: 
        - button "Jinasena Agricultural Machinery (Pvt) Ltd." [ref=e44] [cursor=pointer]:
          - text: 
          - generic [ref=e45]: Jinasena Agricultural Machinery (Pvt) Ltd.
        - generic: 
        - button "User" [ref=e47] [cursor=pointer]:
          - img "User" [ref=e48]
          - text: 
  - generic [ref=e51]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - button "New" [ref=e57] [cursor=pointer]
        - generic [ref=e58]:
          - list [ref=e59]:
            - listitem [ref=e60]:
              - link "Helpdesk Overview" [ref=e61] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e62]:
              - text: /
              - link "Customer Care - Repair" [ref=e63] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e64]:
            - generic [ref=e66]: REPAIR/2026/01229 (#1254)
            - button "" [ref=e70] [cursor=pointer]:
              - generic [ref=e71]: 
        - generic [ref=e72]:
          - generic [ref=e73]:
            - button "Save manually" [disabled]:
              - generic: 
            - button "Discard changes" [ref=e74] [cursor=pointer]:
              - generic [ref=e75]: 
          - generic [ref=e77]: 
      - button " 991 Tickets 740 Open" [ref=e80] [cursor=pointer]:
        - generic [ref=e81]: 
        - generic [ref=e82]:
          - generic [ref=e83]:
            - textbox [ref=e86]: "991"
            - generic [ref=e87]: Tickets
          - generic [ref=e88]:
            - textbox [ref=e91]: "740"
            - generic [ref=e92]: Open
      - generic [ref=e93]:
        - button "Search Knowledge Articles" [ref=e94] [cursor=pointer]:
          - img [ref=e95]
        - search [ref=e99]:
          - navigation "Pager" [ref=e100]:
            - generic [ref=e101]:
              - generic [ref=e102]: "1"
              - text: / 1
            - generic [ref=e103]:
              - button "Previous" [disabled]:
                - generic: 
              - button "Next" [disabled]:
                - generic: 
    - generic [ref=e105]:
      - generic [ref=e106]:
        - radiogroup "Statusbar" [ref=e109]:
          - button "More..." [ref=e110] [cursor=pointer]: ...
          - radio "Repair Completed" [disabled]
          - radio "Repair Started" [disabled]
          - radio "Estimation Approval Received" [disabled]
          - radio "Estimation Sent to Customer" [disabled]
          - radio "Diagnosis" [disabled]
          - radio "Received at Factory" [disabled]
          - radio "Sent to Factory" [disabled]
          - radio "New" [checked] [disabled]
        - generic [ref=e111]:
          - button [ref=e114] [cursor=pointer]:
            - generic "In Progress" [ref=e115]
          - heading "REPAIR/2026/01229" [level=1] [ref=e118]:
            - generic [ref=e119]: REPAIR/2026/01229
          - generic [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]:
                - generic [ref=e124]: Assigned to
                - generic [ref=e127]:
                  - img [ref=e129]
                  - link "Kapila Hettiarachchi - New 17" [ref=e130] [cursor=pointer]:
                    - /url: "#id=8&model=res.users"
                    - generic [ref=e131]: Kapila Hettiarachchi - New 17
              - generic [ref=e132]:
                - generic [ref=e134]: Type
                - combobox "Type" [ref=e140]: Repair - Not Under Warranty (With Serial No)
              - generic [ref=e141]:
                - generic [ref=e143]: Return Receipt Location
                - combobox "Return Receipt Location" [ref=e149]: BR-AM/Stock
              - generic [ref=e150]:
                - generic [ref=e152]: Repair Location
                - link "BR-AM/Stock" [ref=e155] [cursor=pointer]:
                  - /url: "#id=768&model=stock.location"
                  - generic [ref=e156]: BR-AM/Stock
              - generic [ref=e157]:
                - generic [ref=e159]: Repair Reason
                - generic [ref=e162]:
                  - generic "Low Pressue" [ref=e163]:
                    - generic [ref=e164]: Low Pressue
                    - link "Delete" [ref=e165] [cursor=pointer]:
                      - /url: "#"
                      - generic [ref=e166]: 
                  - combobox "Repair Reason" [ref=e170]
              - generic [ref=e171]:
                - generic [ref=e173]: Job Location
                - combobox "Job Location" [ref=e176] [cursor=pointer]:
                  - option "Centre Repair" [selected]
                  - option "Factory Repair"
              - generic [ref=e177]:
                - generic [ref=e179]: Priority
                - radiogroup "Priority" [ref=e182]:
                  - radio "Medium priority" [ref=e183] [cursor=pointer]: 
                  - radio "High priority" [ref=e184] [cursor=pointer]: 
                  - radio "Urgent" [ref=e185] [cursor=pointer]: 
              - generic [ref=e186]:
                - generic [ref=e188]: Re-estimate Status
                - generic [ref=e190]: None
              - generic [ref=e191]:
                - generic [ref=e193]: Re-estimate Count
                - generic [ref=e195]: "0"
            - generic [ref=e196]:
              - generic [ref=e197]:
                - generic [ref=e199]: Customer
                - combobox [ref=e205]: KURUNEGALA CASH CUSTOMER
              - generic [ref=e206]:
                - generic [ref=e208]: Email
                - textbox "Email" [ref=e211]: sanjayarajans26407@gmail.com
              - generic [ref=e212]:
                - generic [ref=e214]: Phone
                - generic [ref=e218]:
                  - textbox "Phone" [ref=e219]: "0372232202"
                  - text:  
              - generic [ref=e220]:
                - generic [ref=e222]: Serial Number
                - generic [ref=e227]:
                  - combobox "Serial Number" [expanded] [active] [ref=e228]
                  - menu [ref=e229]:
                    - listitem [ref=e230]:
                      - option "0207_001" [selected] [ref=e231] [cursor=pointer]
                    - listitem [ref=e232]:
                      - option "0207_002" [ref=e233] [cursor=pointer]
                    - listitem [ref=e234]:
                      - option "0207_003" [ref=e235] [cursor=pointer]
                    - listitem [ref=e236]:
                      - option "0207_004" [ref=e237] [cursor=pointer]
                    - listitem [ref=e238]:
                      - option "0207_005" [ref=e239] [cursor=pointer]
                    - listitem [ref=e240]:
                      - option "0630_001" [ref=e241] [cursor=pointer]
                    - listitem [ref=e242]:
                      - option "0630_002" [ref=e243] [cursor=pointer]
                    - listitem [ref=e244]:
                      - option "0630_003" [ref=e245] [cursor=pointer]
                    - listitem [ref=e246]:
                      - option "Search More..." [ref=e247] [cursor=pointer]
              - generic [ref=e250]:
                - text: Product
                - superscript [ref=e251]: "?"
          - generic [ref=e254]:
            - list [ref=e256]:
              - listitem [ref=e257] [cursor=pointer]:
                - tab "Description" [ref=e258]
              - listitem [ref=e259] [cursor=pointer]:
                - tab "Extra Info" [ref=e260]
              - listitem [ref=e261] [cursor=pointer]:
                - tab "Warranty Details" [ref=e262]
              - listitem [ref=e263] [cursor=pointer]:
                - tab "Cancel/ Reopen Log" [ref=e264]
            - paragraph [ref=e271]
      - generic [ref=e273]:
        - generic [ref=e275]:
          - button "Send message" [ref=e276] [cursor=pointer]
          - button "Log note" [ref=e277] [cursor=pointer]
          - generic [ref=e278]:
            - button "Activities" [ref=e279] [cursor=pointer]
            - button "Search Messages" [ref=e281] [cursor=pointer]:
              - img [ref=e282]: 
            - button "Attach files" [ref=e284] [cursor=pointer]:
              - generic [ref=e285]: 
            - button "1" [ref=e287] [cursor=pointer]:
              - img [ref=e288]: 
              - superscript: "1"
            - button "Following" [ref=e289] [cursor=pointer]:
              - generic [ref=e291]: Following
        - generic [ref=e292]:
          - button "You're viewing older messages Jump to Present " [ref=e293] [cursor=pointer]:
            - generic [ref=e294]: You're viewing older messages
            - generic [ref=e295]: Jump to Present
            - generic [ref=e296]: 
          - generic [ref=e298]:
            - generic [ref=e299]:
              - separator [ref=e300]
              - generic [ref=e301]: Today
              - separator [ref=e302]
            - group "System notification" [ref=e303]:
              - generic [ref=e304]:
                - generic "Open card" [ref=e306] [cursor=pointer]:
                  - img [ref=e307]
                - generic [ref=e308]:
                  - generic [ref=e309]:
                    - generic "Open card" [ref=e310] [cursor=pointer]:
                      - strong [ref=e311]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:08:18 AM" [ref=e312]: "- 2 minutes ago"
                  - list [ref=e317]:
                    - group [ref=e318]:
                      - text: None
                      - generic [ref=e319]: 
                      - text: Kapila Hettiarachchi - New 17
                      - generic [ref=e320]: (Assigned to)
            - group "System notification" [ref=e321]:
              - generic [ref=e322]:
                - generic "Open card" [ref=e324] [cursor=pointer]:
                  - img [ref=e325]
                - generic [ref=e326]:
                  - generic [ref=e327]:
                    - generic "Open card" [ref=e328] [cursor=pointer]:
                      - strong [ref=e329]: Kapila Hettiarachchi - New 17
                    - generic "9/11/2026, 11:08:18 AM" [ref=e330]: "- 2 minutes ago"
                  - paragraph [ref=e335]: Ticket created
  - generic:
    - generic:
      - paragraph: Press esc to exit full screen
  - text:         
```

# Test source

```ts
  10  |   await loginAndSelectCompany(page);
  11  |   await page.goto(`${BASE_URL}/web`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  12  |   await page.waitForSelector('.o_home_menu, .o_app', { timeout: 30_000 });
  13  |   await dismissAnyModal(page);
  14  |   await waitForLoading(page);
  15  | 
  16  |   // Click the Helpdesk app icon
  17  |   const helpdeskApp = page.locator('.o_app').filter({ hasText: /^Helpdesk$/i }).first();
  18  |   await expect(helpdeskApp).toBeVisible({ timeout: 10_000 });
  19  |   await helpdeskApp.click();
  20  |   await page.waitForSelector('.o_main_navbar', { timeout: 20_000 });
  21  |   await waitForLoading(page);
  22  |   console.log('  ✓ Helpdesk app opened');
  23  | 
  24  |   // Find the Customer Care - Repair team card and click its Tickets button
  25  |   const teamCard = page.locator('.o_kanban_record').filter({ hasText: /Customer Care\s*-\s*Repair/i }).first();
  26  |   await expect(teamCard).toBeVisible({ timeout: 15_000 });
  27  |   console.log('  ✓ Found Customer Care - Repair team');
  28  | 
  29  |   const ticketButton = teamCard.locator('button').filter({ hasText: /^Tickets$/i }).first();
  30  |   await expect(ticketButton).toBeVisible({ timeout: 5_000 });
  31  |   await ticketButton.click();
  32  |   await waitForView(page);
  33  |   console.log('  ✓ Clicked Tickets button under Customer Care - Repair');
  34  | 
  35  |   // Click "New" to open a new ticket form (inherits the team from context)
  36  |   const newBtn = page.getByRole('button', { name: 'New' }).first();
  37  |   await expect(newBtn).toBeVisible({ timeout: 10_000 });
  38  |   await newBtn.click();
  39  |   await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  40  |   await waitForLoading(page);
  41  |   console.log('  ✓ New ticket form opened');
  42  | 
  43  |   // Click "Assign to me"
  44  |   const assignBtn = page.locator('button').filter({ hasText: /Assign to me/i }).first();
  45  |   await expect(assignBtn).toBeVisible({ timeout: 8_000 });
  46  |   await assignBtn.click();
  47  |   await waitForLoading(page);
  48  |   console.log('  ✓ Clicked Assign to me');
  49  | 
  50  |   // Select "Repair - Under warranty - RUG" from the Type field
  51  |   // (fillMany2one already waits for its own onchange RPC via waitForLoading)
  52  |   await fillMany2one(page, 'ticket_type_id', 'Repair - Not Under Warranty (With Serial No)');
  53  |   console.log('  ✓ Type set to: Repair - Not Under Warranty (With Serial No)');
  54  | 
  55  |   await fillMany2oneByLabel(page, 'Return Receipt Location', 'BR-AM/Stock');
  56  |   console.log('  ✓ Return Receipt Location set to: BR-AM/Stock');
  57  | 
  58  |   const reasonText = await selectFirstDropdownByLabel(page, 'Repair Reason');
  59  |   console.log(`  ✓ Repair Reason selected: ${reasonText}`);
  60  | 
  61  |   await fillMany2oneByLabel(page, 'Job Location', 'Centre Repair');
  62  |   console.log('  ✓ Job Location set to: Centre Repair');
  63  | 
  64  |   await fillMany2oneByLabel(page, 'Customer', 'Kurunegala Cash Customer');
  65  |   console.log('  ✓ Customer set to: Kurunegala Cash Customer');
  66  | 
  67  |   // Read serial number and sales order from their respective txt files
  68  |   const serialNumber = fs.readFileSync(
  69  |     path.join(__dirname, '..', 'Serial.txt'), 'utf-8'
  70  |   ).trim();
  71  |   console.log(`  ✓ Serial number read from file: ${serialNumber}`);
  72  |   const salesOrderRef = fs.readFileSync(
  73  |     path.join(__dirname, '..', 'SalesOrder.txt'), 'utf-8'
  74  |   ).trim();
  75  |   console.log(`  ✓ Sales order read from file: ${salesOrderRef}`);
  76  |   await fillMany2oneByLabel(page, 'Serial Number', serialNumber);
  77  |   console.log(`  ✓ Serial Number selected: ${serialNumber}`);
  78  | 
  79  |   // Save the ticket using the "Save manually" button (floppy-disk icon in breadcrumb bar)
  80  |   const saveBtn = page.locator('.o_form_button_save').first();
  81  |   await expect(saveBtn).toBeVisible({ timeout: 8_000 });
  82  |   await saveBtn.click();
  83  |   await waitForLoading(page);
  84  |   console.log('  ✓ Ticket saved');
  85  | 
  86  |   // Read the ticket number from the breadcrumb after save
  87  |   const ticketNo = await page.locator('.o_breadcrumb .o_last_breadcrumb_item, .o_breadcrumb .active').first().textContent();
  88  |   const ticketNoClean = ticketNo?.trim() ?? 'Unknown';
  89  |   console.log(`  ✓ Ticket number: ${ticketNoClean}`);
  90  | 
  91  |   // Capture the real database ID from the URL hash (differs from the display #nnn in the ticket name)
  92  |   const ticketUrlHash = await page.evaluate(() => window.location.hash);
  93  |   const ticketRealId = ticketUrlHash.match(/(?:^#?|&)id=(\d+)/)?.[1] ?? null;
  94  |   console.log(`  ✓ Ticket DB ID: ${ticketRealId}`);
  95  |   testInfo.annotations.push({ type: 'Ticket', description: ticketNoClean });
  96  | 
  97  |   // Write ticket number as header in log.txt
  98  |   const logPath = path.join(__dirname, '..', 'log.txt');
  99  |   const timestamp = new Date().toLocaleString();
  100 |   const logHeader = `===== Repair Ticket: ${ticketNoClean} | ${timestamp} =====\n`;
  101 |   fs.appendFileSync(logPath, logHeader, 'utf-8');
  102 |   console.log(`  ✓ Ticket number written to log.txt`);
  103 | 
  104 |   await page.screenshot({ path: 'test-results/repair-rug.png', fullPage: false });
  105 |   console.log('  ✓ Screenshot saved to test-results/repair-rug.png');
  106 | 
  107 |   // Click the Return button on the repair form. In this Odoo instance this
  108 |   // directly opens the "Returned Picking" transfer form (dialog) rather than
  109 |   // a "Suggested Return Location" wizard — so just validate it.
> 110 |   await page.locator('button').filter({ hasText: /^Return$/i }).first().click();
      |                                                                         ^ Error: locator.click: Test timeout of 180000ms exceeded.
  111 |   await waitForLoading(page);
  112 |   console.log('  ✓ Return clicked — Returned Picking form opened');
  113 | 
  114 |   const returnValidateBtn = page.locator('.o_dialog button, button').filter({ hasText: /^Validate$/i }).first();
  115 |   await expect(returnValidateBtn).toBeVisible({ timeout: 15_000 });
  116 |   await returnValidateBtn.click();
  117 |   await waitForLoading(page);
  118 | 
  119 |   // Odoo may open an Immediate Transfer confirmation dialog on first-validate
  120 |   const immTransferBtnReturn = page.locator('.o_dialog button').filter({ hasText: /Immediate Transfer|^Validate$/i }).first();
  121 |   if (await immTransferBtnReturn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  122 |     await immTransferBtnReturn.click();
  123 |     await waitForLoading(page);
  124 |   }
  125 |   // Or a Backorder dialog if the qty received was partial
  126 |   const noBackorderBtnReturn = page.locator('.o_dialog button').filter({ hasText: /No Backorder/i }).first();
  127 |   if (await noBackorderBtnReturn.isVisible({ timeout: 3_000 }).catch(() => false)) {
  128 |     await noBackorderBtnReturn.click();
  129 |     await waitForLoading(page);
  130 |   }
  131 | 
  132 |   // Dismiss any Odoo Error dialog that appears after clicking Validate
  133 |   const odooErrorDlg = page.locator('.o_dialog').filter({ hasText: /Odoo Error|An error occurred/i });
  134 |   if (await odooErrorDlg.isVisible({ timeout: 3_000 }).catch(() => false)) {
  135 |     await odooErrorDlg.locator('button').filter({ hasText: /^Close$/i }).first().click();
  136 |     await waitForLoading(page);
  137 |     console.log('  ⚠ Odoo Error dialog dismissed after Validate click');
  138 |   }
  139 |   console.log('  ✓ Returned Picking validated');
  140 | 
  141 |   // ── CLOSE THE RETURNED PICKING POPUP ─────────────────────────────────────
  142 |   // Validate confirms the picking as Done inside the dialog. Close it via
  143 |   // its top-right "×" button (the dialog's own close control — see
  144 |   // Return.jpg) so it's fully torn down before doing anything else.
  145 |   // NOTE: the dialog also has a "← Back" button, but that just navigates
  146 |   // within the dialog's own history/breadcrumb — it does NOT close the
  147 |   // dialog, so it must not be tried first (a stale locator handle going
  148 |   // "hidden" after Back was previously mistaken for the dialog closing
  149 |   // while the Transfer form was still open underneath).
  150 |   // Loop until the TOTAL count of open dialogs/modals is zero — checking
  151 |   // a single `.first()` handle isn't enough when more than one such node
  152 |   // exists in the DOM.
  153 |   for (let attempt = 0; attempt < 8; attempt++) {
  154 |     const openModals = page.locator('.o_dialog, .modal.d-block');
  155 |     const openCount = await openModals.count();
  156 |     if (openCount === 0) break;
  157 |     const topModal = openModals.last();
  158 |     if (!await topModal.isVisible({ timeout: 2_000 }).catch(() => false)) break;
  159 |     const closeXBtn = topModal.locator('[aria-label="Close"], .btn-close').first();
  160 |     if (await closeXBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
  161 |       await closeXBtn.click().catch(() => {});
  162 |     } else {
  163 |       const closeTextBtn = topModal.locator('button').filter({ hasText: /^Close$/i }).first();
  164 |       if (await closeTextBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
  165 |         await closeTextBtn.click().catch(() => {});
  166 |       } else {
  167 |         await page.keyboard.press('Escape');
  168 |       }
  169 |     }
  170 |     await waitForLoading(page);
  171 |     await page.waitForTimeout(300);
  172 |   }
  173 |   // Final confirmation: no dialog/modal left open at all.
  174 |   await expect(page.locator('.o_dialog, .modal.d-block')).toHaveCount(0, { timeout: 10_000 });
  175 |   await page.waitForSelector('.o_form_view', { timeout: 15_000 });
  176 |   await waitForLoading(page);
  177 |   console.log('  ✓ Returned Picking popup closed');
  178 | 
  179 |   // ── PLAN INTERVENTION ────────────────────────────────────────────────────
  180 |   // After the Returned Picking is validated the ticket transitions to
  181 |   // repair_stage_state='received_at_factory' and the header re-renders.
  182 |   // Plan Intervention's invisible condition flips (see helpdesk_ticket.py:
  183 |   // action_generate_fsm_task guard), so the button becomes visible mid-
  184 |   // render. Playwright's click can catch the moment where the element
  185 |   // is briefly detached during the re-render — retry pattern needed.
  186 |   const clickPlanIntervention = async () => {
  187 |     for (let attempt = 1; attempt <= 5; attempt++) {
  188 |       const btn = page.locator('button').filter({ hasText: /Plan Intervention/i }).first();
  189 |       try {
  190 |         await expect(btn).toBeVisible({ timeout: 10_000 });
  191 |         // Force click via evaluate — bypasses Playwright's stability
  192 |         // checks and dispatches the event even if a re-render happens
  193 |         // during the click.
  194 |         await btn.click({ timeout: 5_000, force: false, trial: false });
  195 |         return;
  196 |       } catch (e) {
  197 |         console.log(`  ℹ Plan Intervention click attempt ${attempt} failed — waiting for re-render`);
  198 |         await waitForLoading(page);
  199 |         await page.waitForTimeout(500);
  200 |       }
  201 |     }
  202 |     throw new Error('Plan Intervention click failed after 5 attempts');
  203 |   };
  204 |   await clickPlanIntervention();
  205 |   await waitForLoading(page);
  206 |   console.log('  ✓ Clicked Plan Intervention');
  207 | 
  208 |   // ── CREATE & VIEW TASK (in "Create a Field Service task" dialog) ──────────
  209 |   await page.getByText('Create a Field Service task').first().waitFor({ state: 'visible', timeout: 10_000 });
  210 |   const createViewBtn = page.locator('.o_dialog button').filter({ hasText: /Create & View Task/i }).first();
```