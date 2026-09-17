# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 1A.Factory_Repair-Not Under Warranty(Without Serial No)-Full Flow.spec.ts >> Factory Repair - Not Under Warranty (Without Serial No) - Full Flow
- Location: tests\1A.Factory_Repair-Not Under Warranty(Without Serial No)-Full Flow.spec.ts:7:5

# Error details

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Test source

```ts
  43  | }
  44  | 
  45  | export async function loginAndSelectCompany(page: Page): Promise<void> {
  46  |   const email = process.env.ODOO_EMAIL || '';
  47  |   const password = process.env.ODOO_PASSWORD || '';
  48  | 
  49  |   await page.goto(`${BASE_URL}/web/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  50  |   await page.fill('input[name="login"]', email);
  51  |   await page.fill('input[name="password"]', password);
  52  |   await page.locator('button[type="submit"]:not(.oe_search_button)').first().click();
  53  |   await page.waitForSelector('.o_main_navbar, .o_home_menu, .o_app', { timeout: 30_000 });
  54  | }
  55  | 
  56  | /**
  57  |  * Wait until Odoo 17's activity indicators are idle.
  58  |  *
  59  |  * Odoo 17 exposes overlapping loading signals:
  60  |  *   1. `.o_loading_indicator` — the bottom-right "Loading" toast. Odoo
  61  |  *      appears it ~400ms AFTER an RPC starts (debounced to prevent
  62  |  *      flashing on fast calls) and fades out with `.o-fade-leave` when
  63  |  *      the pending-request count drops to 0. On the staging build we
  64  |  *      also see the toast rendered without that class — it just says
  65  |  *      "Loading" — so we also check `.o_notification` bottom-right
  66  |  *      toasts and any text node containing "Loading".
  67  |  *   2. `.o_blockUI` (and body.o_ui_blocked) — the full-screen blocker
  68  |  *      used by `ui.block()` during form saves / server actions.
  69  |  *   3. `ui.isBlocked` on the Owl `ui` service — programmatic flag.
  70  |  *
  71  |  * Strategy (per user request): after any user action, grace-wait up to
  72  |  * `graceMs` (default 1000ms) for the loading indicator to APPEAR. If
  73  |  * it does, wait for it to fully disappear before returning. If it
  74  |  * doesn't appear in the grace window, we're already idle.
  75  |  *
  76  |  * This handles both fast RPCs (< 400ms, no indicator) and slow ones
  77  |  * (indicator appears and lingers) with a single predictable pattern.
  78  |  */
  79  | export async function waitForLoading(
  80  |   page: Page,
  81  |   timeoutMs = 60_000,
  82  |   graceMs = 1_000,
  83  | ): Promise<void> {
  84  |   // Wrapped so a transient "execution context was destroyed" error (page is
  85  |   // mid-navigation when we poll) doesn't blow up the whole wait — we just
  86  |   // treat that instant as "still loading" and re-check on the next tick.
  87  |   // If the page/context is actually gone, rethrow so the caller fails fast
  88  |   // instead of polling pointlessly until timeoutMs.
  89  |   const indicatorVisibleNow = async (): Promise<boolean> => {
  90  |     try {
  91  |       return await evalIndicatorVisible();
  92  |     } catch (err: any) {
  93  |       if (page.isClosed()) throw err;
  94  |       const msg = String(err?.message ?? '');
  95  |       if (/context (was )?destroyed|Execution context/i.test(msg)) return true;
  96  |       throw err;
  97  |     }
  98  |   };
  99  | 
  100 |   const evalIndicatorVisible = () => page.evaluate(() => {
  101 |     const w = window as any;
  102 |     // Standard Odoo 17 selector
  103 |     const indicator = document.querySelector('.o_loading_indicator');
  104 |     if (indicator) {
  105 |       const style = getComputedStyle(indicator);
  106 |       if (style.display !== 'none'
  107 |           && style.visibility !== 'hidden'
  108 |           && !indicator.classList.contains('o-fade-leave')) {
  109 |         return true;
  110 |       }
  111 |     }
  112 |     // Backup selector — bottom-right "Loading" toast on some builds
  113 |     // renders as a plain badge/notification with visible "Loading" text
  114 |     for (const el of Array.from(document.querySelectorAll(
  115 |       '.o_notification, .o_loading, [class*="loading" i]'
  116 |     ))) {
  117 |       const style = getComputedStyle(el);
  118 |       if (style.display === 'none' || style.visibility === 'hidden') continue;
  119 |       const txt = (el as HTMLElement).innerText?.trim() ?? '';
  120 |       if (/loading/i.test(txt)) {
  121 |         // Ignore matches inside larger unrelated blocks — only bottom
  122 |         // right of viewport (bottom > vh - 200, right within 250px)
  123 |         const r = (el as HTMLElement).getBoundingClientRect();
  124 |         if (r.bottom >= window.innerHeight - 220 && r.right >= window.innerWidth - 300) {
  125 |           return true;
  126 |         }
  127 |       }
  128 |     }
  129 |     // Full-screen blocker checks
  130 |     if (document.querySelector('.o_blockUI')) return true;
  131 |     if (document.body.classList.contains('o_ui_blocked')) return true;
  132 |     try {
  133 |       if (w.odoo?.__WOWL_DEBUG__?.root?.env?.services?.ui?.isBlocked) return true;
  134 |     } catch { /* debug hook may not exist in production mode */ }
  135 |     return false;
  136 |   });
  137 | 
  138 |   // Phase 1: grace-wait for the indicator to appear.
  139 |   const graceDeadline = Date.now() + graceMs;
  140 |   let appeared = false;
  141 |   while (Date.now() < graceDeadline) {
  142 |     if (await indicatorVisibleNow()) { appeared = true; break; }
> 143 |     await page.waitForTimeout(80);
      |                ^ Error: page.waitForTimeout: Target page, context or browser has been closed
  144 |   }
  145 | 
  146 |   // Phase 2: if it appeared, wait for it to fully disappear.
  147 |   if (appeared) {
  148 |     const deadline = Date.now() + timeoutMs;
  149 |     while (Date.now() < deadline) {
  150 |       if (!(await indicatorVisibleNow())) {
  151 |         // Small stability window — sometimes the indicator flicks off
  152 |         // for ~50ms between chained RPCs. Re-check.
  153 |         await page.waitForTimeout(200);
  154 |         if (!(await indicatorVisibleNow())) return;
  155 |       }
  156 |       await page.waitForTimeout(100);
  157 |     }
  158 |     throw new Error(`waitForLoading: indicator still visible after ${timeoutMs}ms`);
  159 |   }
  160 |   // No indicator appeared within grace — already idle.
  161 | }
  162 | 
  163 | /**
  164 |  * Wait until the action manager has landed on a real, rendered view
  165 |  * (list / kanban / form) OR raised a dialog. Use this after actions that
  166 |  * transition between views (breadcrumb clicks, smart buttons, top-nav
  167 |  * clicks) — waitForLoading alone can return during the momentary gap
  168 |  * between "action manager fetch done" and "view arch rendered", which
  169 |  * looks idle from the RPC perspective but leaves the DOM without the
  170 |  * expected view container.
  171 |  */
  172 | export async function waitForView(page: Page, timeoutMs = 20_000): Promise<void> {
  173 |   await waitForLoading(page, timeoutMs);
  174 |   await page.waitForSelector(
  175 |     '.o_list_view, .o_kanban_view, .o_form_view, .o_dialog',
  176 |     { timeout: timeoutMs }
  177 |   );
  178 |   await waitForLoading(page, timeoutMs);
  179 | }
  180 | 
  181 | export async function dismissAnyModal(page: Page): Promise<void> {
  182 |   const closeBtn = page.locator('.o_dialog button').filter({ hasText: /^Close$/i }).first();
  183 |   if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
  184 |     await closeBtn.click();
  185 |     await page.waitForTimeout(300);
  186 |   }
  187 | }
  188 | 
  189 | export async function fillMany2one(page: Page, fieldName: string, value: string): Promise<void> {
  190 |   const widget = page.locator(`[name="${fieldName}"]`).first();
  191 | 
  192 |   // Selection <select> — pick by visible text
  193 |   const selEl = widget.locator('select').first();
  194 |   if (await selEl.count() > 0) {
  195 |     const options = await selEl.evaluate((s: HTMLSelectElement) =>
  196 |       Array.from(s.options).map(o => ({ value: o.value, text: o.text.trim() }))
  197 |     );
  198 |     const match = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
  199 |     if (match) await selEl.selectOption(match.value);
  200 |     await waitForLoading(page);
  201 |     return;
  202 |   }
  203 | 
  204 |   // Many2one autocomplete <input>
  205 |   const input = widget.locator('input').first();
  206 |   await input.click();
  207 |   await input.fill(value);
  208 |   // Wait for the name_search RPC that populates the dropdown
  209 |   await waitForLoading(page);
  210 |   const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete').first();
  211 |   await menu.waitFor({ state: 'visible', timeout: 8_000 });
  212 |   const exact = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
  213 |     .filter({ hasText: value }).first();
  214 |   if (await exact.isVisible({ timeout: 1_500 }).catch(() => false)) {
  215 |     await exact.click();
  216 |   } else {
  217 |     const first = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
  218 |       .filter({ hasNotText: /loading|searching/i }).first();
  219 |     await first.click();
  220 |   }
  221 |   // Wait for the onchange RPC that fires after selection
  222 |   await waitForLoading(page);
  223 | }
  224 | 
  225 | export async function fillMany2oneByLabel(page: Page, labelText: string, value: string): Promise<void> {
  226 |   const fieldName = await page.evaluate((label: string) => {
  227 |     // Strip trailing tooltip markers (e.g. a "?" help-icon glyph) and
  228 |     // whitespace before comparing — some labels render as "Product ?"
  229 |     // in the DOM, which broke a strict equality match.
  230 |     const normalize = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+$/i, '');
  231 |     for (const el of Array.from(document.querySelectorAll('.o_form_label, label'))) {
  232 |       if (normalize(el.textContent ?? '') === normalize(label)) {
  233 |         const forId = el.getAttribute('for');
  234 |         if (forId) {
  235 |           const widget = document.getElementById(forId)?.closest('[name]');
  236 |           if (widget) return widget.getAttribute('name');
  237 |         }
  238 |         const next = el.nextElementSibling;
  239 |         if (next?.hasAttribute('name')) return next.getAttribute('name');
  240 |         const inner = next?.querySelector('[name]');
  241 |         if (inner) return inner.getAttribute('name');
  242 |         const td = el.closest('td, .o_td_label, .o_cell');
  243 |         if (td) {
```