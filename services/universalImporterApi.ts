/**
 * Arba Universal Importer — Client API Wrapper
 * واجهة العميل لمحلل الملفات الموحد
 * 
 * Calls Firebase Cloud Functions via httpsCallable.
 * NEVER sends raw data processing to client — only receives results.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebase/config';

// Initialize Firebase Functions
const functions = getFunctions(app, 'us-central1');

// =================== Types ===================

export interface DetectedCompany {
    name: string;
    severity: 'critical' | 'warning' | 'info';
    category: string;
    location: string;
    snippet: string;
}

export interface OcrDetectionResult {
    matchedCompany: string;
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
    type: 'logo' | 'watermark' | 'text_branding';
}

export interface OcrResults {
    totalImages: number;
    scannedImages: number;
    hasVisualBranding: boolean;
    detections: OcrDetectionResult[];
}

export interface SecurityAlert {
    isClean: boolean;
    totalMatches: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    securityAlertLevel: 'BLOCKED' | 'WARNING' | 'CLEAN';
    detectedCompanies: DetectedCompany[];
    metadataFlags: string[];
    ocrResults: OcrResults | null;
}

export interface TargetFieldInfo {
    key: string;
    labels: { ar: string; en: string };
    type: string;
    required: boolean;
}

export interface ScanResult {
    scanId: string;
    fileName: string;
    fileType: 'excel' | 'csv' | 'pdf';
    sheetNames: string[];
    rowCounts: number[];
    securityAlert: SecurityAlert;
    headers: string[];
    columnTypes: Record<string, string>;
    autoMappings: Record<string, string>;
    targetFields: TargetFieldInfo[];
    fileMetadata: {
        hasAuthor: boolean;
        hasCompany: boolean;
        authorName?: string;
    };
}

export interface ProcessedItemResult {
    id: string;
    name: { ar: string; en: string; fr: string; zh: string };
    unit: string;
    qty: number;
    totalUnitCost: number;
    totalLinePrice: number;
    category: string;
    sbc: string;
    isImported: boolean;
    source: string;
}

export interface ProcessResult {
    success: boolean;
    importId: string;
    itemCount: number;
    totalValue: number;
    items: ProcessedItemResult[];
    sanitizationSummary: {
        purgeApplied: boolean;
        itemsRemoved: number;
        removedSamples: string[];
    };
    branding: {
        stamp: string;
        whiteLabelApplied: boolean;
    };
}

// =================== API Functions ===================

/**
 * Upload and scan a file
 * Sends file to Cloud Function, receives Pre-Flight Security Alert
 */
export async function uploadAndScan(file: File): Promise<ScanResult> {
    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const parseAndScanFn = httpsCallable<any, ScanResult>(functions, 'parseAndScan');

    const result = await parseAndScanFn({
        fileBase64: base64,
        fileName: file.name,
    });

    return result.data;
}

/**
 * Confirm purge and process data
 * Sends column mappings and purge confirmation to Cloud Function
 */
export async function confirmAndProcess(
    scanId: string,
    columnMappings: Record<string, string>,
    purgeConfirmed: boolean,
    selectedSheet: number = 0,
    overheadConfig?: {
        overheadMultiplier?: number;
        profitMargin?: number;
        contingency?: number;
    }
): Promise<ProcessResult> {
    const sanitizeAndProcessFn = httpsCallable<any, ProcessResult>(functions, 'sanitizeAndProcess');

    const result = await sanitizeAndProcessFn({
        scanId,
        columnMappings,
        purgeConfirmed,
        selectedSheet,
        overheadConfig,
    });

    return result.data;
}

// =================== API Gateway Functions ===================

// --- Auto-Process Types ---

export interface PipelineStage {
    name: string;
    status: 'success' | 'failed' | 'skipped' | 'paused';
    durationMs: number;
    details?: string;
}

export interface AutoProcessOptions {
    autoPurge?: boolean;
    overheadConfig?: {
        overheadMultiplier?: number;
        profitMargin?: number;
        contingency?: number;
    };
    injectMarketRates?: boolean;
    marketRegion?: 'riyadh' | 'jeddah' | 'dammam';
    selectedSheet?: number;
}

export interface AutoProcessResult {
    success: boolean;
    mode: 'auto_complete' | 'paused_for_review';
    importId?: string;
    sessionId?: string;
    pipeline: PipelineStage[];
    totalDurationMs: number;
    securityReport: {
        alertLevel: 'BLOCKED' | 'WARNING' | 'CLEAN';
        totalMatches: number;
        criticalCount: number;
        warningCount: number;
        detectedCompanies: { name: string; severity: string; category: string }[];
        ocrDetections: number;
    };
    items?: ProcessedItemResult[];
    itemCount?: number;
    totalValue?: number;
    marketComparison?: MarketComparisonResult[];
    sanitizationSummary?: {
        purgeApplied: boolean;
        itemsRemoved: number;
    };
    columnMapping?: {
        autoMapped: boolean;
        headers: string[];
        mappings: Record<string, string>;
        targetFields: { key: string; labels: { ar: string; en: string }; required: boolean }[];
    };
}

export interface MarketComparisonResult {
    itemName: string;
    importedRate: number;
    marketRate: number;
    difference: number;
    differencePercent: number;
    status: 'above_market' | 'at_market' | 'below_market';
}

// --- Market Rate Types ---

export interface MaterialRate {
    id: string;
    category: string;
    subcategory: string;
    nameAr: string;
    nameEn: string;
    unit: string;
    rate: number;
    rates: { riyadh: number; jeddah: number; dammam: number };
    currency: 'SAR';
    source: string;
    confidence: number;
}

export interface MarketRatesResult {
    success: boolean;
    rates: MaterialRate[];
    totalResults: number;
    categories: { key: string; nameAr: string; nameEn: string; count: number }[];
    region: string;
}

// --- Health Status Types ---

export interface HealthStatus {
    status: string;
    timestamp: string;
    engines: Record<string, any>;
    cloudFunctions: string[];
}

// =================== API Gateway Client Functions ===================

/**
 * ⚡ Auto-Process — One-shot file processing via API Gateway
 * Upload → Parse → Scan → OCR → Purge → Map → Calculate → Save
 */
export async function autoProcess(
    file: File,
    options?: AutoProcessOptions
): Promise<AutoProcessResult> {
    const buffer = await file.arrayBuffer();
    const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const autoProcessFn = httpsCallable<any, AutoProcessResult>(functions, 'autoProcessFile');

    const result = await autoProcessFn({
        fileBase64: base64,
        fileName: file.name,
        options: options || {},
    });

    return result.data;
}

/**
 * 📊 Query Market Rates — Saudi construction material prices
 */
export async function queryMarketRates(
    query?: { category?: string; subcategory?: string; search?: string; region?: string }
): Promise<MarketRatesResult> {
    const queryFn = httpsCallable<any, MarketRatesResult>(functions, 'getMarketRates');
    const result = await queryFn(query || {});
    return result.data;
}

/**
 * 🏥 System Health Check — All engine statuses
 */
export async function getSystemHealth(): Promise<HealthStatus> {
    const healthFn = httpsCallable<any, HealthStatus>(functions, 'getHealthStatus');
    const result = await healthFn({});
    return result.data;
}
