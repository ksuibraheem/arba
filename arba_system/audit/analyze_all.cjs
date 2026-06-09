const xlsx = require('xlsx');
const filePath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Sample-B.O.Q-.xls';
const workbook = xlsx.readFile(filePath);

let totalCost = 0;
let totalConcrete = 0;

for (const sheetName of workbook.SheetNames) {
  if (sheetName === 'Summary') continue;
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  for (const row of jsonData) {
    if (Array.isArray(row) && row.length >= 6) {
      const desc = String(row[1] || '').toLowerCase();
      const qty = parseFloat(row[2]);
      const unit = String(row[3] || '');
      const rate = parseFloat(row[4]);
      const amount = parseFloat(row[5]);
      
      if (!isNaN(qty) && !isNaN(amount) && qty > 0) {
        totalCost += amount;
        if (unit.toLowerCase().includes('m3') && (desc.includes('concrete') || sheetName.includes('Concrete'))) {
          totalConcrete += qty;
        }
      }
    }
  }
}

console.log(`Estimated Total BOQ Cost: ${totalCost.toLocaleString()} SR`);
console.log(`Total Concrete Volume: ${totalConcrete} m3`);
