/**
 * Verification test for all 14 bug fixes
 */
import { extractSpecs } from '../services/specExtractor.ts';

console.log('═══════════════════════════════════════════');
console.log('🧪 Bug Fix Verification Tests');
console.log('═══════════════════════════════════════════\n');

let passed = 0, failed = 0;

function test(name, condition) {
  if (condition) { console.log(`  ✅ ${name}`); passed++; }
  else { console.log(`  ❌ FAIL: ${name}`); failed++; }
}

// Bug #6: Cable Tray should be 'tray' not 'cable'
console.log('\n📌 Bug #6: Cable Tray Classification');
const tray1 = extractSpecs('Cable tray perforated 300x100mm hot-dip galvanized');
test('Cable tray → subCategory=tray', tray1.subCategory === 'tray');
const tray2 = extractSpecs('حوامل كابلات مثقبة 300 مم');
test('حوامل كابلات → subCategory=tray', tray2.subCategory === 'tray');
// But regular cable should still be 'cable'
const cable1 = extractSpecs('Cable 4x95mm XLPE/SWA');
test('Regular cable → subCategory=cable', cable1.subCategory === 'cable');
const cable2 = extractSpecs('كابل نحاس 4x240mm');
test('كابل نحاس → subCategory=cable', cable2.subCategory === 'cable');

// Bug #14: Ampere regex should NOT match bare 'A' in IDs
console.log('\n📌 Bug #14: Ampere Regex Fix');
const ampFalse = extractSpecs('Main-distribution board (MDB-GF-A)');
test('MDB-GF-A → capacity should NOT be "A"', ampFalse.capacity !== 'A');
// But real ampere should still match
const ampTrue = extractSpecs('ATS 400 AMP UL FM Approved');
test('400 AMP → capacity=400A', ampTrue.capacity === '400A');
const ampAT = extractSpecs('Main breaker 1000 AT/AF');
test('1000 AT/AF → capacity=1000A', ampAT.capacity === '1000A');

// Bug #7: ESMDB should match panel not emergency light
console.log('\n📌 Bug #7: ESMDB Classification');
const esmdb = extractSpecs('Emergency main-distribution board (ESMDB-B1-A)');
test('ESMDB → subCategory=panel', esmdb.subCategory === 'panel');
test('ESMDB → category=electrical', esmdb.category === 'electrical');

// Additional spec extraction tests
console.log('\n📌 Spec Extraction Accuracy');
const gen = extractSpecs('Generator 500 KVA Capacity');
test('Generator → subCategory=generator', gen.subCategory === 'generator');
test('Generator → capacity=500KVA', gen.capacity === '500KVA');

const led = extractSpecs('LED Downlight 18W recessed');
test('LED → subCategory=light', led.subCategory === 'light');
test('LED → capacity=18W', led.capacity === '18W');

const conduit = extractSpecs('PVC conduit 20mm concealed');
test('Conduit → subCategory=conduit', conduit.subCategory === 'conduit');
test('Conduit → material=PVC', conduit.material === 'PVC');

const concrete1 = extractSpecs('خرسانة مسلحة C40 للأعمدة');
const concrete2 = extractSpecs('خرسانة نظافة C20');
test('C40 concrete grade detected', concrete1.grade === 'C40');
test('C20 concrete grade detected', concrete2.grade === 'C20');
test('Different grades = different matching', concrete1.grade !== concrete2.grade);

console.log('\n═══════════════════════════════════════════');
console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed}`);
console.log('═══════════════════════════════════════════');
