/**
 * Client Data Filter — فلتر بيانات العميل
 * Strips sensitive data before exposing to Zone B (Client Portal)
 * 
 * SECURITY: This is the data barrier between Zone A and Zone B.
 * Clients must NEVER see: raw uploads, sanitization logs, formula breakdowns,
 * competitor names, or internal cost components.
 */

import { ArbaProject, ArbaQuote, SecurityAlert } from './projectTypes';

// =================== CLIENT-SAFE TYPES ===================

/** What clients see for a project — NO internal data */
export interface ClientProjectView {
    id: string;
    name: string;
    projectType: string;
    status: 'submitted' | 'approved' | 'archived';  // No 'draft' or 'active'
    location?: string;
    estimatedValue: number;
    currency: 'SAR';
    quoteCount: number;
    latestQuoteId?: string;
    updatedAt: any;
}

/** What clients see for a quote — NO storage paths */
export interface ClientQuoteView {
    id: string;
    version: number;
    quoteNumber: string;
    pdfUrl: string;          // Download URL only
    finalPrice: number;
    totalItems: number;
    generatedAt: any;
}

/** What clients see for a price item — NO formula breakdown */
export interface ClientPriceItem {
    serial: number;
    description: string;
    unit: string;
    quantity: number;
    unitRate: number;        // Final rate ONLY — no material/labor/waste split
    total: number;
}

// =================== FILTER FUNCTIONS ===================

/**
 * Strip internal data from a project for client view.
 * Removes: stateSnapshot, assignedTo, ownerId
 */
export function sanitizeProjectForClient(project: ArbaProject): ClientProjectView {
    // Only show client-visible statuses
    const visibleStatus = (['submitted', 'approved', 'archived'] as const).includes(
        project.status as any
    ) ? project.status as 'submitted' | 'approved' | 'archived' : 'submitted';

    return {
        id: project.id,
        name: project.name,
        projectType: project.projectType,
        status: visibleStatus,
        location: project.location,
        estimatedValue: project.estimatedValue,
        currency: 'SAR',
        quoteCount: project.quoteCount,
        latestQuoteId: project.latestQuoteId,
        updatedAt: project.updatedAt,
    };
    // STRIPPED: stateSnapshot, assignedTo, ownerId
}

/**
 * Strip storage paths from a quote for client view.
 */
export function sanitizeQuoteForClient(quote: ArbaQuote): ClientQuoteView {
    return {
        id: quote.id,
        version: quote.version,
        quoteNumber: quote.quoteNumber,
        pdfUrl: quote.pdfUrl,           // Download URL is safe
        finalPrice: quote.finalPrice,
        totalItems: quote.totalItems,
        generatedAt: quote.generatedAt,
    };
    // STRIPPED: pdfStoragePath, generatedBy, generatedByName, fileSize
}

/**
 * Convert a calculated item to client-safe format.
 * CRITICAL: Only expose final unit rate and total.
 * Material cost, labor cost, wastage, overhead — ALL hidden.
 */
export function sanitizeItemForClient(
    item: { displayName: string; unit: string; qty: number; finalUnitPrice: number; totalLinePrice: number },
    serial: number
): ClientPriceItem {
    return {
        serial,
        description: item.displayName,
        unit: item.unit,
        quantity: item.qty,
        unitRate: item.finalUnitPrice,
        total: item.totalLinePrice,
    };
    // STRIPPED: matCost, labCost, wasteCost, directUnitCost, overheadUnitShare,
    //          profitAmount, selectedSupplier, activeParams, steelRatio, etc.
}

/**
 * Batch sanitize all projects for client view.
 * Also filters out 'draft' and 'active' status projects.
 */
export function sanitizeProjectsForClient(projects: ArbaProject[]): ClientProjectView[] {
    return projects
        .filter(p => p.status !== 'draft' && p.status !== 'active')
        .map(sanitizeProjectForClient);
}

/**
 * Check if any data field contains sensitive information that should be blocked.
 * Used as a safety net before rendering in Zone B.
 */
export function containsSensitiveData(data: any): boolean {
    const sensitiveKeys = [
        'stateSnapshot', 'assignedTo', 'ownerId', 'pdfStoragePath',
        'matCost', 'labCost', 'wasteCost', 'directUnitCost', 'overheadUnitShare',
        'profitAmount', 'selectedSupplier', 'activeParams', 'steelRatio',
        'cementContent', 'baseMaterial', 'baseLabor', 'waste',
    ];

    if (typeof data !== 'object' || data === null) return false;

    for (const key of Object.keys(data)) {
        if (sensitiveKeys.includes(key)) return true;
        if (typeof data[key] === 'object' && containsSensitiveData(data[key])) return true;
    }
    return false;
}
