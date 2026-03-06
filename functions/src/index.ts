/**
 * Arba Universal Intelligence Parser — Cloud Functions Entry Point
 * نقطة الدخول الرئيسية لـ Cloud Functions
 * 
 * Part of Arba Security Shield 🛡️
 * 
 * TWO Callable Functions:
 * 1. parseAndScan — Parse file + Pre-Flight Security Alert + OCR
 * 2. sanitizeAndProcess — Execute The Purge + Apply Formula + Save
 * 
 * ALL processing is server-only. The client never sees raw data,
 * sanitization rules, or the pricing formula.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { parseFile, autoMapColumns, ARBA_SCHEMA_FIELDS } from './fileParser';
import { scanForFingerprints, executePurge, applyWhiteLabel } from './sanitizationEngine';
import { mapRowsToItems, processImportedItems, OverheadConfig } from './formulaEngine';
import { scanImagesForBranding, extractImagesFromExcel, isImageScannable } from './ocrEngine';
import { executeFullPipeline, getGatewayStats } from './apiGateway';
import { createSession, getSession, deleteSession, cleanupExpiredSessions } from './sessionManager';
import { queryRates, getCategories, getEngineStats as getMarketEngineStats } from './marketRatesEngine';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// =================== Temporary Storage ===================
// In production, use Firestore or Cloud Storage for scan sessions
const scanSessions = new Map<string, {
    sheets: any[];
    metadata: any;
    columnTypes: any;
    headers: string[];
    autoMappings: Record<string, string>;
    report: any;
    ocrReport: any;
    createdAt: number;
}>();

// Clean up old sessions every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, session] of scanSessions.entries()) {
        if (now - session.createdAt > 3600000) { // 1 hour
            scanSessions.delete(key);
        }
    }
}, 3600000);

// =================== Function 1: Parse & Scan ===================

/**
 * parseAndScan — Receives file as base64, parses it, scans for
 * competitor fingerprints + OCR visual branding, and returns
 * a Pre-Flight Security Alert.
 * 
 * Part of Arba Security Shield 🛡️
 * 
 * The client uploads the file and gets back:
 * - Pre-Flight Security Alert (detected company names + OCR results)
 * - Security Alert Level (BLOCKED / WARNING / CLEAN)
 * - Column headers (for mapping UI)
 * - Auto-suggested column mappings
 * - Scan session ID (for step 2)
 * 
 * The raw data stays on the server.
 */
export const parseAndScan = onCall({
    maxInstances: 10,
    timeoutSeconds: 180,
    memory: '1GiB',
    region: 'us-central1',
}, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول / Authentication required');
    }

    const { fileBase64, fileName } = request.data;

    if (!fileBase64 || !fileName) {
        throw new HttpsError('invalid-argument', 'File data and name are required');
    }

    try {
        // 1. Decode file from base64
        const buffer = Buffer.from(fileBase64, 'base64');

        // Validate file size (max 10MB)
        if (buffer.length > 10 * 1024 * 1024) {
            throw new HttpsError('invalid-argument', 'File size exceeds 10MB limit');
        }

        // 2. Parse file (server-side only)
        const parseResult = await parseFile(buffer, fileName);

        // 3. Scan for Competitor Fingerprints (text-based)
        const scanReport = scanForFingerprints(parseResult.sheets, parseResult.metadata);

        // 4. OCR Visual De-branding Scan
        let ocrReport = null;
        const allImages = parseResult.embeddedImages.filter(isImageScannable);
        if (allImages.length > 0) {
            try {
                ocrReport = await scanImagesForBranding(allImages);
                // Merge OCR results into scan report
                scanReport.ocrReport = ocrReport;

                // Upgrade alert level if OCR found branding
                if (ocrReport.hasVisualBranding) {
                    const criticalOcr = ocrReport.detections.filter(d => d.severity === 'critical');
                    if (criticalOcr.length > 0 && scanReport.securityAlertLevel !== 'BLOCKED') {
                        scanReport.securityAlertLevel = 'BLOCKED';
                    }
                }
            } catch (ocrErr) {
                console.warn('OCR scan failed (non-blocking):', ocrErr);
            }
        }

        // 5. Auto-map columns
        const primarySheet = parseResult.sheets[0];
        const autoMappings = primarySheet
            ? autoMapColumns(primarySheet.headers, parseResult.columnTypes)
            : {};

        // 6. Store scan session (server-only, raw data never leaves)
        const scanId = `scan_${request.auth.uid}_${Date.now()}`;
        scanSessions.set(scanId, {
            sheets: parseResult.sheets,
            metadata: parseResult.metadata,
            columnTypes: parseResult.columnTypes,
            headers: primarySheet?.headers || [],
            autoMappings,
            report: scanReport,
            ocrReport,
            createdAt: Date.now(),
        });

        // 7. Log the action
        await db.collection('action_logs').add({
            userId: request.auth.uid,
            action: 'universal_parser_scan',
            target: fileName,
            metadata: {
                fileType: parseResult.fileType,
                sheetCount: parseResult.sheets.length,
                totalRows: parseResult.sheets.reduce((sum, s) => sum + s.rowCount, 0),
                fingerprintsFound: scanReport.totalMatches,
                criticalAlerts: scanReport.criticalCount,
                securityAlertLevel: scanReport.securityAlertLevel,
                ocrImagesScanned: ocrReport?.scannedImages || 0,
                ocrDetections: ocrReport?.detections.length || 0,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 8. Log security alert if not clean
        if (scanReport.securityAlertLevel !== 'CLEAN') {
            await db.collection('security_alerts').add({
                userId: request.auth.uid,
                fileName,
                alertLevel: scanReport.securityAlertLevel,
                totalMatches: scanReport.totalMatches,
                criticalCount: scanReport.criticalCount,
                detectedCompanies: scanReport.matches.map(m => m.pattern),
                ocrDetections: ocrReport?.detections.map(d => d.matchedCompany) || [],
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                resolved: false,
            });
        }

        // 9. Return Pre-Flight Security Alert to client
        // NOTE: We send ONLY the alert info, headers, and mappings.
        //       The raw data stays server-side.
        return {
            scanId,
            fileName,
            fileType: parseResult.fileType,
            sheetNames: parseResult.sheets.map(s => s.name),
            rowCounts: parseResult.sheets.map(s => s.rowCount),

            // Pre-Flight Security Alert
            securityAlert: {
                isClean: scanReport.isClean,
                totalMatches: scanReport.totalMatches,
                criticalCount: scanReport.criticalCount,
                warningCount: scanReport.warningCount,
                infoCount: scanReport.infoCount,
                securityAlertLevel: scanReport.securityAlertLevel,
                // Send match summaries (not full data)
                detectedCompanies: scanReport.matches.map(m => ({
                    name: m.pattern,
                    severity: m.severity,
                    category: m.companyCategory,
                    location: `${m.location.field === 'metadata' ? 'Metadata' :
                        `Sheet "${m.location.sheet}" Row ${m.location.row}`}`,
                    snippet: m.matchedText.substring(0, 50),
                })),
                metadataFlags: scanReport.metadataFlags,
                // OCR Results
                ocrResults: ocrReport ? {
                    totalImages: ocrReport.totalImages,
                    scannedImages: ocrReport.scannedImages,
                    hasVisualBranding: ocrReport.hasVisualBranding,
                    detections: ocrReport.detections.map(d => ({
                        matchedCompany: d.matchedCompany,
                        confidence: d.confidence,
                        severity: d.severity,
                        type: d.type,
                    })),
                } : null,
            },

            // Column mapping data
            headers: primarySheet?.headers || [],
            columnTypes: parseResult.columnTypes,
            autoMappings,
            targetFields: ARBA_SCHEMA_FIELDS.map(f => ({
                key: f.key,
                labels: f.labels,
                type: f.type,
                required: f.required,
            })),

            // Metadata flags
            fileMetadata: {
                hasAuthor: !!parseResult.metadata.author,
                hasCompany: !!parseResult.metadata.company,
                authorName: parseResult.metadata.author ? '***' : undefined, // Masked
            },
        };
    } catch (error: any) {
        console.error('parseAndScan error:', error);
        throw new HttpsError('internal', `Failed to parse file: ${error.message}`);
    }
});

// =================== Function 2: Sanitize & Process ===================

/**
 * sanitizeAndProcess — Receives the scan session ID, user-confirmed
 * column mappings, and purge confirmation. Executes:
 * 1. "The Purge" (strip all external branding)
 * 2. Apply Arba white-label
 * 3. Apply secret pricing formula
 * 4. Save processed items to Firestore
 * 
 * Returns only the final calculated items (no raw data).
 */
export const sanitizeAndProcess = onCall({
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB',
    region: 'us-central1',
}, async (request) => {
    // Auth check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول / Authentication required');
    }

    const { scanId, columnMappings, purgeConfirmed, selectedSheet, overheadConfig: clientOverhead } = request.data;

    if (!scanId || !columnMappings) {
        throw new HttpsError('invalid-argument', 'Scan ID and column mappings are required');
    }

    // 1. Retrieve scan session
    const session = scanSessions.get(scanId);
    if (!session) {
        throw new HttpsError('not-found', 'Scan session expired or not found. Please re-upload the file.');
    }

    try {
        const sheetIndex = selectedSheet || 0;
        const sheet = session.sheets[sheetIndex];

        if (!sheet) {
            throw new HttpsError('invalid-argument', 'Selected sheet not found');
        }

        // 2. Execute "The Purge" if confirmed
        let processedSheets = session.sheets;
        let purgeReport: string[] = [];

        if (purgeConfirmed !== false) { // Default to purge
            const purgeResult = executePurge(
                session.sheets,
                session.metadata,
                session.report.matches
            );
            processedSheets = purgeResult.sanitizedSheets;
            purgeReport = purgeResult.removedItems;
        }

        // 3. Apply White-Label
        processedSheets = applyWhiteLabel(processedSheets);

        // 4. Map rows to items using confirmed column mappings
        const targetSheet = processedSheets[sheetIndex];
        const rawItems = mapRowsToItems(
            targetSheet.rows,
            targetSheet.headers,
            columnMappings
        );

        if (rawItems.length === 0) {
            throw new HttpsError('invalid-argument', 'No valid items found after mapping. Check column assignments.');
        }

        // 5. Apply SECRET formula (server-only)
        const overheadConfig: OverheadConfig = {
            overheadMultiplier: clientOverhead?.overheadMultiplier || 1.15,
            profitMargin: clientOverhead?.profitMargin || 0.10,
            contingency: clientOverhead?.contingency || 0.05,
        };

        const processedItems = processImportedItems(rawItems, overheadConfig);

        // 6. Save to Firestore
        const importBatch = db.batch();
        const importRef = db.collection('users').doc(request.auth.uid)
            .collection('imports').doc(`import_${Date.now()}`);

        importBatch.set(importRef, {
            fileName: session.sheets[0]?.name || 'import',
            itemCount: processedItems.length,
            purgeApplied: purgeConfirmed !== false,
            purgeRemovedCount: purgeReport.length,
            overheadConfig,
            importedAt: admin.firestore.FieldValue.serverTimestamp(),
            importedBy: request.auth.uid,
        });

        // Save individual items
        for (const item of processedItems) {
            const itemRef = importRef.collection('items').doc(item.id);
            importBatch.set(itemRef, item);
        }

        await importBatch.commit();

        // 7. Log the action
        await db.collection('action_logs').add({
            userId: request.auth.uid,
            action: 'universal_parser_import',
            target: scanId,
            metadata: {
                itemCount: processedItems.length,
                purgeApplied: purgeConfirmed !== false,
                purgeRemovedCount: purgeReport.length,
                totalValue: processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0),
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 8. Clean up session
        scanSessions.delete(scanId);

        // 9. Return processed items to client
        // Only the FINAL calculated values — no raw data, no formula details
        return {
            success: true,
            importId: importRef.id,
            itemCount: processedItems.length,
            totalValue: processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0),

            // Send processed items (safe — already calculated, no formula exposed)
            items: processedItems.map(item => ({
                id: item.id,
                name: item.name,
                unit: item.unit,
                qty: item.qty,
                totalUnitCost: Math.round(item.totalUnitCost * 100) / 100,
                totalLinePrice: Math.round(item.totalLinePrice * 100) / 100,
                category: item.category,
                sbc: item.sbc,
                isImported: true,
                source: 'arba_universal_parser',
            })),

            // Purge summary
            sanitizationSummary: {
                purgeApplied: purgeConfirmed !== false,
                itemsRemoved: purgeReport.length,
                removedSamples: purgeReport.slice(0, 10), // First 10 for display
            },

            // Arba branding confirmation
            branding: {
                stamp: 'Arba Pricing',
                whiteLabelApplied: true,
            },
        };
    } catch (error: any) {
        console.error('sanitizeAndProcess error:', error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', `Processing failed: ${error.message}`);
    }
});

// =================== Function 3: Auto-Process (Full Pipeline) ===================

/**
 * autoProcessFile — One-shot automated pipeline
 * Chains: Parse → Scan → OCR → Purge → Map → Calculate → Save
 * 
 * Part of Arba API Gateway 🏗️
 * 
 * Hybrid Automation:
 * - CLEAN/WARNING → Auto-complete
 * - BLOCKED → Pause for manual review
 * 
 * ⚠️ Formula lockdown: Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
 */
export const autoProcessFile = onCall({
    maxInstances: 10,
    timeoutSeconds: 300,
    memory: '1GiB',
    region: 'us-central1',
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول / Authentication required');
    }

    const { fileBase64, fileName, options } = request.data;

    if (!fileBase64 || !fileName) {
        throw new HttpsError('invalid-argument', 'File data and name are required');
    }

    try {
        const buffer = Buffer.from(fileBase64, 'base64');

        if (buffer.length > 10 * 1024 * 1024) {
            throw new HttpsError('invalid-argument', 'File size exceeds 10MB limit');
        }

        const result = await executeFullPipeline(
            buffer,
            fileName,
            request.auth.uid,
            options || {}
        );

        // If auto-complete, return items safely (no formula exposed)
        if (result.mode === 'auto_complete' && result.items) {
            return {
                ...result,
                items: result.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    unit: item.unit,
                    qty: item.qty,
                    totalUnitCost: Math.round(item.totalUnitCost * 100) / 100,
                    totalLinePrice: Math.round(item.totalLinePrice * 100) / 100,
                    category: item.category,
                    sbc: item.sbc,
                    isImported: true,
                    source: 'arba_api_gateway',
                })),
            };
        }

        return result;
    } catch (error: any) {
        console.error('autoProcessFile error:', error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', `Auto-process failed: ${error.message}`);
    }
});

// =================== Function 4: Market Rates ===================

/**
 * getMarketRates — Query Saudi construction material prices
 * 
 * Part of Arba API Gateway 🏗️
 * Read-only, stateless endpoint
 */
export const getMarketRates = onCall({
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
    region: 'us-central1',
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'يجب تسجيل الدخول / Authentication required');
    }

    const { category, subcategory, search, region } = request.data || {};

    try {
        const rates = await queryRates({
            category,
            subcategory,
            search,
            region,
        });

        const categories = getCategories();

        return {
            success: true,
            rates: rates.map(r => ({
                id: r.id,
                category: r.category,
                subcategory: r.subcategory,
                nameAr: r.nameAr,
                nameEn: r.nameEn,
                unit: r.unit,
                rate: region ? r.rates[region as keyof typeof r.rates] : r.rates.riyadh,
                rates: r.rates,
                currency: r.currency,
                source: r.source,
                confidence: r.confidence,
            })),
            totalResults: rates.length,
            categories,
            region: region || 'riyadh',
        };
    } catch (error: any) {
        throw new HttpsError('internal', `Market rates query failed: ${error.message}`);
    }
});

// =================== Function 5: Health Status ===================

/**
 * getHealthStatus — System health check for all engines
 * 
 * Part of Arba API Gateway 🏗️
 * Admin/monitoring endpoint
 */
export const getHealthStatus = onCall({
    maxInstances: 5,
    timeoutSeconds: 15,
    memory: '256MiB',
    region: 'us-central1',
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Authentication required');
    }

    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        engines: {
            gateway: getGatewayStats(),
            marketRates: getMarketEngineStats(),
            fileParser: { engine: 'fileParser', supportedFormats: ['xlsx', 'xls', 'csv', 'pdf'] },
            sanitization: { engine: 'sanitizationEngine', patternCount: 62, categories: 7 },
            ocr: { engine: 'ocrEngine', supported: true, languages: ['eng', 'ara'] },
            formula: { engine: 'formulaEngine', lockdown: 'server-only', formula: 'HIDDEN' },
        },
        cloudFunctions: [
            'parseAndScan',
            'sanitizeAndProcess',
            'autoProcessFile',
            'getMarketRates',
            'getHealthStatus',
        ],
    };
});

// =================== Scheduled: Session Cleanup ===================

/**
 * Cleanup expired sessions every 30 minutes
 */
export const scheduledSessionCleanup = onSchedule({
    schedule: 'every 30 minutes',
    region: 'us-central1',
}, async () => {
    const cleaned = await cleanupExpiredSessions();
    console.log(`Session cleanup: removed ${cleaned} expired sessions`);
});
