/**
 * ARBA Brain — Automated Pricing Tests (طبقة 4)
 * اختبارات تلقائية للتحقق من صحة محرك التسعير
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

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
import { companyFinancialEngine, PRESET_PROFILES } from '../services/companyFinancialEngine';

let passed = 0, failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`   ✅ ${testName}`);
    passed++;
  } else {
    console.log(`   ❌ ${testName}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 بدء الاختبارات التلقائية لمحرك التسعير ARBA\n');

  // ═══════════════════════════════════════════
  // مجموعة 1: اختبارات analyze() الأساسية
  // ═══════════════════════════════════════════
  console.log('📦 مجموعة 1: دالة analyze() الأساسية');

  const concrete = itemCostAnalyzer.analyze('توريد وصب خرسانة مسلحة للأعمدة', 'م3', 0.15, 'riyadh');
  assert(concrete.totalCost > 0, 'خرسانة مسلحة: التكلفة > 0', `التكلفة = ${concrete.totalCost}`);
  assert(concrete.sellingPrice > concrete.totalCost, 'سعر البيع > التكلفة');
  assert(concrete.materials.length > 0, 'يحتوي على مواد');
  assert(concrete.labor.length > 0, 'يحتوي على عمالة');
  assert(!isNaN(concrete.totalCost), 'لا يوجد NaN في التكلفة');
  assert(!isNaN(concrete.sellingPrice), 'لا يوجد NaN في سعر البيع');

  const paint = itemCostAnalyzer.analyze('دهان جدران بلاستيك وجهين على المعجون', 'م2', 0.15, 'riyadh');
  assert(paint.totalCost > 10 && paint.totalCost < 200, 'دهان: السعر ضمن النطاق المعقول', `التكلفة = ${paint.totalCost}`);

  const tile = itemCostAnalyzer.analyze('توريد وتركيب بلاط بورسلان للممرات والفصول', 'م2', 0.15, 'riyadh');
  assert(tile.totalCost > 30 && tile.totalCost < 400, 'بورسلان: السعر ضمن النطاق', `التكلفة = ${tile.totalCost}`);

  const block = itemCostAnalyzer.analyze('توريد وتركيب بلوك خرساني 20سم', 'م2', 0.15, 'riyadh');
  assert(block.totalCost > 20 && block.totalCost < 250, 'بلوك: السعر ضمن النطاق', `التكلفة = ${block.totalCost}`);

  // ═══════════════════════════════════════════
  // مجموعة 2: اختبارات NaN Safety
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 2: حماية من NaN');

  const empty = itemCostAnalyzer.analyze('بند غير معروف تماماً ليس له وصفة', 'عدد', 0.15, 'riyadh');
  assert(!isNaN(empty.totalCost), 'بند بدون وصفة: لا NaN');
  assert(empty.totalCost > 0, 'بند بدون وصفة: تقدير > 0');
  assert(empty.confidence < 60, 'بند بدون وصفة: الثقة منخفضة', `الثقة = ${empty.confidence}%`);

  const edgeCases = [
    { desc: '', unit: '' },
    { desc: 'أ', unit: 'م2' },
    { desc: 'توريد وتركيب', unit: '' },
  ];
  for (const ec of edgeCases) {
    const r = itemCostAnalyzer.analyze(ec.desc, ec.unit, 0.15, 'riyadh');
    assert(!isNaN(r.totalCost) && !isNaN(r.sellingPrice), `حافة: "${ec.desc.substring(0,20)}" لا NaN`);
  }

  // ═══════════════════════════════════════════
  // مجموعة 3: اختبارات workScope (ترميم/جديد/مختلط)
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 3: تصنيف نوع العمل');

  const reno = itemCostAnalyzer.analyze('فك وإزالة بلاط قديم ومعالجة الأسطح', 'م2', 0.15, 'riyadh');
  assert(reno.workScope === 'renovation', 'فك وإزالة = ترميم', `نوع = ${reno.workScope}`);
  assert(reno.demolitionCost > 0, 'ترميم: تكلفة فك > 0');

  const newWork = itemCostAnalyzer.analyze('توريد وتركيب سيراميك أرضيات', 'م2', 0.15, 'riyadh');
  assert(newWork.workScope === 'new', 'توريد وتركيب = جديد', `نوع = ${newWork.workScope}`);

  // ═══════════════════════════════════════════
  // مجموعة 4: اختبارات priceGuard
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 4: حارس السعر (Price Guard)');

  const normalItem = itemCostAnalyzer.analyze('توريد وتركيب بلوك 20سم', 'م2', 0.15, 'riyadh');
  const normalGuard = itemCostAnalyzer.priceGuard(normalItem, 100);
  assert(normalGuard.passed, 'بلوك عادي: الحارس يمرر');

  const fakeExpensive: any = { ...normalItem, sellingPrice: 5000, unit: 'م2', materials: normalItem.materials, labor: normalItem.labor };
  const expensiveGuard = itemCostAnalyzer.priceGuard(fakeExpensive, 1);
  assert(!expensiveGuard.passed, 'سعر مبالغ 5000/م2: الحارس يرفض');
  assert(expensiveGuard.issues.length > 0, 'يوجد أسباب للرفض');

  const fakeZero: any = { ...normalItem, sellingPrice: 0, unit: 'م2', materials: [], labor: [] };
  const zeroGuard = itemCostAnalyzer.priceGuard(fakeZero, 1);
  assert(!zeroGuard.passed, 'سعر صفري: الحارس يرفض');

  // ═══════════════════════════════════════════
  // مجموعة 5: اختبارات التعلم الذاتي
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 5: التعلم الذاتي (Price History)');

  itemCostAnalyzer.recordPrice('خرسانة', 'م3', 1000);
  itemCostAnalyzer.recordPrice('خرسانة', 'م3', 1050);
  itemCostAnalyzer.recordPrice('خرسانة', 'م3', 1100);
  const comparison = itemCostAnalyzer.compareWithHistory('خرسانة', 'م3', 1050);
  assert(comparison !== null, 'مقارنة التاريخ تعمل');
  assert(comparison!.isNormal, 'سعر 1050 ضمن النطاق الطبيعي');
  assert(comparison!.avg > 0, `المتوسط التاريخي = ${comparison!.avg}`);

  const outlier = itemCostAnalyzer.compareWithHistory('خرسانة', 'م3', 3000);
  assert(outlier !== null && !outlier.isNormal, 'سعر 3000 خارج النطاق (شاذ)');

  const historyExport = itemCostAnalyzer.exportHistory();
  assert(Object.keys(historyExport).length > 0, 'تصدير التاريخ يعمل');

  // ═══════════════════════════════════════════
  // مجموعة 6: اختبارات scheduleCompression
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 6: ضغط الجدول الزمني');

  const withoutCompression = itemCostAnalyzer.analyze('توريد وصب خرسانة مسلحة', 'م3', 0.15, 'riyadh');
  const withCompression = itemCostAnalyzer.analyze('توريد وصب خرسانة مسلحة', 'م3', 0.15, 'riyadh', { normalMonths: 18, targetMonths: 9 });
  assert(withCompression.totalCost > withoutCompression.totalCost, 'ضغط 50%: التكلفة ترتفع', `بدون=${withoutCompression.totalCost} مع=${withCompression.totalCost}`);
  assert(withCompression.directCost > withoutCompression.directCost, 'التكلفة المباشرة ترتفع');

  const noCompression = itemCostAnalyzer.analyze('توريد وصب خرسانة مسلحة', 'م3', 0.15, 'riyadh', { normalMonths: 12, targetMonths: 12 });
  assert(noCompression.totalCost === withoutCompression.totalCost, 'بدون ضغط (12=12): التكلفة متساوية');

  // ═══════════════════════════════════════════
  // مجموعة 7: اختبارات CompanyFinancialEngine
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 7: المحرك المالي للشركات');

  const saudiProfile = companyFinancialEngine.createFromPreset('saudi_startup', 'شركة تجريبية');
  assert(saudiProfile.nationality === 'saudi', 'قالب سعودي: الجنسية صحيحة');

  const foreignProfile = companyFinancialEngine.createFromPreset('foreign_medium', 'Foreign Co');
  assert(foreignProfile.nationality === 'foreign', 'قالب أجنبي: الجنسية صحيحة');

  const saudiFactors = companyFinancialEngine.calculateFactors(saudiProfile, 1_000_000, 9, 0.15);
  const foreignFactors = companyFinancialEngine.calculateFactors(foreignProfile, 1_000_000, 9, 0.15);

  assert(saudiFactors.effectiveProfitMargin === 0.15, 'سعودي: هامش ربح 15%');
  assert(foreignFactors.effectiveProfitMargin > 0.15, 'أجنبي: هامش ربح > 15% (CIT)', `هامش = ${(foreignFactors.effectiveProfitMargin * 100).toFixed(2)}%`);
  assert(Math.abs(foreignFactors.effectiveProfitMargin - 0.1875) < 0.001, 'أجنبي: هامش = 18.75%');

  assert(foreignFactors.totalAdditionalPercent > saudiFactors.totalAdditionalPercent, 'أجنبي: إضافات أعلى من السعودي');
  assert(foreignFactors.breakdown.length > saudiFactors.breakdown.length, 'أجنبي: بنود مالية أكثر');

  const mixedProfile = companyFinancialEngine.createFromPreset('mixed_company', 'Mixed Co');
  const mixedFactors = companyFinancialEngine.calculateFactors(mixedProfile, 1_000_000, 9, 0.15);
  assert(mixedFactors.effectiveProfitMargin > 0.15 && mixedFactors.effectiveProfitMargin < 0.1875, 'مختلطة: هامش بين 15% و 18.75%', `هامش = ${(mixedFactors.effectiveProfitMargin * 100).toFixed(2)}%`);

  // ═══════════════════════════════════════════
  // مجموعة 8: اختبارات Cloud AI Fallback
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 8: Cloud AI Fallback');

  const aiResult = await itemCostAnalyzer.consultCloudAI('توريد وصب خرسانة مسلحة للأعمدة', 'م3', 1050);
  assert(aiResult.source !== 'none', 'Local fallback يعمل عند غياب API');
  assert(aiResult.confidence > 0, `الثقة > 0 (${aiResult.confidence}%)`);
  assert(aiResult.reasoning.length > 0, 'يوجد تفسير');

  // ═══════════════════════════════════════════
  // مجموعة 9: ابتلاع بيانات التدريب التاريخية
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 9: ابتلاع بيانات التدريب');

  const training = itemCostAnalyzer.ingestTrainingData();
  assert(training.ingested > 0, `تم ابتلاع ${training.ingested} نقطة بيانات`);
  assert(training.categories > 0, `${training.categories} فئة تدريبية`);

  // ═══════════════════════════════════════════
  // مجموعة 10: إثراء الوصفات بالمعدلات الهندسية
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 10: المعدلات الهندسية (materialRates)');

  const c35 = itemCostAnalyzer.enrichConcreteRecipe('C35');
  assert(c35.materials.length === 4, 'C35: 4 مكونات (أسمنت + رمل + حصى + ماء)');
  assert(c35.totalPerM3 > 100, `C35: تكلفة م3 = ${c35.totalPerM3} ريال`);

  const c20 = itemCostAnalyzer.enrichConcreteRecipe('C20');
  assert(c20.totalPerM3 < c35.totalPerM3, 'C20 أرخص من C35');

  const invalid = itemCostAnalyzer.enrichConcreteRecipe('C99');
  assert(invalid.materials.length === 0, 'رتبة غير موجودة: لا نتائج');

  // ═══════════════════════════════════════════
  // مجموعة 11: إنتاجية العمالة (laborProductivity)
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 11: إنتاجية العمالة');

  const blockLabor = itemCostAnalyzer.getLaborFromProductivity('blockwork_20', 100);
  assert(blockLabor !== null, 'بلوك 20: نشاط موجود');
  assert(blockLabor!.days > 0, `بلوك 100م2: ${blockLabor!.days} يوم`);
  assert(blockLabor!.cost > 0, `تكلفة العمالة: ${blockLabor!.cost} ريال`);
  assert(blockLabor!.crewDescription.length > 0, `الطاقم: ${blockLabor!.crewDescription}`);

  const paintLabor = itemCostAnalyzer.getLaborFromProductivity('painting_interior', 200);
  assert(paintLabor !== null, 'دهان داخلي: نشاط موجود');
  assert(paintLabor!.costPerUnit > 0, `تكلفة/م2: ${paintLabor!.costPerUnit} ريال`);

  const summerLabor = itemCostAnalyzer.getLaborFromProductivity('blockwork_20', 100, 'summer_hot');
  assert(summerLabor !== null && summerLabor!.days > blockLabor!.days, 'صيف حار: أيام أكثر بسبب انخفاض الإنتاجية');

  const invalidLabor = itemCostAnalyzer.getLaborFromProductivity('nonexistent_activity');
  assert(invalidLabor === null, 'نشاط غير موجود: null');

  // ═══════════════════════════════════════════
  // مجموعة 12: إحصائيات الربط الهندسي
  // ═══════════════════════════════════════════
  console.log('\n📦 مجموعة 12: إحصائيات الربط');

  const engStats = itemCostAnalyzer.getEngineeringStats();
  assert(engStats.totalRecipes > 50, `وصفات: ${engStats.totalRecipes}`);
  assert(engStats.totalMarketPrices >= 70, `أسعار سوق: ${engStats.totalMarketPrices}`);
  assert(engStats.totalLaborActivities >= 30, `أنشطة عمالة: ${engStats.totalLaborActivities}`);
  assert(engStats.connectedRates.concrete >= 6, `رتب خرسانة: ${engStats.connectedRates.concrete}`);
  assert(engStats.connectedRates.labor >= 30, `أنشطة عمالة مربوطة: ${engStats.connectedRates.labor}`);

  // ═══════════════════════════════════════════
  // النتيجة النهائية
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log(`🧪 النتيجة: ${passed} نجح ✅ | ${failed} فشل ❌ | الإجمالي: ${passed + failed}`);
  if (failed === 0) {
    console.log('🎉 جميع الاختبارات نجحت! المحرك سليم 100%');
  } else {
    console.log(`⚠️ ${failed} اختبار فشل — يحتاج مراجعة`);
  }
  console.log('═'.repeat(50));

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
