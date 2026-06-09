/**
 * ARBA V11.3 — Price Protection Service
 * خدمة حماية الأسعار — 4 طبقات فحص
 * 
 * يمنع ظهور أسعار خاطئة قبل وصولها للمستخدم
 * يعمل تلقائياً بعد التسعير وقبل العرض
 */

// =================== Types ===================

export interface PriceAnomaly {
  type: 'item_too_high' | 'item_too_low' | 'total_too_high' | 'total_too_low' | 'zero_price' | 'outlier' | 'unit_mismatch';
  itemIndex?: number;
  itemDesc?: string;
  description: string;
  expected: number;
  actual: number;
  severity: 'info' | 'warning' | 'critical';
  autoFixed: boolean;
  fixedValue?: number;
}

export interface PriceValidation {
  isValid: boolean;
  totalCost: number;
  correctedTotalCost: number;
  itemCount: number;
  avgCostPerItem: number;
  estimatedCostPerM2: number | null;
  anomalies: PriceAnomaly[];
  anomalyCount: { critical: number; warning: number; info: number };
  overallSeverity: 'ok' | 'warning' | 'critical';
  corrections: number;
  summary: string;
}

export interface BOQItem {
  description: string;
  qty: number | null;
  unit: string;
  estimatedPrice: number | null;
  source?: string;
  isAccessory?: boolean;
  confidence?: number;
  [key: string]: any;
}

// =================== Constants ===================

/** Expected cost per m² (SAR) — Saudi construction market 2024-2026 */
const EXPECTED_COST_PER_M2 = {
  min: 1800,      // مبنى بسيط (مستودع، سياج)
  low: 2500,      // مباني اقتصادية
  typical: 4500,  // فلل ومباني متوسطة
  high: 8000,     // مباني حكومية/عسكرية فاخرة
  max: 15000,     // مستشفيات، مباني ذكية
};

/** Maximum reasonable total cost per item (SAR) — any single BOQ item */
const MAX_ITEM_TOTAL: Record<string, number> = {
  'عدد': 500000,     // مصعد/مولد كبير × كميات
  'م.ط': 200000,     // أنابيب طويلة جداً
  'م2': 1500000,     // أعمال أرضيات كبيرة
  'م3': 800000,      // خرسانة كبيرة
  'طن': 2000000,     // حديد تسليح
  'كجم': 200000,     // مواد خفيفة بالكيلو
  'مقطوعية': 500000, // بند مقطوعية
  'طقم': 100000,     // أطقم
  'نقطة': 300000,    // نقاط كهرباء كثيرة
  'default': 500000,
};

/** Average unit price benchmarks (SAR) for sanity checking */
const UNIT_PRICE_BENCHMARKS: Record<string, { avg: number; max: number }> = {
  'عدد': { avg: 2000, max: 50000 },
  'م.ط': { avg: 150, max: 800 },
  'م2': { avg: 200, max: 1200 },
  'م3': { avg: 500, max: 3000 },
  'طن': { avg: 4000, max: 10000 },
  'كجم': { avg: 10, max: 50 },
  'مقطوعية': { avg: 15000, max: 100000 },
  'طقم': { avg: 1500, max: 10000 },
  'نقطة': { avg: 250, max: 1500 },
};

// =================== Service ===================

class PriceProtectionService {

  /**
   * الفحص الرئيسي: يفحص كل البنود + الإجمالي
   * يعمل تلقائياً قبل عرض النتائج
   * @returns تقرير التحقق + التصحيحات التلقائية
   */
  validate(items: BOQItem[], projectAreaM2?: number): PriceValidation {
    const anomalies: PriceAnomaly[] = [];
    let corrections = 0;
    let correctedTotal = 0;

    // ═══ Phase 1: فحص كل بند على حدة ═══
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const price = item.estimatedPrice || 0;
      const qty = item.qty || 1;
      const unit = item.unit || '';

      // 1a. بند بسعر صفري مع كمية موجودة
      if (price <= 0 && qty > 0 && !item.isAccessory) {
        anomalies.push({
          type: 'zero_price', itemIndex: i,
          itemDesc: item.description?.substring(0, 60),
          description: `بند بدون سعر: "${item.description?.substring(0, 40)}"`,
          expected: qty * (UNIT_PRICE_BENCHMARKS[unit]?.avg || 300),
          actual: 0, severity: 'warning', autoFixed: false,
        });
      }

      // 1b. سعر وحدة مبالغ فيه
      if (price > 0 && qty > 0) {
        const unitPrice = price / qty;
        const benchmark = UNIT_PRICE_BENCHMARKS[unit];
        
        if (benchmark && unitPrice > benchmark.max * 2) {
          // سعر الوحدة > ضعف السقف المعقول → auto-correct
          const correctedPrice = Math.round(benchmark.avg * qty);
          anomalies.push({
            type: 'item_too_high', itemIndex: i,
            itemDesc: item.description?.substring(0, 60),
            description: `سعر وحدة مبالغ: ${Math.round(unitPrice)} ر.س/${unit} (المتوقع ≤${benchmark.max})`,
            expected: correctedPrice, actual: price,
            severity: 'critical', autoFixed: true,
            fixedValue: correctedPrice,
          });
          item.estimatedPrice = correctedPrice;
          corrections++;
        }
      }

      // 1c. إجمالي البند تجاوز السقف
      const maxTotal = MAX_ITEM_TOTAL[unit] || MAX_ITEM_TOTAL['default'];
      if (price > maxTotal) {
        const correctedPrice = Math.round(maxTotal * 0.5); // نصف السقف كتقدير آمن
        anomalies.push({
          type: 'item_too_high', itemIndex: i,
          itemDesc: item.description?.substring(0, 60),
          description: `إجمالي بند تجاوز ${maxTotal.toLocaleString()} ر.س`,
          expected: correctedPrice, actual: price,
          severity: 'critical', autoFixed: true,
          fixedValue: correctedPrice,
        });
        item.estimatedPrice = correctedPrice;
        corrections++;
      }

      correctedTotal += (item.estimatedPrice || 0);
    }

    // ═══ Phase 2: فحص Outliers (IQR Method) ═══
    const prices = items
      .filter(i => (i.estimatedPrice || 0) > 0 && !i.isAccessory)
      .map(i => i.estimatedPrice!);
    
    if (prices.length >= 5) {
      const sorted = [...prices].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const upperFence = q3 + 3 * iqr; // 3× IQR = extreme outlier

      for (let i = 0; i < items.length; i++) {
        const price = items[i].estimatedPrice || 0;
        if (price > upperFence && price > 100000) {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          const correctedPrice = Math.round(Math.min(price, avg * 3));
          
          if (correctedPrice < price) {
            anomalies.push({
              type: 'outlier', itemIndex: i,
              itemDesc: items[i].description?.substring(0, 60),
              description: `بند شاذ (outlier): ${price.toLocaleString()} > حد ${Math.round(upperFence).toLocaleString()}`,
              expected: correctedPrice, actual: price,
              severity: 'critical', autoFixed: true,
              fixedValue: correctedPrice,
            });
            correctedTotal -= price;
            items[i].estimatedPrice = correctedPrice;
            correctedTotal += correctedPrice;
            corrections++;
          }
        }
      }
    }

    // ═══ Phase 3: فحص الإجمالي ═══
    const totalCost = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
    const avgPerItem = items.length > 0 ? totalCost / items.length : 0;
    
    // تقدير مساحة المشروع إذا غير متوفرة
    const estArea = projectAreaM2 || this.estimateProjectArea(items);
    const costPerM2 = estArea ? totalCost / estArea : null;

    // 3a. تكلفة/م² خارج النطاق
    if (costPerM2 !== null) {
      if (costPerM2 > EXPECTED_COST_PER_M2.max) {
        anomalies.push({
          type: 'total_too_high',
          description: `تكلفة/م² = ${Math.round(costPerM2).toLocaleString()} تتجاوز الحد ${EXPECTED_COST_PER_M2.max.toLocaleString()}`,
          expected: estArea * EXPECTED_COST_PER_M2.high,
          actual: totalCost, severity: 'critical', autoFixed: false,
        });
      } else if (costPerM2 < EXPECTED_COST_PER_M2.min) {
        anomalies.push({
          type: 'total_too_low',
          description: `تكلفة/م² = ${Math.round(costPerM2).toLocaleString()} أقل من الحد ${EXPECTED_COST_PER_M2.min.toLocaleString()}`,
          expected: estArea * EXPECTED_COST_PER_M2.low,
          actual: totalCost, severity: 'warning', autoFixed: false,
        });
      }
    }

    // 3b. متوسط البند مبالغ
    if (avgPerItem > 50000) {
      anomalies.push({
        type: 'total_too_high',
        description: `متوسط البند ${Math.round(avgPerItem).toLocaleString()} ر.س (المتوقع <50,000)`,
        expected: 5000, actual: avgPerItem,
        severity: avgPerItem > 200000 ? 'critical' : 'warning', autoFixed: false,
      });
    }

    // ═══ النتيجة ═══
    const critCount = anomalies.filter(a => a.severity === 'critical').length;
    const warnCount = anomalies.filter(a => a.severity === 'warning').length;
    const infoCount = anomalies.filter(a => a.severity === 'info').length;

    const overallSeverity: 'ok' | 'warning' | 'critical' =
      critCount > 0 ? 'critical' : warnCount > 0 ? 'warning' : 'ok';

    const correctedTotalCost = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

    // ملخص نصي
    const summary = overallSeverity === 'ok'
      ? `✅ الأسعار ضمن النطاق المتوقع — ${items.length} بند`
      : overallSeverity === 'warning'
        ? `⚠️ ${warnCount} تنبيه — يحتاج مراجعة`
        : `🔴 ${critCount} خطأ حرج — تم تصحيح ${corrections} بند تلقائياً`;

    // حفظ للتشخيص اليومي
    this.saveValidationLog(totalCost, correctedTotalCost, anomalies.length, corrections);

    return {
      isValid: overallSeverity !== 'critical',
      totalCost, correctedTotalCost, itemCount: items.length,
      avgCostPerItem: avgPerItem,
      estimatedCostPerM2: costPerM2,
      anomalies,
      anomalyCount: { critical: critCount, warning: warnCount, info: infoCount },
      overallSeverity, corrections, summary,
    };
  }

  /**
   * تقدير مساحة المشروع من البنود
   * يبحث عن بنود م² كبيرة (أرضيات، لياسة، بلاط)
   */
  private estimateProjectArea(items: BOQItem[]): number {
    const areaItems = items.filter(i =>
      i.unit === 'م2' && (i.qty || 0) > 50 &&
      /أرضي|بلاط|لياسة|دهان|سيراميك|بورسلان|خرسانة.*أرضي/i.test(i.description || '')
    );
    if (areaItems.length > 0) {
      // أكبر مساحة = تقدير جيد لمساحة المشروع
      return Math.max(...areaItems.map(i => i.qty || 0));
    }
    // fallback: تقدير من عدد البنود
    return Math.max(items.length * 3, 300); // ~3م² لكل بند كتقدير خام
  }

  /**
   * حفظ سجل التحقق لاستخدامه بواسطة brainSelfDiagnostic
   */
  private saveValidationLog(
    originalTotal: number, correctedTotal: number,
    anomalyCount: number, corrections: number
  ): void {
    try {
      const logs = JSON.parse(localStorage.getItem('arba_price_validation_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        originalTotal, correctedTotal,
        anomalyCount, corrections,
        reductionPercent: originalTotal > 0
          ? Math.round(((originalTotal - correctedTotal) / originalTotal) * 100)
          : 0,
      });
      // Keep last 50 logs
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      localStorage.setItem('arba_price_validation_logs', JSON.stringify(logs));
    } catch {}
  }

  /**
   * Get validation statistics for diagnostic
   */
  getStats(): { totalValidations: number; totalCorrections: number; avgReduction: number } {
    try {
      const logs = JSON.parse(localStorage.getItem('arba_price_validation_logs') || '[]');
      const totalCorrections = logs.reduce((s: number, l: any) => s + (l.corrections || 0), 0);
      const avgReduction = logs.length > 0
        ? Math.round(logs.reduce((s: number, l: any) => s + (l.reductionPercent || 0), 0) / logs.length)
        : 0;
      return { totalValidations: logs.length, totalCorrections, avgReduction };
    } catch {
      return { totalValidations: 0, totalCorrections: 0, avgReduction: 0 };
    }
  }
}

export const priceProtectionService = new PriceProtectionService();
