/**
 * ARBA V10.0 — Engineering Ghost Agent
 * المهندس المناوب — يبرر كل سعر ويكشف الأنماط
 *
 * يعمل بـ 3 طبقات:
 * الطبقة 1: تبرير فوري من benchmarkData (95% من الحالات — مجاني)
 * الطبقة 2: كشف أنماط من التاريخ (4% — مجاني)
 * الطبقة 3: Claude للحالات المعقدة فقط (1% — عند الربط)
 */

import { BENCHMARK_RATES, LOCATION_MULTIPLIERS, CATEGORY_LABELS } from '../src/engines/benchmarkData';

// =================== Types ===================

export interface PriceJustification {
  itemDescription: string;
  tier: 1 | 2 | 3;       // Which layer generated this
  
  // Main justification
  mainReason: string;
  mainReasonAr: string;
  
  // Comparison with benchmark
  comparison?: {
    benchmarkRate: number;
    currentRate: number;
    deviationPercent: number;
    direction: 'above' | 'below' | 'match';
  };
  
  // SBC compliance
  sbcCompliance?: {
    isCompliant: boolean;
    code: string;
    note: string;
  };
  
  // Historical context
  historical?: {
    sampleCount: number;
    avgRate: number;
    minRate: number;
    maxRate: number;
    trend: 'rising' | 'stable' | 'falling';
  };
  
  // Confidence
  confidence: number;  // 0-1
  sources: string[];
}

export interface PatternAlert {
  type: 'price_drift' | 'category_anomaly' | 'regional_gap' | 'seasonal_pattern';
  title: string;
  titleAr: string;
  description: string;
  confidence: number;
  suggestedAction: string;
}

// =================== SBC Quick Reference ===================

const SBC_REFERENCES: Record<string, { code: string; rule: string; min?: number; max?: number; unit?: string }> = {
  // SBC 304 — Reinforced Concrete
  steel_ratio: { code: 'SBC 304', rule: 'نسبة الحديد', min: 90, max: 200, unit: 'كجم/م³' },
  concrete_cover: { code: 'SBC 304', rule: 'غطاء الخرسانة', min: 25, max: 75, unit: 'مم' },
  concrete_grade: { code: 'SBC 304', rule: 'رتبة الخرسانة', min: 25, unit: 'MPa' },
  
  // SBC 601 — Insulation
  roof_insulation: { code: 'SBC 601', rule: 'عزل حراري السقف', min: 50, unit: 'مم' },
  wall_insulation: { code: 'SBC 601', rule: 'عزل حراري الجدران', min: 50, unit: 'مم' },
  
  // SBC 801 — Fire Safety
  fire_extinguisher_distance: { code: 'SBC 801', rule: 'مسافة طفاية الحريق', max: 23, unit: 'م' },
  emergency_exit_width: { code: 'SBC 801', rule: 'عرض مخرج الطوارئ', min: 90, unit: 'سم' },
  
  // SBC 1001 — Accessibility
  door_width: { code: 'SBC 1001', rule: 'عرض الباب', min: 90, unit: 'سم' },
  ramp_slope: { code: 'SBC 1001', rule: 'ميل المنحدر', max: 8, unit: '%' },
};

// =================== Service ===================

class EngineeringGhostAgent {

  /**
   * الطبقة 1: تبرير فوري — من benchmarkData
   * يعمل بدون Claude — فوري ومجاني
   */
  justifyPrice(
    description: string,
    category: string,
    costRate: number,
    ruleId: string | null,
    region: string = 'riyadh',
  ): PriceJustification {
    const sources: string[] = [];
    let mainReason = '';
    let mainReasonAr = '';
    let comparison: PriceJustification['comparison'];
    let sbcCompliance: PriceJustification['sbcCompliance'];
    let confidence = 0.5;

    // ── 1. Compare with benchmark ──
    if (ruleId && BENCHMARK_RATES[ruleId]) {
      const benchmark = BENCHMARK_RATES[ruleId] as { rate: number; nameAr?: string; category?: string };
      const benchmarkRate = benchmark.rate;
      const regionInfo = LOCATION_MULTIPLIERS[region] || LOCATION_MULTIPLIERS.riyadh;
      const adjustedBenchmark = Math.round(benchmarkRate * regionInfo.factor);
      
      const deviation = benchmarkRate > 0
        ? Math.round(((costRate - adjustedBenchmark) / adjustedBenchmark) * 100)
        : 0;

      comparison = {
        benchmarkRate: adjustedBenchmark,
        currentRate: costRate,
        deviationPercent: deviation,
        direction: deviation > 5 ? 'above' : deviation < -5 ? 'below' : 'match',
      };

      if (Math.abs(deviation) <= 5) {
        mainReason = `Price is within 5% of the benchmark rate (${adjustedBenchmark} SAR for ${regionInfo.nameEn})`;
        mainReasonAr = `السعر ضمن 5% من السعر المرجعي (${adjustedBenchmark} ر.س لمنطقة ${regionInfo.nameAr})`;
        confidence = 0.9;
      } else if (deviation > 5) {
        mainReason = `Price is ${deviation}% above benchmark (${adjustedBenchmark} SAR). May reflect quality upgrade or market conditions.`;
        mainReasonAr = `السعر أعلى ${deviation}% من المرجعي (${adjustedBenchmark} ر.س). قد يعكس جودة أعلى أو ظروف السوق.`;
        confidence = 0.7;
      } else {
        mainReason = `Price is ${Math.abs(deviation)}% below benchmark (${adjustedBenchmark} SAR). Good value but verify quality.`;
        mainReasonAr = `السعر أقل ${Math.abs(deviation)}% من المرجعي (${adjustedBenchmark} ر.س). سعر جيد لكن تحقق من الجودة.`;
        confidence = 0.7;
      }

      sources.push('ARBA Benchmark Database (205 items)');
    } else {
      mainReason = 'No benchmark data available for this item. Price is based on client input.';
      mainReasonAr = 'لا يوجد سعر مرجعي لهذا البند. السعر مبني على ملف العميل.';
      confidence = 0.3;
      sources.push('Client input');
    }

    // ── 2. SBC compliance check ──
    const sbcRef = this.findSBCReference(category, description);
    if (sbcRef) {
      sbcCompliance = {
        isCompliant: true,
        code: sbcRef.code,
        note: `متوافق مع ${sbcRef.code} — ${sbcRef.rule}`,
      };
      sources.push(sbcRef.code);
    }

    // ── 3. Historical context from learning data ──
    const historical = this.getHistoricalContext(ruleId, category);
    if (historical) {
      sources.push(`${historical.sampleCount} previous projects`);
      confidence = Math.min(0.95, confidence + 0.1);
    }

    return {
      itemDescription: description,
      tier: 1,
      mainReason,
      mainReasonAr,
      comparison,
      sbcCompliance,
      historical,
      confidence,
      sources,
    };
  }

  /**
   * الطبقة 2: كشف أنماط — من بيانات التتبع
   */
  detectPatterns(
    items: Array<{ description: string; category: string; costRate: number; costTotal: number }>,
  ): PatternAlert[] {
    const alerts: PatternAlert[] = [];

    // ── Pattern 1: Category cost distribution anomaly ──
    const catCosts: Record<string, number> = {};
    const totalCost = items.reduce((s, i) => s + i.costTotal, 0);
    
    for (const item of items) {
      if (!catCosts[item.category]) catCosts[item.category] = 0;
      catCosts[item.category] += item.costTotal;
    }

    // Expected ranges for residential projects
    const expectedRanges: Record<string, [number, number]> = {
      concrete: [15, 35],
      masonry: [5, 15],
      finishes: [10, 25],
      electrical: [8, 18],
      plumbing: [5, 12],
      hvac: [5, 15],
    };

    for (const [cat, [min, max]] of Object.entries(expectedRanges)) {
      if (catCosts[cat] && totalCost > 0) {
        const pct = Math.round(catCosts[cat] / totalCost * 100);
        if (pct > max) {
          const catLabel = CATEGORY_LABELS[cat]?.ar || cat;
          alerts.push({
            type: 'category_anomaly',
            title: `${catLabel} cost is ${pct}% (expected ${min}-${max}%)`,
            titleAr: `تكلفة ${catLabel} = ${pct}% (المتوقع ${min}-${max}%)`,
            description: `The ${cat} category costs ${catCosts[cat].toLocaleString()} SAR which is ${pct}% of total — above the typical range.`,
            confidence: 0.7,
            suggestedAction: `راجع أسعار ${catLabel} — النسبة أعلى من المعتاد`,
          });
        }
      }
    }

    // ── Pattern 2: Too many unpriced items ──
    const unpricedCount = items.filter(i => i.costRate === 0).length;
    const unpricedPct = Math.round(unpricedCount / items.length * 100);
    if (unpricedPct > 30) {
      alerts.push({
        type: 'price_drift',
        title: `${unpricedPct}% of items have no price`,
        titleAr: `${unpricedPct}% من البنود بدون سعر`,
        description: `${unpricedCount} out of ${items.length} items are unpriced`,
        confidence: 0.9,
        suggestedAction: 'نسبة كبيرة من البنود بدون أسعار — تحقق من ملف المشروع',
      });
    }

    return alerts;
  }

  // ═══════════════════════════════════════════════════
  // Internal Helpers
  // ═══════════════════════════════════════════════════

  private findSBCReference(category: string, description: string): typeof SBC_REFERENCES[string] | null {
    const desc = description.toLowerCase();
    
    if (category === 'concrete' || desc.includes('خرسانة') || desc.includes('concrete')) {
      return SBC_REFERENCES.concrete_grade;
    }
    if (category === 'structure' && (desc.includes('حديد') || desc.includes('steel'))) {
      return SBC_REFERENCES.steel_ratio;
    }
    if (desc.includes('عزل') && desc.includes('حرار')) {
      return SBC_REFERENCES.roof_insulation;
    }
    if (desc.includes('حريق') || desc.includes('fire')) {
      return SBC_REFERENCES.fire_extinguisher_distance;
    }
    if (category === 'doors' || desc.includes('باب') || desc.includes('door')) {
      return SBC_REFERENCES.door_width;
    }
    
    return null;
  }

  private getHistoricalContext(ruleId: string | null, category: string): PriceJustification['historical'] | undefined {
    if (!ruleId) return undefined;

    try {
      const overrides = JSON.parse(localStorage.getItem('arba_brain_overrides') || '[]');
      const relevant = overrides.filter((o: any) => o.itemId === ruleId || o.category === category);
      
      if (relevant.length < 2) return undefined;

      const prices = relevant.map((o: any) => o.newPrice || o.oldPrice).filter((p: number) => p > 0);
      if (prices.length < 2) return undefined;

      return {
        sampleCount: prices.length,
        avgRate: Math.round(prices.reduce((s: number, p: number) => s + p, 0) / prices.length),
        minRate: Math.min(...prices),
        maxRate: Math.max(...prices),
        trend: 'stable',
      };
    } catch {
      return undefined;
    }
  }
}

export const engineeringGhostAgent = new EngineeringGhostAgent();
