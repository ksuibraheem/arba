/**
 * ARBA Cognitive Engine v4.1 — Deviation Engine & Dependency Traceability
 * محرك الانحرافات وتتبع التبعيات
 * 
 * LAYER 3: The Guardrail Layer
 * - Deviation Sensors: Flags manual overrides >15% from baseline
 * - Dependency Traceability: Hard-links consumables to parent items
 *   (changing parent qty triggers reactive chain recalc of all children)
 * 
 * READS FROM: CalculatedItem[], BaseItem[] (FULL_ITEMS_DATABASE)
 * WRITES TO: In-memory alerts (displayed on QS Dashboard)
 * 
 * ⚠️ MIDDLEWARE: Does NOT modify calculateProjectCosts().
 */

import { CalculatedItem, BaseItem, Language, ConsumableConfig } from '../types';

// =================== Deviation Types ===================

export type DeviationSeverity = 'info' | 'warning' | 'critical';

export interface DeviationAlert {
    itemId: string;
    itemName: string;
    field: 'price' | 'quantity' | 'waste';

    baselineValue: number;
    actualValue: number;
    deviationPercent: number;

    severity: DeviationSeverity;
    explanation: Record<Language, string>;
}

// =================== Deviation Scanner ===================

/**
 * Scan calculated items against master data to detect anomalies.
 * Any manual override >15% from baseline triggers a Critical alert.
 */
export function runDeviationScan(
    calculatedItems: CalculatedItem[],
    masterItems: BaseItem[],
    threshold: number = 0.15
): DeviationAlert[] {
    const alerts: DeviationAlert[] = [];

    for (const calc of calculatedItems) {
        const master = masterItems.find(m => m.id === calc.id);
        if (!master) continue;

        // --- Price Deviation ---
        const masterUnitCost = master.baseMaterial + master.baseLabor;
        if (masterUnitCost > 0 && calc.isManualPrice && calc.activeParams?.manualPrice) {
            const deviation = Math.abs(calc.usedPrice - masterUnitCost) / masterUnitCost;
            if (deviation > 0.05) {
                const pct = Math.round(deviation * 100);
                alerts.push({
                    itemId: calc.id,
                    itemName: calc.displayName,
                    field: 'price',
                    baselineValue: masterUnitCost,
                    actualValue: calc.usedPrice,
                    deviationPercent: pct,
                    severity: deviation > threshold ? 'critical' : deviation > 0.10 ? 'warning' : 'info',
                    explanation: {
                        ar: `السعر اليدوي ${calc.usedPrice} ر.س يختلف ${pct}% عن المرجعي ${masterUnitCost} ر.س`,
                        en: `Manual price ${calc.usedPrice} SAR deviates ${pct}% from baseline ${masterUnitCost} SAR`,
                        fr: `Prix manuel ${calc.usedPrice} SAR dévie de ${pct}% par rapport à ${masterUnitCost} SAR`,
                        zh: `手动价格 ${calc.usedPrice} SAR 偏离基准 ${masterUnitCost} SAR ${pct}%`,
                    },
                });
            }
        }

        // --- Quantity Deviation ---
        if (calc.isManualQty && calc.activeParams?.manualQty) {
            const originalQty = master.qty;
            if (originalQty > 0) {
                const deviation = Math.abs(calc.activeParams.manualQty - originalQty) / originalQty;
                if (deviation > 0.05) {
                    const pct = Math.round(deviation * 100);
                    alerts.push({
                        itemId: calc.id,
                        itemName: calc.displayName,
                        field: 'quantity',
                        baselineValue: originalQty,
                        actualValue: calc.activeParams.manualQty,
                        deviationPercent: pct,
                        severity: deviation > threshold ? 'critical' : 'warning',
                        explanation: {
                            ar: `الكمية اليدوية ${calc.activeParams.manualQty} تختلف ${pct}% عن المرجعية ${originalQty}`,
                            en: `Manual qty ${calc.activeParams.manualQty} deviates ${pct}% from baseline ${originalQty}`,
                            fr: `Quantité manuelle ${calc.activeParams.manualQty} dévie de ${pct}%`,
                            zh: `手动数量 ${calc.activeParams.manualQty} 偏离基准 ${originalQty} ${pct}%`,
                        },
                    });
                }
            }
        }
    }

    // Sort: critical first
    alerts.sort((a, b) => {
        const order: Record<DeviationSeverity, number> = { critical: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
    });

    return alerts;
}

// =================== Dependency Traceability ===================

/** A resolved consumable item with calculated quantity */
export interface ResolvedConsumable {
    parentItemId: string;
    parentItemName: string;
    childItemId: string;
    childUnit: string;

    // Calculated
    parentQty: number;
    ratioPerUnit: number;
    resolvedQty: number;              // parentQty × ratioPerUnit
    isHardLinked: boolean;
}

/**
 * Resolve all consumable dependencies from parent items.
 * Example: Steel (45 ton) → Tie Wire (45 × 10 = 450 kg)
 * 
 * When a parent item's quantity changes, this function recalculates
 * all child consumables automatically (reactive chain).
 */
export function resolveConsumableDependencies(
    calculatedItems: CalculatedItem[],
    masterItems: BaseItem[]
): ResolvedConsumable[] {
    const resolved: ResolvedConsumable[] = [];

    for (const calc of calculatedItems) {
        const master = masterItems.find(m => m.id === calc.id);
        if (!master?.consumables || master.consumables.length === 0) continue;

        for (const dep of master.consumables) {
            const childQty = calc.qty * dep.ratioPerParentUnit;

            resolved.push({
                parentItemId: calc.id,
                parentItemName: calc.displayName,
                childItemId: dep.childItemId,
                childUnit: dep.unit,
                parentQty: calc.qty,
                ratioPerUnit: dep.ratioPerParentUnit,
                resolvedQty: Math.round(childQty * 100) / 100, // Round to 2 decimals
                isHardLinked: dep.isHardLinked,
            });
        }
    }

    return resolved;
}

/**
 * Calculate the total estimated cost of all resolved consumables.
 * Uses a simple reference pricing map for common consumable items.
 */
export function calculateConsumablesCost(
    consumables: ResolvedConsumable[]
): { totalCost: number; breakdown: { itemId: string; qty: number; unitCost: number; total: number }[] } {
    // Reference prices for common consumables (SAR per unit)
    const CONSUMABLE_PRICES: Record<string, number> = {
        'consumable_tie_wire': 8,          // SAR per kg
        'consumable_spacers': 0.5,         // SAR per piece (biscuit)
        'consumable_curing_burlap': 3,     // SAR per m²
        'consumable_polyethylene': 4,      // SAR per m²
        'consumable_tile_adhesive': 35,    // SAR per bag (20kg)
        'consumable_grout': 12,            // SAR per kg
        'consumable_primer': 15,           // SAR per liter
        'consumable_conduit_glue': 8,      // SAR per tube
        'consumable_sand_mortar': 60,      // SAR per m³
        'consumable_cement_bags': 18,      // SAR per bag (50kg)
        'consumable_curing_water': 0.1,    // SAR per liter
    };

    const breakdown = consumables.map(c => {
        const unitCost = CONSUMABLE_PRICES[c.childItemId] || 0;
        return {
            itemId: c.childItemId,
            qty: c.resolvedQty,
            unitCost,
            total: Math.round(c.resolvedQty * unitCost * 100) / 100,
        };
    });

    return {
        totalCost: breakdown.reduce((sum, b) => sum + b.total, 0),
        breakdown,
    };
}
