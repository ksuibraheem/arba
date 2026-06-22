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

const headers = rawRows[headerIdx] as string[];
const descCol = headers.indexOf('وصف البند');

console.log("Row 23 FULL:", rawRows[22][descCol]);
console.log("Row 24 FULL:", rawRows[23][descCol]);
console.log("Row 42 FULL:", rawRows[41][descCol]);
console.log("Row 44 FULL:", rawRows[43][descCol]);
