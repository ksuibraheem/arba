const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
console.log('Reading:', filePath);

const wb = XLSX.readFile(filePath);
console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  console.log(`\n=== ${name} === (rows: ${range.e.r + 1}, cols: ${range.e.c + 1})`);
  
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Print all rows (up to 200)
  data.slice(0, 200).forEach((r, i) => {
    const row = r.filter(c => c !== '');
    if (row.length > 0) {
      console.log(`  R${i}: ${JSON.stringify(row).substring(0, 250)}`);
    }
  });
});
