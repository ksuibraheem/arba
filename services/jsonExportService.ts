/**
 * ARBA JSON Export Service v1.0
 * خدمة تصدير JSON مضغوط ومحدد الحقول مسبقاً
 *
 * يغطي جميع البيانات (الخيار 6):
 *   1. بيانات المشروع (metadata)
 *   2. بنود التسعير المحسوبة (items)
 *   3. المخطط الهندسي (blueprint)
 *   4. تقرير الذكاء الإدراكي (insights)
 *   5. الموردين (suppliers)
 *   6. ملخص مالي (financials)
 *
 * المخرج: JSON minified بحقول مختصرة (short keys) لتقليل الحجم
 */

import { AppState, CalculatedItem, Language } from '../types';
import { CalculationResult } from '../utils/calculations';
import { InsightReport } from './goldenOutputService';

// ====================== Compact Schema Types ======================

/** بند تسعير مضغوط */
interface CItem {
  id: string;       // رقم البند
  n: string;        // الاسم
  cat: string;      // التصنيف
  u: string;        // الوحدة
  q: number;        // الكمية
  mc: number;       // تكلفة مواد
  lc: number;       // تكلفة عمالة
  dc: number;       // تكلفة مباشرة
  oh: number;       // نصيب أعباء
  tc: number;       // إجمالي تكلفة
  pr: number;       // ربح
  up: number;       // سعر الوحدة النهائي
  tp: number;       // إجمالي السطر
  sup: string;      // المورد المختار
  sbc: string;      // مرجع الكود
  ps?: string;      // حالة الربح
  w?: string[];     // تحذيرات الدماغ
  sl?: string;      // وصف النطاق
  ez?: string;      // منطقة الارتفاع
}

/** طابق مضغوط */
interface CFloor {
  id: string;
  nm: string;       // الاسم
  a: number;        // المساحة
  h: number;        // الارتفاع
  st: string;       // نوع السقف
  cc: number;       // عدد الأعمدة
  zn: { id: string; nm: string; a: number; t: string }[];  // مناطق
}

/** بيانات المشروع المضغوطة */
interface CMeta {
  cn: string;       // اسم العميل
  cp: string;       // هاتف العميل
  pn: string;       // اسم المشروع
  pa: string;       // عنوان المشروع
  dn: string;       // رقم الصك
  bp: string;       // رخصة البناء
  qn: string;       // رقم العرض
  qd: string;       // تاريخ العرض
  co: string;       // اسم الشركة
  vat: number;      // نسبة الضريبة
  pt: string;       // شروط الدفع
  dm: number;       // مدة المشروع (أشهر)
  sw: string;       // نطاق العمل
}

/** المخطط المضغوط */
interface CBlueprint {
  pl: number;       // طول القطعة
  pw: number;       // عرض القطعة
  sf: number;       // ارتداد أمامي
  ss: number;       // ارتداد جانبي
  sr?: number;      // ارتداد خلفي
  fl: CFloor[];     // الطوابق
  ex?: {            // بيانات الحفر
    ed: number; sr: boolean; st: number; zl: number;
    sh?: boolean; dt?: string; wt?: number;
  };
  fn?: {            // بيانات الأساسات
    t: string; nh: number; tbd: number; tbw: number;
    fd: number; fw: number; rt: number;
  };
  cw?: number;      // عرض العمود
  cd?: number;      // عمق العمود
}

/** ملخص مالي */
interface CFinancials {
  td: number;       // إجمالي مباشر
  to: number;       // إجمالي أعباء
  tp: number;       // إجمالي ربح
  fp: number;       // السعر النهائي
  tcv: number;      // إجمالي الخرسانة
  tlc: number;      // إجمالي عمالة
  tmc: number;      // إجمالي مواد
  cpsm: number;     // تكلفة/م²
  pm: number;       // هامش الربح %
  vat: number;      // قيمة الضريبة
  fpv: number;      // السعر مع الضريبة
}

/** مورد مضغوط */
interface CSupplier {
  id: string;
  nm: string;       // الاسم
  tr: string;       // الفئة
  pm: number;       // معامل السعر
  or?: string;      // المنشأ
}

/** تقرير الذكاء المضغوط */
interface CInsight {
  gs: string;       // الجملة الذهبية
  fa: string;       // التحليل المالي
  cf: number;       // الثقة
  sc: boolean;      // ندرة
  sa: boolean;      // موسمي
  rm: boolean;      // موقع بعيد
  dv: boolean;      // انحرافات
  cd: number;       // انحرافات حرجة
  scA?: { mc: string; sv: string; ms: string }[];  // تنبيهات ندرة
  dvA?: { id: string; nm: string; dv: number; sv: string }[];  // تنبيهات انحراف
}

/** مخرج شامل — الخيار 6 */
export interface ArbaCompactExport {
  _v: string;       // إصدار المخطط
  _ts: string;      // الطابع الزمني
  _sys: string;     // اسم النظام
  cfg: {            // إعدادات المشروع
    pt: string;     // نوع المشروع
    loc: string;    // الموقع
    sol: string;    // نوع التربة
    la: number;     // مساحة الأرض
    ba: number;     // مساحة البناء
    fl: number;     // عدد الطوابق
    em: string;     // طريقة التنفيذ
    ps: string;     // استراتيجية التسعير
    pm: number;     // هامش الربح
    ds: string;     // نطاق التسليم
    es: string[];   // الأقسام المفعّلة
  };
  meta: CMeta;
  bp: CBlueprint;
  items: CItem[];
  fin: CFinancials;
  sup: CSupplier[];
  ins: CInsight;
}

// ====================== Mapper Functions ======================

function mapItem(item: CalculatedItem, lang: Language): CItem {
  return {
    id: item.id,
    n: item.displayName || (typeof item.name === 'object' ? item.name[lang] : String(item.name)),
    cat: item.category,
    u: item.unit,
    q: r2(item.qty),
    mc: r2(item.matCost),
    lc: r2(item.labCost),
    dc: r2(item.directUnitCost),
    oh: r2(item.overheadUnitShare),
    tc: r2(item.totalUnitCost),
    pr: r2(item.profitAmount),
    up: r2(item.finalUnitPrice),
    tp: r2(item.totalLinePrice),
    sup: item.selectedSupplier?.id || 'market',
    sbc: item.sbc || '',
    ...(item.profitStatus ? { ps: item.profitStatus } : {}),
    ...(item.brainWarnings && item.brainWarnings.length > 0 ? { w: item.brainWarnings } : {}),
    ...(item.scopeLabel ? { sl: item.scopeLabel } : {}),
    ...(item.elevationZone ? { ez: item.elevationZone } : {}),
  };
}

function mapMeta(state: AppState): CMeta {
  const m = state.metadata;
  return {
    cn: m.clientName,
    cp: m.clientPhone,
    pn: m.projectName,
    pa: m.projectAddress,
    dn: m.deedNumber,
    bp: m.buildingPermitNumber,
    qn: m.quotationNumber,
    qd: m.quotationDate,
    co: m.companyName,
    vat: m.vatPercentage,
    pt: m.paymentTerms,
    dm: m.projectDurationMonths,
    sw: m.scopeOfWork,
  };
}

function mapBlueprint(state: AppState): CBlueprint {
  const b = state.blueprint;
  const result: CBlueprint = {
    pl: b.plotLength,
    pw: b.plotWidth,
    sf: b.setbackFront,
    ss: b.setbackSide,
    ...(b.setbackRear !== undefined ? { sr: b.setbackRear } : {}),
    fl: b.floors.map(f => ({
      id: f.id,
      nm: f.name,
      a: f.area,
      h: f.height,
      st: f.slabType,
      cc: f.columnsCount,
      zn: f.zones.map(z => ({ id: z.id, nm: z.name, a: z.area, t: z.type })),
    })),
    ...(b.columnWidth_cm ? { cw: b.columnWidth_cm } : {}),
    ...(b.columnDepth_cm ? { cd: b.columnDepth_cm } : {}),
  };

  if (b.excavation) {
    result.ex = {
      ed: b.excavation.excavationDepth,
      sr: b.excavation.soilReplacementNeeded,
      st: b.excavation.soilReplacementThickness,
      zl: b.excavation.zeroLevel,
      ...(b.excavation.shoringRequired ? { sh: true } : {}),
      ...(b.excavation.dewateringType ? { dt: b.excavation.dewateringType } : {}),
      ...(b.excavation.waterTableDepth ? { wt: b.excavation.waterTableDepth } : {}),
    };
  }

  if (b.foundation) {
    result.fn = {
      t: b.foundation.type,
      nh: b.foundation.neckColumnHeight,
      tbd: b.foundation.tieBeamDepth,
      tbw: b.foundation.tieBeamWidth,
      fd: b.foundation.footingDepth,
      fw: b.foundation.footingWidth,
      rt: b.foundation.raftThickness,
    };
  }

  return result;
}

function mapFinancials(result: CalculationResult, state: AppState): CFinancials {
  const vatRate = state.metadata.vatPercentage || 15;
  const vatAmount = r2(result.finalPrice * (vatRate / 100));
  const costPerSqm = state.buildArea > 0 ? r2(result.finalPrice / state.buildArea) : 0;
  const marginPercent = result.finalPrice > 0
    ? r2((result.totalProfit / result.finalPrice) * 100)
    : 0;

  return {
    td: r2(result.totalDirect),
    to: r2(result.totalOverhead),
    tp: r2(result.totalProfit),
    fp: r2(result.finalPrice),
    tcv: r2(result.totalConcreteVolume),
    tlc: r2(result.totalLaborCost),
    tmc: r2(result.totalMaterialCost),
    cpsm: costPerSqm,
    pm: marginPercent,
    vat: vatAmount,
    fpv: r2(result.finalPrice + vatAmount),
  };
}

function mapSuppliers(items: CalculatedItem[]): CSupplier[] {
  const seen = new Set<string>();
  const suppliers: CSupplier[] = [];
  items.forEach(item => {
    const s = item.selectedSupplier;
    if (s && !seen.has(s.id)) {
      seen.add(s.id);
      const nameStr = typeof s.name === 'object' ? (s.name.ar || s.name.en || s.id) : String(s.name);
      suppliers.push({
        id: s.id,
        nm: nameStr,
        tr: s.tier,
        pm: s.priceMultiplier,
        ...(s.origin ? { or: s.origin } : {}),
      });
    }
  });
  return suppliers;
}

function mapInsight(report: InsightReport | null, lang: Language): CInsight {
  if (!report) {
    return { gs: '', fa: '', cf: 0, sc: false, sa: false, rm: false, dv: false, cd: 0 };
  }
  return {
    gs: report.goldenSentence?.[lang] || '',
    fa: report.financialAnalysisText?.[lang] || '',
    cf: r2(report.confidence * 100),
    sc: report.hasScarcity,
    sa: report.hasSeasonalAdjustment,
    rm: report.isRemoteLocation,
    dv: report.hasDeviations,
    cd: report.criticalDeviations,
    ...(report.scarcityAlerts.length > 0
      ? {
          scA: report.scarcityAlerts.map(a => ({
            mc: a.materialCategory,
            sv: a.severity,
            ms: a.explanation?.[lang] || '',
          })),
        }
      : {}),
    ...(report.deviationAlerts.length > 0
      ? {
          dvA: report.deviationAlerts.map(d => ({
            id: d.itemId,
            nm: d.itemName || d.itemId,
            dv: r2(d.deviationPercent),
            sv: d.severity,
          })),
        }
      : {}),
  };
}

// ====================== Utility ======================

/** Round to 2 decimals */
function r2(n: number): number {
  return Math.round((n || 0) * 100) / 100;
}

// ====================== Main Export Function ======================

/**
 * Build the full compact JSON export payload.
 *
 * @param state           – AppState (current project state)
 * @param calcResult      – CalculationResult from calculateProjectCosts()
 * @param insightReport   – InsightReport from goldenOutputService (optional)
 * @param lang            – Language for string fields (default: state.language)
 * @returns ArbaCompactExport – compact object, ready for JSON.stringify()
 */
export function buildCompactExport(
  state: AppState,
  calcResult: CalculationResult,
  insightReport?: InsightReport | null,
  lang?: Language,
): ArbaCompactExport {
  const effectiveLang = lang || state.language || 'ar';

  return {
    _v: '1.0',
    _ts: new Date().toISOString(),
    _sys: 'ARBA Pricing Engine',
    cfg: {
      pt: state.projectType,
      loc: state.location,
      sol: state.soilType,
      la: state.landArea,
      ba: state.buildArea,
      fl: state.floors,
      em: state.executionMethod,
      ps: state.pricingStrategy,
      pm: state.profitMargin,
      ds: state.deliveryScope,
      es: state.enabledSections,
    },
    meta: mapMeta(state),
    bp: mapBlueprint(state),
    items: calcResult.items.map(i => mapItem(i, effectiveLang)),
    fin: mapFinancials(calcResult, state),
    sup: mapSuppliers(calcResult.items),
    ins: mapInsight(insightReport || null, effectiveLang),
  };
}

/**
 * Generate minified JSON string from the compact export.
 */
export function toMinifiedJSON(
  state: AppState,
  calcResult: CalculationResult,
  insightReport?: InsightReport | null,
  lang?: Language,
): string {
  const payload = buildCompactExport(state, calcResult, insightReport, lang);
  return JSON.stringify(payload);
}

/**
 * Trigger browser download of the minified JSON file.
 */
export function downloadCompactJSON(
  state: AppState,
  calcResult: CalculationResult,
  insightReport?: InsightReport | null,
  lang?: Language,
): void {
  const json = toMinifiedJSON(state, calcResult, insightReport, lang);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const projectName = state.metadata.projectName || 'arba-project';
  const safeName = projectName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `${safeName}_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ====================== Field Map (for documentation / schema consumers) ======================

/**
 * Human-readable field name map — useful for external consumers parsing the compact JSON.
 * This is NOT included in the export; it's here for reference.
 */
export const FIELD_MAP: Record<string, Record<'ar' | 'en', string>> = {
  // Root
  '_v':   { ar: 'إصدار المخطط', en: 'Schema Version' },
  '_ts':  { ar: 'الطابع الزمني', en: 'Timestamp' },
  '_sys': { ar: 'اسم النظام', en: 'System Name' },

  // Config
  'cfg.pt':  { ar: 'نوع المشروع', en: 'Project Type' },
  'cfg.loc': { ar: 'الموقع', en: 'Location' },
  'cfg.sol': { ar: 'نوع التربة', en: 'Soil Type' },
  'cfg.la':  { ar: 'مساحة الأرض', en: 'Land Area' },
  'cfg.ba':  { ar: 'مساحة البناء', en: 'Build Area' },
  'cfg.fl':  { ar: 'عدد الطوابق', en: 'Floors Count' },
  'cfg.em':  { ar: 'طريقة التنفيذ', en: 'Execution Method' },
  'cfg.ps':  { ar: 'استراتيجية التسعير', en: 'Pricing Strategy' },
  'cfg.pm':  { ar: 'هامش الربح', en: 'Profit Margin' },
  'cfg.ds':  { ar: 'نطاق التسليم', en: 'Delivery Scope' },
  'cfg.es':  { ar: 'الأقسام المفعّلة', en: 'Enabled Sections' },

  // Items
  'items[].id': { ar: 'رقم البند', en: 'Item ID' },
  'items[].n':  { ar: 'اسم البند', en: 'Item Name' },
  'items[].cat':{ ar: 'التصنيف', en: 'Category' },
  'items[].u':  { ar: 'الوحدة', en: 'Unit' },
  'items[].q':  { ar: 'الكمية', en: 'Quantity' },
  'items[].mc': { ar: 'تكلفة المواد', en: 'Material Cost' },
  'items[].lc': { ar: 'تكلفة العمالة', en: 'Labor Cost' },
  'items[].dc': { ar: 'التكلفة المباشرة', en: 'Direct Unit Cost' },
  'items[].oh': { ar: 'نصيب الأعباء', en: 'Overhead Share' },
  'items[].tc': { ar: 'إجمالي تكلفة الوحدة', en: 'Total Unit Cost' },
  'items[].pr': { ar: 'ربح الوحدة', en: 'Profit per Unit' },
  'items[].up': { ar: 'سعر الوحدة النهائي', en: 'Final Unit Price' },
  'items[].tp': { ar: 'إجمالي السطر', en: 'Total Line Price' },
  'items[].sup':{ ar: 'المورد', en: 'Supplier' },
  'items[].sbc':{ ar: 'مرجع الكود', en: 'SBC Reference' },

  // Financials
  'fin.td':   { ar: 'إجمالي التكلفة المباشرة', en: 'Total Direct Cost' },
  'fin.to':   { ar: 'إجمالي الأعباء', en: 'Total Overhead' },
  'fin.tp':   { ar: 'إجمالي الربح', en: 'Total Profit' },
  'fin.fp':   { ar: 'السعر النهائي', en: 'Final Price' },
  'fin.cpsm': { ar: 'تكلفة المتر المربع', en: 'Cost per sqm' },
  'fin.pm':   { ar: 'هامش الربح %', en: 'Profit Margin %' },
  'fin.vat':  { ar: 'قيمة الضريبة', en: 'VAT Amount' },
  'fin.fpv':  { ar: 'السعر شامل الضريبة', en: 'Final Price + VAT' },
};
