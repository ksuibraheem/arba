/**
 * ARBA Brain — Company Financial Profile Engine
 * محرك الملف المالي للشركات
 * 
 * يقوم بحساب العوامل المالية الديناميكية (الإشراف، الضرائب، التمويل)
 * بناءً على هوية الشركة وجنسيتها وعدد مشاريعها.
 * 
 * ⚠️ يُفعّل فقط عند الطلب (On-Demand) — لا يُطبق تلقائياً
 */

// ═══════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════

export type CompanyNationality = 'saudi' | 'foreign' | 'mixed';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';

export interface CompanyFinancialProfile {
  id: string;
  companyName: string;
  nationality: CompanyNationality;
  foreignOwnershipPercent?: number;    // نسبة الملكية الأجنبية (للشركات المختلطة) 0-100
  size: CompanySize;

  // مصاريف المكتب الرئيسي (سنوية)
  annualGACost: number;                // إجمالي المصاريف الإدارية السنوية (ر.س)

  // توزيع الحمل على المشاريع
  activeProjectsCount: number;         // عدد المشاريع الحالية
  thisProjectLoadPercent: number;      // نسبة تحميل هذا المشروع (0-100)

  // مصاريف الموقع الشهرية
  monthlySiteOverhead: number;         // مصاريف الموقع الشهرية (مدير + مهندس + حراسة + كرفانات)

  // تمويل وضمانات
  hasBidBond: boolean;                 // خطاب ضمان ابتدائي
  bidBondPercent: number;              // نسبة عمولة الضمان الابتدائي
  hasPerformanceBond: boolean;         // خطاب ضمان تنفيذي
  performanceBondPercent: number;      // نسبة قيمة الضمان التنفيذي من العقد
  performanceBondFeePercent: number;   // عمولة البنك السنوية على الضمان التنفيذي
  hasAdvancePaymentBond: boolean;      // خطاب ضمان دفعة مقدمة
  advancePaymentPercent: number;       // نسبة الدفعة المقدمة من العقد
  workingCapitalInterest: number;      // فائدة رأس المال العامل السنوية %

  // تأمين
  carInsurancePercent: number;         // تأمين المشروع CAR (% من قيمة العقد)
}

export interface FinancialFactors {
  // النسب المحسوبة
  siteOverheadPercent: number;         // مصاريف الموقع كنسبة من التكلفة المباشرة
  gaOverheadPercent: number;           // مصاريف المكتب كنسبة من التكلفة المباشرة
  taxAdjustedProfitMargin: number;     // هامش الربح بعد تعديل الضريبة
  financeCostPercent: number;          // تكلفة التمويل كنسبة
  insurancePercent: number;            // التأمين كنسبة

  // الإجماليات
  totalOverheadPercent: number;        // إجمالي نسبة الإشراف (موقع + مكتب)
  totalAdditionalPercent: number;      // إجمالي كل الإضافات فوق التكلفة المباشرة
  effectiveProfitMargin: number;       // هامش الربح الفعلي المطلوب في العطاء

  // تفاصيل للعرض
  breakdown: FinancialBreakdownLine[];
}

export interface FinancialBreakdownLine {
  nameAr: string;
  nameEn: string;
  amount: number;           // المبلغ بالريال
  percent: number;          // كنسبة مئوية
  category: 'site_overhead' | 'ga_overhead' | 'tax' | 'finance' | 'insurance';
}

// ═══════════════════════════════════════════
// Preset Profiles (قوالب جاهزة)
// ═══════════════════════════════════════════

export const PRESET_PROFILES: Record<string, Omit<CompanyFinancialProfile, 'id' | 'companyName'>> = {
  saudi_startup: {
    nationality: 'saudi',
    size: 'startup',
    annualGACost: 180_000,
    activeProjectsCount: 1,
    thisProjectLoadPercent: 100,
    monthlySiteOverhead: 25_000,
    hasBidBond: false,
    bidBondPercent: 0,
    hasPerformanceBond: false,
    performanceBondPercent: 0,
    performanceBondFeePercent: 0,
    hasAdvancePaymentBond: false,
    advancePaymentPercent: 0,
    workingCapitalInterest: 0,
    carInsurancePercent: 0.5,
  },
  saudi_medium: {
    nationality: 'saudi',
    size: 'medium',
    annualGACost: 800_000,
    activeProjectsCount: 3,
    thisProjectLoadPercent: 40,
    monthlySiteOverhead: 45_000,
    hasBidBond: true,
    bidBondPercent: 1.5,
    hasPerformanceBond: true,
    performanceBondPercent: 5,
    performanceBondFeePercent: 2,
    hasAdvancePaymentBond: false,
    advancePaymentPercent: 0,
    workingCapitalInterest: 0,
    carInsurancePercent: 0.8,
  },
  foreign_medium: {
    nationality: 'foreign',
    size: 'medium',
    annualGACost: 1_200_000,
    activeProjectsCount: 2,
    thisProjectLoadPercent: 50,
    monthlySiteOverhead: 55_000,
    hasBidBond: true,
    bidBondPercent: 2,
    hasPerformanceBond: true,
    performanceBondPercent: 10,
    performanceBondFeePercent: 2.5,
    hasAdvancePaymentBond: true,
    advancePaymentPercent: 10,
    workingCapitalInterest: 7,
    carInsurancePercent: 1.2,
  },
  saudi_enterprise: {
    nationality: 'saudi',
    size: 'enterprise',
    annualGACost: 2_500_000,
    activeProjectsCount: 8,
    thisProjectLoadPercent: 15,
    monthlySiteOverhead: 65_000,
    hasBidBond: true,
    bidBondPercent: 1,
    hasPerformanceBond: true,
    performanceBondPercent: 5,
    performanceBondFeePercent: 1.5,
    hasAdvancePaymentBond: true,
    advancePaymentPercent: 15,
    workingCapitalInterest: 5,
    carInsurancePercent: 1.0,
  },
  mixed_company: {
    nationality: 'mixed',
    foreignOwnershipPercent: 40,
    size: 'large',
    annualGACost: 1_800_000,
    activeProjectsCount: 4,
    thisProjectLoadPercent: 30,
    monthlySiteOverhead: 55_000,
    hasBidBond: true,
    bidBondPercent: 1.5,
    hasPerformanceBond: true,
    performanceBondPercent: 10,
    performanceBondFeePercent: 2,
    hasAdvancePaymentBond: false,
    advancePaymentPercent: 0,
    workingCapitalInterest: 6,
    carInsurancePercent: 1.0,
  },
};

// ═══════════════════════════════════════════
// Engine
// ═══════════════════════════════════════════

class CompanyFinancialEngine {

  /**
   * حساب العوامل المالية بناءً على ملف الشركة وبيانات المشروع
   */
  calculateFactors(
    profile: CompanyFinancialProfile,
    projectDirectCost: number,
    projectDurationMonths: number,
    desiredNetProfitMargin: number = 0.15,
  ): FinancialFactors {

    const breakdown: FinancialBreakdownLine[] = [];

    // ─── 1. مصاريف الموقع (Site Overhead) ───
    const totalSiteOverhead = profile.monthlySiteOverhead * projectDurationMonths;
    const siteOverheadPercent = projectDirectCost > 0 ? totalSiteOverhead / projectDirectCost : 0;
    breakdown.push({
      nameAr: 'مصاريف الموقع (مدير + مهندس + حراسة + كرفانات)',
      nameEn: 'Site Overhead',
      amount: Math.round(totalSiteOverhead),
      percent: Math.round(siteOverheadPercent * 10000) / 100,
      category: 'site_overhead',
    });

    // ─── 2. مصاريف المكتب الرئيسي (G&A) ───
    const monthlyGA = profile.annualGACost / 12;
    const projectGAShare = monthlyGA * projectDurationMonths * (profile.thisProjectLoadPercent / 100);
    const gaOverheadPercent = projectDirectCost > 0 ? projectGAShare / projectDirectCost : 0;
    breakdown.push({
      nameAr: `مصاريف إدارية (${profile.thisProjectLoadPercent}% تحميل من ${profile.activeProjectsCount} مشاريع)`,
      nameEn: `G&A Overhead (${profile.thisProjectLoadPercent}% load)`,
      amount: Math.round(projectGAShare),
      percent: Math.round(gaOverheadPercent * 10000) / 100,
      category: 'ga_overhead',
    });

    // ─── 3. الضرائب / الزكاة (Tax Adjustment) ───
    let taxAdjustedProfitMargin = desiredNetProfitMargin;
    if (profile.nationality === 'foreign') {
      // أجنبية: 20% ضريبة دخل على صافي الأرباح
      taxAdjustedProfitMargin = desiredNetProfitMargin / (1 - 0.20);
      breakdown.push({
        nameAr: 'تعديل ضريبة دخل الشركات الأجنبية (CIT 20%)',
        nameEn: 'Foreign CIT 20% Adjustment',
        amount: 0, // تُحسب لاحقاً ضمن الربح
        percent: Math.round((taxAdjustedProfitMargin - desiredNetProfitMargin) * 10000) / 100,
        category: 'tax',
      });
    } else if (profile.nationality === 'mixed' && profile.foreignOwnershipPercent) {
      // مختلطة: الحصة الأجنبية فقط تخضع لـ CIT 20%
      const foreignShare = profile.foreignOwnershipPercent / 100;
      const saudiShare = 1 - foreignShare;
      // الحصة السعودية: زكاة ~2.5% (تُغطى من الربح)
      // الحصة الأجنبية: CIT 20%
      const foreignAdjusted = desiredNetProfitMargin / (1 - 0.20);
      taxAdjustedProfitMargin = (saudiShare * desiredNetProfitMargin) + (foreignShare * foreignAdjusted);
      breakdown.push({
        nameAr: `تعديل ضريبي مركب (${profile.foreignOwnershipPercent}% أجنبي CIT + ${100 - profile.foreignOwnershipPercent}% سعودي زكاة)`,
        nameEn: `Mixed Tax (${profile.foreignOwnershipPercent}% CIT + Saudi Zakat)`,
        amount: 0,
        percent: Math.round((taxAdjustedProfitMargin - desiredNetProfitMargin) * 10000) / 100,
        category: 'tax',
      });
    } else {
      // سعودية: زكاة ~2.5% (عادة تُغطى من هامش الربح دون رفعه)
      breakdown.push({
        nameAr: 'زكاة (مُغطاة ضمن هامش الربح)',
        nameEn: 'Zakat (covered in margin)',
        amount: 0,
        percent: 0,
        category: 'tax',
      });
    }

    // ─── 4. تكاليف التمويل (Finance Costs) ───
    const estimatedContractValue = projectDirectCost * (1 + siteOverheadPercent + gaOverheadPercent) * (1 + taxAdjustedProfitMargin);
    let financeCost = 0;

    if (profile.hasBidBond) {
      const bidBondCost = estimatedContractValue * (profile.bidBondPercent / 100);
      financeCost += bidBondCost;
      breakdown.push({
        nameAr: `خطاب ضمان ابتدائي (${profile.bidBondPercent}%)`,
        nameEn: `Bid Bond (${profile.bidBondPercent}%)`,
        amount: Math.round(bidBondCost),
        percent: Math.round((bidBondCost / projectDirectCost) * 10000) / 100,
        category: 'finance',
      });
    }

    if (profile.hasPerformanceBond) {
      const bondValue = estimatedContractValue * (profile.performanceBondPercent / 100);
      const annualFee = bondValue * (profile.performanceBondFeePercent / 100);
      const totalFee = annualFee * (projectDurationMonths / 12);
      financeCost += totalFee;
      breakdown.push({
        nameAr: `ضمان تنفيذي (${profile.performanceBondPercent}% × عمولة ${profile.performanceBondFeePercent}%)`,
        nameEn: `Performance Bond Fee`,
        amount: Math.round(totalFee),
        percent: Math.round((totalFee / projectDirectCost) * 10000) / 100,
        category: 'finance',
      });
    }

    if (profile.hasAdvancePaymentBond) {
      const advBondValue = estimatedContractValue * (profile.advancePaymentPercent / 100);
      const advFee = advBondValue * 0.015 * (projectDurationMonths / 12);
      financeCost += advFee;
      breakdown.push({
        nameAr: `ضمان دفعة مقدمة (${profile.advancePaymentPercent}%)`,
        nameEn: `Advance Payment Bond`,
        amount: Math.round(advFee),
        percent: Math.round((advFee / projectDirectCost) * 10000) / 100,
        category: 'finance',
      });
    }

    if (profile.workingCapitalInterest > 0) {
      const avgWorkingCapital = projectDirectCost * 0.25;
      const interestCost = avgWorkingCapital * (profile.workingCapitalInterest / 100) * (projectDurationMonths / 12);
      financeCost += interestCost;
      breakdown.push({
        nameAr: `فائدة رأس مال عامل (${profile.workingCapitalInterest}%)`,
        nameEn: `Working Capital Interest (${profile.workingCapitalInterest}%)`,
        amount: Math.round(interestCost),
        percent: Math.round((interestCost / projectDirectCost) * 10000) / 100,
        category: 'finance',
      });
    }

    const financeCostPercent = projectDirectCost > 0 ? financeCost / projectDirectCost : 0;

    // ─── 5. التأمين (Insurance) ───
    const insuranceCost = estimatedContractValue * (profile.carInsurancePercent / 100) * (projectDurationMonths / 12);
    const insurancePercent = projectDirectCost > 0 ? insuranceCost / projectDirectCost : 0;
    breakdown.push({
      nameAr: `تأمين المشروع CAR (${profile.carInsurancePercent}%)`,
      nameEn: `CAR Insurance (${profile.carInsurancePercent}%)`,
      amount: Math.round(insuranceCost),
      percent: Math.round(insurancePercent * 10000) / 100,
      category: 'insurance',
    });

    // ─── الإجماليات ───
    const totalOverheadPercent = siteOverheadPercent + gaOverheadPercent;
    const totalAdditionalPercent = totalOverheadPercent + financeCostPercent + insurancePercent;
    const effectiveProfitMargin = taxAdjustedProfitMargin;

    return {
      siteOverheadPercent: Math.round(siteOverheadPercent * 10000) / 10000,
      gaOverheadPercent: Math.round(gaOverheadPercent * 10000) / 10000,
      taxAdjustedProfitMargin: Math.round(taxAdjustedProfitMargin * 10000) / 10000,
      financeCostPercent: Math.round(financeCostPercent * 10000) / 10000,
      insurancePercent: Math.round(insurancePercent * 10000) / 10000,
      totalOverheadPercent: Math.round(totalOverheadPercent * 10000) / 10000,
      totalAdditionalPercent: Math.round(totalAdditionalPercent * 10000) / 10000,
      effectiveProfitMargin: Math.round(effectiveProfitMargin * 10000) / 10000,
      breakdown,
    };
  }

  /**
   * إنشاء ملف مالي من قالب جاهز
   */
  createFromPreset(presetKey: string, companyName: string): CompanyFinancialProfile {
    const preset = PRESET_PROFILES[presetKey];
    if (!preset) {
      throw new Error(`القالب "${presetKey}" غير موجود. القوالب المتاحة: ${Object.keys(PRESET_PROFILES).join(', ')}`);
    }
    return {
      id: `profile_${Date.now()}`,
      companyName,
      ...preset,
    };
  }

  /**
   * طباعة تقرير مالي مفصل
   */
  printReport(profile: CompanyFinancialProfile, factors: FinancialFactors, projectDirectCost: number): void {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 التقرير المالي — ${profile.companyName}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`🏢 النوع: ${profile.nationality === 'saudi' ? 'سعودية' : profile.nationality === 'foreign' ? 'أجنبية' : 'مختلطة'} | الحجم: ${profile.size}`);
    console.log(`📁 المشاريع: ${profile.activeProjectsCount} | تحميل هذا المشروع: ${profile.thisProjectLoadPercent}%`);
    console.log(`${'─'.repeat(60)}`);

    for (const line of factors.breakdown) {
      if (line.amount > 0 || line.percent > 0) {
        console.log(`   ${line.nameAr}: ${line.amount > 0 ? line.amount.toLocaleString() + ' ر.س' : ''} (${line.percent}%)`);
      } else {
        console.log(`   ${line.nameAr}`);
      }
    }

    console.log(`${'─'.repeat(60)}`);
    console.log(`   📌 إجمالي الإشراف: ${(factors.totalOverheadPercent * 100).toFixed(2)}%`);
    console.log(`   📌 إجمالي الإضافات: ${(factors.totalAdditionalPercent * 100).toFixed(2)}%`);
    console.log(`   📌 هامش الربح الفعلي في العطاء: ${(factors.effectiveProfitMargin * 100).toFixed(2)}%`);

    const adjustedCost = projectDirectCost * (1 + factors.totalAdditionalPercent);
    const sellingPrice = adjustedCost * (1 + factors.effectiveProfitMargin);
    console.log(`\n   💰 التكلفة المباشرة: ${projectDirectCost.toLocaleString()} ر.س`);
    console.log(`   💰 التكلفة بعد الإضافات: ${Math.round(adjustedCost).toLocaleString()} ر.س`);
    console.log(`   🏷️ سعر البيع المقترح: ${Math.round(sellingPrice).toLocaleString()} ر.س`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}

export const companyFinancialEngine = new CompanyFinancialEngine();
