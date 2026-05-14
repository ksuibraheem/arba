/**
 * ARBA V9.0 — Confidence Scoring System
 * نظام تقييم الثقة بالسعر
 * 
 * كل سعر يُقيّم من 0 إلى 100:
 * - 90+ = سعر موثوق (من مشاريع فعلية متعددة)
 * - 70-89 = سعر مرجعي معتمد (benchmark)
 * - 50-69 = تقدير بناءً على فئة مشابهة
 * - <50 = تخمين — يحتاج مراجعة بشرية
 */

export interface ConfidenceScore {
  score: number;          // 0-100
  level: 'high' | 'medium' | 'low' | 'guess';
  label: string;          // عرض للمستخدم
  icon: string;
  sources: string[];      // مصادر السعر
}

/**
 * يحسب درجة الثقة بناءً على عدة عوامل:
 * 1. مصدر السعر (ملف العميل vs مرجعي vs تخمين)
 * 2. عدد المشاريع السابقة اللي استخدمت نفس السعر
 * 3. هل البند مصنّف بدقة أو بشكل عام
 * 4. هل السعر مدعوم بعروض موردين
 */
export function calculateConfidence(params: {
  pricingTier: 'original' | 'benchmark' | 'unpriced';
  classificationMatched: boolean;
  ruleId: string | null;
  priority: number;        // أولوية القاعدة (أعلى = أدق)
  learningCount?: number;  // عدد مرات التعلم من مشاريع سابقة
  hasSupplierQuote?: boolean;
  commodityRiskFactor?: number;
}): ConfidenceScore {
  let score = 0;
  const sources: string[] = [];

  // ═══ العامل 1: مصدر السعر (40 نقطة) ═══
  if (params.pricingTier === 'original') {
    score += 40;
    sources.push('سعر من ملف العميل');
  } else if (params.pricingTier === 'benchmark') {
    score += 25;
    sources.push('سعر مرجعي من قاعدة البيانات');
  } else {
    score += 0;
    sources.push('بدون سعر');
  }

  // ═══ العامل 2: دقة التصنيف (25 نقطة) ═══
  if (params.classificationMatched) {
    // أولوية القاعدة تعكس الدقة: 100 = ممتاز، 50 = عام
    const classScore = Math.min(25, Math.round((params.priority / 100) * 25));
    score += classScore;
    sources.push(`تصنيف بأولوية ${params.priority}`);
  }

  // ═══ العامل 3: التعلم من المشاريع السابقة (20 نقطة) ═══
  if (params.learningCount && params.learningCount > 0) {
    const learnScore = Math.min(20, params.learningCount * 5); // 5 نقاط لكل مشروع (max 4)
    score += learnScore;
    sources.push(`${params.learningCount} مشاريع سابقة`);
  }

  // ═══ العامل 4: عرض مورد (10 نقاط) ═══
  if (params.hasSupplierQuote) {
    score += 10;
    sources.push('مدعوم بعرض مورد');
  }

  // ═══ العامل 5: استقرار السلعة (5 نقاط) ═══
  if (params.commodityRiskFactor && params.commodityRiskFactor < 1.05) {
    score += 5;
    sources.push('سلعة مستقرة');
  } else if (params.commodityRiskFactor && params.commodityRiskFactor > 1.15) {
    score -= 5;
    sources.push('⚠️ سلعة متقلبة');
  }

  // تأكد أن النتيجة بين 0 و 100
  score = Math.max(0, Math.min(100, score));

  // تحديد المستوى
  let level: ConfidenceScore['level'];
  let label: string;
  let icon: string;

  if (score >= 90) {
    level = 'high';
    label = 'ثقة عالية';
    icon = '🟢';
  } else if (score >= 70) {
    level = 'medium';
    label = 'ثقة متوسطة';
    icon = '🟡';
  } else if (score >= 50) {
    level = 'low';
    label = 'ثقة منخفضة';
    icon = '🟠';
  } else {
    level = 'guess';
    label = 'تخمين — يحتاج مراجعة';
    icon = '🔴';
  }

  return { score, level, label, icon, sources };
}

/**
 * يحسب متوسط الثقة لمجموعة بنود (للملخص النهائي)
 */
export function averageConfidence(scores: ConfidenceScore[]): {
  avgScore: number;
  distribution: { high: number; medium: number; low: number; guess: number };
} {
  if (scores.length === 0) return { avgScore: 0, distribution: { high: 0, medium: 0, low: 0, guess: 0 } };

  const avgScore = Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
  const distribution = {
    high: scores.filter(s => s.level === 'high').length,
    medium: scores.filter(s => s.level === 'medium').length,
    low: scores.filter(s => s.level === 'low').length,
    guess: scores.filter(s => s.level === 'guess').length,
  };

  return { avgScore, distribution };
}
