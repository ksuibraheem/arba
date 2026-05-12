/**
 * ARBA Cognitive Engine v4.1 — Golden Output Service
 * خدمة المخرج الذهبي — الجملة التي تختصر ذكاء النظام
 * 
 * LAYER 6: The Final Synthesis
 * - Collects insights from ALL cognitive layers
 * - Generates the "Golden Sentence" — a contextual summary for the QS Engineer
 * - Produces a full InsightReport with scarcity alerts, seasonal warnings, deviations, and suggestions
 * 
 * Example Output:
 * "📊 بناءً على 15 مشروع مماثل في الرياض، متوسط التكلفة 1,850 ر.س/م² (ثقة 94%).
 *  ⚠️ ندرة في الحديد (3/5 موردين نفد مخزونهم).
 *  🌡️ الصيف: توصية بإضافة 25 ر.س/م³ لتأخير شك الخرسانة."
 * 
 * ⚠️ MIDDLEWARE: Pure aggregator — does NOT modify calculateProjectCosts().
 */

import { AppState, Language, CalculatedItem, BaseItem } from '../types';
import { blueprintIntelligence, PredictionResult, CostEstimate } from './blueprintIntelligence';
import {
    contextualMemoryService,
    calculateConfidence,
    type BaselineComparison,
} from './contextualMemoryService';
import {
    detectScarcity,
    type ScarcityAlert,
} from './arbaIntuitionBridge';
import {
    getSeasonalAdjustments,
    type SeasonalAdjustment,
} from './environmentalAwarenessService';
import {
    getDistanceFactor,
    type DistanceFactor,
} from '../constants/geospatialData';
import {
    runDeviationScan,
    type DeviationAlert,
} from './deviationEngine';

// =================== Types ===================

export interface InsightReport {
    // The Golden Sentence
    goldenSentence: Record<Language, string>;
    financialAnalysisText: Record<Language, string>;

    // Source data
    confidence: number;
    baselineComparison: BaselineComparison | null;

    // Alerts & Warnings
    scarcityAlerts: ScarcityAlert[];
    seasonalAdjustment: SeasonalAdjustment;
    distanceFactor: DistanceFactor;
    deviationAlerts: DeviationAlert[];

    // Summary flags
    hasScarcity: boolean;
    hasSeasonalAdjustment: boolean;
    isRemoteLocation: boolean;
    hasDeviations: boolean;
    criticalDeviations: number;

    // Blueprint Intelligence (v9.0)
    blueprintPrediction?: PredictionResult | null;
    costEstimate?: CostEstimate | null;

    // Timestamp
    generatedAt: Date;
}

// =================== Main Generator ===================

/**
 * Generate a complete InsightReport by collecting data from all cognitive layers.
 * This is the FINAL orchestrator — called AFTER calculateProjectCosts().
 */
export function generateInsightReport(
    state: AppState,
    calculatedItems: CalculatedItem[],
    masterItems: BaseItem[],
    supplierProducts?: { stock: number; status: string; category: string }[],
    externalPrices?: { status: string; validUntil?: string; category: string }[]
): InsightReport {

    // --- Layer 1: Memory ---
    const currentCostPerSqm = state.buildArea > 0
        ? calculatedItems.reduce((sum, item) => sum + item.totalLinePrice, 0) / state.buildArea
        : 0;

    const baselineComparison = contextualMemoryService.compareWithBaseline(
        state.projectType,
        state.location,
        currentCostPerSqm
    );

    // --- Layer 2: Intuition (Scarcity) ---
    const scarcityAlerts = detectScarcity(
        (supplierProducts || []) as any,
        (externalPrices || []) as any
    );

    // --- Layer 3: Deviations ---
    const deviationAlerts = runDeviationScan(calculatedItems, masterItems);

    // --- Layer 4: Environment ---
    const seasonalAdjustment = getSeasonalAdjustments(state.location);
    const distanceFactor = getDistanceFactor(state.location);

    // --- Layer 5: Financial Insight ---
    const totalCost = calculatedItems.reduce((acc, item) => acc + (item.totalMaterialCost || 0) + (item.totalLaborCost || 0), 0);
    const totalPrice = calculatedItems.reduce((acc, item) => acc + (item.totalLinePrice || 0), 0);
    const totalProfit = totalPrice - totalCost;
    const margin = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;
    
    // Find highest and lowest margin items
    let highestMarginItem = calculatedItems[0];
    let lowestMarginItem = calculatedItems[0];
    
    calculatedItems.forEach(item => {
        const cost = (item.totalMaterialCost || 0) + (item.totalLaborCost || 0);
        const price = item.totalLinePrice || 0;
        const profit = price - cost;
        const itemMargin = price > 0 ? (profit / price) * 100 : 0;
        
        if (highestMarginItem) {
            const hCost = (highestMarginItem.totalMaterialCost || 0) + (highestMarginItem.totalLaborCost || 0);
            const hPrice = highestMarginItem.totalLinePrice || 0;
            const hMargin = hPrice > 0 ? ((hPrice - hCost) / hPrice) * 100 : 0;
            if (itemMargin > hMargin) highestMarginItem = item;
        } else { highestMarginItem = item; }
        
        if (lowestMarginItem) {
            const lCost = (lowestMarginItem.totalMaterialCost || 0) + (lowestMarginItem.totalLaborCost || 0);
            const lPrice = lowestMarginItem.totalLinePrice || 0;
            const lMargin = lPrice > 0 ? ((lPrice - lCost) / lPrice) * 100 : 0;
            if (itemMargin < lMargin && itemMargin > 0) lowestMarginItem = item;
        } else { lowestMarginItem = item; }
    });

    const financialAnalysisText = {
        ar: `بناءً على التحليل العميق: الهامش الربحي الإجمالي للمشروع هو ${margin.toFixed(1)}%. 
البند الأعلى ربحية هو "${highestMarginItem?.descriptionAr || 'غير محدد'}"، 
بينما البند الأقل ربحية (أو الأكثر خطورة) هو "${lowestMarginItem?.descriptionAr || 'غير محدد'}". 
يرجى مراجعة تكاليف البند الأخير أو التفاوض مع الموردين لتحسين الربحية.`,
        en: `Based on deep analysis: The overall profit margin is ${margin.toFixed(1)}%. 
The most profitable item is "${highestMarginItem?.descriptionEn || 'Unknown'}", 
while the lowest margin (high risk) item is "${lowestMarginItem?.descriptionEn || 'Unknown'}". 
Consider reviewing costs for the latter to improve profitability.`,
        fr: `Marge bénéficiaire: ${margin.toFixed(1)}%. Consultez l'article le moins rentable.`,
        zh: `利润率: ${margin.toFixed(1)}%. 检查利润最低的项目.`
    };

    // --- Layer 6: Build Golden Sentence ---
    const goldenSentence = buildGoldenSentence(
        baselineComparison,
        scarcityAlerts,
        seasonalAdjustment,
        distanceFactor,
        deviationAlerts,
        state
    );

    // --- Layer 7: Blueprint Intelligence ---
    let blueprintPrediction: PredictionResult | null = null;
    let costEstimate: CostEstimate | null = null;
    try {
        blueprintPrediction = blueprintIntelligence.predict({
            projectType: state.projectType,
            plotArea: state.landArea || 300,
            floorsCount: state.floors || 2,
        });
        costEstimate = blueprintPrediction?.costEstimate || null;
    } catch { /* silent — brain layer is optional */ }

    return {
        goldenSentence,
        financialAnalysisText,
        confidence: baselineComparison?.confidence || 0,
        baselineComparison,
        scarcityAlerts,
        seasonalAdjustment,
        distanceFactor,
        deviationAlerts,
        hasScarcity: scarcityAlerts.length > 0,
        hasSeasonalAdjustment: seasonalAdjustment.isAdjusted,
        isRemoteLocation: distanceFactor.isRemote,
        hasDeviations: deviationAlerts.length > 0,
        criticalDeviations: deviationAlerts.filter(d => d.severity === 'critical').length,
        blueprintPrediction,
        costEstimate,
        generatedAt: new Date(),
    };
}

// =================== Golden Sentence Builder ===================

function buildGoldenSentence(
    baseline: BaselineComparison | null,
    scarcity: ScarcityAlert[],
    seasonal: SeasonalAdjustment,
    distance: DistanceFactor,
    deviations: DeviationAlert[],
    state: AppState
): Record<Language, string> {
    return {
        ar: buildAR(baseline, scarcity, seasonal, distance, deviations, state),
        en: buildEN(baseline, scarcity, seasonal, distance, deviations, state),
        fr: buildFR(baseline, scarcity, seasonal, distance, state),
        zh: buildZH(baseline, scarcity, seasonal, distance, state),
    };
}

function buildAR(
    baseline: BaselineComparison | null,
    scarcity: ScarcityAlert[],
    seasonal: SeasonalAdjustment,
    distance: DistanceFactor,
    deviations: DeviationAlert[],
    state: AppState
): string {
    const parts: string[] = [];

    // Part 1: Confidence
    if (baseline?.hasBaseline && baseline.costComparison) {
        const conf = Math.round((baseline.confidence || 0) * 100);
        const avg = baseline.costComparison.baselineCostPerSqm;
        const src = baseline.baselineSource?.ar || '';
        parts.push(`📊 بناءً على ${src}، متوسط التكلفة ${avg.toLocaleString()} ر.س/م² (ثقة ${conf}%).`);

        const diff = baseline.costComparison.differencePercent;
        if (diff > 10) parts.push(`↗️ تكلفتك أعلى ${diff.toFixed(1)}% من المتوسط.`);
        else if (diff < -10) parts.push(`↘️ تكلفتك أقل ${Math.abs(diff).toFixed(1)}% من المتوسط.`);
    }

    // Part 2: Scarcity
    if (scarcity.length > 0) {
        const cats = scarcity.map(s => s.materialCategory).join('، ');
        parts.push(`⚠️ تحذير ندرة: ${cats}.`);
    }

    // Part 3: Seasonal
    if (seasonal.isAdjusted) {
        if (seasonal.season === 'summer') {
            parts.push(`🌡️ الصيف: توصية بإضافات تأخير شك (+${seasonal.concreteTotalExtraCost} ر.س/م³) وإنتاجية ${(seasonal.laborProductivityFactor * 100).toFixed(0)}%.`);
        } else if (seasonal.season === 'winter') {
            parts.push(`❄️ الشتاء: توصية ببطانيات حرارية وتسريع شك (+${seasonal.concreteTotalExtraCost} ر.س/م³).`);
        }
    }

    // Part 4: Distance
    if (distance.isRemote) {
        parts.push(`📍 الموقع يبعد ${distance.distanceKm} كم — تكلفة نقل إضافية ${distance.shippingCostPerTon} ر.س/طن.`);
    }

    // Part 5: Deviations
    const critical = deviations.filter(d => d.severity === 'critical');
    if (critical.length > 0) {
        parts.push(`🚨 ${critical.length} بند بانحراف حرج يتجاوز 15%.`);
    }

    return parts.length > 0
        ? parts.join(' ')
        : '✅ لا توجد تنبيهات — البيانات ضمن المعدلات الطبيعية.';
}

function buildEN(
    baseline: BaselineComparison | null,
    scarcity: ScarcityAlert[],
    seasonal: SeasonalAdjustment,
    distance: DistanceFactor,
    deviations: DeviationAlert[],
    state: AppState
): string {
    const parts: string[] = [];

    if (baseline?.hasBaseline && baseline.costComparison) {
        const conf = Math.round((baseline.confidence || 0) * 100);
        const avg = baseline.costComparison.baselineCostPerSqm;
        const src = baseline.baselineSource?.en || '';
        parts.push(`📊 Based on ${src}, average cost is ${avg.toLocaleString()} SAR/m² (${conf}% confidence).`);
    }

    if (scarcity.length > 0) {
        parts.push(`⚠️ Scarcity alert: ${scarcity.map(s => s.materialCategory).join(', ')}.`);
    }

    if (seasonal.isAdjusted && seasonal.season === 'summer') {
        parts.push(`🌡️ Summer: Add ${seasonal.concreteTotalExtraCost} SAR/m³ for retarders. Labor at ${(seasonal.laborProductivityFactor * 100).toFixed(0)}%.`);
    } else if (seasonal.isAdjusted && seasonal.season === 'winter') {
        parts.push(`❄️ Winter: Add ${seasonal.concreteTotalExtraCost} SAR/m³ for accelerators and thermal blankets.`);
    }

    if (distance.isRemote) {
        parts.push(`📍 Remote site: ${distance.distanceKm}km from hub — shipping +${distance.shippingCostPerTon} SAR/ton.`);
    }

    const critical = deviations.filter(d => d.severity === 'critical');
    if (critical.length > 0) {
        parts.push(`🚨 ${critical.length} critical deviations exceeding 15%.`);
    }

    return parts.length > 0
        ? parts.join(' ')
        : '✅ No alerts — all data within normal ranges.';
}

function buildFR(
    baseline: BaselineComparison | null,
    scarcity: ScarcityAlert[],
    seasonal: SeasonalAdjustment,
    distance: DistanceFactor,
    state: AppState
): string {
    const parts: string[] = [];

    if (baseline?.hasBaseline && baseline.costComparison) {
        const conf = Math.round((baseline.confidence || 0) * 100);
        parts.push(`📊 Confiance ${conf}% basée sur ${baseline.baselineSource?.fr || ''}.`);
    }
    if (scarcity.length > 0) parts.push(`⚠️ Pénurie: ${scarcity.map(s => s.materialCategory).join(', ')}.`);
    if (seasonal.isAdjusted) parts.push(`🌡️ Ajustement saisonnier: +${seasonal.concreteTotalExtraCost} SAR/m³.`);
    if (distance.isRemote) parts.push(`📍 Site distant: ${distance.distanceKm}km.`);

    return parts.length > 0 ? parts.join(' ') : '✅ Aucune alerte.';
}

function buildZH(
    baseline: BaselineComparison | null,
    scarcity: ScarcityAlert[],
    seasonal: SeasonalAdjustment,
    distance: DistanceFactor,
    state: AppState
): string {
    const parts: string[] = [];

    if (baseline?.hasBaseline && baseline.costComparison) {
        const conf = Math.round((baseline.confidence || 0) * 100);
        parts.push(`📊 置信度 ${conf}%，基于 ${baseline.baselineSource?.zh || ''}。`);
    }
    if (scarcity.length > 0) parts.push(`⚠️ 短缺警报：${scarcity.map(s => s.materialCategory).join('、')}。`);
    if (seasonal.isAdjusted) parts.push(`🌡️ 季节调整：+${seasonal.concreteTotalExtraCost} SAR/m³。`);
    if (distance.isRemote) parts.push(`📍 偏远工地：${distance.distanceKm}km。`);

    return parts.length > 0 ? parts.join(' ') : '✅ 无警报，数据在正常范围内。';
}
