/**
 * اختبار نهائي شامل — المحرك المالي للشركات + محرك التسعير
 * يقارن 3 شركات مختلفة على نفس المشروع (ابتدائية الأبرار)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';
import * as fs from 'fs';

// Mock localStorage
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
import { companyFinancialEngine, CompanyFinancialProfile, PRESET_PROFILES } from '../services/companyFinancialEngine';

async function runFinalTest() {
  console.log('🚀 بدء الاختبار النهائي الشامل...\n');

  // ═══════════════════════════════════════════
  // 1. تسعير ابتدائية الأبرار (التكلفة المباشرة فقط)
  // ═══════════════════════════════════════════
  const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[1]]; // أول مدرسة
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[];

  let directCost = 0;
  let itemCount = 0;

  for (const row of data) {
    if (typeof row[0] !== 'number' || typeof row[1] !== 'string' || row[1].length < 10) continue;
    const desc = row[1].trim();
    const unit = (row[2] || '').toString().trim();
    const analysis = itemCostAnalyzer.analyze(desc, unit, 0.15, 'riyadh', { normalMonths: 18, targetMonths: 9 });
    directCost += analysis.totalCost;
    itemCount++;
  }

  console.log(`📊 ابتدائية الأبرار: ${itemCount} بند`);
  console.log(`💰 التكلفة المباشرة: ${directCost.toLocaleString()} ر.س\n`);

  // ═══════════════════════════════════════════
  // 2. إنشاء 3 ملفات مالية للشركات
  // ═══════════════════════════════════════════
  const companies: { name: string; profile: CompanyFinancialProfile }[] = [
    {
      name: 'مؤسسة البناء الحديث (مبتدئة سعودية)',
      profile: companyFinancialEngine.createFromPreset('saudi_startup', 'مؤسسة البناء الحديث'),
    },
    {
      name: 'شركة Global Build (أجنبية)',
      profile: companyFinancialEngine.createFromPreset('foreign_medium', 'Global Build Ltd'),
    },
    {
      name: 'شركة الراجحي للمقاولات (كبرى سعودية)',
      profile: companyFinancialEngine.createFromPreset('saudi_enterprise', 'شركة الراجحي للمقاولات'),
    },
  ];

  // ═══════════════════════════════════════════
  // 3. حساب الملف المالي لكل شركة
  // ═══════════════════════════════════════════
  const results: any[] = [];

  for (const company of companies) {
    const factors = companyFinancialEngine.calculateFactors(
      company.profile,
      directCost,
      9,        // مدة المشروع 9 أشهر
      0.15,     // ربح صافي مطلوب 15%
    );

    // طباعة التقرير المفصل
    companyFinancialEngine.printReport(company.profile, factors, directCost);

    const adjustedCost = directCost * (1 + factors.totalAdditionalPercent);
    const sellingPrice = adjustedCost * (1 + factors.effectiveProfitMargin);

    results.push({
      company: company.name,
      nationality: company.profile.nationality,
      size: company.profile.size,
      directCost: Math.round(directCost),
      siteOverhead: Math.round(directCost * factors.siteOverheadPercent),
      gaOverhead: Math.round(directCost * factors.gaOverheadPercent),
      financeCost: Math.round(directCost * factors.financeCostPercent),
      insurance: Math.round(directCost * factors.insurancePercent),
      totalCostWithAdditions: Math.round(adjustedCost),
      profitMarginUsed: (factors.effectiveProfitMargin * 100).toFixed(2) + '%',
      sellingPrice: Math.round(sellingPrice),
      profitAmount: Math.round(sellingPrice - adjustedCost),
    });
  }

  // ═══════════════════════════════════════════
  // 4. جدول المقارنة النهائي
  // ═══════════════════════════════════════════
  console.log('\n' + '═'.repeat(70));
  console.log('📊 جدول المقارنة النهائي — نفس المدرسة بـ 3 شركات مختلفة');
  console.log('═'.repeat(70));

  for (const r of results) {
    console.log(`\n🏢 ${r.company}`);
    console.log(`   التكلفة المباشرة:     ${r.directCost.toLocaleString()} ر.س`);
    console.log(`   + مصاريف الموقع:      ${r.siteOverhead.toLocaleString()} ر.س`);
    console.log(`   + مصاريف إدارية:      ${r.gaOverhead.toLocaleString()} ر.س`);
    console.log(`   + تكلفة تمويل:        ${r.financeCost.toLocaleString()} ر.س`);
    console.log(`   + تأمين:              ${r.insurance.toLocaleString()} ر.س`);
    console.log(`   = التكلفة الكاملة:    ${r.totalCostWithAdditions.toLocaleString()} ر.س`);
    console.log(`   هامش الربح المُطبق:   ${r.profitMarginUsed}`);
    console.log(`   🏷️ سعر البيع النهائي:  ${r.sellingPrice.toLocaleString()} ر.س`);
  }

  // ═══════════════════════════════════════════
  // 5. تصدير النتائج لملف Excel
  // ═══════════════════════════════════════════
  const newWb = XLSX.utils.book_new();
  const summaryRows = [
    ['🧠 ARBA Brain — مقارنة الملف المالي للشركات'],
    ['المدرسة: ابتدائية الأبرار | الموقع: الرياض | المدة: 9 أشهر'],
    [''],
    ['الشركة', 'الجنسية', 'الحجم', 'التكلفة المباشرة', 'مصاريف الموقع', 'مصاريف إدارية', 'تمويل', 'تأمين', 'التكلفة الكاملة', 'هامش الربح', 'سعر البيع', 'الربح'],
    ...results.map(r => [
      r.company, r.nationality, r.size,
      r.directCost, r.siteOverhead, r.gaOverhead, r.financeCost, r.insurance,
      r.totalCostWithAdditions, r.profitMarginUsed, r.sellingPrice, r.profitAmount,
    ]),
  ];
  const sWs = XLSX.utils.aoa_to_sheet(summaryRows);
  sWs['!cols'] = [
    { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(newWb, sWs, 'مقارنة الشركات');

  const outPath = path.join(process.cwd(), 'scratch', 'company_comparison.xlsx');
  XLSX.writeFile(newWb, outPath);
  console.log(`\n✅ تم حفظ ملف المقارنة: ${path.basename(outPath)}`);

  console.log('\n🏁 اكتمل الاختبار النهائي!');
  process.exit(0);
}

runFinalTest().catch(e => { console.error(e); process.exit(1); });
