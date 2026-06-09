const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

console.log('=== ALL SHEETS ===');
console.log('Sheet names:', wb.SheetNames);
console.log('');

const allItems = [];

wb.SheetNames.forEach((sheetName, sheetIdx) => {
  const ws = wb.Sheets[sheetName];
  if (!ws['!ref']) {
    console.log(`Sheet "${sheetName}": EMPTY`);
    return;
  }
  
  const range = XLSX.utils.decode_range(ws['!ref']);
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  // Filter out empty rows
  const nonEmpty = data.filter(r => r.some(c => c !== ''));
  console.log(`\n=== Sheet "${sheetName}" === (${nonEmpty.length} non-empty rows, ${range.e.c + 1} cols)`);
  
  // Print first 8 rows to understand structure
  console.log('  Header rows:');
  nonEmpty.slice(0, 8).forEach((r, i) => {
    const vals = r.map((c, ci) => c !== '' ? `[${ci}]=${JSON.stringify(c).substring(0, 60)}` : null).filter(Boolean);
    if (vals.length > 0) console.log(`    R${i}: ${vals.join(' | ')}`);
  });
  
  // Try to extract BOQ items
  let currentSection = '';
  let itemCount = 0;
  
  for (let i = 0; i < nonEmpty.length; i++) {
    const row = nonEmpty[i];
    
    // Find section headers
    const filtered = row.filter(c => c !== '');
    if (filtered.length === 1 && typeof filtered[0] === 'string' && filtered[0].length > 3 && isNaN(Number(filtered[0]))) {
      currentSection = filtered[0].trim();
      continue;
    }
    
    // BOQ items: look for rows with number + description + unit + qty
    // Try different column layouts
    let no, desc, unit, qty, price;
    
    if (typeof row[0] === 'number' && typeof row[1] === 'string' && row[1].length > 10) {
      no = row[0]; desc = row[1]; unit = row[2]; qty = row[3]; price = row[4];
    } else if (typeof row[1] === 'number' && typeof row[2] === 'string' && row[2].length > 10) {
      no = row[1]; desc = row[2]; unit = row[3]; qty = row[4]; price = row[5];
    }
    
    if (desc) {
      itemCount++;
      allItems.push({
        sheet: sheetName,
        sheetIdx,
        no: no || itemCount,
        desc: desc.toString().trim().replace(/\r\n/g, ' ').substring(0, 200),
        unit: (unit || '').toString().trim(),
        qty: typeof qty === 'number' ? qty : parseFloat(qty) || 0,
        price: typeof price === 'number' ? price : parseFloat(price) || 0,
        section: currentSection,
      });
    }
  }
  
  console.log(`  → Extracted ${itemCount} BOQ items`);
});

console.log(`\n\n=== TOTAL: ${allItems.length} items across all sheets ===`);

// Print summary by section
const sections = {};
allItems.forEach(item => {
  const key = `${item.sheet} > ${item.section}`;
  if (!sections[key]) sections[key] = { count: 0, hasPrice: 0 };
  sections[key].count++;
  if (item.price > 0) sections[key].hasPrice++;
});

console.log('\n--- Sections Summary ---');
Object.entries(sections).forEach(([key, val]) => {
  console.log(`  ${key}: ${val.count} items (${val.hasPrice} priced)`);
});

// Print all items
console.log('\n\n--- ALL BOQ ITEMS ---');
allItems.forEach(item => {
  const priceStr = item.price > 0 ? `${item.price} ر.س` : '⚠️ NO PRICE';
  console.log(`[${item.sheet}][${item.no}] ${item.desc.substring(0, 80)} | ${item.unit} | qty=${item.qty} | ${priceStr}`);
});

// Save
const outputPath = path.join(__dirname, 'tender_boq_all.json');
fs.writeFileSync(outputPath, JSON.stringify({ totalItems: allItems.length, items: allItems }, null, 2));
console.log(`\nSaved to: ${outputPath}`);
