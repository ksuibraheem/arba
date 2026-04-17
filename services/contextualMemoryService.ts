/**
 * ARBA Cognitive Engine v4.1 — Contextual Memory Service
 * خدمة الذاكرة السياقية — تتعلم من المشاريع المكتملة
 * 
 * LAYER 1: The Memory Layer
 * - Indexes completed projects into "Project DNA Profiles"
 * - Builds weighted baselines for each (projectType + location) pair
 * - Calculates confidence scores based on sample size
 * 
 * READS FROM: projects collection, quotes collection (Firebase)
 * WRITES TO: cognitiveMemory/{recordId}, baselines/{profileKey} (Firebase)
 * 
 * ⚠️ MIDDLEWARE: Does NOT modify calculateProjectCosts().
 */

import { ProjectType, LocationType, Language } from '../types';

// =================== Types ===================

/** DNA profile extracted from a completed project */
export interface ProjectPerformanceRecord {
    id: string;
    projectId: string;
    projectType: ProjectType;
    location: LocationType;
    buildArea: number;
    floorsCount: number;

    // Actual performance data (filled after project completion)
    actualCostPerSqm: number;
    actualWasteFactors: Record<string, number>;   // itemId → actual waste %
    actualLaborRates: Record<string, number>;      // itemId → actual labor cost/unit

    // Comparison
    quotedPrice: number;
    actualPrice: number;
    deviationPercent: number;       // (actual - quoted) / quoted * 100

    completedAt: Date;
    recordedBy: string;
}

/** Weighted baseline for a (projectType + location) combination */
export interface BaselineProfile {
    profileKey: string;             // e.g., "villa_riyadh"
    projectType: ProjectType;
    location: LocationType;
    sampleSize: number;

    // Weighted averages (all completed projects)
    avgCostPerSqm: number;
    avgWasteFactors: Record<string, number>;
    avgLaborRates: Record<string, number>;

    // Best performers (top 20% — lowest deviation)
    bestCostPerSqm: number;
    bestWasteFactors: Record<string, number>;

    // Statistics
    minCostPerSqm: number;
    maxCostPerSqm: number;
    stdDevCostPerSqm: number;

    confidence: number;             // 0-1 (calculated from sample size)
    lastUpdated: Date;
}

/** Insight comparison result */
export interface BaselineComparison {
    hasBaseline: boolean;
    confidence: number;
    confidenceLabel: Record<Language, string>;
    baselineSource: Record<Language, string>;

    costComparison?: {
        currentCostPerSqm: number;
        baselineCostPerSqm: number;
        differencePercent: number;
        status: 'below' | 'at' | 'above';
    };
}

// =================== Constants ===================

const STORAGE_KEY = 'arba_cognitive_memory';
const BASELINES_KEY = 'arba_baselines';

// =================== Confidence Scoring ===================

/**
 * Calculate confidence score based on number of similar completed projects.
 * Min 3 projects → 60% | 10 projects → 75% | 20+ → 95%
 */
export function calculateConfidence(sampleSize: number): number {
    if (sampleSize < 3) return 0;
    if (sampleSize >= 20) return 0.95;
    // Logarithmic growth: rapid at first, plateaus at 95%
    return Math.min(0.95, 0.50 + Math.log2(sampleSize) * 0.10);
}

/**
 * Get human-readable confidence label
 */
export function getConfidenceLabel(confidence: number): Record<Language, string> {
    if (confidence >= 0.9) return { ar: 'ثقة عالية جداً', en: 'Very High Confidence', fr: 'Confiance très élevée', zh: '非常高置信度' };
    if (confidence >= 0.75) return { ar: 'ثقة عالية', en: 'High Confidence', fr: 'Confiance élevée', zh: '高置信度' };
    if (confidence >= 0.5) return { ar: 'ثقة متوسطة', en: 'Medium Confidence', fr: 'Confiance moyenne', zh: '中等置信度' };
    return { ar: 'بيانات غير كافية', en: 'Insufficient Data', fr: 'Données insuffisantes', zh: '数据不足' };
}

// =================== Core Service ===================

class ContextualMemoryService {

    /**
     * Record a completed project's performance into memory
     */
    addPerformanceRecord(record: Omit<ProjectPerformanceRecord, 'id'>): ProjectPerformanceRecord {
        const records = this.getRecords();
        const newRecord: ProjectPerformanceRecord = {
            ...record,
            id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        records.push(newRecord);
        this.saveRecords(records);

        // Rebuild the baseline for this (type + location)
        this.rebuildBaseline(record.projectType, record.location);

        return newRecord;
    }

    /**
     * Get or build a baseline profile for a given project type and location
     */
    getBaseline(projectType: ProjectType, location: LocationType): BaselineProfile | null {
        const baselines = this.getBaselines();
        const key = `${projectType}_${location}`;
        return baselines.find(b => b.profileKey === key) || null;
    }

    /**
     * Compare current project against the historical baseline
     */
    compareWithBaseline(
        projectType: ProjectType,
        location: LocationType,
        currentCostPerSqm: number
    ): BaselineComparison {
        const baseline = this.getBaseline(projectType, location);

        if (!baseline || baseline.confidence < 0.5) {
            return {
                hasBaseline: false,
                confidence: baseline?.confidence || 0,
                confidenceLabel: getConfidenceLabel(baseline?.confidence || 0),
                baselineSource: {
                    ar: `${baseline?.sampleSize || 0} مشروع مماثل`,
                    en: `${baseline?.sampleSize || 0} similar projects`,
                    fr: `${baseline?.sampleSize || 0} projets similaires`,
                    zh: `${baseline?.sampleSize || 0} 个类似项目`,
                },
            };
        }

        const diff = ((currentCostPerSqm - baseline.avgCostPerSqm) / baseline.avgCostPerSqm) * 100;

        return {
            hasBaseline: true,
            confidence: baseline.confidence,
            confidenceLabel: getConfidenceLabel(baseline.confidence),
            baselineSource: {
                ar: `${baseline.sampleSize} مشروع مماثل في ${location}`,
                en: `${baseline.sampleSize} similar projects in ${location}`,
                fr: `${baseline.sampleSize} projets similaires à ${location}`,
                zh: `${baseline.sampleSize} 个 ${location} 类似项目`,
            },
            costComparison: {
                currentCostPerSqm,
                baselineCostPerSqm: baseline.avgCostPerSqm,
                differencePercent: Math.round(diff * 10) / 10,
                status: diff > 10 ? 'above' : diff < -10 ? 'below' : 'at',
            },
        };
    }

    // =================== Internal ===================

    private rebuildBaseline(projectType: ProjectType, location: LocationType): void {
        const records = this.getRecords().filter(
            r => r.projectType === projectType && r.location === location
        );

        if (records.length < 1) return;

        // Sort by deviation (best performers = lowest absolute deviation)
        const sorted = [...records].sort(
            (a, b) => Math.abs(a.deviationPercent) - Math.abs(b.deviationPercent)
        );

        // Top 20% = best performers
        const top20Count = Math.max(1, Math.floor(sorted.length * 0.2));
        const bestPerformers = sorted.slice(0, top20Count);

        // Calculate averages
        const avgCostPerSqm = records.reduce((s, r) => s + r.actualCostPerSqm, 0) / records.length;
        const bestCostPerSqm = bestPerformers.reduce((s, r) => s + r.actualCostPerSqm, 0) / bestPerformers.length;

        // Build waste factor averages
        const avgWasteFactors: Record<string, number> = {};
        const bestWasteFactors: Record<string, number> = {};
        const avgLaborRates: Record<string, number> = {};

        // Aggregate waste factors across all records
        const wasteAccum: Record<string, { sum: number; count: number }> = {};
        const bestWasteAccum: Record<string, { sum: number; count: number }> = {};
        const laborAccum: Record<string, { sum: number; count: number }> = {};

        for (const r of records) {
            for (const [itemId, waste] of Object.entries(r.actualWasteFactors)) {
                if (!wasteAccum[itemId]) wasteAccum[itemId] = { sum: 0, count: 0 };
                wasteAccum[itemId].sum += waste;
                wasteAccum[itemId].count++;
            }
            for (const [itemId, rate] of Object.entries(r.actualLaborRates)) {
                if (!laborAccum[itemId]) laborAccum[itemId] = { sum: 0, count: 0 };
                laborAccum[itemId].sum += rate;
                laborAccum[itemId].count++;
            }
        }

        for (const r of bestPerformers) {
            for (const [itemId, waste] of Object.entries(r.actualWasteFactors)) {
                if (!bestWasteAccum[itemId]) bestWasteAccum[itemId] = { sum: 0, count: 0 };
                bestWasteAccum[itemId].sum += waste;
                bestWasteAccum[itemId].count++;
            }
        }

        for (const [k, v] of Object.entries(wasteAccum)) avgWasteFactors[k] = v.sum / v.count;
        for (const [k, v] of Object.entries(bestWasteAccum)) bestWasteFactors[k] = v.sum / v.count;
        for (const [k, v] of Object.entries(laborAccum)) avgLaborRates[k] = v.sum / v.count;

        // Std deviation
        const variance = records.reduce((s, r) => s + Math.pow(r.actualCostPerSqm - avgCostPerSqm, 2), 0) / records.length;

        const baseline: BaselineProfile = {
            profileKey: `${projectType}_${location}`,
            projectType,
            location,
            sampleSize: records.length,
            avgCostPerSqm: Math.round(avgCostPerSqm),
            avgWasteFactors,
            avgLaborRates,
            bestCostPerSqm: Math.round(bestCostPerSqm),
            bestWasteFactors,
            minCostPerSqm: Math.min(...records.map(r => r.actualCostPerSqm)),
            maxCostPerSqm: Math.max(...records.map(r => r.actualCostPerSqm)),
            stdDevCostPerSqm: Math.round(Math.sqrt(variance)),
            confidence: calculateConfidence(records.length),
            lastUpdated: new Date(),
        };

        // Save
        const baselines = this.getBaselines().filter(b => b.profileKey !== baseline.profileKey);
        baselines.push(baseline);
        this.saveBaselines(baselines);
    }

    // =================== Persistence ===================

    private getRecords(): ProjectPerformanceRecord[] {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
    }

    private saveRecords(records: ProjectPerformanceRecord[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    private getBaselines(): BaselineProfile[] {
        try { return JSON.parse(localStorage.getItem(BASELINES_KEY) || '[]'); } catch { return []; }
    }

    private saveBaselines(baselines: BaselineProfile[]): void {
        localStorage.setItem(BASELINES_KEY, JSON.stringify(baselines));
    }
}

export const contextualMemoryService = new ContextualMemoryService();
