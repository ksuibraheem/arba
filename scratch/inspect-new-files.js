import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FOLDER = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة';
const FILE_HAFR = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بحفر الباطن للتسعير.xlsx');
const FILE_RIYADH = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بالرياض للتسعير.xlsx');

function inspect(filePath) {
  console.log(`\n📄 Inspecting: ${path.basename(filePath)}`);
  if (!fs.existsSync(filePath)) {
    console.log('❌ File does not exist.');
    return;
  }
  
  const wb = XLSX.readFile(filePath);
  console.log(`Sheets: ${wb.SheetNames.join(', ')}`);
  
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const rowCount = range.e.r - range.s.r + 1;
    const colCount = range.e.c - range.s.c + 1;
    console.log(`  Sheet "${name}": Rows=${rowCount}, Cols=${colCount}`);
    
    // Convert first 5 rows to JSON
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(0, 8);
    console.log('  First few rows:');
    data.forEach((r, idx) => {
      console.log(`    Row ${idx}:`, JSON.stringify(r.slice(0, 10)));
    });
  }
}

inspect(FILE_HAFR);
inspect(FILE_RIYADH);
