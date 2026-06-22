const fs = require('fs');
const content = fs.readFileSync('constants/mepDatabase.ts', 'utf8');

// Count items
const ids = content.match(/id:\s*['"][^'"]+['"]/g) || [];
console.log('Total items:', ids.length);

// Check for duplicate IDs
const idVals = ids.map(s => s.replace(/id:\s*['"]/, '').replace(/['"]$/, ''));
const dupes = idVals.filter((id, i) => idVals.indexOf(id) !== i);
if (dupes.length > 0) console.log('DUPLICATE IDs:', [...new Set(dupes)]);
else console.log('No duplicate IDs OK');

// Check categories
const cats = [...new Set((content.match(/category:\s*['"][^'"]+['"]/g) || []).map(s => s.replace(/category:\s*['"]/, '').replace(/['"]$/, '')))];
console.log('Categories:', cats.join(', '));

// Check units
const units = [...new Set((content.match(/unit:\s*['"][^'"]+['"]/g) || []).map(s => s.replace(/unit:\s*['"]/, '').replace(/['"]$/, '')))];
console.log('Units:', units.join(', '));

// High prices
const mats = (content.match(/baseMaterial:\s*\d+/g) || []).map(s => parseInt(s.replace('baseMaterial:', '')));
console.log('Price range: ' + Math.min(...mats) + ' - ' + Math.max(...mats));
const highP = mats.filter(p => p > 200000);
if (highP.length) console.log('WARNING: ' + highP.length + ' items > 200K SAR:', highP);

// Zero prices
const zeros = mats.filter(p => p === 0);
if (zeros.length) console.log('WARNING: ' + zeros.length + ' items with baseMaterial=0');

// Check for type errors
const labors = (content.match(/baseLabor:\s*\d+/g) || []).map(s => parseInt(s.replace('baseLabor:', '')));
console.log('Labor range: ' + Math.min(...labors) + ' - ' + Math.max(...labors));
