/**
 * ARBA-Ops v6.0 — Self-Learning Feedback Service
 * خدمة التعلم الذاتي — تتعلم من المشاريع المنفذة
 *
 * تقارن الكميات المحسوبة نظرياً (Cognitive Engine) مع الكميات الفعلية (الفواتير)
 * لتحديث أوزان التعلم وتخصيص معامل الهدر لكل نوع مشروع + مدينة.
 *
 * GUARDS: ترفض البيانات المشبوهة (انحراف > 25% عن SBC) لمنع تلوث التعلم.
 */

import { ProjectType, LocationType } from '../types';

// =================== Types ===================

/** سجل تعلم واحد — يُنشأ عند إقفال المشروع ومقارنة الفواتير */
export interface LearningDataPoint {
  id: string;
  projectId: string;
  projectType: ProjectType;
  location: LocationType;
  recordedAt: Date;

  // الكميات المحسوبة نظرياً (Predicted)
  predictedQty: Record<string, number>;  // itemId → qty

  // الكميات الفعلية (Actuals from invoices)
  actualQty: Record<string, number>;     // itemId → qty

  // نسبة الانحراف لكل بند
  deviations: Record<string, number>;    // itemId → deviation %

  // هل تم اعتماد هذه النقطة للتعلم؟
  accepted: boolean;
  rejectionReason?: string;
}

/** ملف وزن التعلم المتراكم لتركيبة (نوع مشروع + مدينة) */
export interface LearningWeight {
  profileKey: string;                    // e.g., "villa_riyadh"
  projectType: ProjectType;
  location: LocationType;
  sampleCount: number;

  // أوزان الهدر المتعلمة (تُضاف فوق SBC baseline)
  learnedWasteAdjustments: Record<string, number>; // itemCategory → adjustment factor (e.g., 1.07 = +7%)

  // متوسط الانحرافات
  avgDeviations: Record<string, number>;

  lastUpdated: Date;
}

// =================== Constants ===================

const LEARNING_STORAGE_KEY = 'arba_learning_data';
const WEIGHTS_STORAGE_KEY = 'arba_learning_weights';

/** Guard: الحد الأقصى للانحراف المسموح للتعلم */
const MAX_ACCEPTABLE_DEVIATION = 0.25; // 25%

// =================== Service ===================

class LearningFeedbackService {

  /**
   * إضافة نقطة تعلم جديدة (عند إقفال مشروع وتفريغ الفواتير)
   */
  addDataPoint(
    projectId: string,
    projectType: ProjectType,
    location: LocationType,
    predictedQty: Record<string, number>,
    actualQty: Record<string, number>,
  ): LearningDataPoint {
    // Calculate deviations
    const deviations: Record<string, number> = {};
    let hasExcessiveDeviation = false;
    let rejectionReason = '';

    for (const [itemId, predicted] of Object.entries(predictedQty)) {
      const actual = actualQty[itemId];
      if (actual !== undefined && predicted > 0) {
        const deviation = (actual - predicted) / predicted;
        deviations[itemId] = Math.round(deviation * 1000) / 1000; // 3 decimal places

        if (Math.abs(deviation) > MAX_ACCEPTABLE_DEVIATION) {
          hasExcessiveDeviation = true;
          rejectionReason = `${itemId}: انحراف ${(deviation * 100).toFixed(1)}% يتجاوز الحد (${MAX_ACCEPTABLE_DEVIATION * 100}%)`;
        }
      }
    }

    const dataPoint: LearningDataPoint = {
      id: `learn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      projectId,
      projectType,
      location,
      recordedAt: new Date(),
      predictedQty,
      actualQty,
      deviations,
      accepted: !hasExcessiveDeviation,
      rejectionReason: hasExcessiveDeviation ? rejectionReason : undefined,
    };

    // Save
    const points = this.getDataPoints();
    points.push(dataPoint);
    this.saveDataPoints(points);

    // Rebuild weights if accepted
    if (dataPoint.accepted) {
      this.rebuildWeights(projectType, location);
    }

    return dataPoint;
  }

  /**
   * استرجاع الوزن المتعلم لتركيبة (نوع مشروع + مدينة)
   * يتم استخدامه في cognitiveCalculations.ts لتعديل الهدر
   */
  getLearnedWeight(projectType: ProjectType, location: LocationType): LearningWeight | null {
    const weights = this.getWeights();
    return weights.find(w => w.profileKey === `${projectType}_${location}`) || null;
  }

  /**
   * توليد "نصيحة ذكية" للمهندس بناءً على البيانات المتراكمة
   */
  generateInsight(
    projectType: ProjectType,
    location: LocationType,
    currentItemId: string,
    currentQty: number,
  ): { hasInsight: boolean; suggestedQty?: number; confidence?: number; message?: string } {
    const weight = this.getLearnedWeight(projectType, location);
    if (!weight || weight.sampleCount < 3) {
      return { hasInsight: false };
    }

    const adjustment = weight.learnedWasteAdjustments[currentItemId];
    if (!adjustment || adjustment === 1.0) {
      return { hasInsight: false };
    }

    const suggestedQty = Math.round(currentQty * adjustment * 100) / 100;
    const confidence = Math.min(0.95, 0.50 + Math.log2(weight.sampleCount) * 0.10);

    return {
      hasInsight: true,
      suggestedQty,
      confidence,
      message: `بناءً على ${weight.sampleCount} مشاريع مماثلة في ${location}، ننصح بتعديل الكمية بنسبة ${((adjustment - 1) * 100).toFixed(1)}%`,
    };
  }

  // =================== Internal ===================

  private rebuildWeights(projectType: ProjectType, location: LocationType): void {
    const profileKey = `${projectType}_${location}`;
    const points = this.getDataPoints().filter(
      p => p.projectType === projectType && p.location === location && p.accepted
    );

    if (points.length < 1) return;

    // Aggregate deviations per item category
    const deviationAccum: Record<string, { sum: number; count: number }> = {};

    for (const point of points) {
      for (const [itemId, deviation] of Object.entries(point.deviations)) {
        if (!deviationAccum[itemId]) deviationAccum[itemId] = { sum: 0, count: 0 };
        deviationAccum[itemId].sum += deviation;
        deviationAccum[itemId].count++;
      }
    }

    const avgDeviations: Record<string, number> = {};
    const learnedWasteAdjustments: Record<string, number> = {};

    for (const [itemId, accum] of Object.entries(deviationAccum)) {
      const avg = accum.sum / accum.count;
      avgDeviations[itemId] = Math.round(avg * 1000) / 1000;
      // Convert deviation to adjustment factor: if avg deviation is +7%, factor = 1.07
      learnedWasteAdjustments[itemId] = Math.round((1 + avg) * 1000) / 1000;
    }

    const weight: LearningWeight = {
      profileKey,
      projectType,
      location,
      sampleCount: points.length,
      learnedWasteAdjustments,
      avgDeviations,
      lastUpdated: new Date(),
    };

    // Save
    const weights = this.getWeights().filter(w => w.profileKey !== profileKey);
    weights.push(weight);
    this.saveWeights(weights);
  }

  // =================== Persistence ===================

  private getDataPoints(): LearningDataPoint[] {
    try { return JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) || '[]'); } catch { return []; }
  }

  private saveDataPoints(points: LearningDataPoint[]): void {
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(points));
  }

  private getWeights(): LearningWeight[] {
    try { return JSON.parse(localStorage.getItem(WEIGHTS_STORAGE_KEY) || '[]'); } catch { return []; }
  }

  private saveWeights(weights: LearningWeight[]): void {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  }
}

export const learningFeedbackService = new LearningFeedbackService();
