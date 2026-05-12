const xlsx = require('xlsx');

const filePath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Sample-B.O.Q-.xls';
console.log(`Reading Excel file: ${filePath}`);

const workbook = xlsx.readFile(filePath);
console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}`);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Total Rows: ${jsonData.length}`);
console.log('First 30 rows:');
for (let i = 0; i < 30 && i < jsonData.length; i++) {
  console.log(JSON.stringify(jsonData[i]));
}
