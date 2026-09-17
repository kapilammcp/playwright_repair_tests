# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 1A.Factory_Repair-Not Under Warranty(Without Serial No)-Full Flow.spec.ts >> Factory Repair - Not Under Warranty (Without Serial No) - Full Flow
- Location: tests\1A.Factory_Repair-Not Under Warranty(Without Serial No)-Full Flow.spec.ts:7:5

# Error details

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "https://rohanabalagalla-jinstage-clear-db-37966019.dev.odoo.com/web/login", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | import * as dotenv from 'dotenv';
  2   | import * as path from 'path';
  3   | import { Page } from '@playwright/test';
  4   | 
  5   | dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
  6   | 
  7   | export const BASE_URL = (process.env.ODOO_URL || '').replace(/\/$/, '');
  8   | 
  9   | /**
  10  |  * Injects a fixed, blinking banner at the bottom of the page showing the
  11  |  * given test name. Uses page.addInitScript so it re-injects itself on
  12  |  * every navigation/reload for the lifetime of this `page` — call it once,
  13  |  * near the top of a test, right after `page` is available.
  14  |  */
  15  | export async function showTestNameBanner(page: Page, testName: string): Promise<void> {
  16  |   await page.addInitScript((name: string) => {
  17  |     const render = () => {
  18  |       if (!document.body) { requestAnimationFrame(render); return; }
  19  |       const existing = document.getElementById('__pw_test_name_banner__');
  20  |       if (existing) existing.remove();
  21  |       const style = document.createElement('style');
  22  |       style.textContent = `
  23  |         @keyframes pw-test-name-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
  24  |         #__pw_test_name_banner__ {
  25  |           position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483647;
  26  |           background: #90ee90; color: #000; font: bold 14px/1.4 sans-serif;
  27  |           text-align: center; padding: 6px 10px; pointer-events: none;
  28  |         }
  29  |         #__pw_test_name_banner__ span {
  30  |           animation: pw-test-name-blink 1s steps(1, end) infinite;
  31  |         }
  32  |       `;
  33  |       const banner = document.createElement('div');
  34  |       banner.id = '__pw_test_name_banner__';
  35  |       const label = document.createElement('span');
  36  |       label.textContent = `▶ Running: ${name}`;
  37  |       banner.appendChild(label);
  38  |       document.head.appendChild(style);
  39  |       document.body.appendChild(banner);
  40  |     };
  41  |     render();
  42  |   }, testName);
  43  | }
  44  | 
  45  | export async function loginAndSelectCompany(page: Page): Promise<void> {
  46  |   const email = process.env.ODOO_EMAIL || '';
  47  |   const password = process.env.ODOO_PASSWORD || '';
  48  | 
> 49  |   await page.goto(`${BASE_URL}/web/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      |              ^ Error: page.goto: Target page, context or browser has been closed
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
  143 |     await page.waitForTimeout(80);
  144 |   }
  145 | 
  146 |   // Phase 2: if it appeared, wait for it to fully disappear.
  147 |   if (appeared) {
  148 |     const deadline = Date.now() + timeoutMs;
  149 |     while (Date.now() < deadline) {
```