import * as dotenv from 'dotenv';
import * as path from 'path';
import { Page } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const BASE_URL = (process.env.ODOO_URL || '').replace(/\/$/, '');

export async function loginAndSelectCompany(page: Page): Promise<void> {
  const email = process.env.ODOO_EMAIL || '';
  const password = process.env.ODOO_PASSWORD || '';

  await page.goto(`${BASE_URL}/web/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.fill('input[name="login"]', email);
  await page.fill('input[name="password"]', password);
  await page.locator('button[type="submit"]:not(.oe_search_button)').first().click();
  await page.waitForSelector('.o_main_navbar, .o_home_menu, .o_app', { timeout: 30_000 });
}

/**
 * Wait until Odoo 17's activity indicators are idle.
 *
 * Odoo 17 exposes overlapping loading signals:
 *   1. `.o_loading_indicator` — the bottom-right "Loading" toast. Odoo
 *      appears it ~400ms AFTER an RPC starts (debounced to prevent
 *      flashing on fast calls) and fades out with `.o-fade-leave` when
 *      the pending-request count drops to 0. On the staging build we
 *      also see the toast rendered without that class — it just says
 *      "Loading" — so we also check `.o_notification` bottom-right
 *      toasts and any text node containing "Loading".
 *   2. `.o_blockUI` (and body.o_ui_blocked) — the full-screen blocker
 *      used by `ui.block()` during form saves / server actions.
 *   3. `ui.isBlocked` on the Owl `ui` service — programmatic flag.
 *
 * Strategy (per user request): after any user action, grace-wait up to
 * `graceMs` (default 1000ms) for the loading indicator to APPEAR. If
 * it does, wait for it to fully disappear before returning. If it
 * doesn't appear in the grace window, we're already idle.
 *
 * This handles both fast RPCs (< 400ms, no indicator) and slow ones
 * (indicator appears and lingers) with a single predictable pattern.
 */
export async function waitForLoading(
  page: Page,
  timeoutMs = 60_000,
  graceMs = 1_000,
): Promise<void> {
  const indicatorVisibleNow = () => page.evaluate(() => {
    const w = window as any;
    // Standard Odoo 17 selector
    const indicator = document.querySelector('.o_loading_indicator');
    if (indicator) {
      const style = getComputedStyle(indicator);
      if (style.display !== 'none'
          && style.visibility !== 'hidden'
          && !indicator.classList.contains('o-fade-leave')) {
        return true;
      }
    }
    // Backup selector — bottom-right "Loading" toast on some builds
    // renders as a plain badge/notification with visible "Loading" text
    for (const el of Array.from(document.querySelectorAll(
      '.o_notification, .o_loading, [class*="loading" i]'
    ))) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const txt = (el as HTMLElement).innerText?.trim() ?? '';
      if (/loading/i.test(txt)) {
        // Ignore matches inside larger unrelated blocks — only bottom
        // right of viewport (bottom > vh - 200, right within 250px)
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.bottom >= window.innerHeight - 220 && r.right >= window.innerWidth - 300) {
          return true;
        }
      }
    }
    // Full-screen blocker checks
    if (document.querySelector('.o_blockUI')) return true;
    if (document.body.classList.contains('o_ui_blocked')) return true;
    try {
      if (w.odoo?.__WOWL_DEBUG__?.root?.env?.services?.ui?.isBlocked) return true;
    } catch { /* debug hook may not exist in production mode */ }
    return false;
  });

  // Phase 1: grace-wait for the indicator to appear.
  const graceDeadline = Date.now() + graceMs;
  let appeared = false;
  while (Date.now() < graceDeadline) {
    if (await indicatorVisibleNow()) { appeared = true; break; }
    await page.waitForTimeout(80);
  }

  // Phase 2: if it appeared, wait for it to fully disappear.
  if (appeared) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (!(await indicatorVisibleNow())) {
        // Small stability window — sometimes the indicator flicks off
        // for ~50ms between chained RPCs. Re-check.
        await page.waitForTimeout(200);
        if (!(await indicatorVisibleNow())) return;
      }
      await page.waitForTimeout(100);
    }
    throw new Error(`waitForLoading: indicator still visible after ${timeoutMs}ms`);
  }
  // No indicator appeared within grace — already idle.
}

/**
 * Wait until the action manager has landed on a real, rendered view
 * (list / kanban / form) OR raised a dialog. Use this after actions that
 * transition between views (breadcrumb clicks, smart buttons, top-nav
 * clicks) — waitForLoading alone can return during the momentary gap
 * between "action manager fetch done" and "view arch rendered", which
 * looks idle from the RPC perspective but leaves the DOM without the
 * expected view container.
 */
export async function waitForView(page: Page, timeoutMs = 20_000): Promise<void> {
  await waitForLoading(page, timeoutMs);
  await page.waitForSelector(
    '.o_list_view, .o_kanban_view, .o_form_view, .o_dialog',
    { timeout: timeoutMs }
  );
  await waitForLoading(page, timeoutMs);
}

export async function dismissAnyModal(page: Page): Promise<void> {
  const closeBtn = page.locator('.o_dialog button').filter({ hasText: /^Close$/i }).first();
  if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
}

export async function fillMany2one(page: Page, fieldName: string, value: string): Promise<void> {
  const widget = page.locator(`[name="${fieldName}"]`).first();

  // Selection <select> — pick by visible text
  const selEl = widget.locator('select').first();
  if (await selEl.count() > 0) {
    const options = await selEl.evaluate((s: HTMLSelectElement) =>
      Array.from(s.options).map(o => ({ value: o.value, text: o.text.trim() }))
    );
    const match = options.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
    if (match) await selEl.selectOption(match.value);
    await waitForLoading(page);
    return;
  }

  // Many2one autocomplete <input>
  const input = widget.locator('input').first();
  await input.click();
  await input.fill(value);
  // Wait for the name_search RPC that populates the dropdown
  await waitForLoading(page);
  const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete').first();
  await menu.waitFor({ state: 'visible', timeout: 8_000 });
  const exact = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
    .filter({ hasText: value }).first();
  if (await exact.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await exact.click();
  } else {
    const first = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
      .filter({ hasNotText: /loading|searching/i }).first();
    await first.click();
  }
  // Wait for the onchange RPC that fires after selection
  await waitForLoading(page);
}

export async function fillMany2oneByLabel(page: Page, labelText: string, value: string): Promise<void> {
  const fieldName = await page.evaluate((label: string) => {
    for (const el of Array.from(document.querySelectorAll('.o_form_label, label'))) {
      if ((el.textContent ?? '').trim().toLowerCase() === label.toLowerCase()) {
        const forId = el.getAttribute('for');
        if (forId) {
          const widget = document.getElementById(forId)?.closest('[name]');
          if (widget) return widget.getAttribute('name');
        }
        const next = el.nextElementSibling;
        if (next?.hasAttribute('name')) return next.getAttribute('name');
        const inner = next?.querySelector('[name]');
        if (inner) return inner.getAttribute('name');
        const td = el.closest('td, .o_td_label, .o_cell');
        if (td) {
          const sib = td.nextElementSibling;
          const w = (sib?.hasAttribute('name') ? sib : sib?.querySelector('[name]')) as Element | null;
          if (w) return w.getAttribute('name');
        }
      }
    }
    return null;
  }, labelText);

  if (fieldName) {
    await fillMany2one(page, fieldName, value);
  } else {
    const input = page.locator(`input[placeholder*="${labelText}" i]`).first();
    await input.fill(value);
    await waitForLoading(page);
    const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete').first();
    if (await menu.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
        .filter({ hasNotText: /loading|searching/i }).first().click();
      await waitForLoading(page);
    }
  }
}

export async function selectFirstDropdownByLabel(page: Page, labelText: string): Promise<string> {
  const fieldName = await page.evaluate((label: string) => {
    for (const el of Array.from(document.querySelectorAll('.o_form_label, label'))) {
      if ((el.textContent ?? '').trim().toLowerCase() === label.toLowerCase()) {
        const forId = el.getAttribute('for');
        if (forId) {
          const widget = document.getElementById(forId)?.closest('[name]');
          if (widget) return widget.getAttribute('name');
        }
        const next = el.nextElementSibling;
        if (next?.hasAttribute('name')) return next.getAttribute('name');
        const td = el.closest('td, .o_td_label');
        if (td) {
          const sib = td.nextElementSibling;
          const w = (sib?.hasAttribute('name') ? sib : sib?.querySelector('[name]')) as Element | null;
          if (w) return w.getAttribute('name');
        }
      }
    }
    return null;
  }, labelText);

  if (!fieldName) throw new Error(`Could not find field for label: "${labelText}"`);

  const widget = page.locator(`[name="${fieldName}"]`).first();

  // Try Selection <select>
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
      return label;
    }
  }

  // Fallback: Many2one with empty search
  const input = widget.locator('input').first();
  await input.click();
  await input.fill('');
  await waitForLoading(page);
  const menu = page.locator('.o-autocomplete--dropdown-menu, .ui-autocomplete').first();
  if (await menu.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const first = menu.locator('.o-autocomplete--dropdown-item, .ui-menu-item a')
      .filter({ hasNotText: /loading|searching/i }).first();
    const text = (await first.textContent())?.trim() ?? '';
    await first.click();
    await waitForLoading(page);
    return text;
  }

  return '';
}

export async function rpc(
  page: Page,
  model: string,
  method: string,
  args: any[] = [],
  kwargs: Record<string, any> = {}
): Promise<any> {
  return page.evaluate(
    async ({ baseUrl, model, method, args, kwargs }: {
      baseUrl: string; model: string; method: string;
      args: any[]; kwargs: Record<string, any>;
    }) => {
      const res = await fetch(`${baseUrl}/web/dataset/call_kw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          id: Math.random(),
          params: { model, method, args, kwargs: { context: {}, ...kwargs } },
        }),
        credentials: 'include',
      });
      const j = await res.json() as { result?: any; error?: { data?: { message?: string } } };
      if (j.error) throw new Error(j.error?.data?.message ?? JSON.stringify(j.error));
      return j.result;
    },
    { baseUrl: BASE_URL, model, method, args, kwargs }
  );
}
