const xlsx = require('xlsx');
const fs = require('fs');

const filePath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Sample-B.O.Q-.xls';
const workbook = xlsx.readFile(filePath);

const allItems = [];

for (const sheetName of workbook.SheetNames) {
  if (sheetName === 'Summary') continue;
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  let currentCategory = sheetName;
  
  for (const row of jsonData) {
    if (Array.isArray(row) && row.length >= 6) {
      const itemCode = row[0];
      const desc = String(row[1] || '').trim();
      const qty = parseFloat(row[2]);
      const unit = String(row[3] || '').trim();
      const rate = parseFloat(row[4]);
      const amount = parseFloat(row[5]);
      
      if (!isNaN(qty) && !isNaN(amount) && qty > 0) {
        allItems.push({
          sheet: sheetName,
          desc,
          qty,
          unit,
          rate,
          amount
        });
      }
    }
  }
}

fs.writeFileSync('extracted_boq.json', JSON.stringify(allItems, null, 2));
console.log(`Extracted ${allItems.length} valid items.`);
