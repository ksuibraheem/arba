/**
 * ARBA Cognitive Engine v4.1 — Intuition Bridge
 * جسر الحدس — كشف الندرة وحلقة الملاحظات الميدانية
 * 
 * LAYER 2: The Intuition Layer
 * - Scarcity Detection: Scans supplier stock levels to trigger MarketRiskFactor
 * - Field Feedback Loop: Auto-adjusts waste factors based on contractor performance data
 * 
 * READS FROM: supplierService (SupplierProduct.stock), externalSupplierService (ExternalPrice)
 * WRITES TO: scarcityAlerts (in-memory), contractorPerformance (localStorage/Firebase)
 * 
 * ⚠️ MIDDLEWARE: Does NOT modify calculateProjectCosts().
 */

import { Language } from '../types';
import { SupplierProduct } from './supplierService';
import { ExternalPrice } from './externalSupplierService';

// =================== Scarcity Detection Types ===================

export interface ScarcityAlert {
    materialCategory: string;
    affectedItemIds: string[];

    // Scarcity data
    suppliersChecked: number;
    suppliersOutOfStock: number;
    expiredPrices: number;
    scarcityRatio: number;              // 0-1 (proportion of suppliers out of stock)

    // Market risk
    marketRiskFactor: number;           // 1.0 normal | 1.05-1.15 scarce
    severity: 'low' | 'medium' | 'high';

    explanation: Record<Language, string>;
}

// =================== Field Feedback Types ===================

export interface ContractorPerformanceLog {
    id: string;
    contractorId: string;
    contractorName: string;
    projectId: string;

    // Field data (entered by site engineer from Team Dashboard)
    itemId: string;
    actualWastePercent: number;
    expectedWastePercent: number;

    // Evidence (optional)
    photoUrls?: string[];
    notes?: string;

    reportedBy: string;
    reportedAt: Date;
}

export interface ContractorWasteProfile {
    contractorId: string;
    contractorName: string;
    totalLogs: number;
    avgWasteOverage: number;            // Average overuse ratio (1.0 = perfect, 1.2 = 20% more waste)
    isHighWaster: boolean;              // True if consistently >15% over expected
    adjustmentFactor: number;           // Multiplier for future bids
}

// =================== Item Category Mapping ===================

/** Map supplier product categories to ITEMS_DATABASE item IDs */
const CATEGORY_TO_ITEM_IDS: Record<string, string[]> = {
    steel: ['02.04'],
    cement: ['02.01', '02.02', '02.03', '04.01'],
    tiles: ['04.04', '04.05', '04.06'],
    paints: ['04.03', '12.02'],
    plumbing: ['05.01', '05.02'],
    electrical: ['06.03', '06.04', '06.05'],
    wood: ['11.02'],
    blocks: ['02.05', '02.06'],
    insulation: ['03.01', '03.02'],
    hvac: ['07.01', '07.02'],
};

function getItemIdsByCategory(category: string): string[] {
    return CATEGORY_TO_ITEM_IDS[category] || [];
}

// =================== Scarcity Detection Engine ===================

/**
 * Scan all supplier products and external prices to detect material scarcity.
 * Triggers risk factors when too many suppliers are out of stock.
 */
export function detectScarcity(
    supplierProducts: SupplierProduct[],
    externalPrices: ExternalPrice[]
): ScarcityAlert[] {
    const alerts: ScarcityAlert[] = [];
    const categories = new Map<string, { total: number; outOfStock: number; expired: number }>();

    // Scan internal supplier products
    for (const product of supplierProducts) {
        if (!product.category) continue;
        const entry = categories.get(product.category) || { total: 0, outOfStock: 0, expired: 0 };
        entry.total++;

        // stock === 0 OR status === 'inactive' → out of stock
        if (product.stock === 0 || product.status === 'inactive') {
            entry.outOfStock++;
        }
        categories.set(product.category, entry);
    }

    // Scan external prices for expired/outdated entries
    for (const price of externalPrices) {
        if (!price.category) continue;
        const entry = categories.get(price.category) || { total: 0, outOfStock: 0, expired: 0 };

        if (price.status === 'outdated' ||
            (price.validUntil && new Date(price.validUntil) < new Date())) {
            entry.expired++;
        }
        categories.set(price.category, entry);
    }

    // Generate alerts
    for (const [category, data] of categories) {
        if (data.total === 0) continue;
        const scarcityRatio = (data.outOfStock + data.expired) / data.total;

        if (scarcityRatio > 0.3) { // More than 30% unavailable
            let marketRiskFactor = 1.0;
            let severity: ScarcityAlert['severity'] = 'low';

            if (scarcityRatio > 0.7) {
                marketRiskFactor = 1.15; severity = 'high';
            } else if (scarcityRatio > 0.5) {
                marketRiskFactor = 1.10; severity = 'medium';
            } else {
                marketRiskFactor = 1.05; severity = 'low';
            }

            const riskPct = ((marketRiskFactor - 1) * 100).toFixed(0);

            alerts.push({
                materialCategory: category,
                affectedItemIds: getItemIdsByCategory(category),
                suppliersChecked: data.total,
                suppliersOutOfStock: data.outOfStock,
                expiredPrices: data.expired,
                scarcityRatio,
                marketRiskFactor,
                severity,
                explanation: {
                    ar: `⚠️ ندرة في ${category}: ${data.outOfStock} من ${data.total} مورد نفد مخزونه. نوصي بزيادة ${riskPct}% للمخاطر.`,
                    en: `⚠️ Scarcity in ${category}: ${data.outOfStock}/${data.total} out of stock. Risk factor: +${riskPct}%.`,
                    fr: `⚠️ Pénurie de ${category}: ${data.outOfStock}/${data.total} en rupture. Facteur risque: +${riskPct}%.`,
                    zh: `⚠️ ${category} 短缺：${data.outOfStock}/${data.total} 缺货。风险系数：+${riskPct}%。`,
                },
            });
        }
    }

    return alerts;
}

// =================== Field Feedback Loop ===================

const FEEDBACK_KEY = 'arba_contractor_performance';

class FieldFeedbackService {

    /**
     * Log a contractor's actual waste performance from the field
     */
    addPerformanceLog(log: Omit<ContractorPerformanceLog, 'id'>): ContractorPerformanceLog {
        const logs = this.getLogs();
        const newLog: ContractorPerformanceLog = {
            ...log,
            id: `cflog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        logs.push(newLog);
        this.saveLogs(logs);
        return newLog;
    }

    /**
     * Get the waste adjustment factor for a specific contractor.
     * If contractor consistently wastes >15% more than expected, returns >1.0.
     */
    getContractorWasteAdjustment(contractorId: string): number {
        const profile = this.getContractorProfile(contractorId);
        return profile?.adjustmentFactor || 1.0;
    }

    /**
     * Build a performance profile for a contractor
     */
    getContractorProfile(contractorId: string): ContractorWasteProfile | null {
        const logs = this.getLogs().filter(l => l.contractorId === contractorId);
        if (logs.length < 3) return null; // Not enough data

        const avgOverage = logs.reduce((sum, log) => {
            const expected = Math.max(0.01, log.expectedWastePercent);
            return sum + (log.actualWastePercent / expected);
        }, 0) / logs.length;

        const isHighWaster = avgOverage > 1.15;

        return {
            contractorId,
            contractorName: logs[0]?.contractorName || '',
            totalLogs: logs.length,
            avgWasteOverage: Math.round(avgOverage * 100) / 100,
            isHighWaster,
            adjustmentFactor: isHighWaster ? avgOverage : 1.0,
        };
    }

    /**
     * Get all contractor profiles
     */
    getAllProfiles(): ContractorWasteProfile[] {
        const logs = this.getLogs();
        const contractorIds = [...new Set(logs.map(l => l.contractorId))];
        return contractorIds
            .map(id => this.getContractorProfile(id))
            .filter((p): p is ContractorWasteProfile => p !== null);
    }

    // =================== Persistence ===================

    private getLogs(): ContractorPerformanceLog[] {
        try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]'); } catch { return []; }
    }

    private saveLogs(logs: ContractorPerformanceLog[]): void {
        // Keep last 1000 entries
        if (logs.length > 1000) logs = logs.slice(-1000);
        localStorage.setItem(FEEDBACK_KEY, JSON.stringify(logs));
    }
}

export const fieldFeedbackService = new FieldFeedbackService();
