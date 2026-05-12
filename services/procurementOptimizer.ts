/**
 * ARBA v7.0 — Procurement Optimizer
 * محرك تحسين المشتريات
 *
 * PURPOSE:
 * - Analyze BOQ items and find best supplier for each material
 * - Calculate bulk purchase savings
 * - Generate weekly procurement schedule aligned with project timeline
 */

import { CalculatedItem, Language } from '../types';
import { CalculationResult } from '../utils/calculations';

// =================== Types ===================

export interface ProcurementItem {
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  /** Current unit price used */
  currentUnitPrice: number;
  /** Best available unit price */
  bestUnitPrice: number;
  /** Best supplier name */
  bestSupplierName: string;
  /** Savings per unit */
  savingsPerUnit: number;
  /** Total savings for this item */
  totalSavings: number;
  /** Procurement week (when to order) */
  procurementWeek: number;
}

export interface ProcurementScheduleWeek {
  week: number;
  materials: string[];
  estimatedBudget: number;
  items: ProcurementItem[];
}

export interface ProcurementResult {
  items: ProcurementItem[];
  totalCurrentCost: number;
  totalOptimizedCost: number;
  totalSavings: number;
  savingsPercent: number;
  weeklySchedule: ProcurementScheduleWeek[];
  /** Top 5 items with highest savings potential */
  topSavings: ProcurementItem[];
}

// =================== Category → Procurement Week Mapping ===================

/**
 * Determines when materials should be ordered based on construction sequence.
 * Week 0 = project start. Earlier weeks = earlier procurement.
 */
const CATEGORY_WEEK_MAP: Record<string, number> = {
  excavation: 0,
  substructure: 1,
  superstructure: 3,
  masonry: 6,
  consumables: 0, // ongoing
  finishes: 8,
  facades: 9,
  doorsAndWindows: 10,
  insulation: 7,
  waterproofing: 5,
  fireProtection: 8,
  testing: 2, // tests happen early and throughout
  safety: 0,
  summerAdditives: 2,
  mep: 6,
  custom: 4,
  site: 0,
  structure: 2,
  manpower: 0,
};

// =================== Bulk Discount Tiers ===================

interface BulkTier {
  minQty: number;
  discount: number; // 0-1
}

const BULK_DISCOUNTS: Record<string, BulkTier[]> = {
  concrete: [
    { minQty: 50, discount: 0.02 },
    { minQty: 200, discount: 0.05 },
    { minQty: 500, discount: 0.08 },
  ],
  steel: [
    { minQty: 5, discount: 0.02 },   // tons
    { minQty: 20, discount: 0.04 },
    { minQty: 50, discount: 0.07 },
  ],
  blocks: [
    { minQty: 5000, discount: 0.03 },
    { minQty: 20000, discount: 0.06 },
    { minQty: 50000, discount: 0.10 },
  ],
  tiles: [
    { minQty: 100, discount: 0.03 },  // m2
    { minQty: 500, discount: 0.06 },
    { minQty: 1000, discount: 0.10 },
  ],
  paint: [
    { minQty: 20, discount: 0.03 },   // drums
    { minQty: 50, discount: 0.05 },
    { minQty: 100, discount: 0.08 },
  ],
};

function getBulkDiscount(materialGroup: string, qty: number): number {
  const tiers = BULK_DISCOUNTS[materialGroup];
  if (!tiers) return 0;
  let discount = 0;
  for (const tier of tiers) {
    if (qty >= tier.minQty) discount = tier.discount;
  }
  return discount;
}

function getMaterialGroup(item: CalculatedItem): string {
  const id = item.id || '';
  if (id.includes('concrete') || id.includes('sub_') || id.includes('super_')) {
    if (item.unit === 'م3') return 'concrete';
    if (item.unit === 'طن') return 'steel';
  }
  if (id.includes('block') || id.includes('masonry')) return 'blocks';
  if (id.includes('tile') || id.includes('ceramic') || id.includes('porcelain')) return 'tiles';
  if (id.includes('paint')) return 'paint';
  if (id.includes('steel') || id.includes('rebar')) return 'steel';
  return '';
}

// =================== Optimizer Engine ===================

/**
 * Analyze BOQ calculation result and optimize procurement.
 */
export function optimizeProcurement(
  calcResult: CalculationResult,
  language: Language = 'ar'
): ProcurementResult {
  const procItems: ProcurementItem[] = [];

  for (const item of calcResult.items) {
    if (item.qty <= 0) continue;

    const currentPrice = item.usedPrice || item.finalUnitPrice || 0;
    const materialGroup = getMaterialGroup(item);
    const bulkDiscount = getBulkDiscount(materialGroup, item.qty);

    // Check all available suppliers for best price
    let bestPrice = currentPrice;
    let bestSupplier = item.selectedSupplier?.name?.[language] || 'السوق المحلي';

    if (item.suppliers && item.suppliers.length > 0) {
      for (const sup of item.suppliers) {
        const supPrice = sup.dynamicPrice
          ? sup.dynamicPrice
          : (item.baseMaterial || 0) * sup.priceMultiplier;
        if (supPrice > 0 && supPrice < bestPrice) {
          bestPrice = supPrice;
          bestSupplier = sup.name?.[language] || sup.name?.ar || 'مورد';
        }
      }
    }

    // Apply bulk discount
    if (bulkDiscount > 0) {
      bestPrice = bestPrice * (1 - bulkDiscount);
    }

    const savingsPerUnit = Math.max(0, currentPrice - bestPrice);
    const totalSavings = savingsPerUnit * item.qty;
    const week = CATEGORY_WEEK_MAP[item.category] ?? 4;

    const displayName = item.displayName || item.name?.[language] || item.name?.ar || item.id;

    procItems.push({
      itemId: item.id,
      itemName: displayName,
      category: item.category,
      quantity: item.qty,
      unit: item.unit,
      currentUnitPrice: Math.round(currentPrice * 100) / 100,
      bestUnitPrice: Math.round(bestPrice * 100) / 100,
      bestSupplierName: bestSupplier,
      savingsPerUnit: Math.round(savingsPerUnit * 100) / 100,
      totalSavings: Math.round(totalSavings * 100) / 100,
      procurementWeek: week,
    });
  }

  // Aggregate totals
  const totalCurrentCost = procItems.reduce((s, i) => s + i.currentUnitPrice * i.quantity, 0);
  const totalOptimizedCost = procItems.reduce((s, i) => s + i.bestUnitPrice * i.quantity, 0);
  const totalSavings = totalCurrentCost - totalOptimizedCost;
  const savingsPercent = totalCurrentCost > 0 ? (totalSavings / totalCurrentCost) * 100 : 0;

  // Build weekly schedule
  const weekMap = new Map<number, ProcurementItem[]>();
  for (const item of procItems) {
    const w = item.procurementWeek;
    if (!weekMap.has(w)) weekMap.set(w, []);
    weekMap.get(w)!.push(item);
  }

  const weeklySchedule: ProcurementScheduleWeek[] = [];
  for (const [week, items] of Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0])) {
    weeklySchedule.push({
      week,
      materials: [...new Set(items.map(i => i.category))],
      estimatedBudget: Math.round(items.reduce((s, i) => s + i.bestUnitPrice * i.quantity, 0)),
      items,
    });
  }

  // Top 5 savings
  const topSavings = [...procItems]
    .filter(i => i.totalSavings > 0)
    .sort((a, b) => b.totalSavings - a.totalSavings)
    .slice(0, 5);

  return {
    items: procItems,
    totalCurrentCost: Math.round(totalCurrentCost),
    totalOptimizedCost: Math.round(totalOptimizedCost),
    totalSavings: Math.round(totalSavings),
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    weeklySchedule,
    topSavings,
  };
}
