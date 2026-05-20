import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';

const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

const ws = wb.Sheets['الادارات'];
if (ws) {
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[];
  let sheetItems = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (typeof row[0] !== 'number') continue;
    if (typeof row[1] !== 'string' || row[1].trim().length < 10) continue;
    sheetItems++;
    if (sheetItems <= 5) {
      console.log('Sample item:', row[1].substring(0, 50), '| Qty:', row[3]);
    }
  }
  console.log(`- الشيت [الادارات]: ${sheetItems} بند`);
} else {
  console.log('Sheet الادارات not found');
}
