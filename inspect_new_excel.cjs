const xlsx = require('xlsx');

const filePath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\item priced للتسعير.xlsx';
const workbook = xlsx.readFile(filePath);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Total Rows: ${jsonData.length}`);
console.log('First 20 rows:');
for (let i = 0; i < 20 && i < jsonData.length; i++) {
  console.log(JSON.stringify(jsonData[i]));
}
