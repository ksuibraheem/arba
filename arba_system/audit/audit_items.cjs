const fs = require('fs');
const itemsDir = 'c:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\items';
const files = fs.readdirSync(itemsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'suppliers.ts');

let grandTotal = 0;
const report = [];

files.forEach(f => {
  const content = fs.readFileSync(itemsDir + '\\' + f, 'utf8');
  
  // Count items by counting 'id:' patterns
  const idMatches = content.match(/id:\s*["'][^"']+["']/g) || [];
  const count = idMatches.length;
  grandTotal += count;

  // Check for missing Arabic names
  const hasAr = (content.match(/ar:\s*["']/g) || []).length;
  
  // Check for zero prices
  const zeroPrices = (content.match(/baseMaterial:\s*0\s*,/g) || []).length;
  
  // Check for missing units
  const units = (content.match(/unit:\s*["'][^"']+["']/g) || []).length;

  // Check categories used
  const categories = [...new Set((content.match(/category:\s*["']([^"']+)["']/g) || []).map(m => m.match(/["']([^"']+)["']/)[1]))];

  report.push({
    file: f,
    items: count,
    hasArabic: hasAr,
    zeroPrices,
    units,
    categories: categories.join(', ')
  });

  console.log(`${f.padEnd(25)} | ${String(count).padStart(3)} items | Categories: ${categories.join(', ')}${zeroPrices > 0 ? ` | ⚠️ ${zeroPrices} zero-price` : ''}`);
});

console.log('\n========================================');
console.log(`TOTAL ITEMS IN PROGRAM: ${grandTotal}`);
console.log('========================================');

// Check for duplicate IDs
const allContent = files.map(f => fs.readFileSync(itemsDir + '\\' + f, 'utf8')).join('\n');
const allIds = (allContent.match(/id:\s*["']([^"']+)["']/g) || []).map(m => m.match(/["']([^"']+)["']/)[1]);
const seen = {};
const dupes = [];
allIds.forEach(id => {
  if (seen[id]) dupes.push(id);
  seen[id] = true;
});
if (dupes.length > 0) {
  console.log(`\n⚠️ DUPLICATE IDs FOUND: ${dupes.length}`);
  dupes.forEach(d => console.log(`  - ${d}`));
} else {
  console.log(`\n✅ No duplicate IDs found`);
}
