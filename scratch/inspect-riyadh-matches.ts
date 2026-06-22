import { matchTextToItemId } from '../services/semanticNormalizer';
import { FULL_ITEMS_DATABASE } from '../constants';
import XLSX from 'xlsx';
import path from 'path';

const FOLDER = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة';
const FILE_RIYADH = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بالرياض للتسعير.xlsx');

const wb = XLSX.readFile(FILE_RIYADH);
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });

let headerIdx = -1;
for (let i = 0; i < Math.min(30, rawRows.length); i++) {
  const row = rawRows[i];
  if (row && row.includes('وصف البند')) {
    headerIdx = i;
    break;
  }
}

if (headerIdx === -1) {
  console.log("No header found!");
  process.exit(1);
}

const headers = rawRows[headerIdx] as string[];
const descCol = headers.indexOf('وصف البند');
const unitCol = headers.indexOf('وحدة القياس');
const qtyCol = headers.indexOf('الكمية');

console.log(`\n--- Riyadh Project Match Inspection ---`);

for (let r = headerIdx + 1; r < rawRows.length; r++) {
  const row = rawRows[r] as any[];
  if (!row || !row[descCol]) continue;
  
  const desc = String(row[descCol]).trim();
  if (desc.length < 5) continue;
  
  const matchedId = matchTextToItemId(desc);
  const dbItem = FULL_ITEMS_DATABASE.find(item => item.id === matchedId);
  
  console.log(`Row ${r + 1}: "${desc.substring(0, 60)}..."`);
  console.log(`  Matched: ID ${matchedId} | Name: ${dbItem ? dbItem.name.ar : 'NONE'}`);
}
