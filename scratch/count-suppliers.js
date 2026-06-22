/**
 * Scratch script to count and analyze suppliers and their products
 */
import { registrationService } from '../services/registrationService.ts';
import { supplierService } from '../services/supplierService.ts';

// Initialize data
registrationService.initializeSampleData();
supplierService.initializeSampleData();

const suppliers = supplierService.getSuppliers();
const products = supplierService.getProducts();

console.log('═══════════════════════════════════════════');
console.log('🏭 ARBA Suppliers & Products Catalog Survey');
console.log('═══════════════════════════════════════════\n');

console.log(`Total Active Registered Suppliers: ${suppliers.length}`);
console.log(`Total Products in Catalog: ${products.length} items`);
console.log('═'.repeat(110));

console.log(
  '| ' + 'Supplier Name (AR)'.padEnd(35) + 
  ' | ' + 'Category'.padEnd(18) + 
  ' | ' + 'Items Count'.padStart(12) + 
  ' | ' + 'Estimated Market Items'.padStart(22) + 
  ' | ' + 'Est. Coverage %'.padStart(16) + ' |'
);
console.log('|' + '-'.repeat(37) + '|' + '-'.repeat(20) + '|' + '-'.repeat(14) + '|' + '-'.repeat(24) + '|' + '-'.repeat(18) + '|');

// Enumerate and calculate stats
const supplierStats = {
  'supplier-steel': { name: 'شركة الحديد المتحد', cat: 'حديد وصلب', realCount: 50 },
  'supplier-cement': { name: 'مصانع الإسمنت الخليجية', cat: 'إسمنت وخرسانة', realCount: 40 },
  'supplier-electrical': { name: 'المعدات الكهربائية المتقدمة', cat: 'كهربائيات', realCount: 5000 },
  'supplier-plumbing': { name: 'مؤسسة أنابيب الخليج', cat: 'سباكة ومواسير', realCount: 1500 },
  'supplier-rental': { name: 'شركة المعدات الثقيلة للتأجير', cat: 'تأجير معدات', realCount: 120 },
  'sample-2': { name: 'مؤسسة التوريد الذهبي', cat: 'توريدات عامة وتشطيب', realCount: 8000 },
  'supplier-tools': { name: 'مؤسسة العدد والأدوات المتخصصة', cat: 'أدوات وعدد', realCount: 3000 }
};

for (const s of suppliers) {
  const sProducts = products.filter(p => p.supplierId === s.id);
  const info = supplierStats[s.id] || { name: s.companyName, cat: s.businessType || 'أخرى', realCount: 100 };
  
  const coverage = info.realCount > 0 
    ? ((sProducts.length / info.realCount) * 100).toFixed(1) + '%'
    : 'N/A';

  console.log(
    '| ' + info.name.padEnd(35) + 
    ' | ' + info.cat.padEnd(18) + 
    ' | ' + sProducts.length.toString().padStart(12) + 
    ' | ' + info.realCount.toString().padStart(22) + 
    ' | ' + coverage.padStart(16) + ' |'
  );
}

console.log('═'.repeat(110));

console.log('\n📝 Product Details Sample for "Advanced Electrical Equipment" (المعدات الكهربائية):');
products.filter(p => p.supplierId === 'supplier-electrical').forEach(p => {
  console.log(`   - ${p.name.ar} (${p.name.en}) | Price: ${p.price} SAR / ${p.unit} | Stock: ${p.stock}`);
});

console.log('\n📝 Product Details Sample for "United Steel" (الحديد المتحد):');
products.filter(p => p.supplierId === 'supplier-steel').forEach(p => {
  console.log(`   - ${p.name.ar} (${p.name.en}) | Price: ${p.price} SAR / ${p.unit} | Stock: ${p.stock}`);
});
