import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { loginAndSelectCompany, rpc } from '../helpers/odoo';

const PRODUCT_CODE = 'JMC6';

function esc(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

async function loadBom(page: any, bomId: number, seen: Set<number>): Promise<any> {
  if (seen.has(bomId)) return null;
  seen.add(bomId);

  const [bom] = await rpc(page, 'mrp.bom', 'read', [[bomId], [
    'code', 'product_tmpl_id', 'product_id', 'product_qty', 'product_uom_id',
    'type', 'bom_line_ids', 'operation_ids',
  ]]);

  bom.lines = bom.bom_line_ids?.length
    ? await rpc(page, 'mrp.bom.line', 'read', [bom.bom_line_ids, [
        'product_id', 'product_qty', 'product_uom_id', 'operation_id',
      ]])
    : [];

  bom.operations = bom.operation_ids?.length
    ? await rpc(page, 'mrp.routing.workcenter', 'read', [bom.operation_ids, [
        'name', 'workcenter_id', 'time_cycle_manual',
      ]])
    : [];

  // For each component that itself has a BOM, load it recursively (sub-assembly explosion)
  for (const line of bom.lines) {
    const productId = line.product_id?.[0];
    if (!productId) continue;
    const [tmpl] = await rpc(page, 'product.product', 'read', [[productId], ['product_tmpl_id']]);
    const tmplId = tmpl?.product_tmpl_id?.[0];
    if (!tmplId) continue;
    const subBomIds: number[] = await rpc(page, 'mrp.bom', 'search', [[['product_tmpl_id', '=', tmplId]]], { limit: 1 });
    if (subBomIds.length) {
      line.subBom = await loadBom(page, subBomIds[0], seen);
    }
  }

  return bom;
}

function renderBom(bom: any, level: number): string {
  const heading = level === 0 ? 'h1' : 'h2';
  return `
<div class="bom-block level-${level}">
  <${heading}>${level === 0 ? 'Bill of Materials: ' : 'Sub-Assembly: '}${esc(bom.product_id?.[1] ?? bom.product_tmpl_id?.[1] ?? '')}</${heading}>
  <div class="meta">
    <div><strong>Product:</strong> ${esc(bom.product_id?.[1] ?? bom.product_tmpl_id?.[1] ?? '')}</div>
    <div><strong>Reference:</strong> ${esc(bom.code)}</div>
    <div><strong>Quantity:</strong> ${esc(bom.product_qty)} ${esc(bom.product_uom_id?.[1] ?? '')}</div>
    <div><strong>Type:</strong> ${esc(bom.type)}</div>
  </div>

  <h3>Components</h3>
  <table>
    <tr><th>#</th><th>Component</th><th>Quantity</th><th>UoM</th><th>Operation</th></tr>
    ${bom.lines.map((l: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(l.product_id?.[1])}</td>
      <td>${esc(l.product_qty)}</td>
      <td>${esc(l.product_uom_id?.[1])}</td>
      <td>${esc(l.operation_id?.[1] ?? '')}</td>
    </tr>`).join('')}
  </table>

  ${bom.operations.length ? `
  <h3>Operations</h3>
  <table>
    <tr><th>#</th><th>Operation</th><th>Work Center</th><th>Duration (min)</th></tr>
    ${bom.operations.map((o: any, i: number) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(o.name)}</td>
      <td>${esc(o.workcenter_id?.[1])}</td>
      <td>${esc(o.time_cycle_manual)}</td>
    </tr>`).join('')}
  </table>` : ''}

  ${bom.lines.filter((l: any) => l.subBom).map((l: any) => renderBom(l.subBom, level + 1)).join('')}
</div>`;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await loginAndSelectCompany(page);

  const productTmpls = await rpc(page, 'product.template', 'search_read', [
    [['default_code', '=', PRODUCT_CODE]],
    ['id', 'name', 'default_code'],
  ]);
  if (!productTmpls.length) throw new Error(`No product found with code "${PRODUCT_CODE}"`);
  const tmplId = productTmpls[0].id;

  const bomIds: number[] = await rpc(page, 'mrp.bom', 'search', [[['product_tmpl_id', '=', tmplId]]]);
  if (!bomIds.length) throw new Error(`No BOM found for product code "${PRODUCT_CODE}"`);

  const seen = new Set<number>();
  const bom = await loadBom(page, bomIds[0], seen);

  await browser.close();

  const html = `<!doctype html>
<html><head><meta charset="utf-8">
<title>BOM ${esc(PRODUCT_CODE)}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 24px; color: #222; }
  h1 { color: #1a1a1a; }
  h2 { color: #333; }
  h3 { margin-top: 20px; border-bottom: 2px solid #ddd; padding-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; }
  .meta { background: #fafafa; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
  .meta div { margin: 2px 0; }
  .bom-block { margin-bottom: 24px; }
  .level-1 { margin-left: 24px; padding-left: 16px; border-left: 3px solid #bbb; }
  .level-2 { margin-left: 24px; padding-left: 16px; border-left: 3px solid #ddd; }
</style>
</head><body>
${renderBom(bom, 0)}
</body></html>`;

  const outPath = path.resolve(__dirname, '..', 'JMC6.html');
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`Written: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
