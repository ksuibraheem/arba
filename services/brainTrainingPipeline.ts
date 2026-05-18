/**
 * ARBA V10.0 — Brain Training Pipeline
 * خط التدريب المستمر — Teacher-Student Architecture
 *
 * يدير عملية التعلم بالكامل:
 * 1. جمع بيانات المشاريع المكتملة
 * 2. تحديد الانحرافات (predicted vs actual)
 * 3. إنشاء تصحيحات (patches) تلقائية
 * 4. (مستقبلي) إرسال للمعلم (Claude) للحالات المعقدة
 *
 * الطبقات:
 * - Tier 1: Auto-correction (deviation < 10%) → تصحيح تلقائي
 * - Tier 2: Pattern-based (10-20%) → كشف أنماط + تصحيح مشروط
 * - Tier 3: Claude review (> 20%) → مراجعة خارجية (مستقبلي)
 */

import { brainVersionControl } from './brainVersionControl';
import { BENCHMARK_RATES, getEffectiveRate } from '../src/engines/benchmarkData';
import { brainTestKnowledgeBase } from './brainTestKnowledgeBase';
import { normalizeInput, correctSpelling, matchTextToItemId } from './semanticNormalizer';

// =================== Types ===================

export interface TrainingDataPoint {
  itemId: string;
  itemDescription: string;
  category: string;
  predictedRate: number;     // السعر المتوقع (من Benchmark)
  actualRate: number;        // السعر الفعلي (من الفاتورة/العميل)
  deviationPercent: number;
  projectType: string;
  region: string;
  recordedAt: Date;
}

export interface TrainingCycleResult {
  totalPoints: number;
  autoCorrections: number;   // Tier 1 corrections applied
  patternCorrections: number; // Tier 2 corrections applied
  claudeReviews: number;     // Tier 3 sent to Claude
  patchesCreated: number;
  maturityBefore: number;
  maturityAfter: number;
  duration: number;          // ms
  cycleAt: Date;
}

// =================== Constants ===================

const TRAINING_DATA_KEY = 'arba_brain_training_data';
const CYCLE_LOG_KEY = 'arba_brain_training_log';
const MAX_AUTO_DEVIATION = 10;    // ±10% → auto-correct
const MAX_PATTERN_DEVIATION = 20; // ±20% → pattern-based
const MIN_SAMPLES_FOR_PATTERN = 3; // Need 3+ samples for pattern detection
const MAX_TRAINING_POINTS = 1000;

// =================== Service ===================

class BrainTrainingPipeline {

  /**
   * Record a training data point (called when user overrides a price)
   */
  recordOverride(params: {
    itemId: string;
    itemDescription: string;
    category: string;
    predictedRate: number;
    actualRate: number;
    projectType: string;
    region: string;
  }): TrainingDataPoint {
    const { predictedRate, actualRate } = params;
    const deviationPercent = predictedRate > 0
      ? Math.round(((actualRate - predictedRate) / predictedRate) * 100)
      : 0;

    const point: TrainingDataPoint = {
      ...params,
      deviationPercent,
      recordedAt: new Date(),
    };

    const data = this.getTrainingData();
    data.push(point);
    
    // Keep storage lean
    if (data.length > MAX_TRAINING_POINTS) {
      data.splice(0, data.length - MAX_TRAINING_POINTS);
    }

    this.saveTrainingData(data);

    // فحص إذا كان الخطأ نمط معروف من قاعدة المعرفة
    try {
      const errorMatch = brainTestKnowledgeBase.matchError(
        params.itemDescription,
        `deviation: ${deviationPercent}%`
      );
      if (errorMatch.matched && errorMatch.pattern) {
        console.log(`🧠 KB Match: "${params.itemDescription}" → ${errorMatch.pattern.patternAr} (confidence: ${(errorMatch.confidence * 100).toFixed(0)}%)`);
      }
    } catch { /* KB not critical */ }

    return point;
  }

  /**
   * Run a full training cycle
   * يشغّل دورة تدريب كاملة — يحلل البيانات وينشئ تصحيحات
   */
  runTrainingCycle(): TrainingCycleResult {
    const startTime = Date.now();
    const data = this.getTrainingData();
    
    let autoCorrections = 0;
    let patternCorrections = 0;
    let claudeReviews = 0;
    let patchesCreated = 0;

    const maturityBefore = brainVersionControl.getVersion().maturityScore;

    // ── Group by item ──
    const byItem = new Map<string, TrainingDataPoint[]>();
    for (const point of data) {
      const key = point.itemId || point.itemDescription;
      if (!byItem.has(key)) byItem.set(key, []);
      byItem.get(key)!.push(point);
    }

    // ── Process each item ──
    for (const [itemKey, points] of byItem) {
      // Calculate average deviation
      const avgDeviation = points.reduce((s, p) => s + p.deviationPercent, 0) / points.length;
      const absDeviation = Math.abs(avgDeviation);
      const latestPoint = points[points.length - 1];

      // ── Tier 1: Auto-correction (< 10% deviation, 2+ samples) ──
      if (absDeviation <= MAX_AUTO_DEVIATION && points.length >= 2) {
        const avgActualRate = Math.round(
          points.reduce((s, p) => s + p.actualRate, 0) / points.length
        );

        const patch = brainVersionControl.createPatch({
          source: 'auto_detector',
          itemId: itemKey,
          field: 'price',
          oldValue: latestPoint.predictedRate,
          newValue: avgActualRate,
          reason: `Auto-correction: ${points.length} overrides, avg deviation ${avgDeviation.toFixed(1)}%`,
          reasonAr: `تصحيح تلقائي: ${points.length} تعديلات، متوسط انحراف ${avgDeviation.toFixed(1)}%`,
          confidence: 0.85,
        });

        autoCorrections++;
        patchesCreated++;
      }

      // ── Tier 2: Pattern-based (10-20% deviation, 3+ samples) ──
      else if (absDeviation <= MAX_PATTERN_DEVIATION && points.length >= MIN_SAMPLES_FOR_PATTERN) {
        const avgActualRate = Math.round(
          points.reduce((s, p) => s + p.actualRate, 0) / points.length
        );

        // Check consistency — are overrides in same direction?
        const allUp = points.every(p => p.deviationPercent > 0);
        const allDown = points.every(p => p.deviationPercent < 0);
        const isConsistent = allUp || allDown;

        if (isConsistent) {
          const patch = brainVersionControl.createPatch({
            source: 'learning',
            itemId: itemKey,
            field: 'price',
            oldValue: latestPoint.predictedRate,
            newValue: avgActualRate,
            reason: `Pattern correction: ${points.length} consistent overrides (all ${allUp ? 'up' : 'down'}), avg deviation ${avgDeviation.toFixed(1)}%`,
            reasonAr: `تصحيح بنمط: ${points.length} تعديلات متسقة (كلها ${allUp ? 'أعلى' : 'أقل'})، متوسط انحراف ${avgDeviation.toFixed(1)}%`,
            confidence: 0.65, // Lower confidence → needs review
          });

          patternCorrections++;
          patchesCreated++;
        }
      }

      // ── Tier 3: Claude review (> 20%, future) ──
      else if (absDeviation > MAX_PATTERN_DEVIATION && points.length >= 2) {
        // TODO Phase 3: Send to Claude onCall function
        claudeReviews++;
      }
    }

    const maturityAfter = brainVersionControl.getVersion().maturityScore;

    const result: TrainingCycleResult = {
      totalPoints: data.length,
      autoCorrections,
      patternCorrections,
      claudeReviews,
      patchesCreated,
      maturityBefore,
      maturityAfter,
      duration: Date.now() - startTime,
      cycleAt: new Date(),
    };

    // Save cycle log
    this.saveCycleLog(result);

    console.log(`🧠 Training Cycle: ${autoCorrections} auto + ${patternCorrections} pattern + ${claudeReviews} pending Claude | ${patchesCreated} patches created`);

    return result;
  }

  /**
   * Get training data statistics
   */
  getStats(): {
    totalPoints: number;
    uniqueItems: number;
    avgDeviation: number;
    topOverriddenItems: Array<{ item: string; count: number; avgDev: number }>;
    lastCycle: TrainingCycleResult | null;
  } {
    const data = this.getTrainingData();
    const uniqueItems = new Set(data.map(d => d.itemId || d.itemDescription)).size;
    const avgDeviation = data.length > 0
      ? Math.round(data.reduce((s, d) => s + Math.abs(d.deviationPercent), 0) / data.length)
      : 0;

    // Top overridden items
    const counts: Record<string, { count: number; totalDev: number }> = {};
    for (const point of data) {
      const key = point.itemDescription.substring(0, 40);
      if (!counts[key]) counts[key] = { count: 0, totalDev: 0 };
      counts[key].count++;
      counts[key].totalDev += Math.abs(point.deviationPercent);
    }

    const topItems = Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([item, data]) => ({
        item,
        count: data.count,
        avgDev: Math.round(data.totalDev / data.count),
      }));

    const logs = this.getCycleLogs();

    return {
      totalPoints: data.length,
      uniqueItems,
      avgDeviation,
      topOverriddenItems: topItems,
      lastCycle: logs.length > 0 ? logs[logs.length - 1] : null,
    };
  }

  // ═══════════════════════════════════════════════════
  // Storage
  // ═══════════════════════════════════════════════════

  private getTrainingData(): TrainingDataPoint[] {
    try { return JSON.parse(localStorage.getItem(TRAINING_DATA_KEY) || '[]'); }
    catch { return []; }
  }

  private saveTrainingData(data: TrainingDataPoint[]): void {
    localStorage.setItem(TRAINING_DATA_KEY, JSON.stringify(data));
  }

  private getCycleLogs(): TrainingCycleResult[] {
    try { return JSON.parse(localStorage.getItem(CYCLE_LOG_KEY) || '[]'); }
    catch { return []; }
  }

  private saveCycleLog(result: TrainingCycleResult): void {
    const logs = this.getCycleLogs();
    logs.push(result);
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem(CYCLE_LOG_KEY, JSON.stringify(logs));
  }

  // ═══════════════════════════════════════════════════
  // BOQ Feed Integration (browser-compatible feeder)
  // ═══════════════════════════════════════════════════

  /**
   * Feed BOQ items into training pipeline
   * يغذي بيانات BOQ مباشرة في خط التدريب — بديل feedBrain من brainTrainingFeeder
   */
  feedFromBOQ(items: Array<{
    id: string;
    description: string;
    category: string;
    unit: string;
    qty: number;
    userPrice: number;
    benchmarkPrice?: number;
    projectType?: string;
    region?: string;
  }>): { fed: number; skipped: number } {
    let fed = 0;
    let skipped = 0;

    for (const item of items) {
      const predicted = item.benchmarkPrice || getEffectiveRate(item.id) || 0;
      if (predicted <= 0 || item.userPrice <= 0) {
        skipped++;
        continue;
      }

      // تطبيع الوصف عبر semanticNormalizer (تصحيح إملاء + ربط دلالي)
      const normalized = normalizeInput(item.description, item.unit, item.category);
      const resolvedId = normalized.matchedItemId || item.id;

      this.recordOverride({
        itemId: resolvedId,
        itemDescription: normalized.correctedText,
        category: item.category,
        predictedRate: predicted,
        actualRate: item.userPrice,
        projectType: item.projectType || 'general',
        region: item.region || 'SA',
      });
      fed++;
    }

    console.log(`🧠 BOQ Feed: ${fed} items fed, ${skipped} skipped`);
    return { fed, skipped };
  }
}

export const brainTrainingPipeline = new BrainTrainingPipeline();
