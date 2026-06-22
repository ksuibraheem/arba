const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const rawPath = path.join(__dirname, '..', 'pricing_files', 'hafr_albatin_raw.xlsx');
const wb = xlsx.readFile(rawPath);
const ws = wb.Sheets['الموقع 1'];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });

console.log('--- Site 1 First 15 Rows ---');
rows.slice(0, 15).forEach((r, idx) => {
    console.log(`Row ${idx}:`, r.map(c => c === undefined ? 'EMPTY' : c).join(' | '));
});
