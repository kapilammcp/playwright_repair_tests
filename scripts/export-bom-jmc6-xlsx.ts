import { chromium } from '@playwright/test';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { loginAndSelectCompany, rpc } from '../helpers/odoo';

const PRODUCT_CODE = 'JMC6';

async function loadBom(page: any, bomId: number): Promise<any> {
  const [bom] = await rpc(page, 'mrp.bom', 'read', [[bomId], [
    'code', 'product_tmpl_id', 'product_id', 'product_qty', 'product_uom_id',
    'type', 'bom_line_ids',
  ]]);

  bom.lines = bom.bom_line_ids?.length
    ? await rpc(page, 'mrp.bom.line', 'read', [bom.bom_line_ids, [
        'product_id', 'product_qty', 'product_uom_id', 'operation_id',
      ]])
    : [];

  return bom;
}

interface Row {
  level: number;
  product: string;
  reference: string;
  qty: number;
  uom: string;
  type: string;
  operation: string;
}

function flatten(bom: any, rows: Row[]) {
  rows.push({
    level: 0,
    product: bom.product_tmpl_id?.[1] ?? bom.product_id?.[1] ?? '',
    reference: '',
    qty: bom.product_qty,
    uom: bom.product_uom_id?.[1] ?? '',
    type: 'normal',
    operation: '',
  });
  for (const line of bom.lines) {
    rows.push({
      level: 1,
      product: '',
      reference: line.product_id?.[1] ?? '',
      qty: line.product_qty,
      uom: line.product_uom_id?.[1] ?? '',
      type: 'normal',
      operation: line.operation_id?.[1] ?? '',
    });
  }
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

  const bom = await loadBom(page, bomIds[0]);

  await browser.close();

  const rows: Row[] = [];
  flatten(bom, rows);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`BOM ${PRODUCT_CODE}`);

  sheet.columns = [
    { header: 'Level', key: 'level', width: 8 },
    { header: 'Product / Component', key: 'product', width: 55 },
    { header: 'Reference', key: 'reference', width: 15 },
    { header: 'Item Code', key: 'itemCode', width: 15 },
    { header: 'Quantity', key: 'qty', width: 12 },
    { header: 'UoM', key: 'uom', width: 10 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Operation', key: 'operation', width: 25 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  const extractItemCode = (text: string): string => text.match(/^\[([^\]]+)\]/)?.[1] ?? '';

  for (const r of rows) {
    const row = sheet.addRow({
      level: r.level,
      product: r.product,
      reference: r.reference,
      itemCode: extractItemCode(r.reference || r.product),
      qty: r.qty,
      uom: r.uom,
      type: r.type,
      operation: r.operation,
    });
    if (r.level === 0) {
      row.font = { bold: true };
    }
  }

  sheet.autoFilter = { from: 'A1', to: 'H1' };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const outPath = path.resolve(__dirname, '..', 'JMC6_v2.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`Written: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
