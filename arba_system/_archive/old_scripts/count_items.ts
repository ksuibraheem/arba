import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';

const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

console.log('--- إحصائيات ملف الإكسل (Pricing Sheet 25.xlsx) ---');
let totalExcelItems = 0;

for (let si = 1; si <= 8; si++) {
  const sheetName = wb.SheetNames[si];
  if (!sheetName) continue;
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[];
  
  let sheetItems = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (typeof row[0] !== 'number') continue;
    if (typeof row[1] !== 'string' || row[1].trim().length < 10) continue;
    sheetItems++;
  }
  totalExcelItems += sheetItems;
  console.log(`- الشيت [${sheetName}]: ${sheetItems} بند`);
}

console.log(`\n=> إجمالي البنود الصالحة للتسعير في الإكسل: ${totalExcelItems} بند`);
