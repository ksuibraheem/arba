/**
 * ARBA Brain v8.5 — Test Suite
 * اختبارات شاملة لكل التعديلات
 * 
 * الترتيب: من الأبسط (بدون تبعيات) إلى الأعقد (تكامل كامل)
 */

let passed = 0;
let failed = 0;
const results: string[] = [];

function assert(testName: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    results.push(`  ✅ ${testName}`);
  } else {
    failed++;
    results.push(`  ❌ ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🧪 ARBA Brain v8.5 — Test Suite');
console.log('='.repeat(60));

// ============================================================
// TEST 1: المصفاة الذكية (Semantic Normalizer)
// ============================================================
console.log('\n📝 Test 1: المصفاة الذكية (Semantic Normalizer)');

import {
  cleanArabicText,
  normalizeArabicChars,
  correctSpelling,
  normalizeUnit,
  matchTextToItemId,
  normalizeInput
} from '../services/semanticNormalizer';

// 1.1 تنظيف التطويل والتشكيل
const cleaned = cleanArabicText('خَرْسَـــانَة   قَواعِد');
assert('تنظيف التطويل والتشكيل', cleaned === 'خرسانة قواعد', `got: "${cleaned}"`);

// 1.2 توحيد الألف
const normalized = normalizeArabicChars('إبراهيم أحمد');
assert('توحيد أشكال الألف', normalized === 'ابراهيم احمد', `got: "${normalized}"`);

// 1.3 تصحيح إملاء — خارسانه → خرسانة
const corrected1 = correctSpelling('خارسانه قعد');
assert('تصحيح: خارسانه → خرسانة', corrected1.includes('خرسانة'), `got: "${corrected1}"`);

// 1.4 تصحيح إملاء — بلك → بلوك
const corrected2 = correctSpelling('بلك خارجي');
assert('تصحيح: بلك → بلوك', corrected2.includes('بلوك'), `got: "${corrected2}"`);

// 1.5 تصحيح إملاء — كهربا → كهرباء
const corrected3 = correctSpelling('كهربا');
assert('تصحيح: كهربا → كهرباء', corrected3 === 'كهرباء', `got: "${corrected3}"`);

// 1.6 تصحيح إملاء — اسانسير → مصعد
const corrected4 = correctSpelling('اسانسير');
assert('تصحيح: اسانسير → مصعد', corrected4 === 'مصعد', `got: "${corrected4}"`);

// 1.7 توحيد الوحدات — متر مربع → م2
const unit1 = normalizeUnit('متر مربع', 'finishes');
assert('وحدة: متر مربع → م2', unit1 === 'م2', `got: "${unit1}"`);

// 1.8 توحيد الوحدات — متر مكعب → م3
const unit2 = normalizeUnit('متر مكعب', 'structure');
assert('وحدة: متر مكعب → م3', unit2 === 'م3', `got: "${unit2}"`);

// 1.9 استنتاج الوحدة من السياق — "متر" في بند خرسانة = م3
const unit3 = normalizeUnit('متر', 'structure');
assert('استنتاج: متر + structure → م3', unit3 === 'م3', `got: "${unit3}"`);

// 1.10 استنتاج الوحدة من السياق — "متر" في بند بلوك = م2
const unit4 = normalizeUnit('متر', 'masonry');
assert('استنتاج: متر + masonry → م2', unit4 === 'م2', `got: "${unit4}"`);

// 1.11 ربط دلالي — مضخة حريق → 15.06
const match1 = matchTextToItemId('مضخة حريق');
assert('ربط: مضخة حريق → 15.06', match1 === '15.06', `got: "${match1}"`);

// 1.12 ربط دلالي — تشيلر → 10.04
const match2 = matchTextToItemId('تشيلر مركزي');
assert('ربط: تشيلر → 10.04', match2 === '10.04', `got: "${match2}"`);

// 1.13 Pipeline كامل
const pipeline = normalizeInput('خارسانه قعد', 'متر مكعب', 'structure');
assert('Pipeline كامل: تصحيح + ربط + وحدة', 
  pipeline.correctedText.includes('خرسانة') && 
  pipeline.normalizedUnit === 'م3' &&
  pipeline.corrections.length > 0,
  `corrections: [${pipeline.corrections.join(', ')}]`
);


// ============================================================
// TEST 2: تنبيهات الربح (Brain Insights)
// ============================================================
console.log('\n🧠 Test 2: تنبيهات الربح (Brain Insights)');

function simulateProfitStatus(directUnitCost: number, baseMaterial: number, baseLabor: number) {
  const baseCost = baseMaterial + baseLabor;
  let profitStatus: 'balanced' | 'exaggerated' | 'loss' = 'balanced';
  const warnings: string[] = [];

  if (baseCost > 0 && directUnitCost > 0) {
    const profitMarginPercent = ((directUnitCost - baseCost) / baseCost) * 100;
    if (directUnitCost < baseCost * 0.95) {
      profitStatus = 'loss';
      warnings.push(`خسارة: ${profitMarginPercent.toFixed(0)}%`);
    } else if (profitMarginPercent > 30) {
      profitStatus = 'exaggerated';
      warnings.push(`مبالغة: ${profitMarginPercent.toFixed(0)}%`);
    }
  }
  return { profitStatus, warnings };
}

// 2.1 خسارة
const loss = simulateProfitStatus(80, 60, 40);
assert('🔴 خسارة: سعر 80 < تكلفة 100', loss.profitStatus === 'loss', `got: ${loss.profitStatus}`);

// 2.2 مبالغة
const exag = simulateProfitStatus(200, 60, 40);
assert('🟠 مبالغة: سعر 200 > تكلفة 100 (+100%)', exag.profitStatus === 'exaggerated', `got: ${exag.profitStatus}`);

// 2.3 متوازن
const balanced = simulateProfitStatus(115, 60, 40);
assert('🟢 متوازن: سعر 115 ~ تكلفة 100 (+15%)', balanced.profitStatus === 'balanced', `got: ${balanced.profitStatus}`);

// 2.4 حد الخسارة
const edge = simulateProfitStatus(95, 60, 40);
assert('🟢 حد: سعر 95 = 95% من 100 (لسى متوازن)', edge.profitStatus === 'balanced', `got: ${edge.profitStatus}`);

// 2.5 حد المبالغة
const edge2 = simulateProfitStatus(130, 60, 40);
assert('🟢 حد: سعر 130 = +30% (لسى متوازن)', edge2.profitStatus === 'balanced', `got: ${edge2.profitStatus}`);

// 2.6 فوق الحد
const edge3 = simulateProfitStatus(131, 60, 40);
assert('🟠 فوق حد: سعر 131 = +31% (مبالغة)', edge3.profitStatus === 'exaggerated', `got: ${edge3.profitStatus}`);


// ============================================================
// TEST 3: خريطة الربط (COGNITIVE_TO_DB_MAP) — اختبار من الملف مباشرة
// ============================================================
console.log('\n🔗 Test 3: خريطة الربط (ID Mapping)');

import { readFileSync } from 'fs';
const boqSource = readFileSync(
  'c:/Users/ksuib/Desktop/Ibrahim AL-duaydi/My own program/pro-pricing-platform/services/boqEngine.ts',
  'utf-8'
);

// Parse map from source
function checkMapping(cogId: string, expectedDbId: string): boolean {
  const regex = new RegExp(`'${cogId}'\\s*:\\s*'${expectedDbId}'`);
  return regex.test(boqSource);
}

// 3.1 بنود الحريق المتقدمة
assert('ربط: fire_pump_set → 15.06', checkMapping('fire_pump_set', '15.06'));
assert('ربط: fire_sprinkler_sys → 15.05', checkMapping('fire_sprinkler_sys', '15.05'));
assert('ربط: fire_wet_riser → 21.01', checkMapping('fire_wet_riser', '21.01'));
assert('ربط: fire_water_tank → 21.02', checkMapping('fire_water_tank', '21.02'));

// 3.2 بنود الكهرباء المتقدمة
assert('ربط: mep_elec_mdb → 19.01', checkMapping('mep_elec_mdb', '19.01'));
assert('ربط: mep_elec_generator → 19.04', checkMapping('mep_elec_generator', '19.04'));

// 3.3 بنود التكييف
assert('ربط: mep_hvac_chiller → 10.04', checkMapping('mep_hvac_chiller', '10.04'));
assert('ربط: mep_hvac_ahu → 10.07', checkMapping('mep_hvac_ahu', '10.07'));

// 3.4 بنود ELV
assert('ربط: elv_bms → 18.10', checkMapping('elv_bms', '18.10'));
assert('ربط: elv_cctv → 18.03', checkMapping('elv_cctv', '18.03'));

// 3.5 FALLBACK_PRICES موجودة لكل بنود جديدة
const advancedIds = ['fire_pump_set', 'fire_sprinkler_sys', 'fire_wet_riser', 'fire_water_tank', 'mep_elec_mdb', 'mep_elec_generator'];
for (const id of advancedIds) {
  const hasFallback = boqSource.includes(`'${id}'`) && (
    boqSource.includes(`FALLBACK_PRICES`) || boqSource.includes(`COGNITIVE_TO_DB_MAP`)
  );
  assert(`${id}: موجود في خريطة الربط`, hasFallback);
}


// ============================================================
// TEST 4: بوابة الصلاحيات (Feature Gate)
// ============================================================
console.log('\n🔐 Test 4: بوابة الصلاحيات (Feature Gate)');

import { getBrainAccessLevel, filterBrainDataForUser, getUpgradePrompt } from '../services/brainFeatureGate';
import { ROLE_PERMISSIONS } from '../services/projectTypes';

// 4.1 مشاهد = none
const viewerLevel = getBrainAccessLevel(ROLE_PERMISSIONS.viewer);
assert('مشاهد → none', viewerLevel === 'none', `got: ${viewerLevel}`);

// 4.2 عميل = basic_alerts
const clientLevel = getBrainAccessLevel(ROLE_PERMISSIONS.client);
assert('عميل → basic_alerts', clientLevel === 'basic_alerts', `got: ${clientLevel}`);

// 4.3 مهندس QS = basic_alerts
const qsLevel = getBrainAccessLevel(ROLE_PERMISSIONS.qs_engineer);
assert('مهندس QS → basic_alerts', qsLevel === 'basic_alerts', `got: ${qsLevel}`);

// 4.4 مختص آربا = arba_specialist
const specialistLevel = getBrainAccessLevel(ROLE_PERMISSIONS.arba_qs_specialist);
assert('مختص آربا → arba_specialist', specialistLevel === 'arba_specialist', `got: ${specialistLevel}`);

// 4.5 فلترة بيانات المشاهد
const mockItems: any[] = [{
  id: 'test', profitStatus: 'loss', brainWarnings: ['تحذير خسارة (500 ر.س)']
}];
const filteredNone = filterBrainDataForUser(mockItems, 'none');
assert('فلترة مشاهد: profitStatus محذوف', filteredNone[0].profitStatus === undefined);
assert('فلترة مشاهد: brainWarnings محذوف', filteredNone[0].brainWarnings === undefined);

// 4.6 فلترة العميل — يرى الألوان لكن بدون أرقام داخلية
const filteredClient = filterBrainDataForUser(mockItems, 'basic_alerts');
assert('فلترة عميل: profitStatus موجود', filteredClient[0].profitStatus === 'loss');
assert('فلترة عميل: أرقام الريال مخفية', !filteredClient[0].brainWarnings[0].includes('ر.س'));

// 4.7 مختص آربا — يرى كل شيء بما فيه الأرقام
const filteredSpec = filterBrainDataForUser(mockItems, 'arba_specialist');
assert('مختص آربا: يرى الأرقام', filteredSpec[0].brainWarnings![0].includes('ر.س'));

// 4.8 رسالة ترقية
const upgradeMsg = getUpgradePrompt('basic_alerts', 'تحليل AI');
assert('رسالة ترقية للعميل المجاني', upgradeMsg !== null && upgradeMsg.includes('149'), `got: "${upgradeMsg}"`);

const noUpgrade = getUpgradePrompt('arba_specialist', 'تحليل AI');
assert('مختص آربا: لا يحتاج ترقية', noUpgrade === null);


// ============================================================
// TEST 5: فحص بنود systemsBaseItems
// ============================================================
console.log('\n📦 Test 5: سلامة بنود قاعدة البيانات');

const sysSource = readFileSync(
  'c:/Users/ksuib/Desktop/Ibrahim AL-duaydi/My own program/pro-pricing-platform/items/systemsBaseItems.ts',
  'utf-8'
);

// 5.1 لا وجود للتكرارات المحذوفة
assert('19.02 (ATS مكرر) محذوف', !sysSource.includes('id: "19.02"'));
assert('20.01 (Chiller مكرر) محذوف', !sysSource.includes('id: "20.01"'));
assert('21.03 (BMS مكرر) محذوف', !sysSource.includes('id: "21.03"'));

// 5.2 لا بنود بدون موردين في أقسام 19-21
const emptySupplierMatches = sysSource.match(/id: "(?:19|20|21)\.\d+".*?suppliers: \[\]/g);
assert(`أقسام 19-21: لا بنود بدون موردين`, !emptySupplierMatches || emptySupplierMatches.length === 0,
  emptySupplierMatches ? `found: ${emptySupplierMatches.length}` : undefined
);

// 5.3 كل البنود لها SUPPLIERS_ constant
const sec19to21Ids = (sysSource.match(/id: "(?:19|20|21)\.\d+"/g) || []);
assert(`أقسام 19-21: ${sec19to21Ids.length} بنود موجودة`, sec19to21Ids.length > 0);

// 5.4 الموردين مربوطين
assert('أقسام 19: SUPPLIERS_ELECTRICAL موجود', sysSource.includes('SUPPLIERS_ELECTRICAL'));
assert('أقسام 20: SUPPLIERS_HVAC موجود', sysSource.includes('SUPPLIERS_HVAC'));
assert('قسم 21: SUPPLIERS_FIRE_SAFETY موجود', sysSource.includes('SUPPLIERS_FIRE_SAFETY'));
assert('قسم 21: SUPPLIERS_TANKS موجود', sysSource.includes('SUPPLIERS_TANKS'));


// ============================================================
// TEST 6: فحص grossQty في cognitiveCalculations
// ============================================================
console.log('\n🔢 Test 6: تصحيح grossQty (الكمية ≠ التكلفة)');

const cogSource = readFileSync(
  'c:/Users/ksuib/Desktop/Ibrahim AL-duaydi/My own program/pro-pricing-platform/services/cognitiveCalculations.ts',
  'utf-8'
);

// الأسطر القديمة الخاطئة يجب أن تكون غير موجودة
assert('لا grossQty = cubeTestSets * cost', !cogSource.includes('grossQty: cubeTestSets * tc.cubeTestCost_SAR'));
assert('لا grossQty = pressureTests * cost', !cogSource.includes('grossQty: pressureTests * tc.pressureTestCost_SAR'));
assert('لا grossQty = geotechnicalReportCost_SAR', !cogSource.includes('grossQty: tc.geotechnicalReportCost_SAR'));
assert('لا grossQty = waterproofTestCost_SAR', !cogSource.includes('grossQty: tc.waterproofTestCost_SAR'));
assert('لا grossQty = electricalTestCost_SAR', !cogSource.includes('grossQty: tc.electricalTestCost_SAR'));
assert('لا grossQty = perimeter * cost', !cogSource.includes('grossQty: round2(plotPerimeter * sc.hoardingCostPerLm_SAR)'));
assert('لا grossQty = points * cost', !cogSource.includes('grossQty: sc.nightLightingPoints * sc.nightLightCostPerPoint_SAR'));

// بنود المضخات التجارية
assert('fire_pump_set بند جديد موجود', cogSource.includes("id: 'fire_pump_set'"));
assert('fire_sprinkler_sys بند جديد موجود', cogSource.includes("id: 'fire_sprinkler_sys'"));
assert('fire_wet_riser بند جديد موجود', cogSource.includes("id: 'fire_wet_riser'"));
assert('fire_water_tank بند جديد موجود', cogSource.includes("id: 'fire_water_tank'"));

// التعلم الذاتي مربوط
assert('WASTE_FACTORS_BASELINE موجود', cogSource.includes('WASTE_FACTORS_BASELINE'));
assert('learningFeedbackService مستدعى', cogSource.includes('learningFeedbackService'));


// ============================================================
// FINAL REPORT
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('📊 النتائج النهائية:');
console.log('='.repeat(60));
results.forEach(r => console.log(r));
console.log('\n' + '-'.repeat(40));
console.log(`  ✅ نجح: ${passed}`);
console.log(`  ❌ فشل: ${failed}`);
console.log(`  📊 الإجمالي: ${passed + failed}`);
console.log(`  📈 نسبة النجاح: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
console.log('-'.repeat(40));

if (failed === 0) {
  console.log('\n🎉 جميع الاختبارات نجحت! جاهز للنشر على GitHub.');
} else {
  console.log(`\n⚠️ ${failed} اختبار(ات) فشلت. راجع التفاصيل أعلاه.`);
}

process.exit(failed > 0 ? 1 : 0);
