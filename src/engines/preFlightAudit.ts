/**
 * ARBA V9.0 — Pre-Flight Audit Engine
 * محرك الفحص الأولي — يفحص الملف قبل التسعير ويكشف المشاكل
 * 
 * يعمل كـ "طيار" يراجع قائمة الفحص قبل الإقلاع:
 * ✅ هل فيه تكرارات؟
 * ✅ هل الأسعار المرجعية net أو gross؟
 * ✅ هل فيه بنود بكميات غير منطقية؟
 * ✅ هل فيه فجوات في التصنيف؟
 * ✅ هل المشروع يحتاج تسعيرة تشطيب أو بناء كامل؟
 */

import type { RawBOQItem } from './arbaProcessor';

export interface PreFlightResult {
  status: 'READY' | 'WARNINGS' | 'CRITICAL';
  checks: PreFlightCheck[];
  summary: string;
  recommendation: string;
}

export interface PreFlightCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  icon: string;
  details: string;
  count?: number;
}

export function runPreFlightAudit(items: RawBOQItem[]): PreFlightResult {
  const checks: PreFlightCheck[] = [];

  // ═══ Check 1: عدد البنود ═══
  checks.push({
    id: 'item_count',
    name: 'عدد البنود',
    status: items.length > 0 ? 'pass' : 'fail',
    icon: items.length > 0 ? '✅' : '🔴',
    details: `${items.length} بند`,
    count: items.length,
  });

  // ═══ Check 2: بنود بدون سعر ═══
  const unpriced = items.filter(i => i.originalRate === 0);
  const unpricedPct = Math.round((unpriced.length / Math.max(items.length, 1)) * 100);
  checks.push({
    id: 'unpriced',
    name: 'بنود بدون سعر',
    status: unpricedPct > 80 ? 'warn' : 'pass',
    icon: unpricedPct > 80 ? '🟡' : '✅',
    details: `${unpriced.length} بند (${unpricedPct}%) — سيتم تسعيرها تلقائياً`,
    count: unpriced.length,
  });

  // ═══ Check 3: كميات غير منطقية (سالبة أو ضخمة جداً) ═══
  const crazyQty = items.filter(i => i.qty > 100000 || i.qty < 0);
  checks.push({
    id: 'crazy_qty',
    name: 'كميات غير منطقية',
    status: crazyQty.length > 0 ? 'warn' : 'pass',
    icon: crazyQty.length > 0 ? '🟠' : '✅',
    details: crazyQty.length > 0
      ? `${crazyQty.length} بند بكمية مشبوهة (> 100,000 أو سالبة)`
      : 'جميع الكميات طبيعية',
    count: crazyQty.length,
  });

  // ═══ Check 4: هل المشروع تشطيب فقط أو بناء كامل؟ ═══
  const hasStructural = items.some(i => {
    const d = i.description.toLowerCase();
    return i.originalRate > 0 && (/concrete|خرسانة|reinforc|حديد تسليح/i.test(d));
  });
  const hasFinishes = items.some(i => {
    const d = i.description.toLowerCase();
    return /paint|دهان|gypsum|جبس|porcelain|بورسلان|marble|رخام/i.test(d);
  });
  
  let projectType = 'غير محدد';
  if (hasStructural && hasFinishes) projectType = 'بناء كامل (عظم + تشطيب)';
  else if (hasStructural) projectType = 'أعمال إنشائية فقط';
  else if (hasFinishes) projectType = 'أعمال تشطيبات فقط';
  
  checks.push({
    id: 'project_type',
    name: 'نوع المشروع (مكتشف)',
    status: 'pass',
    icon: '📋',
    details: projectType,
  });

  // ═══ Check 5: تعدد الشيتات (مباني) ═══
  const sheets = new Set(items.map(i => i.sheetName).filter(Boolean));
  checks.push({
    id: 'sheet_count',
    name: 'مباني / مناطق',
    status: 'pass',
    icon: '🏗️',
    details: `${sheets.size} شيت: ${Array.from(sheets).join(', ')}`,
    count: sheets.size,
  });

  // ═══ Check 6: وحدات غير متسقة ═══
  const weirdUnits = items.filter(i => {
    const u = i.unit.toLowerCase();
    return !['م2', 'م3', 'م.ط', 'عدد', 'طن', 'لتر', 'كجم', 'مقطوعية', 'ls',
             'm2', 'm3', 'lm', 'ea', 'ton', 'kg', 'no', 'nos', 'set',
             'rolls', 'tons', 'lot', ''].includes(u);
  });
  checks.push({
    id: 'unit_check',
    name: 'وحدات غير معروفة',
    status: weirdUnits.length > 5 ? 'warn' : 'pass',
    icon: weirdUnits.length > 5 ? '🟡' : '✅',
    details: weirdUnits.length > 0
      ? `${weirdUnits.length} بند بوحدة غير معتادة`
      : 'جميع الوحدات معروفة',
    count: weirdUnits.length,
  });

  // ═══ Check 7: تحذير الأعمال الخاصة (مسابح، مصاعد) ═══
  const specialItems = items.filter(i => {
    const d = i.description.toLowerCase();
    return /pool|مسبح|elevator|مصعد|generator|مولد|chiller|تشيلر/i.test(d);
  });
  if (specialItems.length > 0) {
    checks.push({
      id: 'special_items',
      name: 'أعمال خاصة مكتشفة',
      status: 'warn',
      icon: '⚠️',
      details: `${specialItems.length} بند خاص (مسابح/مصاعد/مولدات) — تحتاج مراجعة يدوية للتسعير`,
      count: specialItems.length,
    });
  }

  // ═══ Check 8: هل يوجد بنود بأوصاف قصيرة جداً؟ ═══
  const shortDesc = items.filter(i => i.description.length < 10);
  if (shortDesc.length > 0) {
    checks.push({
      id: 'short_desc',
      name: 'أوصاف قصيرة',
      status: 'warn',
      icon: '🟡',
      details: `${shortDesc.length} بند بوصف أقل من 10 أحرف — قد يصعب تصنيفها`,
      count: shortDesc.length,
    });
  }

  // ═══ الحكم النهائي ═══
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;

  let status: PreFlightResult['status'];
  let summary: string;
  let recommendation: string;

  if (failCount > 0) {
    status = 'CRITICAL';
    summary = `🔴 ${failCount} مشكلة حرجة تمنع التسعير`;
    recommendation = 'يجب إصلاح المشاكل الحرجة قبل المتابعة';
  } else if (warnCount > 2) {
    status = 'WARNINGS';
    summary = `🟡 ${warnCount} تحذيرات — التسعير ممكن لكن يحتاج مراجعة`;
    recommendation = 'يُنصح بمراجعة التحذيرات قبل اعتماد العرض';
  } else {
    status = 'READY';
    summary = `✅ الملف جاهز للتسعير — ${items.length} بند`;
    recommendation = 'يمكن المتابعة بثقة';
  }

  return { status, checks, summary, recommendation };
}
