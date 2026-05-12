/**
 * ARBA v7.0 — Collective Brain Service
 * خدمة الدماغ الجماعي — التعلم من جميع المشاريع
 * 
 * PURPOSE:
 * - Push anonymized project data to a global insights hub
 * - Pull aggregated standard weights (waste patterns, labor rates)
 * - Privacy-first: no client names, no project addresses
 * 
 * STORAGE: localStorage with optional Firebase Firestore sync
 * CACHE: 24-hour refresh cycle
 */

import { ProjectType, LocationType } from '../types';

// =================== Types ===================

export interface AnonymizedProjectInsight {
  id: string;
  
  // Classification (anonymized)
  projectType: ProjectType;
  region: string;                    // e.g. "riyadh", "jeddah" (not full address)
  buildArea_m2: number;
  floorsCount: number;
  
  // Output metrics
  costPerSqm_SAR: number;
  concretePerSqm_m3: number;        // م³ خرسانة / م² بناء
  steelPerSqm_kg: number;           // كجم حديد / م² بناء
  blockPerSqm_count: number;        // عدد بلوك / م² بناء
  
  // Waste patterns
  actualWastePercents: {
    concrete: number;
    steel: number;
    blocks: number;
    tiles: number;
    paint: number;
  };
  
  // Cost breakdown ratios
  costBreakdown: {
    substructurePercent: number;
    superstructurePercent: number;
    masonryPercent: number;
    finishesPercent: number;
    mepPercent: number;
    otherPercent: number;
  };
  
  // Metadata
  submittedAt: Date;
  engineVersion: string;
}

export interface StandardWeight {
  metric: string;                    // e.g. "concrete_per_sqm_villa"
  value: number;
  unit: string;
  sampleSize: number;               // how many projects this is based on
  confidence: number;               // 0-1
  lastUpdated: Date;
}

export interface CollectiveBrainState {
  insights: AnonymizedProjectInsight[];
  standardWeights: StandardWeight[];
  lastSyncTimestamp: Date | null;
  totalProjectsInHub: number;
}

// =================== Storage ===================

const INSIGHTS_KEY = 'arba_collective_insights';
const WEIGHTS_KEY = 'arba_standard_weights';
const SYNC_TS_KEY = 'arba_last_sync_ts';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// =================== Service ===================

class CollectiveBrainService {

  /**
   * Push an anonymized insight from a completed project.
   * Privacy: No client name, no project address, no engineer name.
   */
  pushAnonymizedInsight(
    projectType: ProjectType,
    location: LocationType,
    buildArea: number,
    floorsCount: number,
    costPerSqm: number,
    totalConcrete_m3: number,
    totalSteel_tons: number,
    totalBlocks: number,
    actualWastes: AnonymizedProjectInsight['actualWastePercents'],
    costBreakdown: AnonymizedProjectInsight['costBreakdown'],
  ): AnonymizedProjectInsight {
    const region = this.extractRegion(location);

    const insight: AnonymizedProjectInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      projectType,
      region,
      buildArea_m2: buildArea,
      floorsCount,
      costPerSqm_SAR: Math.round(costPerSqm),
      concretePerSqm_m3: buildArea > 0 ? Math.round((totalConcrete_m3 / buildArea) * 1000) / 1000 : 0,
      steelPerSqm_kg: buildArea > 0 ? Math.round((totalSteel_tons * 1000 / buildArea) * 100) / 100 : 0,
      blockPerSqm_count: buildArea > 0 ? Math.round(totalBlocks / buildArea) : 0,
      actualWastePercents: actualWastes,
      costBreakdown,
      submittedAt: new Date(),
      engineVersion: '7.0',
    };

    const insights = this.getLocalInsights();
    insights.push(insight);
    this.saveLocalInsights(insights);

    // TODO: Firebase push when connected
    // firestore.collection('global_insight_hub').add(insight);

    return insight;
  }

  /**
   * Recalculate standard weights from all local insights.
   * Returns aggregated metrics for estimation benchmarking.
   */
  recalculateStandardWeights(): StandardWeight[] {
    const insights = this.getLocalInsights();
    if (insights.length === 0) return this.getDefaultWeights();

    const weights: StandardWeight[] = [];
    const now = new Date();

    // Group by project type
    const byType = new Map<string, AnonymizedProjectInsight[]>();
    insights.forEach(i => {
      const key = i.projectType;
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key)!.push(i);
    });

    for (const [type, group] of byType) {
      const n = group.length;
      const confidence = Math.min(1, n / 10); // max confidence at 10+ samples

      // Concrete per sqm
      const avgConcrete = group.reduce((s, g) => s + g.concretePerSqm_m3, 0) / n;
      weights.push({
        metric: `concrete_per_sqm_${type}`,
        value: Math.round(avgConcrete * 1000) / 1000,
        unit: 'م³/م²',
        sampleSize: n,
        confidence,
        lastUpdated: now,
      });

      // Steel per sqm
      const avgSteel = group.reduce((s, g) => s + g.steelPerSqm_kg, 0) / n;
      weights.push({
        metric: `steel_per_sqm_${type}`,
        value: Math.round(avgSteel * 100) / 100,
        unit: 'كجم/م²',
        sampleSize: n,
        confidence,
        lastUpdated: now,
      });

      // Cost per sqm
      const avgCost = group.reduce((s, g) => s + g.costPerSqm_SAR, 0) / n;
      weights.push({
        metric: `cost_per_sqm_${type}`,
        value: Math.round(avgCost),
        unit: 'ر.س/م²',
        sampleSize: n,
        confidence,
        lastUpdated: now,
      });

      // Average waste percents
      const avgConcreteWaste = group.reduce((s, g) => s + g.actualWastePercents.concrete, 0) / n;
      weights.push({
        metric: `waste_concrete_${type}`,
        value: Math.round(avgConcreteWaste * 10) / 10,
        unit: '%',
        sampleSize: n,
        confidence,
        lastUpdated: now,
      });
    }

    this.saveLocalWeights(weights);
    return weights;
  }

  /**
   * Get current standard weights (from cache or recalculate).
   */
  getStandardWeights(): StandardWeight[] {
    const cached = this.getLocalWeights();
    if (cached.length > 0) return cached;
    return this.recalculateStandardWeights();
  }

  /**
   * Check if sync is needed (cache expired).
   */
  needsSync(): boolean {
    try {
      const ts = localStorage.getItem(SYNC_TS_KEY);
      if (!ts) return true;
      return Date.now() - new Date(ts).getTime() > CACHE_DURATION_MS;
    } catch {
      return true;
    }
  }

  /**
   * Get state summary.
   */
  getState(): CollectiveBrainState {
    const insights = this.getLocalInsights();
    return {
      insights,
      standardWeights: this.getStandardWeights(),
      lastSyncTimestamp: this.getLastSyncTimestamp(),
      totalProjectsInHub: insights.length,
    };
  }

  // =================== Private Helpers ===================

  private extractRegion(location: LocationType): string {
    // Anonymize to region only
    const regionMap: Partial<Record<LocationType, string>> = {
      riyadh: 'central',
      jeddah: 'western',
      dammam: 'eastern',
      makkah: 'western',
      madinah: 'western',
      abha: 'southern',
      tabuk: 'northern',
      hail: 'northern',
      jazan: 'southern',
      najran: 'southern',
    };
    return regionMap[location] || 'central';
  }

  private getDefaultWeights(): StandardWeight[] {
    const now = new Date();

    // ─── v2.0: Data-backed weights from brain_mega_training.json ───
    // Values updated from: R.E Farm (1 sample), SOW-TBC Schools (8 samples),
    // STR Package 25970 (1 sample, C35/Grade60), كراسة حائل + الشرقية + المدينة
    return [
      // Concrete per sqm by project type
      { metric: 'concrete_per_sqm_villa', value: 0.45, unit: 'م³/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'concrete_per_sqm_tower', value: 0.55, unit: 'م³/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'concrete_per_sqm_residential_building', value: 0.50, unit: 'م³/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
      { metric: 'concrete_per_sqm_mall', value: 0.42, unit: 'م³/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'concrete_per_sqm_farm', value: 0.35, unit: 'م³/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },

      // Steel per sqm (backed by STR Package Grade 60 data)
      { metric: 'steel_per_sqm_villa', value: 55, unit: 'كجم/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'steel_per_sqm_tower', value: 75, unit: 'كجم/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'steel_per_sqm_residential_building', value: 65, unit: 'كجم/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },

      // Cost per sqm (2026 market — backed by real training data)
      { metric: 'cost_per_sqm_villa', value: 1850, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_tower', value: 2400, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_school', value: 1800, unit: 'ر.س/م²', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'cost_per_sqm_hospital', value: 3500, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_mosque', value: 2200, unit: 'ر.س/م²', sampleSize: 0, confidence: 0.3, lastUpdated: now },
      { metric: 'cost_per_sqm_farm', value: 1400, unit: 'ر.س/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
      { metric: 'cost_per_sqm_residential_building', value: 2100, unit: 'ر.س/م²', sampleSize: 1, confidence: 0.6, lastUpdated: now },
      { metric: 'cost_per_sqm_government', value: 1950, unit: 'ر.س/م²', sampleSize: 3, confidence: 0.65, lastUpdated: now },

      // Standard waste percentages (backed by 8 school samples + corrected SOW-TBC)
      { metric: 'waste_concrete_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_steel_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_blocks_default', value: 7, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_tiles_default', value: 10, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },
      { metric: 'waste_paint_default', value: 5, unit: '%', sampleSize: 8, confidence: 0.75, lastUpdated: now },

      // Regional price indices (from كراسات حائل + الشرقية + المدينة)
      { metric: 'price_index_hail', value: 0.92, unit: 'ratio', sampleSize: 282, confidence: 0.65, lastUpdated: now },
      { metric: 'price_index_dammam', value: 1.05, unit: 'ratio', sampleSize: 329, confidence: 0.65, lastUpdated: now },
      { metric: 'price_index_madinah', value: 1.03, unit: 'ratio', sampleSize: 334, confidence: 0.65, lastUpdated: now },

      // Structural specs (from STR Package 25970 — C35, Grade 60)
      { metric: 'default_concrete_grade_mpa', value: 35, unit: 'MPa', sampleSize: 1, confidence: 0.9, lastUpdated: now },
      { metric: 'default_steel_grade_mpa', value: 420, unit: 'MPa', sampleSize: 1, confidence: 0.9, lastUpdated: now },
    ];
  }

  private getLocalInsights(): AnonymizedProjectInsight[] {
    try { return JSON.parse(localStorage.getItem(INSIGHTS_KEY) || '[]'); } catch { return []; }
  }

  private saveLocalInsights(insights: AnonymizedProjectInsight[]): void {
    if (insights.length > 500) insights = insights.slice(-500);
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  }

  private getLocalWeights(): StandardWeight[] {
    try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY) || '[]'); } catch { return []; }
  }

  private saveLocalWeights(weights: StandardWeight[]): void {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    localStorage.setItem(SYNC_TS_KEY, new Date().toISOString());
  }

  private getLastSyncTimestamp(): Date | null {
    try {
      const ts = localStorage.getItem(SYNC_TS_KEY);
      return ts ? new Date(ts) : null;
    } catch {
      return null;
    }
  }

  // =================== Phase 4: Enhanced Methods ===================

  /**
   * Push labor productivity feedback from actual field data.
   * Adjusts future productivity estimates based on real crew performance.
   */
  pushLaborProductivityFeedback(
    activityId: string,
    actualOutputPerDay: number,
    region: string,
    projectType: ProjectType
  ): void {
    const key = 'arba_labor_feedback';
    try {
      const existing: Array<{ activityId: string; actual: number; region: string; type: string; ts: string }> =
        JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ activityId, actual: actualOutputPerDay, region, type: projectType, ts: new Date().toISOString() });
      if (existing.length > 500) existing.splice(0, existing.length - 500);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch { /* silent */ }
  }

  /**
   * Get a price index comparing current material costs to the collective average.
   * Returns a ratio: 1.0 = on average, <1.0 = below average (good), >1.0 = above average.
   */
  getPriceIndex(projectType: ProjectType, currentCostPerSqm: number): { index: number; verdict: string } {
    const weights = this.getStandardWeights();
    const w = weights.find(w => w.metric === `cost_per_sqm_${projectType}`);
    const avgCost = w?.value || 1850;
    const index = currentCostPerSqm / avgCost;
    let verdict = 'متوسط';
    if (index < 0.85) verdict = 'أقل من المعدل ✅';
    else if (index < 0.95) verdict = 'أقل بقليل من المعدل';
    else if (index > 1.15) verdict = 'أعلى من المعدل ⚠️';
    else if (index > 1.05) verdict = 'أعلى بقليل من المعدل';
    return { index: Math.round(index * 100) / 100, verdict };
  }

  /**
   * Get waste patterns aggregated from all project insights.
   * Returns average actual waste percentages by material type.
   */
  getWastePatterns(projectType?: ProjectType): Record<string, { avgPercent: number; sampleSize: number }> {
    const insights = this.getLocalInsights();
    const filtered = projectType ? insights.filter(i => i.projectType === projectType) : insights;

    if (filtered.length === 0) {
      return {
        concrete: { avgPercent: 5, sampleSize: 0 },
        steel: { avgPercent: 5, sampleSize: 0 },
        blocks: { avgPercent: 7, sampleSize: 0 },
        tiles: { avgPercent: 10, sampleSize: 0 },
        paint: { avgPercent: 5, sampleSize: 0 },
      };
    }

    const n = filtered.length;
    return {
      concrete: { avgPercent: Math.round(filtered.reduce((s, i) => s + i.actualWastePercents.concrete, 0) / n * 10) / 10, sampleSize: n },
      steel: { avgPercent: Math.round(filtered.reduce((s, i) => s + i.actualWastePercents.steel, 0) / n * 10) / 10, sampleSize: n },
      blocks: { avgPercent: Math.round(filtered.reduce((s, i) => s + i.actualWastePercents.blocks, 0) / n * 10) / 10, sampleSize: n },
      tiles: { avgPercent: Math.round(filtered.reduce((s, i) => s + i.actualWastePercents.tiles, 0) / n * 10) / 10, sampleSize: n },
      paint: { avgPercent: Math.round(filtered.reduce((s, i) => s + i.actualWastePercents.paint, 0) / n * 10) / 10, sampleSize: n },
    };
  }
}

export const collectiveBrainService = new CollectiveBrainService();
