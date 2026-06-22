/**
 * Scratch script to extract and show catalog items matched with SBC, specifications, and suppliers
 */
import { FULL_ITEMS_DATABASE } from '../constants.ts';

console.log('═══════════════════════════════════════════');
console.log('📊 ARBA Brain - SBC & Supplier Mapping Audit');
console.log('═══════════════════════════════════════════\n');

console.log(`Total Database Items: ${FULL_ITEMS_DATABASE.length} items`);

const categories = {};

// Group items by category
for (const item of FULL_ITEMS_DATABASE) {
  const cat = item.category || 'other';
  if (!categories[cat]) categories[cat] = [];
  categories[cat].push(item);
}

console.log('\n📁 Category Breakdown:');
for (const [cat, items] of Object.entries(categories)) {
  console.log(`   - ${cat.padEnd(20)}: ${items.length} items`);
}

// Print samples for important categories
const targetCategories = ['gov_fees', 'site', 'structure', 'insulation', 'mep_elec', 'mep_plumb', 'mep_hvac', 'fire_protection', 'hvac_central'];

console.log('\n📋 Detailed SBC & Supplier Mapping Samples:');
console.log('═'.repeat(100));

for (const cat of targetCategories) {
  const items = categories[cat] || [];
  if (items.length === 0) continue;

  console.log(`\n📁 Category: ${cat.toUpperCase()} (${items.length} items total)`);
  console.log('─'.repeat(100));
  
  // Take first 3-4 items as a sample
  const sample = items.slice(0, 4);
  for (const item of sample) {
    const sbc = item.sbc || 'N/A';
    const suppliers = item.suppliers && item.suppliers.length > 0 
      ? item.suppliers.map(s => s.name?.ar || s.name?.en || s.id).join(', ') 
      : 'N/A';
    const baseCost = (item.baseMaterial || 0) + (item.baseLabor || 0);
    
    console.log(`   🔹 ID: ${item.id.padEnd(8)} | SBC: ${sbc.padEnd(14)} | Price: ${baseCost.toString().padStart(6)} SAR | Unit: ${item.unit.padEnd(6)}`);
    console.log(`       Name (AR): ${item.name?.ar}`);
    console.log(`       Name (EN): ${item.name?.en || 'N/A'}`);
    console.log(`       Suppliers: ${suppliers}`);
    console.log('  ' + '-'.repeat(90));
  }
}
