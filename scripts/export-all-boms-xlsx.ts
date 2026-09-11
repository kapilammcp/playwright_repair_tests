import { chromium } from '@playwright/test';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { loginAndSelectCompany, rpc } from '../helpers/odoo';

const extractItemCode = (text: string): string => text?.match(/^\[([^\]]+)\]/)?.[1] ?? '';

function sanitizeSheetName(name: string, used: Set<string>): string {
  let base = name.replace(/[\\/*?:[\]]/g, ' ').trim().slice(0, 28) || 'BOM';
  let candidate = base;
  let i = 1;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base} (${i++})`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await loginAndSelectCompany(page);

  const companyName = process.env.ODOO_COMPANY || '';
  const companies = await rpc(page, 'res.company', 'search_read', [
    [['name', 'ilike', companyName]],
    ['id', 'name'],
  ]);
  if (!companies.length) throw new Error(`Company not found: "${companyName}"`);
  const companyId = companies[0].id;
  console.log(`Filtering BOMs for company: ${companies[0].name} (id ${companyId})`);

  const boms = await rpc(page, 'mrp.bom', 'search_read', [
    [['company_id', '=', companyId]],
    ['id', 'code', 'product_tmpl_id', 'product_id', 'product_qty', 'product_uom_id', 'type', 'bom_line_ids'],
  ]);

  console.log(`Found ${boms.length} BOMs`);

  // Batch-fetch all bom lines across all BOMs in one call
  const allLineIds: number[] = boms.flatMap((b: any) => b.bom_line_ids || []);
  const allLines = allLineIds.length
    ? await rpc(page, 'mrp.bom.line', 'read', [allLineIds, [
        'id', 'bom_id', 'product_id', 'product_qty', 'product_uom_id', 'operation_id',
      ]])
    : [];
  const linesByBom = new Map<number, any[]>();
  for (const line of allLines) {
    const bomId = line.bom_id[0];
    if (!linesByBom.has(bomId)) linesByBom.set(bomId, []);
    linesByBom.get(bomId)!.push(line);
  }

  await browser.close();

  const workbook = new ExcelJS.Workbook();
  const usedNames = new Set<string>();

  const combinedSheet = workbook.addWorksheet('All BOMs');
  combinedSheet.columns = [
    { header: 'BOM Product', key: 'bomProduct', width: 40 },
    { header: 'Level', key: 'level', width: 8 },
    { header: 'Product / Component', key: 'product', width: 55 },
    { header: 'Reference', key: 'reference', width: 40 },
    { header: 'Item Code', key: 'itemCode', width: 15 },
    { header: 'Quantity', key: 'qty', width: 12 },
    { header: 'UoM', key: 'uom', width: 10 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Operation', key: 'operation', width: 25 },
  ];
  combinedSheet.getRow(1).font = { bold: true };
  combinedSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  for (const bom of boms) {
    const productName = bom.product_id?.[1] ?? bom.product_tmpl_id?.[1] ?? `BOM ${bom.id}`;
    const itemCode = extractItemCode(productName);
    const sheetName = sanitizeSheetName(itemCode || productName, usedNames);
    const sheet = workbook.addWorksheet(sheetName);

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

    const headerRow = sheet.addRow({
      level: 0,
      product: productName,
      reference: '',
      itemCode,
      qty: bom.product_qty,
      uom: bom.product_uom_id?.[1] ?? '',
      type: 'normal',
      operation: '',
    });
    headerRow.font = { bold: true };

    const combinedHeaderRow = combinedSheet.addRow({
      bomProduct: productName,
      level: 0,
      product: productName,
      reference: '',
      itemCode,
      qty: bom.product_qty,
      uom: bom.product_uom_id?.[1] ?? '',
      type: 'normal',
      operation: '',
    });
    combinedHeaderRow.font = { bold: true };

    const lines = linesByBom.get(bom.id) || [];
    for (const line of lines) {
      const compName = line.product_id?.[1] ?? '';
      sheet.addRow({
        level: 1,
        product: '',
        reference: compName,
        itemCode: extractItemCode(compName),
        qty: line.product_qty,
        uom: line.product_uom_id?.[1] ?? '',
        type: 'normal',
        operation: line.operation_id?.[1] ?? '',
      });
      combinedSheet.addRow({
        bomProduct: productName,
        level: 1,
        product: '',
        reference: compName,
        itemCode: extractItemCode(compName),
        qty: line.product_qty,
        uom: line.product_uom_id?.[1] ?? '',
        type: 'normal',
        operation: line.operation_id?.[1] ?? '',
      });
    }

    sheet.autoFilter = { from: 'A1', to: 'H1' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  combinedSheet.autoFilter = { from: 'A1', to: 'I1' };
  combinedSheet.views = [{ state: 'frozen', ySplit: 1 }];

  const outPath = path.resolve(__dirname, '..', 'All_BOMs.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`Written: ${outPath} (${boms.length} sheets)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
