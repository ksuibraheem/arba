const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

// Only process the main pricing sheet (first sheet with data)
const mainSheet = wb.SheetNames[0];
const ws = wb.Sheets[mainSheet];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Extract all BOQ items
const items = [];
let currentSection = '';

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const filtered = row.filter(c => c !== '');
  if (filtered.length === 0) continue;

  // Detect section headers (single text cell, no number)
  if (filtered.length === 1 && typeof filtered[0] === 'string' && isNaN(filtered[0])) {
    currentSection = filtered[0].trim();
    continue;
  }

  // BOQ item: [no, desc, unit, qty, price]
  if (typeof row[0] === 'number' && typeof row[1] === 'string' && row[1].length > 5) {
    items.push({
      no: row[0],
      desc: row[1].trim().substring(0, 120),
      unit: (row[2] || '').toString().trim(),
      qty: row[3] || 0,
      price: row[4] || 0,
      section: currentSection,
    });
  }
}

console.log(`Total items: ${items.length}`);
console.log(`Sections found:`);
const sections = [...new Set(items.map(i => i.section))];
sections.forEach(s => {
  const count = items.filter(i => i.section === s).length;
  console.log(`  ${s || '(none)'}: ${count} items`);
});

console.log('\n--- ALL ITEMS ---');
items.forEach(item => {
  console.log(`[${item.no}] ${item.section} | ${item.desc} | ${item.unit} | qty=${item.qty} | price=${item.price}`);
});

// Save as JSON for processing
const outputPath = path.join(__dirname, 'tender_boq_items.json');
fs.writeFileSync(outputPath, JSON.stringify({ totalItems: items.length, sections, items }, null, 2));
console.log(`\nSaved to: ${outputPath}`);
