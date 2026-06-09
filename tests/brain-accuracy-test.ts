/**
 * 🧪 ARBA V11.3 — Full Brain Test Suite
 * اختبار شامل للدماغ على جميع الفئات
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل market_prices_2026 للمقارنة
const marketPath = path.resolve(__dirname, '../training_data/trained/market_prices_2026.json');
const market = JSON.parse(fs.readFileSync(marketPath, 'utf8'));

// استيراد الدماغ
const analyzerPath = path.resolve(__dirname, '../services/itemCostAnalyzer.ts');

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║       🧪 ARBA Brain V11.3 — Full Accuracy Test Suite       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ═══════════════════════════════════════════
// بنود الاختبار — 50 بند متنوع يغطي كل الفئات
// ═══════════════════════════════════════════
const TEST_ITEMS = [
  // === إنشائي ===
  { desc: 'توريد وصب خرسانة مسلحة للأساسات رتبة C30 مع الشدة والتسليح', unit: 'م3', expected: { min: 800, max: 1500 }, cat: 'concrete' },
  { desc: 'خرسانة عادية نظافة رتبة C15 سمك 10سم', unit: 'م3', expected: { min: 200, max: 400 }, cat: 'concrete' },
  { desc: 'توريد وعمل بلوك خرساني مقاس 20سم للجدران', unit: 'م2', expected: { min: 50, max: 120 }, cat: 'blocks' },
  { desc: 'توريد وعمل حديد تسليح قطر 16مم', unit: 'طن', expected: { min: 3500, max: 5500 }, cat: 'steel' },
  { desc: 'أعمال شدات خشبية للأسقف والكمرات', unit: 'م2', expected: { min: 50, max: 130 }, cat: 'formwork' },
  { desc: 'أعمال حفر وردم بتربة نظيفة مع الدمك', unit: 'م3', expected: { min: 30, max: 80 }, cat: 'excavation' },
  
  // === لياسة ودهان ===
  { desc: 'توريد وعمل لياسة أسمنتية للجدران الداخلية', unit: 'م2', expected: { min: 25, max: 60 }, cat: 'plaster' },
  { desc: 'دهان الجدران الداخلية وجهين جوتن مع البطانة', unit: 'م2', expected: { min: 18, max: 50 }, cat: 'paint' },
  { desc: 'دهان خارجي جوتاشيلد مع المعجون والبطانة', unit: 'م2', expected: { min: 25, max: 60 }, cat: 'paint' },

  // === بلاط وأرضيات ===
  { desc: 'توريد وتركيب بلاط سيراميك أرضيات 60×60 محلي فرز أول', unit: 'م2', expected: { min: 60, max: 130 }, cat: 'tiles' },
  { desc: 'توريد وتركيب بورسلان أرضيات 80×80 إسباني', unit: 'م2', expected: { min: 200, max: 500 }, cat: 'tiles' },
  { desc: 'توريد وتركيب رخام أرضيات محلي', unit: 'م2', expected: { min: 180, max: 400 }, cat: 'stone' },
  { desc: 'أرضيات إيبوكسي صناعي ذاتي التسوية', unit: 'م2', expected: { min: 100, max: 220 }, cat: 'epoxy' },

  // === عزل ===
  { desc: 'عزل مائي للأسطح بيتومين على البارد وجهين', unit: 'م2', expected: { min: 20, max: 70 }, cat: 'waterproofing' },
  { desc: 'عزل حراري بولي ستايرين XPS سمك 5سم', unit: 'م2', expected: { min: 50, max: 120 }, cat: 'insulation' },

  // === أبواب ونوافذ ===
  { desc: 'باب خشب HDF مقولب مع الحلق والمفصلات', unit: 'عدد', expected: { min: 500, max: 1200 }, cat: 'doors' },
  { desc: 'شباك ألمنيوم ثيرمال بريك مع زجاج دبل', unit: 'م2', expected: { min: 800, max: 1800 }, cat: 'windows' },
  { desc: 'باب مقاوم للحريق مفرد فولاذ 90 دقيقة', unit: 'عدد', expected: { min: 2500, max: 6000 }, cat: 'fire_doors' },

  // === كهرباء ===
  { desc: 'كابل كهربائي نحاس XLPE مقاس 4×10مم', unit: 'م.ط', expected: { min: 18, max: 40 }, cat: 'cables' },
  { desc: 'لوحة توزيع كهربائية فرعية 24 خط شنايدر', unit: 'عدد', expected: { min: 500, max: 1500 }, cat: 'panels' },
  { desc: 'سبوت لايت LED داون لايت 15 واط', unit: 'عدد', expected: { min: 30, max: 80 }, cat: 'lighting' },
  { desc: 'نقطة إنارة شاملة الأنبوب والسلك والعلبة', unit: 'نقطة', expected: { min: 40, max: 100 }, cat: 'electrical' },

  // === سباكة ===
  { desc: 'مواسير PPR قطر 25مم للمياه الباردة والحارة', unit: 'م.ط', expected: { min: 10, max: 30 }, cat: 'plumbing' },
  { desc: 'كرسي حمام أرضي سيراميكا أمريكان ستاندرد', unit: 'عدد', expected: { min: 300, max: 800 }, cat: 'sanitary' },
  { desc: 'خزان مياه فايبرجلاس سعة 2000 لتر', unit: 'عدد', expected: { min: 800, max: 2000 }, cat: 'plumbing' },

  // === تكييف ===
  { desc: 'مكيف سبليت 2 طن انفرتر', unit: 'عدد', expected: { min: 2500, max: 5000 }, cat: 'hvac' },
  { desc: 'مجاري هواء صاج مجلفن مع العزل', unit: 'م2', expected: { min: 50, max: 120 }, cat: 'ductwork' },

  // === حريق ===
  { desc: 'رشاش حريق مخفي نوع كونسيلد', unit: 'عدد', expected: { min: 30, max: 80 }, cat: 'fire' },
  { desc: 'لوحة إنذار حريق ذكية addressable 4 مناطق', unit: 'عدد', expected: { min: 3000, max: 10000 }, cat: 'fire' },

  // === أنظمة ذكية ===
  { desc: 'كاميرا مراقبة IP 4 ميجابكسل هيك فيجن', unit: 'عدد', expected: { min: 200, max: 500 }, cat: 'cctv' },
  { desc: 'نظام تحكم وصول بالبصمة مع قفل مغناطيسي', unit: 'عدد', expected: { min: 800, max: 2500 }, cat: 'access' },

  // === معدات ===
  { desc: 'مصعد ركاب 8 أشخاص 6 محطات مع التركيب', unit: 'عدد', expected: { min: 100000, max: 180000 }, cat: 'elevator' },
  { desc: 'مولد كهرباء ديزل 250 كيلو فولت أمبير', unit: 'عدد', expected: { min: 200000, max: 300000 }, cat: 'generator' },

  // === أعمال خارجية ===
  { desc: 'أسفلت طبقة سطحية سمك 5سم', unit: 'م2', expected: { min: 30, max: 80 }, cat: 'asphalt' },
  { desc: 'بلاط متداخل إنترلوك ملون سمك 8سم', unit: 'م2', expected: { min: 60, max: 150 }, cat: 'interlock' },
  { desc: 'بردورة خرسانية جاهزة', unit: 'م.ط', expected: { min: 10, max: 25 }, cat: 'curb' },

  // === واجهات ===
  { desc: 'كلادينج ألمنيوم مركب ACP للواجهات', unit: 'م2', expected: { min: 100, max: 300 }, cat: 'cladding' },
  { desc: 'درابزين ستانلس ستيل للسلالم', unit: 'م.ط', expected: { min: 200, max: 900 }, cat: 'handrails' },
  
  // === أسقف مستعارة ===
  { desc: 'سقف مستعار جبس بورد مع الهيكل المعدني', unit: 'م2', expected: { min: 45, max: 130 }, cat: 'ceiling' },
  { desc: 'ساندويتش بانل سقف معدني 75مم', unit: 'م2', expected: { min: 100, max: 250 }, cat: 'roofing' },

  // === نجارة ===
  { desc: 'خزائن مطبخ MDF مع الأسطح والمفصلات', unit: 'م.ط', expected: { min: 500, max: 1000 }, cat: 'kitchen' },
];

// ═══════════════════════════════════════════
// تشغيل الاختبارات
// ═══════════════════════════════════════════

// Dynamic import for the analyzer
async function runTests() {
  // We need to use the analyzer
  const { itemCostAnalyzer } = await import('../services/itemCostAnalyzer.ts');

  let passed = 0, failed = 0, warnings = 0;
  const results: any[] = [];
  const failedItems: any[] = [];

  console.log('🔬 Testing ' + TEST_ITEMS.length + ' items across all categories...');
  console.log('─'.repeat(120));
  console.log(`  ${'#'.padStart(3)} ${'البند'.padEnd(45)} ${'الوحدة'.padEnd(8)} ${'السعر'.padStart(10)} ${'المتوقع'.padStart(15)} ${'الحالة'.padStart(8)} ${'الثقة'.padStart(6)}`);
  console.log('─'.repeat(120));

  for (let i = 0; i < TEST_ITEMS.length; i++) {
    const t = TEST_ITEMS[i];
    
    try {
      const result = itemCostAnalyzer.analyze(t.desc, t.unit);
      const price = result.sellingPrice;
      const inRange = price >= t.expected.min && price <= t.expected.max;
      const closeEnough = price >= t.expected.min * 0.5 && price <= t.expected.max * 2;
      
      let status = '';
      if (inRange) { status = '✅'; passed++; }
      else if (closeEnough) { status = '⚠️'; warnings++; }
      else { status = '❌'; failed++; }

      const expectedStr = `${t.expected.min}-${t.expected.max}`;
      const shortDesc = t.desc.substring(0, 42);
      console.log(`  ${String(i+1).padStart(3)} ${shortDesc.padEnd(45)} ${t.unit.padEnd(8)} ${price.toLocaleString().padStart(10)} ${expectedStr.padStart(15)} ${status.padStart(8)} ${String(Math.round(result.confidence * 100)).padStart(5)}%`);

      results.push({
        desc: t.desc,
        unit: t.unit,
        category: t.cat,
        brainPrice: price,
        expectedMin: t.expected.min,
        expectedMax: t.expected.max,
        inRange,
        closeEnough,
        confidence: result.confidence,
        materials: result.materials.length,
        labor: result.labor.length,
        sources: result.sources,
        warnings: result.warnings,
      });

      if (!inRange) {
        failedItems.push({
          desc: t.desc,
          unit: t.unit,
          cat: t.cat,
          brainPrice: price,
          expected: `${t.expected.min}-${t.expected.max}`,
          deviation: price < t.expected.min 
            ? `-${Math.round((1 - price/t.expected.min) * 100)}%` 
            : `+${Math.round((price/t.expected.max - 1) * 100)}%`,
          confidence: result.confidence,
        });
      }
    } catch (e: any) {
      console.log(`  ${String(i+1).padStart(3)} ${t.desc.substring(0,42).padEnd(45)} ${t.unit.padEnd(8)} ${'ERROR'.padStart(10)} ${''.padStart(15)} ${'💀'.padStart(8)}`);
      failed++;
      failedItems.push({
        desc: t.desc, unit: t.unit, cat: t.cat,
        brainPrice: 0, expected: `${t.expected.min}-${t.expected.max}`,
        deviation: 'ERROR', confidence: 0, error: e.message
      });
    }
  }

  // ═══════════════════════════════════════════
  // التقرير النهائي
  // ═══════════════════════════════════════════
  const total = TEST_ITEMS.length;
  const accuracy = Math.round(passed / total * 100);
  const acceptableRate = Math.round((passed + warnings) / total * 100);

  console.log('─'.repeat(120));
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              📊 Test Results — ARBA V11.3                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Passed (in range):     ${String(passed).padStart(3)} / ${total}  (${accuracy}%)${' '.repeat(19)}║`);
  console.log(`║  ⚠️ Close (within 2x):     ${String(warnings).padStart(3)} / ${total}${' '.repeat(30)}║`);
  console.log(`║  ❌ Failed (off range):    ${String(failed).padStart(3)} / ${total}${' '.repeat(30)}║`);
  console.log(`║  📈 Acceptable Rate:       ${String(acceptableRate).padStart(3)}%${' '.repeat(32)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  if (failedItems.length > 0) {
    console.log('');
    console.log('❌ البنود التي تحتاج تحسين:');
    console.log('─'.repeat(90));
    for (const f of failedItems) {
      console.log(`  [${f.cat}] ${f.desc.substring(0, 50)}`);
      console.log(`         السعر: ${f.brainPrice?.toLocaleString()} | المتوقع: ${f.expected} | الانحراف: ${f.deviation}`);
    }
  }

  // حفظ النتائج
  const testReport = {
    version: 'V11.3',
    testedAt: new Date().toISOString(),
    totalTests: total,
    passed, warnings, failed,
    accuracy: accuracy + '%',
    acceptableRate: acceptableRate + '%',
    results,
    failedItems,
  };

  const outPath = path.resolve(__dirname, '../training_data/trained/brain_test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(testReport, null, 2));
  console.log(`\n💾 النتائج محفوظة: brain_test_results.json`);
}

runTests().catch(e => { console.error('Fatal:', e); process.exit(1); });
