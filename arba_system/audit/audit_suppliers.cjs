const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'items');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'suppliers.ts' && f !== 'index.ts');

const supplierMap = {
  'SUPPLIERS_CONCRETE': ['structure','site','external_works'],
  'SUPPLIERS_STEEL': ['structure','external_works'],
  'SUPPLIERS_ELECTRICAL': ['mep_elec'],
  'SUPPLIERS_SWITCHES': ['mep_elec'],
  'SUPPLIERS_PLUMBING': ['mep_plumb'],
  'SUPPLIERS_SANITARY': ['mep_plumb'],
  'SUPPLIERS_TILES': ['architecture'],
  'SUPPLIERS_PAINT': ['architecture'],
  'SUPPLIERS_INSULATION': ['insulation','architecture'],
  'SUPPLIERS_FACADES': ['architecture','structure'],
  'SUPPLIERS_HVAC': ['mep_hvac'],
  'SUPPLIERS_ELEVATORS': ['mep_elec'],
  'SUPPLIERS_FIRE_SAFETY': ['safety'],
  'SUPPLIERS_BLOCKS': ['structure','architecture'],
  'SUPPLIERS_DOORS': ['architecture'],
  'SUPPLIERS_HEAVY_EQUIPMENT': ['site','structure','architecture'],
  'SUPPLIERS_TANKS': ['mep_plumb','structure'],
  'SUPPLIERS_KITCHENS': ['architecture'],
  'SUPPLIERS_SOLAR': ['mep_elec'],
  'SUPPLIERS_SMART_SECURITY': ['mep_elec'],
  'SUPPLIERS_LANDSCAPING': ['external_works','architecture'],
  'SUPPLIERS_SWIMMING_POOLS': ['architecture','external_works'],
  'SUPPLIERS_FURNITURE': ['furniture','architecture'],
  'SUPPLIERS_MEDICAL_EQUIPMENT': ['architecture','mep_elec'],
  'SUPPLIERS_COMMERCIAL_KITCHEN': ['architecture','mep_plumb'],
  'SUPPLIERS_SPORTS_SURFACES': ['architecture','external_works'],
  'SUPPLIERS_GENERATORS': ['mep_elec'],
  'SUPPLIERS_BMS_ELV': ['mep_elec'],
  'SUPPLIERS_NETWORKING': ['mep_elec'],
  'SUPPLIERS_MEDICAL_GAS': ['mep_plumb'],
  'SUPPLIERS_FUEL_SYSTEMS': ['structure','mep_plumb','safety','site'],
  'SUPPLIERS_CAR_WASH': ['architecture','mep_elec'],
  'SUPPLIERS_EV_CHARGING': ['mep_elec'],
  'SUPPLIERS_SAFETY_SIGNS': ['safety'],
  'SUPPLIERS_MANPOWER': ['*']
};

let supplierIssues = [];
let zeroPrice = [];
let lowPrice = [];
let totalItems = 0;

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  // Split into individual item lines
  const lines = content.split('\n');
  lines.forEach(line => {
    const idMatch = line.match(/id:\s*"([^"]+)"/);
    const catMatch = line.match(/category:\s*"([^"]+)"/);
    const supMatch = line.match(/suppliers:\s*(SUPPLIERS_\w+)/);
    const matMatch = line.match(/baseMaterial:\s*(\d+)/);
    const labMatch = line.match(/baseLabor:\s*(\d+)/);
    const nameMatch = line.match(/ar:\s*"([^"]+)"/);
    
    if (idMatch && catMatch && supMatch && matMatch && labMatch) {
      totalItems++;
      const id = idMatch[1];
      const cat = catMatch[1];
      const sup = supMatch[1];
      const mat = parseInt(matMatch[1]);
      const lab = parseInt(labMatch[1]);
      const nameAr = nameMatch ? nameMatch[1] : '?';
      
      // Check supplier mismatch
      const validCats = supplierMap[sup];
      if (validCats && validCats[0] !== '*' && !validCats.includes(cat)) {
        supplierIssues.push({file: f, id, nameAr, cat, sup, expected: validCats.join('|')});
      }
      
      // Check zero material AND zero labor
      if (mat === 0 && lab === 0) {
        zeroPrice.push({file: f, id, nameAr, cat});
      }
      // Check zero material only (labor-only items like GS01.04 are OK)
      if (mat === 0 && lab > 0) {
        // This is fine for labor-only items
      }
    }
  });
});

console.log('Total items scanned: ' + totalItems + '\n');

console.log('==== SUPPLIER MISMATCHES (' + supplierIssues.length + ') ====');
supplierIssues.forEach(i => {
  console.log('  ' + i.file + ' | ' + i.id + ' | ' + i.nameAr);
  console.log('    category="' + i.cat + '" uses ' + i.sup + ' | valid for: ' + i.expected);
});

console.log('\n==== ZERO-PRICE ITEMS (' + zeroPrice.length + ') ====');
zeroPrice.forEach(z => {
  console.log('  ' + z.file + ' | ' + z.id + ' | ' + z.nameAr + ' | cat=' + z.cat);
});
