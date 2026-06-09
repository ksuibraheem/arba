const xlsx = require('xlsx');
const path = require('path');

const FILE = path.join(
    'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program',
    'التأسيس', 'الملحلة الثالثة', 'مزرعة خاصة',
    'RE Farm Phase 02 -Preliminary BOQ - Priced concrete.xlsx'
);

console.log('Reading:', FILE);
const wb = xlsx.readFile(FILE);
console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(s => {
    const rows = xlsx.utils.sheet_to_json(wb.Sheets[s], { header: 1 });
    console.log(`\n=== Sheet: "${s}" (${rows.length} rows) ===`);
    for (let i = 0; i < Math.min(10, rows.length); i++) {
        const row = rows[i];
        if (!row) continue;
        const preview = row.slice(0, 10).map((c, j) => `[${j}]=${c}`).join(' | ');
        console.log(`Row ${i}: ${preview}`);
    }
});
