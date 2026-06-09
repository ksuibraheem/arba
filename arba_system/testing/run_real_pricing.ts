/**
 * ARBA Brain V11.0 — Real Pricing Engine
 * المسعّر الحقيقي: يحسب من الصفر، يتحقق من 3 مصادر، يسجل المكسب
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';
import * as fs from 'fs';

// Mock browser APIs for Node
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
import { marketDataProvider } from '../services/marketDataProvider';
import { companyFinancialEngine, PRESET_PROFILES } from '../services/companyFinancialEngine';

async function runRealPricing() {
  // ══════════════════════════════════════════
  // تنبيه المكسب
  // ══════════════════════════════════════════
  const profitArg = process.argv.find(a => a.startsWith('--profit='));
  let profitMargin: number | undefined;
  
  if (profitArg) {
    profitMargin = parseFloat(profitArg.split('=')[1]) / 100;
    itemCostAnalyzer.setProfitMargin(profitMargin);
    console.log(`✅ نسبة المكسب المحددة: ${(profitMargin * 100).toFixed(0)}%`);
  } else {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  ⚠️  تنبيه: لم تحدد نسبة المكسب المطلوبة!              ║');
    console.log('║  سيتم استخدام 15% كنسبة افتراضية.                      ║');
    console.log('║  لتغييرها: أضف --profit=20 مثلاً                       ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
  }

  // ══════════════════════════════════════════
  // الملف المالي للشركة (اختياري)
  // ══════════════════════════════════════════
  const companyArg = process.argv.find(a => a.startsWith('--company='));
  let companyProfile: any = null;
  let financialFactors: any = null;

  if (companyArg) {
    const presetKey = companyArg.split('=')[1];
    if (PRESET_PROFILES[presetKey]) {
      companyProfile = companyFinancialEngine.createFromPreset(presetKey, presetKey);
      console.log(`\n🏢 تم تفعيل الملف المالي: ${presetKey}`);
      console.log(`   الجنسية: ${companyProfile.nationality} | الحجم: ${companyProfile.size} | المشاريع: ${companyProfile.activeProjectsCount}`);
    } else {
      console.log(`⚠️ القالب "${presetKey}" غير موجود. القوالب المتاحة: ${Object.keys(PRESET_PROFILES).join(', ')}`);
    }
  }

  // ══════════════════════════════════════════
  // 1. تحديث بيانات السوق
  // ══════════════════════════════════════════
  console.log('\n🔄 1. جارٍ تحديث بيانات الموردين والبورصة...');
  const updatedCount = await marketDataProvider.syncWithExternalAPI();
  console.log(`   ✅ تم تحديث ${updatedCount} سعر من API الموردين`);

  // ══════════════════════════════════════════
  // 1.5 ابتلاع بيانات التدريب التاريخية
  // ══════════════════════════════════════════
  const training = itemCostAnalyzer.ingestTrainingData();
  const stats = itemCostAnalyzer.getEngineeringStats();
  console.log(`📚 1.5. ربط هندسي: ${stats.totalRecipes} وصفة | ${stats.totalMarketPrices} سعر سوق | ${stats.totalLaborActivities} نشاط عمالة`);
  console.log(`   🔬 معدلات مربوطة: خرسانة=${stats.connectedRates.concrete} | مونة=${stats.connectedRates.mortar} | بلاط=${stats.connectedRates.tile} | دهان=${stats.connectedRates.paint} | عزل=${stats.connectedRates.insulation + stats.connectedRates.waterproofing} | عمالة=${stats.connectedRates.labor}`);

  // ══════════════════════════════════════════
  // 2. قراءة ملف العطاء
  // ══════════════════════════════════════════
  const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
  console.log(`📂 2. قراءة ملف العطاء: ${path.basename(filePath)}`);
  const wb = XLSX.readFile(filePath);

  const schoolNames = [
    'ابتدائية الأبرار', 'الابتدائية السادسة', 'الابتدائية 26',
    'الثانوية 29', 'الثانوية الثالثة', 'الثانوية السابعة', 'متوسطة ابن خلدون',
  ];

  let grandTotalCost = 0, grandTotalSelling = 0, grandTotalProfit = 0;
  const allResults: any[] = [];

  // ══════════════════════════════════════════
  // 3. تسعير كل مدرسة
  // ══════════════════════════════════════════
  console.log('\n🧠 3. بدء التسعير الحقيقي...\n');

  for (let si = 1; si <= 8; si++) {
    const ws = wb.Sheets[wb.SheetNames[si]];
    if (!ws) continue;
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const schoolName = schoolNames[si - 1] || `مدرسة ${si}`;

    let schoolCost = 0, schoolSelling = 0, schoolProfit = 0;
    let withRecipe = 0, estimated = 0;
    let renovationCount = 0, newCount = 0, mixedCount = 0;
    const schoolItems: any[] = [];

    for (const row of data) {
      if (typeof row[0] !== 'number' || typeof row[1] !== 'string' || row[1].length < 10) continue;
      
      const no = row[0];
      const desc = row[1].trim();
      const unit = (row[2] || '').toString().trim();
      const qty = parseFloat(row[3]) || 0;

      // تحليل البند عبر المحلل الحقيقي مع تحديد المنطقة (الرياض) وضريبة ضغط الجدول الزمني (18 إلى 9 أشهر)
      const analysis = itemCostAnalyzer.analyze(desc, unit, profitMargin, 'riyadh', { normalMonths: 18, targetMonths: 9 });

      // 🛡️ طبقة 1: حارس السعر
      const guard = itemCostAnalyzer.priceGuard(analysis, qty);
      if (!guard.passed) {
        // استشارة Cloud AI عند فشل الحارس
        const ai = await itemCostAnalyzer.consultCloudAI(desc, unit, analysis.sellingPrice);
        if (ai.suggestedPrice && ai.confidence > 50) {
          analysis.warnings.push(`🛡️ حارس السعر: ${guard.issues[0]}`);
          analysis.warnings.push(`☁️ AI: ${ai.reasoning}`);
        } else {
          guard.issues.forEach(issue => analysis.warnings.push(issue));
        }
      }

      // 🧠 طبقة 5: تسجيل السعر للتعلم الذاتي
      itemCostAnalyzer.recordPrice(analysis.category, unit, analysis.totalCost);

      const itemCost = analysis.totalCost * qty;
      const itemSelling = analysis.sellingPrice * qty;
      const itemProfit = analysis.profitAmount * qty;

      schoolCost += itemCost;
      schoolSelling += itemSelling;
      schoolProfit += itemProfit;

      if (analysis.materials.length > 0) withRecipe++; else estimated++;
      if (analysis.workScope === 'renovation') renovationCount++;
      else if (analysis.workScope === 'mixed') mixedCount++;
      else newCount++;

      schoolItems.push({
        no, desc: desc.substring(0, 80), unit, qty,
        costPerUnit: analysis.totalCost,
        sellingPerUnit: analysis.sellingPrice,
        profitPerUnit: analysis.profitAmount,
        totalCost: Math.round(itemCost),
        totalSelling: Math.round(itemSelling),
        category: analysis.category,
        workScope: analysis.workScope === 'renovation' ? 'ترميم' : analysis.workScope === 'mixed' ? 'مختلط' : 'جديد',
        demolitionCost: analysis.demolitionCost,
        confidence: analysis.confidence,
        sources: analysis.sources.join(', '),
        warnings: analysis.warnings,
        isDefaultProfit: analysis.isDefaultProfit,
        breakdown: {
          materials: analysis.materials.length,
          labor: analysis.labor.length,
          directCost: analysis.directCost,
        }
      });
    }

    grandTotalCost += schoolCost;
    grandTotalSelling += schoolSelling;
    grandTotalProfit += schoolProfit;

    const total = withRecipe + estimated;
    console.log(`📍 ${schoolName}`);
    console.log(`   📊 بنود: ${total} | بوصفة: ${withRecipe} ✅ | تقدير: ${estimated} ⚡`);
    console.log(`   🏗️ جديد: ${newCount} | 🔧 ترميم: ${renovationCount} | 🔄 مختلط: ${mixedCount}`);
    console.log(`   💰 التكلفة: ${Math.round(schoolCost).toLocaleString()} | المكسب: ${Math.round(schoolProfit).toLocaleString()} | البيع: ${Math.round(schoolSelling).toLocaleString()} ر.س`);

    allResults.push({ school: schoolName, items: schoolItems, schoolCost, schoolSelling, schoolProfit, withRecipe, estimated, renovationCount, newCount, mixedCount });
  }

  // ══════════════════════════════════════════
  // 🔍 طبقة 2: مراجعة ذاتية (Self-Review)
  // ══════════════════════════════════════════
  console.log('\n🔍 مراجعة ذاتية...');
  const avgSchool = grandTotalSelling / allResults.length;
  let reviewIssues = 0;
  for (const r of allResults) {
    const dev = Math.round(((r.schoolSelling - avgSchool) / avgSchool) * 100);
    if (Math.abs(dev) > 40) {
      console.log(`   ⚠️ ${r.school}: انحراف ${dev > 0 ? '+' : ''}${dev}% عن المتوسط`);
      reviewIssues++;
    }
  }
  if (reviewIssues === 0) console.log('   ✅ جميع المدارس ضمن النطاق الطبيعي');

  // ══════════════════════════════════════════
  // 📋 طبقة 3: تقرير صحة (Health Report)
  // ══════════════════════════════════════════
  console.log('\n📋 تقرير الصحة...');
  const allItems = allResults.flatMap(r => r.items);
  const guardFails = allItems.filter((i: any) => i.warnings?.some((w: string) => w.includes('حارس') || w.includes('⛔')));
  const top5 = [...allItems].sort((a: any, b: any) => (b.totalSelling || 0) - (a.totalSelling || 0)).slice(0, 5);
  console.log(`   📊 إجمالي البنود: ${allItems.length}`);
  console.log(`   🛡️ فشل حارس السعر: ${guardFails.length}`);
  console.log(`   🔝 أغلى 5 بنود:`);
  top5.forEach((i: any) => console.log(`      ${i.no} | ${(i.desc||'').substring(0,40)} | ${(i.totalSelling||0).toLocaleString()} ر.س`));

  // ══════════════════════════════════════════
  // 4. التقرير النهائي
  // ══════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🧠 ARBA Brain V11.2 — التقرير النهائي (محمي بـ 5 طبقات)');
  console.log('═'.repeat(60));
  const vatAmount = grandTotalSelling * 0.15;
  const sellingWithVat = grandTotalSelling + vatAmount;

  console.log(`💰 إجمالي التكلفة المباشرة:  ${Math.round(grandTotalCost).toLocaleString()} ر.س`);
  console.log(`📈 إجمالي المكسب:   ${Math.round(grandTotalProfit).toLocaleString()} ر.س (${((grandTotalProfit/grandTotalCost)*100).toFixed(1)}%)`);
  console.log(`🏷️ إجمالي سعر البيع (قبل الضريبة): ${Math.round(grandTotalSelling).toLocaleString()} ر.س`);
  console.log(`🧾 ضريبة القيمة المضافة (15%): ${Math.round(vatAmount).toLocaleString()} ر.س`);
  console.log(`🏆 إجمالي العطاء (شامل الضريبة): ${Math.round(sellingWithVat).toLocaleString()} ر.س`);
  if (!profitArg) {
    console.log(`⚠️  تنبيه: المكسب 15% افتراضي — حدد --profit=XX لتغييره`);
  }
  console.log('═'.repeat(60));

  // ══════════════════════════════════════════
  // 5. توليد Excel مسعّر
  // ══════════════════════════════════════════
  console.log('\n📝 5. توليد ملف Excel...');
  const newWb = XLSX.utils.book_new();

  // ملخص
  const summary: any[][] = [
    ['🧠 ARBA Brain V11.0 — تقرير التسعير الحقيقي'],
    [`نسبة المكسب: ${((profitMargin || 0.15) * 100).toFixed(0)}%${!profitArg ? ' (افتراضي ⚠️)' : ''}`],
    [''],
    ['المدرسة', 'التكلفة', 'المكسب', 'سعر البيع', 'بوصفة', 'تقدير'],
    ...allResults.map(r => [r.school, Math.round(r.schoolCost), Math.round(r.schoolProfit), Math.round(r.schoolSelling), r.withRecipe, r.estimated]),
    [''],
    ['الإجمالي', Math.round(grandTotalCost), Math.round(grandTotalProfit), Math.round(grandTotalSelling)],
  ];

  // إذا تم تفعيل الملف المالي → نضيف الحسابات المالية
  if (companyProfile) {
    financialFactors = companyFinancialEngine.calculateFactors(companyProfile, grandTotalCost, 9, profitMargin || 0.15);
    companyFinancialEngine.printReport(companyProfile, financialFactors, grandTotalCost);

    const adjustedCost = grandTotalCost * (1 + financialFactors.totalAdditionalPercent);
    const finalSelling = adjustedCost * (1 + financialFactors.effectiveProfitMargin);
    const vatAmount = finalSelling * 0.15;
    const sellingWithVat = finalSelling + vatAmount;

    summary.push(['']);
    summary.push(['═══ الملف المالي للشركة ═══']);
    summary.push(['البند', 'المبلغ (ر.س)', 'النسبة']);
    for (const line of financialFactors.breakdown) {
      summary.push([line.nameAr, line.amount, line.percent + '%']);
    }
    summary.push(['']);
    summary.push(['التكلفة بعد الإضافات المالية', Math.round(adjustedCost)]);
    summary.push(['هامش الربح الفعلي', (financialFactors.effectiveProfitMargin * 100).toFixed(2) + '%']);
    summary.push(['سعر البيع النهائي (قبل الضريبة)', Math.round(finalSelling)]);
    summary.push(['ضريبة القيمة المضافة VAT (15%)', Math.round(vatAmount)]);
    summary.push(['🏷️ إجمالي قيمة العطاء (شامل الضريبة)', Math.round(sellingWithVat)]);
  } else {
    // إذا لم يتم تحديد شركة، نحسب الضريبة فقط على الإجمالي
    const vatAmount = grandTotalSelling * 0.15;
    const sellingWithVat = grandTotalSelling + vatAmount;
    
    summary.push(['']);
    summary.push(['═══ الضرائب ═══']);
    summary.push(['سعر البيع الإجمالي (قبل الضريبة)', Math.round(grandTotalSelling)]);
    summary.push(['ضريبة القيمة المضافة VAT (15%)', Math.round(vatAmount)]);
    summary.push(['🏷️ إجمالي قيمة العطاء (شامل الضريبة)', Math.round(sellingWithVat)]);
  }

  const sWs = XLSX.utils.aoa_to_sheet(summary);
  sWs['!cols'] = [{ wch: 50 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(newWb, sWs, 'ملخص');

  // شيتات المدارس
  for (const r of allResults) {
    const rows = [
      ['م', 'وصف البند', 'الوحدة', 'الكمية', 'تكلفة الوحدة', 'مكسب الوحدة', 'سعر البيع', 'إجمالي تكلفة', 'إجمالي بيع', 'التصنيف', 'نوع العمل', 'تكلفة فك', 'الثقة'],
      ...r.items.map((i: any) => [
        i.no, i.desc, i.unit, i.qty,
        i.costPerUnit, i.profitPerUnit, i.sellingPerUnit,
        i.totalCost, i.totalSelling,
        i.category, i.workScope, i.demolitionCost || 0, i.confidence + '%',
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 4 }, { wch: 55 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 6 }];
    XLSX.utils.book_append_sheet(newWb, ws, r.school.substring(0, 31));
  }

  const outPath = path.join(process.cwd(), 'scratch', 'tender_real_pricing.xlsx');
  XLSX.writeFile(newWb, outPath);
  console.log(`✅ تم حفظ: ${path.basename(outPath)}`);

  // ══════════════════════════════════════════
  // 6. بيانات التدريب
  // ══════════════════════════════════════════
  const feed = {
    version: 'V11.2-Protected',
    date: new Date().toISOString(),
    profitMargin: (profitMargin || 0.15),
    isDefaultProfit: !profitArg,
    totals: { cost: Math.round(grandTotalCost), profit: Math.round(grandTotalProfit), selling: Math.round(grandTotalSelling) },
    schools: allResults.map(r => ({
      name: r.school,
      cost: Math.round(r.schoolCost),
      selling: Math.round(r.schoolSelling),
      itemsWithRecipe: r.withRecipe,
      itemsEstimated: r.estimated,
      renovation: r.renovationCount, new: r.newCount, mixed: r.mixedCount,
    })),
    priceHistory: itemCostAnalyzer.exportHistory(),
  };
  const feedPath = path.join(process.cwd(), 'scratch', 'brain_v11_feed.json');
  fs.writeFileSync(feedPath, JSON.stringify(feed, null, 2), 'utf8');
  console.log(`✅ بيانات التدريب: ${path.basename(feedPath)}`);

  console.log('\n🏁 اكتمل التسعير الحقيقي!');
  process.exit(0);
}

runRealPricing().catch(e => { console.error(e); process.exit(1); });
