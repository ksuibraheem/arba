"use strict";
/**
 * Arba Formula Engine v2 — Server-Only (Zero-Leak)
 * محرك معادلة التسعير — خاص بالسيرفر فقط
 *
 * Part of Arba Security Shield 🛡️
 * 🏰 THE FORTRESS — Hybrid Pricing Engine
 *
 * SECRET FORMULA (never sent to client):
 * Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
 *
 * PRICING HIERARCHY (v2):
 * 1. Manual User Override (highest priority)
 * 2. Supplier Link (live supplier price)
 * 3. Dynamic API (market rates)
 * 4. Arba Benchmark (default fallback)
 *
 * PRECISION: All intermediate calculations use 4-decimal precision (0.0001)
 *
 * ⚠️ ANTI-TAMPERING: This module runs exclusively on Firebase Cloud Functions.
 * DO NOT export calculateItemTotal. DO NOT log intermediate values to client.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImportedItems = processImportedItems;
exports.mapRowsToItems = mapRowsToItems;
exports.certifyPrice = certifyPrice;
const signatureManager_1 = require("./signatureManager");
// =================== Constants ===================
/** All intermediate calculations use 4-decimal precision */
const PRECISION = 4;
/** Round to N decimal places */
function precise(value, decimals = PRECISION) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
// =================== Formula Engine ===================
/**
 * SECRET FORMULA — Calculate total cost for a single item
 * Total = [(Materials × (1 + Wastage)) + Labor + Equipment] × Overheads
 *
 * ⚠️ THIS FUNCTION RUNS SERVER-ONLY. NEVER EXPOSE TO CLIENT.
 * ⚠️ DO NOT export this function.
 */
function calculateItemTotal(materials, wastage, labor, equipment, overheadMultiplier) {
    // Input validation — guard against NaN and negative values
    const safeMaterials = Math.max(0, isNaN(materials) ? 0 : materials);
    const safeWastage = Math.max(0, isNaN(wastage) ? 0 : wastage);
    const safeLabor = Math.max(0, isNaN(labor) ? 0 : labor);
    const safeEquipment = Math.max(0, isNaN(equipment) ? 0 : equipment);
    const safeOverhead = Math.max(1, isNaN(overheadMultiplier) ? 1 : overheadMultiplier);
    // Step 1: Apply wastage to materials
    const wastageMultiplier = 1 + safeWastage;
    const materialWithWaste = precise(safeMaterials * wastageMultiplier);
    // Step 2: Sum direct costs
    const directCost = precise(materialWithWaste + safeLabor + safeEquipment);
    // Step 3: Apply overhead multiplier
    const totalUnitCost = precise(directCost * safeOverhead);
    const overheadAmount = precise(totalUnitCost - directCost);
    return {
        materialWithWaste,
        directCost,
        overheadAmount,
        totalUnitCost,
    };
}
/**
 * Process all imported items through the secret formula
 */
function processImportedItems(rawItems, overheadConfig) {
    const now = new Date().toISOString();
    const totalOverheadMultiplier = overheadConfig.overheadMultiplier *
        (1 + overheadConfig.profitMargin) *
        (1 + overheadConfig.contingency);
    return rawItems.map((item, index) => {
        const calc = calculateItemTotal(item.materials || 0, item.waste || 0, item.labor || 0, item.equipment || 0, totalOverheadMultiplier);
        // Use UUID instead of timestamp-based IDs
        const itemId = `arba_import_${crypto.randomUUID ? crypto.randomUUID().substring(0, 8) : Date.now()}_${index}`;
        return {
            id: itemId,
            name: {
                ar: item.name_ar || item.name_en || '',
                en: item.name_en || item.name_ar || '',
                fr: item.name_en || item.name_ar || '', // Fallback
                zh: item.name_en || item.name_ar || '', // Fallback
            },
            unit: item.unit || 'm²',
            qty: item.qty || 1,
            // 4-decimal precision on all calculated values
            materialsCost: precise(item.materials || 0),
            wastageCost: precise(calc.materialWithWaste - (item.materials || 0)),
            laborCost: precise(item.labor || 0),
            equipmentCost: precise(item.equipment || 0),
            directCost: calc.directCost,
            overheadAmount: calc.overheadAmount,
            totalUnitCost: calc.totalUnitCost,
            totalLinePrice: precise(calc.totalUnitCost * (item.qty || 1)),
            category: item.category || 'custom',
            sbc: item.sbc || 'N/A',
            isImported: true,
            importedAt: now,
            source: 'arba_universal_parser',
        };
    });
}
/**
 * Map raw imported data rows to RawImportedItem objects
 * based on user-confirmed column mappings
 */
function mapRowsToItems(rows, headers, columnMappings // sourceColumn → targetField
) {
    const items = [];
    // Build reverse mapping: targetField → columnIndex
    const fieldToColIdx = {};
    for (const [sourceCol, targetField] of Object.entries(columnMappings)) {
        const colIdx = headers.indexOf(sourceCol);
        if (colIdx !== -1) {
            fieldToColIdx[targetField] = colIdx;
        }
    }
    for (const row of rows) {
        const getValue = (field) => {
            const idx = fieldToColIdx[field];
            if (idx === undefined || idx >= (row?.length || 0))
                return undefined;
            return row[idx];
        };
        const item = {
            name_ar: String(getValue('name_ar') || getValue('description') || '').trim(),
            name_en: getValue('name_en') ? String(getValue('name_en')).trim() : undefined,
            description: getValue('description') ? String(getValue('description')).trim() : undefined,
            unit: String(getValue('unit') || 'm²').trim(),
            qty: parseFloat(getValue('qty')) || 1,
            materials: parseFloat(getValue('materials')) || 0,
            labor: parseFloat(getValue('labor')) || 0,
            equipment: parseFloat(getValue('equipment')) || 0,
            waste: normalizeWaste(getValue('waste')),
            category: String(getValue('category') || 'custom').trim().toLowerCase(),
            sbc: getValue('sbc') ? String(getValue('sbc')).trim() : undefined,
            rate: getValue('rate') ? parseFloat(getValue('rate')) : undefined,
        };
        // Skip empty rows
        if (!item.name_ar && !item.name_en)
            continue;
        // Fallback: copy name between AR/EN
        if (!item.name_ar && item.name_en)
            item.name_ar = item.name_en;
        if (!item.name_en && item.name_ar)
            item.name_en = item.name_ar;
        // If rate is provided but materials is not, derive materials from rate
        if (item.rate && item.rate > 0 && item.materials === 0) {
            item.materials = item.rate * 0.6; // Estimate: 60% materials
            item.labor = item.rate * 0.3; // Estimate: 30% labor
            item.equipment = item.rate * 0.1; // Estimate: 10% equipment
        }
        items.push(item);
    }
    return items;
}
/**
 * Normalize waste percentage
 * Handles both decimal (0.05) and percentage (5) formats
 */
function normalizeWaste(value) {
    if (value == null)
        return 0;
    const num = parseFloat(value);
    if (isNaN(num))
        return 0;
    // If > 1, treat as percentage
    return num > 1 ? num / 100 : num;
}
/**
 * Generate an "Official Certified Price" with HMAC integrity
 * This is the endpoint for B2C portal "Certified Final Price" display
 *
 * @param userId The authenticated user requesting certification
 * @param projectId The project being certified
 * @param rawItems The items to certify (from import or manual entry)
 * @param overheadConfig The overhead configuration to apply
 * @param pricingSource Which pricing hierarchy source was used
 */
function certifyPrice(userId, projectId, rawItems, overheadConfig, pricingSource = 'arba_benchmark') {
    // Process all items through the secret formula with 4-decimal precision
    const processedItems = processImportedItems(rawItems, overheadConfig);
    // Calculate total with 4-decimal precision
    const finalPrice = precise(processedItems.reduce((sum, item) => sum + item.totalLinePrice, 0));
    const certifiedAt = new Date().toISOString();
    // Generate HMAC integrity packet
    const integrity = (0, signatureManager_1.generateSignature)(userId, finalPrice, processedItems.length, PRECISION);
    // Generate QR verification hash (short, URL-safe)
    const qrVerificationHash = (0, signatureManager_1.generateQRVerificationHash)(projectId, finalPrice, certifiedAt);
    return {
        projectId,
        totalItems: processedItems.length,
        finalPrice,
        items: processedItems,
        integrity,
        qrVerificationHash,
        certifiedAt,
        pricingSource,
    };
}
//# sourceMappingURL=formulaEngine.js.map