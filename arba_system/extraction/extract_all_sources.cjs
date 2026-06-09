const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', '..', 'جداول لتسعير (نماذج)');
const OUT = path.join(__dirname, '..', 'data', 'training');

function extractExcel(filePath, label) {
  console.log(`\n📂 استخراج: ${label}`);
  try {
    const wb = xlsx.readFile(filePath);
    const result = { source: label, sheets: {}, summary: {} };
    let totalItems = 0;

    wb.SheetNames.forEach(name => {
      const data = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
      const items = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        // Try to find rows with numeric data (qty, price)
        const nums = row.filter(c => typeof c === 'number' && c > 0);
        const texts = row.filter(c => typeof c === 'string' && c.trim().length > 3);
        
        if (nums.length >= 1 && texts.length >= 1) {
          items.push({
            rowIndex: i,
            cells: row.map(c => typeof c === 'string' ? c.trim().substring(0, 100) : c)
          });
        }
      }
      
      if (items.length > 0) {
        result.sheets[name] = { itemCount: items.length, sample: items.slice(0, 5), allItems: items };
        totalItems += items.length;
      }
    });

    result.summary = { totalSheets: wb.SheetNames.length, sheetsWithData: Object.keys(result.sheets).length, totalItems };
    console.log(`  ✅ ${totalItems} بند من ${wb.SheetNames.length} ورقة`);
    return result;
  } catch (e) {
    console.log(`  ❌ خطأ: ${e.message}`);
    return null;
  }
}

// 1. R.E Farm Consolidated MEP
const farm1 = extractExcel(
  path.join(BASE, 'R.E Farm-Consolidated MEP BOQ -Priced (1).xlsx'),
  'RE_Farm_Consolidated_MEP'
);

// 2. RE Farm Phase 02
const farm2 = extractExcel(
  path.join(BASE, 'RE Farm Phase 02 -Preliminary BOQ - Priced (1).xlsx'),
  'RE_Farm_Phase02'
);

// 3. جدول الكميات والمواصفات
const qsTable = extractExcel(
  path.join(BASE, 'sfكامل جدول الكميات والمواصفات رثص (1).xls'),
  'QS_Full_Table'
);

// Save all extracted data
const allData = { extractedAt: new Date().toISOString(), sources: {} };
if (farm1) allData.sources.farm_consolidated = farm1;
if (farm2) allData.sources.farm_phase02 = farm2;
if (qsTable) allData.sources.qs_full_table = qsTable;

fs.writeFileSync(path.join(OUT, 'extracted_all_excel.json'), JSON.stringify(allData, null, 2), 'utf8');
console.log(`\n✅ تم حفظ البيانات في extracted_all_excel.json`);
console.log(`📊 الملخص:`);
Object.entries(allData.sources).forEach(([k, v]) => {
  console.log(`  ${k}: ${v.summary.totalItems} بند`);
});
