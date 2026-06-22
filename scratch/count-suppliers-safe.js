/**
 * Safe scratch script to count and analyze suppliers and their products without loading Firebase config
 */
import { FULL_ITEMS_DATABASE } from '../constants.ts';

console.log('═══════════════════════════════════════════');
console.log('🏭 ARBA Suppliers & Products Catalog Survey (Safe Mode)');
console.log('═══════════════════════════════════════════\n');

// 1. Definition of suppliers and their sample products count from supplierService.ts
const suppliers = [
  { id: 'supplier-steel', name: 'شركة الحديد المتحد', cat: 'حديد وصلب', sampleCount: 6, realCount: 50 },
  { id: 'supplier-cement', name: 'مصانع الإسمنت الخليجية', cat: 'إسمنت وخرسانة', sampleCount: 6, realCount: 60 },
  { id: 'supplier-electrical', name: 'المعدات الكهربائية المتقدمة', cat: 'كهربائيات', sampleCount: 6, realCount: 8000 },
  { id: 'supplier-plumbing', name: 'مؤسسة أنابيب الخليج', cat: 'سباكة ومواسير', sampleCount: 6, realCount: 2500 },
  { id: 'supplier-rental', name: 'شركة المعدات الثقيلة للتأجير', cat: 'تأجير معدات', sampleCount: 18, realCount: 150 },
  { id: 'sample-2', name: 'مؤسسة التوريد الذهبي', cat: 'توريدات عامة وتشطيب', sampleCount: 10, realCount: 12000 },
  { id: 'supplier-tools', name: 'مؤسسة العدد والأدوات المتخصصة', cat: 'أدوات وعدد', sampleCount: 8, realCount: 4000 }
];

// 2. Count mapped items from FULL_ITEMS_DATABASE
const categoryMapping = {
  'site': 'supplier-cement',
  'structure': 'supplier-cement',
  'architecture': 'sample-2',
  'mep_elec': 'supplier-electrical',
  'mep_plumb': 'supplier-plumbing',
  'mep_hvac': 'supplier-electrical',
  'insulation': 'sample-2',
  'safety': 'sample-2',
  'gov_fees': 'sample-2',
  'manpower': 'supplier-rental',
  'custom': 'sample-2'
};

const mappedCounts = {
  'supplier-steel': 0,
  'supplier-cement': 0,
  'supplier-electrical': 0,
  'supplier-plumbing': 0,
  'supplier-rental': 0,
  'sample-2': 0,
  'supplier-tools': 0
};

// Map each item in FULL_ITEMS_DATABASE to its supplier
for (const item of FULL_ITEMS_DATABASE) {
  // If the description matches steel/rebar, map to steel supplier
  const desc = (item.name?.ar || '').toLowerCase() + ' ' + (item.name?.en || '').toLowerCase();
  
  let targetSupplier = categoryMapping[item.category] || 'sample-2';
  
  if (desc.includes('حديد تسليح') || desc.includes('rebar') || desc.includes('حديد تسليح أساسات')) {
    targetSupplier = 'supplier-steel';
  }
  
  if (mappedCounts[targetSupplier] !== undefined) {
    mappedCounts[targetSupplier]++;
  } else {
    mappedCounts['sample-2']++; // fallback
  }
}

// 3. Print Survey Table
console.log(`Total Database Items (Core): ${FULL_ITEMS_DATABASE.length}`);
console.log(`Suppliers Registered: ${suppliers.length}`);
console.log('═'.repeat(125));

console.log(
  '| ' + 'Supplier Name (AR)'.padEnd(35) + 
  ' | ' + 'Category'.padEnd(22) + 
  ' | ' + 'Base Mapped'.padStart(12) + 
  ' | ' + 'Samples'.padStart(8) + 
  ' | ' + 'Total System'.padStart(14) + 
  ' | ' + 'Est. Real Catalog'.padStart(18) + 
  ' | ' + 'Est. Coverage %'.padStart(16) + ' |'
);
console.log('|' + '-'.repeat(37) + '|' + '-'.repeat(24) + '|' + '-'.repeat(14) + '|' + '-'.repeat(10) + '|' + '-'.repeat(16) + '|' + '-'.repeat(20) + '|' + '-'.repeat(18) + '|');

let totalSystemItems = 0;

for (const s of suppliers) {
  const mapped = mappedCounts[s.id];
  const total = mapped + s.sampleCount;
  totalSystemItems += total;
  
  const coverage = s.realCount > 0 
    ? ((total / s.realCount) * 100).toFixed(1) + '%'
    : 'N/A';

  console.log(
    '| ' + s.name.padEnd(35) + 
    ' | ' + s.cat.padEnd(22) + 
    ' | ' + mapped.toString().padStart(12) + 
    ' | ' + s.sampleCount.toString().padStart(8) + 
    ' | ' + total.toString().padStart(14) + 
    ' | ' + s.realCount.toString().padStart(18) + 
    ' | ' + coverage.padStart(16) + ' |'
  );
}

console.log('═'.repeat(125));
console.log(`Total System Items (Core Catalog + Samples): ${totalSystemItems} items`);
console.log('═'.repeat(125));
