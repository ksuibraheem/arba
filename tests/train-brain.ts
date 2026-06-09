/**
 * 🧠 ARBA V11.3 — Full Brain Training Runner
 * يشغّل تدريب الدماغ على كل بيانات mega_training v3.0
 * 32 مصدر | 13,005 بند | 17 نوع مشروع
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        🧠 ARBA Brain V11.3 — Full Training Pipeline        ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// ══════════════════════════════════════════════════
// 1. تحميل mega training v3.0
// ══════════════════════════════════════════════════
const megaPath = path.resolve(__dirname, '../training_data/trained/brain_mega_training.json');
console.log('📂 Step 1: Loading mega training v3.0...');

if (!fs.existsSync(megaPath)) {
  console.error('❌ لم يتم العثور على brain_mega_training.json');
  process.exit(1);
}

const megaRaw = fs.readFileSync(megaPath, 'utf-8');
const mega = JSON.parse(megaRaw);
const sizeKB = (Buffer.byteLength(megaRaw) / 1024).toFixed(0);

console.log(`  ✅ Version: ${mega.version}`);
console.log(`  ✅ Sources: ${mega.totalSources}`);
console.log(`  ✅ Items:   ${mega.totalItems?.toLocaleString()}`);
console.log(`  ✅ Size:    ${sizeKB} KB`);
console.log('');

// ══════════════════════════════════════════════════
// 2. تحليل وتصنيف كل البنود
// ══════════════════════════════════════════════════
console.log('🔍 Step 2: Analyzing all sources...');
console.log('─'.repeat(90));

interface CategoryStats {
  items: number;
  pricesFound: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  units: Set<string>;
  sources: Set<string>;
  totalValue: number;
}

const categories: Record<string, CategoryStats> = {};
const regionStats: Record<string, { items: number; sources: number; types: Set<string> }> = {};
const typeStats: Record<string, { items: number; sources: number }> = {};
let totalItems = 0;
let totalPriced = 0;
let totalUnpriced = 0;

// الكلمات المفتاحية للتصنيف
const CAT_KEYWORDS: Record<string, string[]> = {
  'concrete':     ['خرسان', 'concrete', 'نظافة', 'blinding', 'ready mix'],
  'steel_rebar':  ['حديد تسليح', 'rebar', 'steel', 'تسليح'],
  'formwork':     ['شدة', 'قوالب', 'formwork', 'shuttering'],
  'excavation':   ['حفر', 'excavat', 'حفريات'],
  'backfill':     ['ردم', 'backfill', 'تربة'],
  'blocks':       ['بلوك', 'block', 'طوب'],
  'plaster':      ['لياسة', 'plaster', 'مح ارة'],
  'tiles':        ['بلاط', 'سيراميك', 'بورسلان', 'tile', 'ceramic', 'porcelain'],
  'paint':        ['دهان', 'paint', 'طلاء'],
  'waterproofing':['عزل مائي', 'waterproof', 'بيتومين'],
  'insulation':   ['عزل حراري', 'thermal', 'insulation', 'فوم'],
  'doors':        ['باب', 'door', 'أبواب'],
  'windows':      ['شباك', 'نافذة', 'window', 'ألمنيوم', 'aluminum'],
  'electrical':   ['كهرب', 'elect', 'كابل', 'cable', 'مفتاح', 'switch', 'لوحة', 'panel'],
  'plumbing':     ['صحي', 'سباكة', 'plumb', 'مواسير', 'pipe', 'صرف'],
  'hvac':         ['تكييف', 'hvac', 'تبريد', 'cooling', 'مكيف', 'ac'],
  'fire_safety':  ['حريق', 'fire', 'إطفاء', 'كاشف', 'detector'],
  'elevator':     ['مصعد', 'elevator', 'lift'],
  'landscaping':  ['تنسيق', 'landscape', 'إنترلوك', 'interlock', 'زراعة'],
  'cleaning':     ['تنظيف', 'cleaning', 'نظافة عامة'],
  'demolition':   ['هدم', 'إزالة', 'demolit', 'فك'],
};

function categorizeItem(desc: string): string {
  const lower = desc.toLowerCase();
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) return cat;
    }
  }
  return 'general';
}

// معالجة كل المصادر
for (const [srcKey, src] of Object.entries(mega.sources) as [string, any][]) {
  const items = Array.isArray(src.items) ? src.items : [];
  const srcType = src.type || 'unknown';
  const srcRegion = src.location || 'saudi';

  // إحصائيات المنطقة
  if (!regionStats[srcRegion]) regionStats[srcRegion] = { items: 0, sources: 0, types: new Set() };
  regionStats[srcRegion].items += items.length;
  regionStats[srcRegion].sources++;
  regionStats[srcRegion].types.add(srcType);

  // إحصائيات النوع
  if (!typeStats[srcType]) typeStats[srcType] = { items: 0, sources: 0 };
  typeStats[srcType].items += items.length;
  typeStats[srcType].sources++;

  let srcPriced = 0;
  let srcUnpriced = 0;

  for (const item of items) {
    totalItems++;
    const desc = item.desc || item.description || item.spec || item.category || '';
    const price = item.unitPrice || item.originalPrice || item.boqPrice || item.avgPrice || item.rate || 0;
    const unit = item.unit || '';
    const qty = item.qty || 0;

    const cat = desc ? categorizeItem(desc) : 'uncategorized';

    if (!categories[cat]) {
      categories[cat] = {
        items: 0, pricesFound: 0, avgPrice: 0, minPrice: Infinity, maxPrice: 0,
        units: new Set(), sources: new Set(), totalValue: 0,
      };
    }

    categories[cat].items++;
    categories[cat].sources.add(srcKey);
    if (unit) categories[cat].units.add(unit);

    if (price > 0) {
      categories[cat].pricesFound++;
      categories[cat].minPrice = Math.min(categories[cat].minPrice, price);
      categories[cat].maxPrice = Math.max(categories[cat].maxPrice, price);
      categories[cat].totalValue += price * (qty || 1);
      totalPriced++;
      srcPriced++;
    } else {
      totalUnpriced++;
      srcUnpriced++;
    }
  }

  const pctPriced = items.length > 0 ? Math.round(srcPriced / items.length * 100) : 0;
  console.log(`  ${srcKey.padEnd(35)} ${String(items.length).padStart(6)} items  ${String(pctPriced).padStart(3)}% priced  [${srcType}]`);
}

// حساب المتوسطات
for (const cat of Object.values(categories)) {
  if (cat.pricesFound > 0) {
    cat.avgPrice = Math.round(cat.totalValue / cat.pricesFound);
  }
  if (cat.minPrice === Infinity) cat.minPrice = 0;
}

console.log('');

// ══════════════════════════════════════════════════
// 3. بناء الأسعار المرجعية (Benchmarks)
// ══════════════════════════════════════════════════
console.log('📊 Step 3: Building price benchmarks...');
console.log('─'.repeat(100));
console.log(`  ${'الفئة'.padEnd(20)} ${'البنود'.padStart(6)} ${'مسعّر'.padStart(6)} ${'الأدنى'.padStart(10)} ${'المتوسط'.padStart(10)} ${'الأعلى'.padStart(10)} ${'المصادر'.padStart(8)} ${'الوحدات'.padStart(15)}`);
console.log('─'.repeat(100));

const sortedCats = Object.entries(categories).sort((a, b) => b[1].items - a[1].items);

for (const [cat, info] of sortedCats) {
  const unitsStr = [...info.units].slice(0, 3).join(', ');
  console.log(`  ${cat.padEnd(20)} ${String(info.items).padStart(6)} ${String(info.pricesFound).padStart(6)} ${info.minPrice.toLocaleString().padStart(10)} ${info.avgPrice.toLocaleString().padStart(10)} ${info.maxPrice.toLocaleString().padStart(10)} ${String(info.sources.size).padStart(8)} ${unitsStr.padStart(15)}`);
}

console.log('─'.repeat(100));
console.log(`  ${'الإجمالي'.padEnd(20)} ${String(totalItems).padStart(6)} ${String(totalPriced).padStart(6)}`);
console.log('');

// ══════════════════════════════════════════════════
// 4. تقرير المناطق
// ══════════════════════════════════════════════════
console.log('🗺️  Step 4: Regional coverage...');
console.log('─'.repeat(60));
for (const [region, stats] of Object.entries(regionStats).sort((a, b) => b[1].items - a[1].items)) {
  console.log(`  ${region.padEnd(15)} ${String(stats.items).padStart(6)} items  ${String(stats.sources).padStart(3)} sources  [${[...stats.types].join(', ')}]`);
}
console.log('');

// ══════════════════════════════════════════════════
// 5. تقرير أنواع المشاريع
// ══════════════════════════════════════════════════
console.log('🏗️  Step 5: Project types coverage...');
console.log('─'.repeat(60));
for (const [type, stats] of Object.entries(typeStats).sort((a, b) => b[1].items - a[1].items)) {
  const bar = '█'.repeat(Math.min(Math.round(stats.items / 200), 30));
  console.log(`  ${type.padEnd(25)} ${String(stats.items).padStart(6)} items  ${bar}`);
}
console.log('');

// ══════════════════════════════════════════════════
// 6. حفظ نتائج التدريب
// ══════════════════════════════════════════════════
console.log('💾 Step 6: Saving training results...');

const trainingResult = {
  version: '3.0',
  trainedAt: new Date().toISOString(),
  brainVersion: 'V11.3',
  megaVersion: mega.version,
  stats: {
    totalSources: mega.totalSources,
    totalItems,
    totalPriced,
    totalUnpriced,
    pricedPercent: Math.round(totalPriced / totalItems * 100),
    categoriesCount: Object.keys(categories).length,
    regionsCount: Object.keys(regionStats).length,
    projectTypesCount: Object.keys(typeStats).length,
  },
  benchmarks: Object.fromEntries(
    sortedCats.map(([cat, info]) => [cat, {
      items: info.items,
      pricesFound: info.pricesFound,
      avgPrice: info.avgPrice,
      minPrice: info.minPrice,
      maxPrice: info.maxPrice,
      units: [...info.units],
      sourcesCount: info.sources.size,
      totalValue: Math.round(info.totalValue),
    }])
  ),
  regions: Object.fromEntries(
    Object.entries(regionStats).map(([r, s]) => [r, {
      items: s.items,
      sources: s.sources,
      types: [...s.types],
    }])
  ),
  projectTypes: typeStats,
};

const outPath = path.resolve(__dirname, '../training_data/trained/brain_training_results_v3.json');
fs.writeFileSync(outPath, JSON.stringify(trainingResult, null, 2));
console.log(`  ✅ Saved: brain_training_results_v3.json`);

// ══════════════════════════════════════════════════
// 7. التقرير النهائي
// ══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║              🧠 Training Complete — ARBA V11.3             ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║  Sources:        ${String(mega.totalSources).padStart(6)}                                   ║`);
console.log(`║  Total Items:    ${String(totalItems).padStart(6).toLocaleString()}                                   ║`);
console.log(`║  Priced Items:   ${String(totalPriced).padStart(6)} (${String(Math.round(totalPriced/totalItems*100)).padStart(2)}%)                              ║`);
console.log(`║  Categories:     ${String(Object.keys(categories).length).padStart(6)}                                   ║`);
console.log(`║  Regions:        ${String(Object.keys(regionStats).length).padStart(6)}                                   ║`);
console.log(`║  Project Types:  ${String(Object.keys(typeStats).length).padStart(6)}                                   ║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log('🧠 الدماغ مدرّب وجاهز للاستخدام!');
console.log('');
