"use strict";
/**
 * Arba API Gateway — Central Pipeline Orchestrator
 * بوابة API المركزية — المنسق الرئيسي
 *
 * Part of Arba API Gateway 🏗️
 *
 * Orchestrates the full data flow between:
 * - File Parser
 * - Security Shield (RegEx + OCR)
 * - Session Manager
 * - Formula Engine
 * - Market Rates Engine
 *
 * Hybrid Automation:
 * - CLEAN / WARNING → Auto-purge, auto-map, auto-calculate, save
 * - BLOCKED → Pause pipeline, save session, require manual review
 *
 * ALL processing is stateless and server-only.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFullPipeline = executeFullPipeline;
exports.getGatewayStats = getGatewayStats;
const admin = __importStar(require("firebase-admin"));
const fileParser_1 = require("./fileParser");
const sanitizationEngine_1 = require("./sanitizationEngine");
const ocrEngine_1 = require("./ocrEngine");
const formulaEngine_1 = require("./formulaEngine");
const sessionManager_1 = require("./sessionManager");
const marketRatesEngine_1 = require("./marketRatesEngine");
const db = admin.firestore();
// =================== Default Config ===================
const DEFAULT_OVERHEAD = {
    overheadMultiplier: 1.15,
    profitMargin: 0.10,
    contingency: 0.05,
};
// =================== Main Pipeline ===================
/**
 * Execute the full automated pipeline
 *
 * Flow: Parse → Scan → OCR → [Purge → Map → Calculate → Save]
 *
 * Hybrid Logic:
 * - CLEAN/WARNING: Auto-proceed through all stages
 * - BLOCKED: Pause after scan, save session for manual review
 *
 * ⚡ Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
 * ⚠️ Formula is computed EXCLUSIVELY here. NEVER on client.
 */
async function executeFullPipeline(fileBuffer, fileName, userId, options = {}) {
    const pipelineStart = Date.now();
    const stages = [];
    const overheadConfig = options.overheadConfig || DEFAULT_OVERHEAD;
    // ===== STAGE 1: Parse =====
    let parseResult;
    const parseStart = Date.now();
    try {
        parseResult = await (0, fileParser_1.parseFile)(fileBuffer, fileName);
        stages.push({
            name: 'parse',
            status: 'success',
            durationMs: Date.now() - parseStart,
            details: `${parseResult.sheets.length} sheets, ${parseResult.sheets.reduce((s, sh) => s + sh.rowCount, 0)} rows`,
        });
    }
    catch (error) {
        stages.push({ name: 'parse', status: 'failed', durationMs: Date.now() - parseStart, details: error.message });
        return buildFailedResult(stages, pipelineStart);
    }
    // ===== STAGE 2: Security Scan (RegEx) =====
    let scanReport;
    const scanStart = Date.now();
    try {
        scanReport = (0, sanitizationEngine_1.scanForFingerprints)(parseResult.sheets, parseResult.metadata);
        stages.push({
            name: 'scan',
            status: 'success',
            durationMs: Date.now() - scanStart,
            details: `${scanReport.totalMatches} matches, level: ${scanReport.securityAlertLevel}`,
        });
    }
    catch (error) {
        stages.push({ name: 'scan', status: 'failed', durationMs: Date.now() - scanStart, details: error.message });
        return buildFailedResult(stages, pipelineStart);
    }
    // ===== STAGE 3: OCR Visual Scan =====
    const ocrStart = Date.now();
    const scannableImages = parseResult.embeddedImages.filter(ocrEngine_1.isImageScannable);
    let ocrDetectionCount = 0;
    if (scannableImages.length > 0) {
        try {
            const ocrReport = await (0, ocrEngine_1.scanImagesForBranding)(scannableImages);
            scanReport.ocrReport = ocrReport;
            ocrDetectionCount = ocrReport.detections.length;
            // Upgrade alert level if OCR found critical branding
            if (ocrReport.hasVisualBranding) {
                const criticalOcr = ocrReport.detections.filter(d => d.severity === 'critical');
                if (criticalOcr.length > 0) {
                    scanReport.securityAlertLevel = 'BLOCKED';
                }
            }
            stages.push({
                name: 'ocr',
                status: 'success',
                durationMs: Date.now() - ocrStart,
                details: `${ocrReport.scannedImages}/${ocrReport.totalImages} images, ${ocrDetectionCount} detections`,
            });
        }
        catch (error) {
            stages.push({ name: 'ocr', status: 'failed', durationMs: Date.now() - ocrStart, details: `OCR non-blocking: ${error.message}` });
        }
    }
    else {
        stages.push({ name: 'ocr', status: 'skipped', durationMs: 0, details: 'No scannable images' });
    }
    // Build security report (always returned)
    const securityReport = {
        alertLevel: scanReport.securityAlertLevel,
        totalMatches: scanReport.totalMatches,
        criticalCount: scanReport.criticalCount,
        warningCount: scanReport.warningCount,
        detectedCompanies: scanReport.matches.map(m => ({
            name: m.pattern,
            severity: m.severity,
            category: m.companyCategory,
        })),
        ocrDetections: ocrDetectionCount,
    };
    // Auto-map columns (needed for both paths)
    const primarySheet = parseResult.sheets[options.selectedSheet || 0];
    const autoMappings = primarySheet
        ? (0, fileParser_1.autoMapColumns)(primarySheet.headers, parseResult.columnTypes)
        : {};
    // ===== DECISION POINT: Hybrid Automation =====
    if (scanReport.securityAlertLevel === 'BLOCKED') {
        // 🛑 BLOCKED → Pause pipeline, save session for manual review
        const sessionId = await (0, sessionManager_1.createSession)(userId, {
            fileName,
            fileType: parseResult.fileType,
            sheets: parseResult.sheets,
            metadata: parseResult.metadata,
            columnTypes: parseResult.columnTypes,
            headers: primarySheet?.headers || [],
            autoMappings,
            scanReport,
            ocrReport: scanReport.ocrReport || null,
            pipelineStage: 'scanned',
            securityAlertLevel: 'BLOCKED',
        });
        stages.push({ name: 'purge', status: 'paused', durationMs: 0, details: 'BLOCKED — Manual review required' });
        stages.push({ name: 'map', status: 'paused', durationMs: 0 });
        stages.push({ name: 'calculate', status: 'paused', durationMs: 0 });
        stages.push({ name: 'save', status: 'paused', durationMs: 0 });
        // Log security alert
        await db.collection('security_alerts').add({
            userId,
            fileName,
            alertLevel: 'BLOCKED',
            totalMatches: scanReport.totalMatches,
            criticalCount: scanReport.criticalCount,
            detectedCompanies: scanReport.matches.map(m => m.pattern),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            resolved: false,
        });
        return {
            success: true,
            mode: 'paused_for_review',
            sessionId,
            pipeline: stages,
            totalDurationMs: Date.now() - pipelineStart,
            securityReport,
            columnMapping: {
                autoMapped: true,
                headers: primarySheet?.headers || [],
                mappings: autoMappings,
                targetFields: fileParser_1.ARBA_SCHEMA_FIELDS.map(f => ({
                    key: f.key,
                    labels: f.labels,
                    required: f.required,
                })),
            },
        };
    }
    // ===== CLEAN / WARNING → Auto-proceed =====
    // ===== STAGE 4: Auto-Purge =====
    let processedSheets = parseResult.sheets;
    let purgeItemCount = 0;
    const purgeStart = Date.now();
    if (scanReport.totalMatches > 0) {
        try {
            const purgeResult = (0, sanitizationEngine_1.executePurge)(parseResult.sheets, parseResult.metadata, scanReport.matches);
            processedSheets = purgeResult.sanitizedSheets;
            purgeItemCount = purgeResult.removedItems.length;
            stages.push({
                name: 'purge',
                status: 'success',
                durationMs: Date.now() - purgeStart,
                details: `${purgeItemCount} items purged`,
            });
        }
        catch (error) {
            stages.push({ name: 'purge', status: 'failed', durationMs: Date.now() - purgeStart, details: error.message });
        }
    }
    else {
        stages.push({ name: 'purge', status: 'skipped', durationMs: 0, details: 'File is clean' });
    }
    // Apply white-label
    processedSheets = (0, sanitizationEngine_1.applyWhiteLabel)(processedSheets);
    // ===== STAGE 5: Auto-Map Columns =====
    const mapStart = Date.now();
    const targetSheet = processedSheets[options.selectedSheet || 0];
    if (!targetSheet) {
        stages.push({ name: 'map', status: 'failed', durationMs: Date.now() - mapStart, details: 'No valid sheet found' });
        return buildFailedResult(stages, pipelineStart, securityReport);
    }
    const rawItems = (0, formulaEngine_1.mapRowsToItems)(targetSheet.rows, targetSheet.headers, autoMappings);
    stages.push({
        name: 'map',
        status: rawItems.length > 0 ? 'success' : 'failed',
        durationMs: Date.now() - mapStart,
        details: `${rawItems.length} items mapped from ${Object.keys(autoMappings).length} columns`,
    });
    if (rawItems.length === 0) {
        return buildFailedResult(stages, pipelineStart, securityReport);
    }
    // ===== STAGE 6: Calculate (SECRET FORMULA — Server Only) =====
    // ⚠️ Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
    const calcStart = Date.now();
    let processedItems;
    try {
        processedItems = (0, formulaEngine_1.processImportedItems)(rawItems, overheadConfig);
        stages.push({
            name: 'calculate',
            status: 'success',
            durationMs: Date.now() - calcStart,
            details: `${processedItems.length} items calculated`,
        });
    }
    catch (error) {
        stages.push({ name: 'calculate', status: 'failed', durationMs: Date.now() - calcStart, details: error.message });
        return buildFailedResult(stages, pipelineStart, securityReport);
    }
    // ===== STAGE 6.5: Market Rate Comparison (Optional) =====
    let marketComparison;
    if (options.injectMarketRates) {
        try {
            const region = options.marketRegion || 'riyadh';
            marketComparison = await (0, marketRatesEngine_1.compareWithMarket)(processedItems.map(item => ({
                name: item.name.ar || item.name.en,
                rate: item.totalUnitCost,
                category: item.category,
            })), region);
            stages.push({
                name: 'market_compare',
                status: 'success',
                durationMs: 0,
                details: `${marketComparison.length} items compared with ${region} market rates`,
            });
        }
        catch (_e) {
            stages.push({ name: 'market_compare', status: 'skipped', durationMs: 0, details: 'Market comparison skipped' });
        }
    }
    // ===== STAGE 7: Save to Firestore =====
    const saveStart = Date.now();
    try {
        const importBatch = db.batch();
        const importRef = db.collection('users').doc(userId)
            .collection('imports').doc(`import_${Date.now()}`);
        importBatch.set(importRef, {
            fileName,
            fileType: parseResult.fileType,
            itemCount: processedItems.length,
            totalValue: processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0),
            purgeApplied: scanReport.totalMatches > 0,
            purgeRemovedCount: purgeItemCount,
            securityAlertLevel: scanReport.securityAlertLevel,
            overheadConfig,
            processedVia: 'api_gateway_auto',
            importedAt: admin.firestore.FieldValue.serverTimestamp(),
            importedBy: userId,
        });
        // Save individual items
        for (const item of processedItems) {
            const itemRef = importRef.collection('items').doc(item.id);
            importBatch.set(itemRef, item);
        }
        await importBatch.commit();
        stages.push({
            name: 'save',
            status: 'success',
            durationMs: Date.now() - saveStart,
            details: `${processedItems.length} items saved to Firestore`,
        });
        // Log the action
        await db.collection('action_logs').add({
            userId,
            action: 'api_gateway_auto_process',
            target: fileName,
            metadata: {
                itemCount: processedItems.length,
                totalValue: processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0),
                pipelineStages: stages.map(s => `${s.name}:${s.status}`).join(','),
                securityAlertLevel: scanReport.securityAlertLevel,
                totalDurationMs: Date.now() - pipelineStart,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            mode: 'auto_complete',
            importId: importRef.id,
            pipeline: stages,
            totalDurationMs: Date.now() - pipelineStart,
            securityReport,
            items: processedItems,
            itemCount: processedItems.length,
            totalValue: processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0),
            marketComparison,
            sanitizationSummary: {
                purgeApplied: scanReport.totalMatches > 0,
                itemsRemoved: purgeItemCount,
            },
            columnMapping: {
                autoMapped: true,
                headers: targetSheet.headers,
                mappings: autoMappings,
                targetFields: fileParser_1.ARBA_SCHEMA_FIELDS.map(f => ({
                    key: f.key,
                    labels: f.labels,
                    required: f.required,
                })),
            },
        };
    }
    catch (error) {
        stages.push({ name: 'save', status: 'failed', durationMs: Date.now() - saveStart, details: error.message });
        return buildFailedResult(stages, pipelineStart, securityReport);
    }
}
// =================== Helper ===================
function buildFailedResult(stages, pipelineStart, securityReport) {
    return {
        success: false,
        mode: 'auto_complete',
        pipeline: stages,
        totalDurationMs: Date.now() - pipelineStart,
        securityReport: securityReport || {
            alertLevel: 'CLEAN',
            totalMatches: 0,
            criticalCount: 0,
            warningCount: 0,
            detectedCompanies: [],
            ocrDetections: 0,
        },
    };
}
/**
 * Get gateway engine health stats
 */
function getGatewayStats() {
    return {
        engine: 'apiGateway',
        version: '1.0.0',
        pipelineStages: ['parse', 'scan', 'ocr', 'purge', 'map', 'calculate', 'market_compare', 'save'],
        hybridAutomation: {
            CLEAN: 'auto-proceed',
            WARNING: 'auto-proceed',
            BLOCKED: 'pause-for-review',
        },
        formulaLockdown: 'server-only',
    };
}
//# sourceMappingURL=apiGateway.js.map