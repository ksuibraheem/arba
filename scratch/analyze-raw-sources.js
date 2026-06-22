import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');

console.log('--- Analyzing extracted_all_excel.json ---');
const excelPath = path.join(TRAINED_DIR, 'extracted_all_excel.json');
if (fs.existsSync(excelPath)) {
  const raw = fs.readFileSync(excelPath, 'utf8');
  const data = JSON.parse(raw);
  console.log(`Extracted At: ${data.extractedAt}`);
  if (data.sources) {
    for (const [sourceKey, source] of Object.entries(data.sources)) {
      console.log(`\nSource: ${sourceKey} (${source.source})`);
      if (source.sheets) {
        for (const [sheetName, sheet] of Object.entries(source.sheets)) {
          console.log(`  Sheet: "${sheetName}" | Raw rows counted: ${sheet.itemCount} | allItems length: ${sheet.allItems ? sheet.allItems.length : 0}`);
          if (sheet.allItems && sheet.allItems.length > 0) {
            console.log(`    Sample Row 0 cells:`, JSON.stringify(sheet.allItems[0].cells));
            if (sheet.allItems.length > 1) {
              console.log(`    Sample Row 1 cells:`, JSON.stringify(sheet.allItems[1].cells));
            }
          }
        }
      }
    }
  }
} else {
  console.log('extracted_all_excel.json not found');
}

console.log('\n--- Analyzing extracted_pdf_boqs.json ---');
const pdfPath = path.join(TRAINED_DIR, 'extracted_pdf_boqs.json');
if (fs.existsSync(pdfPath)) {
  const raw = fs.readFileSync(pdfPath, 'utf8');
  const data = JSON.parse(raw);
  console.log(`Type of PDF data: ${Array.isArray(data) ? 'Array' : typeof data}`);
  if (Array.isArray(data)) {
    console.log(`Array length: ${data.length}`);
    data.slice(0, 3).forEach((item, index) => {
      console.log(`  Item ${index}:`, JSON.stringify(item).substring(0, 200));
    });
  } else if (typeof data === 'object') {
    const keys = Object.keys(data);
    console.log(`Object keys:`, keys);
    keys.forEach(k => {
      const val = data[k];
      console.log(`  Key: ${k} | Type: ${Array.isArray(val) ? 'Array' : typeof val} | Length: ${Array.isArray(val) ? val.length : 'N/A'}`);
      if (Array.isArray(val) && val.length > 0) {
        console.log(`    Sample item:`, JSON.stringify(val[0]).substring(0, 200));
      }
    });
  }
} else {
  console.log('extracted_pdf_boqs.json not found');
}
