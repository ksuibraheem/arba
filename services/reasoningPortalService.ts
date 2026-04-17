/**
 * ARBA Cognitive Engine v4.1 — Reasoning Portal Service
 * بوابة التبرير — لا تعديل بدون سبب
 * 
 * LAYER 5: The Accountability Layer
 * - Intercepts manual overrides that deviate >10% from system suggestion
 * - Forces a JustificationNode (category + reason + optional attachment)
 * - Feeds ReasoningAnalytics for future audit and pattern detection
 * 
 * WRAPS: auditLogService.ts (does NOT modify it)
 * WRITES TO: reasoningAnalytics (localStorage, with Firebase sync option)
 */

import { ProjectType, LocationType, Language } from '../types';

// =================== Types ===================

export type JustificationCategory =
    | 'market_fluctuation'      // تقلب السوق
    | 'client_specification'    // مواصفات خاصة من العميل
    | 'site_condition'          // ظروف الموقع
    | 'supplier_quote'          // عرض سعر خاص من مورد
    | 'engineering_judgment'    // حكم هندسي
    | 'seasonal_factor'         // عامل موسمي
    | 'other';

export const JUSTIFICATION_LABELS: Record<JustificationCategory, Record<Language, string>> = {
    market_fluctuation:   { ar: 'تقلب السوق', en: 'Market Volatility', fr: 'Volatilité du marché', zh: '市场波动' },
    client_specification: { ar: 'مواصفات العميل', en: 'Client Specification', fr: 'Spécification client', zh: '客户规格' },
    site_condition:       { ar: 'ظروف الموقع', en: 'Site Conditions', fr: 'Conditions du site', zh: '现场条件' },
    supplier_quote:       { ar: 'عرض سعر خاص', en: 'Supplier Quote', fr: 'Devis fournisseur', zh: '供应商报价' },
    engineering_judgment:  { ar: 'حكم هندسي', en: 'Engineering Judgment', fr: 'Jugement technique', zh: '工程判断' },
    seasonal_factor:      { ar: 'عامل موسمي', en: 'Seasonal Factor', fr: 'Facteur saisonnier', zh: '季节因素' },
    other:                { ar: 'أخرى', en: 'Other', fr: 'Autre', zh: '其他' },
};

export interface JustificationNode {
    id: string;

    // What was changed
    itemId: string;
    itemName: string;
    field: 'price' | 'quantity' | 'waste' | 'supplier';

    // Values
    originalValue: number;
    overriddenValue: number;
    deviationPercent: number;

    // Mandatory justification
    justification: string;
    category: JustificationCategory;
    attachmentUrl?: string;

    // Context
    projectId: string;
    projectType?: ProjectType;
    location?: LocationType;
    engineerId: string;
    engineerName: string;
    createdAt: Date;

    // Review
    reviewedBy?: string;
    reviewStatus: 'pending' | 'approved' | 'flagged';
}

// =================== Threshold Logic ===================

const JUSTIFICATION_THRESHOLD = 0.10; // 10%

/**
 * Check if a manual override requires justification.
 * Returns true if the deviation exceeds the threshold.
 */
export function requiresJustification(
    originalValue: number,
    newValue: number,
    threshold: number = JUSTIFICATION_THRESHOLD
): boolean {
    if (originalValue === 0) return newValue > 0;
    const deviation = Math.abs(newValue - originalValue) / originalValue;
    return deviation > threshold;
}

// =================== Service ===================

const REASONING_KEY = 'arba_reasoning_analytics';

class ReasoningPortalService {

    /**
     * Save a justification node
     */
    addJustification(node: Omit<JustificationNode, 'id' | 'createdAt' | 'reviewStatus'>): JustificationNode {
        const nodes = this.getNodes();
        const newNode: JustificationNode = {
            ...node,
            id: `reason_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            reviewStatus: 'pending',
        };
        nodes.push(newNode);
        this.saveNodes(nodes);
        return newNode;
    }

    /**
     * Get all justification nodes for a project
     */
    getProjectNodes(projectId: string): JustificationNode[] {
        return this.getNodes().filter(n => n.projectId === projectId);
    }

    /**
     * Get pending review nodes
     */
    getPendingNodes(): JustificationNode[] {
        return this.getNodes().filter(n => n.reviewStatus === 'pending');
    }

    /**
     * Update review status
     */
    reviewNode(nodeId: string, reviewedBy: string, status: 'approved' | 'flagged'): void {
        const nodes = this.getNodes();
        const idx = nodes.findIndex(n => n.id === nodeId);
        if (idx >= 0) {
            nodes[idx].reviewedBy = reviewedBy;
            nodes[idx].reviewStatus = status;
            this.saveNodes(nodes);
        }
    }

    /**
     * Analytics: Get most common justification categories
     */
    getCategoryBreakdown(): { category: JustificationCategory; count: number; percent: number }[] {
        const nodes = this.getNodes();
        const counts: Record<string, number> = {};

        for (const node of nodes) {
            counts[node.category] = (counts[node.category] || 0) + 1;
        }

        const total = nodes.length || 1;
        return Object.entries(counts)
            .map(([category, count]) => ({
                category: category as JustificationCategory,
                count,
                percent: Math.round((count / total) * 100),
            }))
            .sort((a, b) => b.count - a.count);
    }

    // =================== Persistence ===================

    private getNodes(): JustificationNode[] {
        try { return JSON.parse(localStorage.getItem(REASONING_KEY) || '[]'); } catch { return []; }
    }

    private saveNodes(nodes: JustificationNode[]): void {
        if (nodes.length > 500) nodes = nodes.slice(-500);
        localStorage.setItem(REASONING_KEY, JSON.stringify(nodes));
    }
}

export const reasoningPortalService = new ReasoningPortalService();
