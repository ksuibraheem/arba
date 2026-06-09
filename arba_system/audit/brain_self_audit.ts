/**
 * ARBA Brain — تحليل شامل وتحقق من صحة البيانات 🧠🔍
 * يفحص كل مصدر بيانات مربوط ويكشف: تناقضات، أسعار شاذة، فجوات، تكرارات
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import * as fs from 'fs';
import * as path from 'path';

const store: any = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

import { firestoreDataService } from '../services/firestoreDataService';
firestoreDataService.batchWrite = async () => ({ success: true, data: 0 });
firestoreDataService.getCollection = async () => [];

import { itemCostAnalyzer } from '../services/itemCostAnalyzer';
import { MATERIAL_PRICES, LABOR_DAILY_RATES } from '../data/marketPricesToday';
import {
  CONCRETE_MIX_RATES, MORTAR_RATES, TILE_RATES, PAINT_RATES,
  INSULATION_RATES, WATERPROOFING_RATES, ENHANCED_WASTE_FACTORS,
} from '../data/materialRates';
import { LABOR_ACTIVITIES, WEATHER_FACTORS, COMPLEXITY_FACTORS } from '../data/laborProductivity';

let totalIssues = 0;
let totalWarnings = 0;
let totalChecks = 0;

function check(passed: boolean, msg: string, severity: 'error' | 'warn' | 'info' = 'error') {
  totalChecks++;
  if (passed) {
    // silent pass
  } else if (severity === 'error') {
    console.log(`   ❌ ${msg}`);
    totalIssues++;
  } else {
    console.log(`   ⚠️ ${msg}`);
    totalWarnings++;
  }
}

async function deepAnalysis() {
  console.log('═'.repeat(60));
  console.log('🧠 ARBA Brain — تحليل شامل وتحقق من صحة البيانات');
  console.log('═'.repeat(60));

  // ═══════════════════════════════════════════
  // 1. فحص أسعار السوق (marketPricesToday)
  // ═══════════════════════════════════════════
  console.log('\n📊 1. فحص أسعار السوق (70 مادة)...');
  const priceIssues: string[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const mat of MATERIAL_PRICES) {
    // تكرار ID
    check(!seenIds.has(mat.id), `مادة مكررة الكود: ${mat.id}`, 'error');
    seenIds.add(mat.id);

    // اسم مكرر
    if (seenNames.has(mat.nameAr)) {
      check(false, `اسم مكرر: "${mat.nameAr}" (${mat.id})`, 'warn');
    }
    seenNames.add(mat.nameAr);

    // سعر صفري أو سالب
    check(mat.price > 0, `سعر صفري/سالب: ${mat.nameAr} = ${mat.price}`, 'error');

    // سعر مرتفع جداً (>100,000)
    check(mat.price < 100000, `سعر مرتفع جداً: ${mat.nameAr} = ${mat.price}`, 'warn');

    // وحدة فارغة
    check(mat.unit && mat.unit.length > 0, `وحدة فارغة: ${mat.nameAr}`, 'error');
  }
  console.log(`   ✅ تم فحص ${MATERIAL_PRICES.length} مادة`);

  // ═══════════════════════════════════════════
  // 2. فحص أسعار العمالة
  // ═══════════════════════════════════════════
  console.log('\n👷 2. فحص أسعار العمالة...');
  for (const [trade, rateObj] of Object.entries(LABOR_DAILY_RATES)) {
    const rate = (rateObj as any).daily;
    check(rate > 0, `سعر عمالة صفري: ${trade}`, 'error');
    check(rate >= 80 && rate <= 500, `سعر عمالة غير طبيعي: ${trade} = ${rate} ريال/يوم`, 'warn');
  }
  console.log(`   ✅ تم فحص ${Object.keys(LABOR_DAILY_RATES).length} حرفة`);

  // ═══════════════════════════════════════════
  // 3. فحص معدلات الخرسانة (SBC 304)
  // ═══════════════════════════════════════════
  console.log('\n🏗️ 3. فحص معدلات خلط الخرسانة...');
  const grades = Object.keys(CONCRETE_MIX_RATES);
  for (const grade of grades) {
    const mix = CONCRETE_MIX_RATES[grade];
    check(mix.cement_kg_per_m3 > 0, `${grade}: أسمنت = 0`, 'error');
    check(mix.sand_m3_per_m3 > 0 && mix.sand_m3_per_m3 < 1, `${grade}: رمل غير منطقي = ${mix.sand_m3_per_m3}`, 'error');
    check(mix.gravel_m3_per_m3 > 0 && mix.gravel_m3_per_m3 < 1, `${grade}: حصى غير منطقي = ${mix.gravel_m3_per_m3}`, 'error');
    check(mix.wcRatio > 0.3 && mix.wcRatio < 0.8, `${grade}: w/c ratio غير طبيعي = ${mix.wcRatio}`, 'error');

    // التحقق من التدرج — C35 لازم أسمنت أكثر من C20
    if (grade !== 'C15') {
      const prevGrade = grades[grades.indexOf(grade) - 1];
      if (prevGrade) {
        const prev = CONCRETE_MIX_RATES[prevGrade];
        check(mix.cement_kg_per_m3 >= prev.cement_kg_per_m3, `${grade}: أسمنت (${mix.cement_kg_per_m3}) أقل من ${prevGrade} (${prev.cement_kg_per_m3})!`, 'error');
      }
    }

    // اختبار enrichConcreteRecipe
    const enriched = itemCostAnalyzer.enrichConcreteRecipe(grade);
    check(enriched.totalPerM3 > 50, `${grade}: تكلفة مُثرية = ${enriched.totalPerM3} (منخفضة جداً)`, 'warn');
    check(enriched.totalPerM3 < 1000, `${grade}: تكلفة مُثرية = ${enriched.totalPerM3} (مرتفعة جداً)`, 'warn');
  }
  console.log(`   ✅ تم فحص ${grades.length} رتبة خرسانة`);

  // ═══════════════════════════════════════════
  // 4. فحص أنشطة العمالة (laborProductivity)
  // ═══════════════════════════════════════════
  console.log('\n🔧 4. فحص أنشطة العمالة (إنتاجية)...');
  const actIds = new Set<string>();
  for (const act of LABOR_ACTIVITIES) {
    check(!actIds.has(act.id), `نشاط مكرر: ${act.id}`, 'error');
    actIds.add(act.id);

    check(act.outputPerDay > 0, `${act.id}: إنتاجية = 0`, 'error');
    check(act.dailyCrewCost > 0, `${act.id}: تكلفة طاقم = 0`, 'error');
    check(act.crewSize > 0, `${act.id}: حجم طاقم = 0`, 'error');
    check(act.laborCostPerUnit > 0, `${act.id}: تكلفة/وحدة = 0`, 'error');

    // التحقق أن laborCostPerUnit = dailyCrewCost / outputPerDay
    const expected = Math.round((act.dailyCrewCost / act.outputPerDay) * 100) / 100;
    check(Math.abs(act.laborCostPerUnit - expected) < 0.1,
      `${act.id}: تكلفة/وحدة (${act.laborCostPerUnit}) ≠ محسوبة (${expected})`, 'error');

    // فحص اتصال getLaborFromProductivity
    const result = itemCostAnalyzer.getLaborFromProductivity(act.id, 10);
    check(result !== null, `${act.id}: getLaborFromProductivity فشل`, 'error');
    if (result) {
      check(result.days > 0, `${act.id}: أيام = 0`, 'error');
      check(result.cost > 0, `${act.id}: تكلفة = 0`, 'error');
    }
  }
  console.log(`   ✅ تم فحص ${LABOR_ACTIVITIES.length} نشاط عمالة`);

  // ═══════════════════════════════════════════
  // 5. فحص الوصفات (ITEM_RECIPES)
  // ═══════════════════════════════════════════
  console.log('\n📦 5. فحص وصفات الدماغ...');
  const stats = itemCostAnalyzer.getEngineeringStats();
  const recipePrices: { name: string; cost: number; selling: number; category: string }[] = [];

  // نحلل عينة ضخمة من البنود
  const testItems = [
    'خرسانة مسلحة', 'خرسانة عادية', 'بلوك 20', 'لياسة', 'دهان بلاستيك',
    'سيراميك', 'بورسلان', 'رخام', 'شبابيك الومنيوم', 'وحدة إنارة led',
    'مخرج قوى', 'مفتاح إنارة', 'حفر', 'ردم', 'عزل مائي', 'عزل حراري',
    'مظلة', 'باب خشب', 'باب حديد', 'تكييف', 'لوحة توزيع',
    'مرحاض افرنجي', 'مرحاض شرقي', 'طفاية حريق', 'مغسلة', 'مواسير',
    'انترلوك', 'درابزين', 'فينيل', 'صندوق اطفاء', 'مكبر صوت',
    'wifi', 'كبينة توزيع', 'سنترال', 'مضخة', 'خزانات المياه',
    'فك وازالة', 'معالجة', 'تدعيم الاعمدة', 'غرف تفتيش',
    'إنارة الطوارئ', 'حماية من الصواعق', 'مثلث تأريض',
    'هدف', 'عشب صناعي', 'اسفلت', 'سبورة', 'براد مياه',
    'جرجور', 'hdpe', 'مواسير ppr', 'upvc', 'مخرج بيانات',
  ];

  let zeroCost = 0;
  let nanCost = 0;
  let extremeHigh = 0;
  let noMaterials = 0;

  for (const item of testItems) {
    const r = itemCostAnalyzer.analyze(`توريد وتركيب ${item}`, 'م2', 0.15, 'riyadh');

    check(!isNaN(r.totalCost), `NaN في "${item}"`, 'error');
    check(!isNaN(r.sellingPrice), `NaN في سعر بيع "${item}"`, 'error');

    if (isNaN(r.totalCost)) { nanCost++; continue; }
    if (r.totalCost === 0) zeroCost++;
    if (r.sellingPrice > 50000) extremeHigh++;
    if (r.materials.length === 0) noMaterials++;

    check(r.sellingPrice >= r.totalCost, `"${item}": سعر بيع (${r.sellingPrice}) < تكلفة (${r.totalCost})!`, 'error');
    check(r.totalCost > 0, `"${item}": تكلفة = 0`, 'warn');

    recipePrices.push({ name: item, cost: r.totalCost, selling: r.sellingPrice, category: r.category });
  }

  // كشف التكرار في الوصفات
  const duplicateCheck = new Map<string, string[]>();
  for (const rp of recipePrices) {
    const key = `${rp.category}-${Math.round(rp.cost / 10) * 10}`;
    if (!duplicateCheck.has(key)) duplicateCheck.set(key, []);
    duplicateCheck.get(key)!.push(rp.name);
  }
  const possibleDups = [...duplicateCheck.values()].filter(v => v.length > 1 && v.length < 5);
  for (const dup of possibleDups) {
    check(false, `وصفات متشابهة (نفس الفئة وقريبة السعر): [${dup.join(', ')}]`, 'warn');
  }

  console.log(`   ✅ تم فحص ${testItems.length} بند`);
  console.log(`   📊 NaN: ${nanCost} | صفري: ${zeroCost} | مرتفع جداً: ${extremeHigh} | بدون مواد: ${noMaterials}`);

  // ═══════════════════════════════════════════
  // 6. فحص بيانات التدريب التاريخية
  // ═══════════════════════════════════════════
  console.log('\n📚 6. فحص بيانات التدريب...');
  const trainingPath = path.join(process.cwd(), 'data', 'training', 'brain_mega_training.json');
  if (fs.existsSync(trainingPath)) {
    const raw = JSON.parse(fs.readFileSync(trainingPath, 'utf8'));
    check(raw.version, 'ملف التدريب: يوجد إصدار', 'error');
    check(raw.totalItems > 0, `ملف التدريب: ${raw.totalItems} بند`, 'error');

    let negPrices = 0;
    let zeroPrices = 0;
    let totalItems = 0;
    if (raw.sources) {
      for (const [name, src] of Object.entries(raw.sources) as [string, any][]) {
        if (!src.items || !Array.isArray(src.items)) continue;
        for (const item of src.items) {
          totalItems++;
          if (item.avgPrice < 0) negPrices++;
          if (item.avgPrice === 0 && item.minPrice === 0) zeroPrices++;
          if (item.minPrice > item.maxPrice && item.maxPrice > 0) {
            check(false, `${name}: min (${item.minPrice}) > max (${item.maxPrice}) في ${item.category}`, 'error');
          }
        }
      }
    }
    console.log(`   ✅ ${totalItems} بند تدريبي | سالب: ${negPrices} | صفري: ${zeroPrices}`);

    // ابتلاع + تحقق
    const ingestion = itemCostAnalyzer.ingestTrainingData();
    check(ingestion.ingested > 0, `ابتلاع التدريب: ${ingestion.ingested} نقطة`, 'error');
  } else {
    check(false, 'ملف التدريب غير موجود!', 'error');
  }

  // ═══════════════════════════════════════════
  // 7. فحص التوافق بين المصادر
  // ═══════════════════════════════════════════
  console.log('\n🔗 7. فحص التوافق بين المصادر...');

  // هل معدلات الهدر تغطي الوصفات؟
  const wasteCategories = Object.keys(ENHANCED_WASTE_FACTORS);
  const recipeCategories = new Set(recipePrices.map(r => r.category));
  const mappedWaste: Record<string, string> = {
    'إنشائي': 'concrete', 'مباني': 'blocks', 'تشطيبات': 'ceramic_tiles',
    'عزل': 'waterproofing', 'أرضيات': 'ceramic_tiles',
  };
  for (const [rc, wc] of Object.entries(mappedWaste)) {
    check(wasteCategories.includes(wc), `فئة "${rc}" مربوطة بهدر "${wc}"`, 'error');
  }

  // هل معاملات الطقس والتعقيد سليمة؟
  for (const [key, factor] of Object.entries(WEATHER_FACTORS)) {
    check(factor.factor > 0 && factor.factor <= 1.2, `طقس "${key}": معامل ${factor.factor} غير طبيعي`, 'error');
  }
  for (const [key, factor] of Object.entries(COMPLEXITY_FACTORS)) {
    check(factor.factor > 0 && factor.factor <= 1.2, `تعقيد "${key}": معامل ${factor.factor} غير طبيعي`, 'error');
  }

  // ═══════════════════════════════════════════
  // 8. اختبار حارس السعر على كل الوصفات
  // ═══════════════════════════════════════════
  console.log('\n🛡️ 8. اختبار حارس السعر على كل البنود...');
  let guardPassed = 0;
  let guardFailed = 0;
  const guardFailDetails: string[] = [];

  for (const item of testItems) {
    const r = itemCostAnalyzer.analyze(`توريد وتركيب ${item}`, 'م2', 0.15, 'riyadh');
    const guard = itemCostAnalyzer.priceGuard(r, 10);
    if (guard.passed) {
      guardPassed++;
    } else {
      guardFailed++;
      guardFailDetails.push(`${item}: ${guard.issues[0]}`);
    }
  }
  console.log(`   ✅ مرر: ${guardPassed} | ⚠️ رفض: ${guardFailed}`);
  if (guardFailDetails.length > 0 && guardFailDetails.length <= 10) {
    for (const d of guardFailDetails) console.log(`      🔸 ${d}`);
  }

  // ═══════════════════════════════════════════
  // 9. فحص تناسق الأسعار (Cross-validation)
  // ═══════════════════════════════════════════
  console.log('\n📈 9. فحص تناسق الأسعار...');

  // خرسانة مسلحة لازم أغلى من خرسانة عادية
  const concreteR = recipePrices.find(r => r.name === 'خرسانة مسلحة');
  const plainC = recipePrices.find(r => r.name === 'خرسانة عادية');
  if (concreteR && plainC) {
    check(concreteR.cost > plainC.cost, `خرسانة مسلحة (${concreteR.cost}) لازم > عادية (${plainC.cost})`, 'error');
  }

  // رخام لازم أغلى من سيراميك
  const marble = recipePrices.find(r => r.name === 'رخام');
  const ceramic = recipePrices.find(r => r.name === 'سيراميك');
  if (marble && ceramic) {
    check(marble.cost > ceramic.cost, `رخام (${marble.cost}) لازم > سيراميك (${ceramic.cost})`, 'error');
  }

  // باب حديد لازم أغلى من باب خشب
  const ironDoor = recipePrices.find(r => r.name === 'باب حديد');
  const woodDoor = recipePrices.find(r => r.name === 'باب خشب');
  if (ironDoor && woodDoor) {
    check(ironDoor.cost > woodDoor.cost, `باب حديد (${ironDoor.cost}) لازم > خشب (${woodDoor.cost})`, 'error');
  }

  // تكييف لازم أغلى من مروحة
  const ac = recipePrices.find(r => r.name === 'تكييف');
  if (ac) {
    check(ac.cost > 500, `تكييف (${ac.cost}) منخفض جداً`, 'warn');
  }

  // مضخة لازم أغلى من خلاط
  const pump = recipePrices.find(r => r.name === 'مضخة');
  if (pump) {
    check(pump.cost > 1000, `مضخة (${pump.cost}) منخفضة جداً`, 'warn');
  }

  // سنترال لازم أغلى من هاتف
  const central = recipePrices.find(r => r.name === 'سنترال');
  if (central) {
    check(central.cost > 2000, `سنترال (${central.cost}) منخفض جداً`, 'warn');
  }

  // حفر لازم أرخص من بلوك (لكل م2)
  const exc = recipePrices.find(r => r.name === 'حفر');
  const block = recipePrices.find(r => r.name === 'بلوك 20');
  if (exc && block) {
    check(exc.cost < block.cost, `حفر (${exc.cost}) لازم < بلوك (${block.cost})`, 'warn');
  }

  console.log('   ✅ تم فحص العلاقات المنطقية بين الأسعار');

  // ═══════════════════════════════════════════
  // 10. ملخص نهائي
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🧠 التقرير النهائي — تحليل صحة البيانات');
  console.log('═'.repeat(60));
  console.log(`   🔍 إجمالي الفحوصات: ${totalChecks}`);
  console.log(`   ✅ نجح: ${totalChecks - totalIssues - totalWarnings}`);
  console.log(`   ❌ أخطاء: ${totalIssues}`);
  console.log(`   ⚠️ تحذيرات: ${totalWarnings}`);
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   📊 أسعار سوق: ${MATERIAL_PRICES.length}`);
  console.log(`   📦 وصفات: ${stats.totalRecipes}`);
  console.log(`   👷 أنشطة عمالة: ${stats.totalLaborActivities}`);
  console.log(`   🏗️ رتب خرسانة: ${stats.connectedRates.concrete}`);
  console.log(`   🛡️ حارس السعر: مرر ${guardPassed}/${testItems.length}`);
  console.log('════════════════════════════════════════════════════════════');

  if (totalIssues === 0) {
    console.log('🎉 البيانات سليمة 100%! لا توجد أخطاء.');
  } else {
    console.log(`⚠️ يوجد ${totalIssues} خطأ يحتاج مراجعة.`);
  }
  console.log('═'.repeat(60));

  process.exit(totalIssues > 0 ? 1 : 0);
}

deepAnalysis().catch(e => { console.error(e); process.exit(1); });
