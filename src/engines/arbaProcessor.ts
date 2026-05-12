/**
 * ARBA V8.2 — Main Processor (Browser-Compatible)
 * المعالج الرئيسي — يربط كل المحركات في pipeline واحد
 * Excel → Sanitizer → Classifier → 3-Tier Pricer → Sanity Check → Results
 */

import { sanitizeItem } from './sanitizerEngine';
import { classifyItem, type ClassificationResult } from './classificationEngine';
import { BENCHMARK_RATES, LOCATION_MULTIPLIERS, CATEGORY_LABELS, getEffectiveRate } from './benchmarkData';
import { auditScope, extractFeatures, type ScopeAuditResult, type DimensionExtraction } from './scopeAuditor';
import { commodityEngine } from '../../services/commodityIntelligenceEngine';
import * as XLSX from 'xlsx';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface RawBOQItem {
  seq: number | string;
  description: string;
  unit: string;
  qty: number;
  originalRate: number;
  originalAmount: number;
  sheetName?: string;
}

export interface ProcessedItem extends RawBOQItem {
  // Classification
  classification: ClassificationResult;
  sanitizedDesc: string;
  // Pricing
  pricingTier: 'original' | 'benchmark' | 'unpriced';
  costRate: number;
  costTotal: number;
  sellRate: number;
  sellTotal: number;
  profit: number;
  // Sanity check
  sanityFlag: 'ok' | 'warning' | 'critical';
  sanityNote: string;
  // Scope Audit (V8.2)
  scopeAudit?: ScopeAuditResult;
  extractedFeatures?: DimensionExtraction;
  // Commodity Risk (V8.3)
  commodityRiskFactor?: number;
  // Display
  categoryIcon: string;
  categoryLabel: string;
}

export interface ProcessingResult {
  items: ProcessedItem[];
  stats: {
    total: number;
    classified: number;
    classificationRate: number;
    totalCost: number;
    totalSell: number;
    totalProfit: number;
    profitMargin: number;
    tier1Count: number;  // original prices
    tier2Count: number;  // benchmark
    tier3Count: number;  // unpriced
    warningCount: number;
    criticalCount: number;
    categoryBreakdown: Record<string, { count: number; total: number }>;
  };
  region: string;
  regionMultiplier: number;
  commodityRiskApplied: boolean;
  processedAt: string;
}

// ═══════════════════════════════════════════════════
// Excel Reader (Smart Multi-Sheet)
// ═══════════════════════════════════════════════════

function findHeaderRow(rows: unknown[][]): { headerIdx: number; colMap: Record<string, number> } {
  const patterns = {
    desc: ['scope', 'description', 'وصف', 'البند', 'item', 'بند'],
    unit: ['unit', 'الوحدة', 'وحدة'],
    qty: ['qty', 'quantity', 'الكمية', 'كمية'],
    rate: ['rate', 'u/price', 'سعر', 'unit price', 'unit rate'],
    amount: ['amount', 'total', 'المبلغ', 'إجمالي', 'price'],
  };

  for (let i = 0; i < Math.min(15, rows.length); i++) {
    const row = rows[i];
    if (!row) continue;
    const joined = row.map(c => String(c || '').toLowerCase()).join('|');

    if (patterns.desc.some(p => joined.includes(p))) {
      const colMap: Record<string, number> = { desc: 1, unit: 2, qty: 3, rate: 4, amount: 5 };
      row.forEach((cell, idx) => {
        const h = String(cell || '').toLowerCase();
        if (patterns.desc.some(p => h.includes(p))) colMap.desc = idx;
        if (patterns.unit.some(p => h.includes(p))) colMap.unit = idx;
        if (patterns.qty.some(p => h.includes(p))) colMap.qty = idx;
        if (patterns.rate.some(p => h.includes(p))) colMap.rate = idx;
        if (patterns.amount.some(p => h.includes(p))) colMap.amount = idx;
      });
      return { headerIdx: i, colMap };
    }
  }

  return { headerIdx: 0, colMap: { desc: 1, unit: 2, qty: 3, rate: 4, amount: 5 } };
}

function isDataRow(row: unknown[], descIdx: number): boolean {
  if (!row) return false;
  const desc = String(row[descIdx] || '').trim();
  if (!desc || desc.length < 3) return false;
  // Skip headers/totals/titles
  const skip = ['total', 'sub-total', 'إجمالي', 'المجموع', 'bill', 'div', 'kingdom', 'المملكة'];
  const lower = desc.toLowerCase();
  if (skip.some(s => lower.includes(s))) return false;
  if (desc.startsWith('*') || desc.startsWith('DIV')) return false;
  return true;
}

export function readExcelFile(data: ArrayBuffer): RawBOQItem[] {
  const wb = XLSX.read(data, { type: 'array' });
  const items: RawBOQItem[] = [];
  let seq = 1;

  for (const sheetName of wb.SheetNames) {
    // Skip metadata sheets
    if (['codes', 'summary', 'cover', 'notes'].some(s => sheetName.toLowerCase().includes(s))) continue;

    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1 });
    const { headerIdx, colMap } = findHeaderRow(rows as unknown[][]);

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      if (!isDataRow(row, colMap.desc)) continue;

      const desc = String(row[colMap.desc] || '').trim();
      const unit = String(row[colMap.unit] || '').trim();
      const qty = Number(row[colMap.qty]) || 0;
      const rate = Number(row[colMap.rate]) || 0;
      const amount = Number(row[colMap.amount]) || 0;

      if (qty <= 0) continue;

      items.push({
        seq: seq++,
        description: desc,
        unit: unit || 'عدد',
        qty,
        originalRate: rate,
        originalAmount: amount,
        sheetName,
      });
    }
  }

  return items;
}

// ═══════════════════════════════════════════════════
// Sanity Check (M0B fix — catches extreme outliers)
// ═══════════════════════════════════════════════════

function sanityCkeck(item: ProcessedItem): { flag: 'ok' | 'warning' | 'critical'; note: string } {
  const rate = item.costRate;
  const benchmark = item.classification.baseRate;
  const category = item.classification.category;

  // Skip unpriced items
  if (rate === 0) return { flag: 'ok', note: '' };

  // Category ceiling prices (maximum reasonable price per unit)
  const ceilings: Record<string, number> = {
    earthworks: 200, masonry: 200, finishes: 500,
    concrete: 2500, doors: 50000, windows: 2000,
    electrical: 200000, hvac: 100000, plumbing: 50000,
    fire: 150000, external: 10000, mep: 500000,
    metalwork: 5000, structure: 30000,
  };

  const ceiling = ceilings[category] || 100000;

  // Check 1: Price exceeds category ceiling
  if (rate > ceiling) {
    return { flag: 'critical', note: `سعر ${rate} يتجاوز سقف الفئة ${ceiling}` };
  }

  // Check 2: Price is 10x+ the benchmark
  if (benchmark > 0 && rate > benchmark * 10) {
    return { flag: 'critical', note: `سعر ${rate} أعلى 10x من المرجعي ${benchmark}` };
  }

  // Check 3: Price is 3x+ the benchmark
  if (benchmark > 0 && rate > benchmark * 3) {
    return { flag: 'warning', note: `سعر ${rate} أعلى 3x من المرجعي ${benchmark}` };
  }

  return { flag: 'ok', note: '' };
}

// ═══════════════════════════════════════════════════
// Main Processing Pipeline
// ═══════════════════════════════════════════════════

export function processItems(
  rawItems: RawBOQItem[],
  region: string = 'riyadh',
  profitMargin: number = 0.15
): ProcessingResult {
  const regionInfo = LOCATION_MULTIPLIERS[region] || LOCATION_MULTIPLIERS.riyadh;
  const multiplier = regionInfo.factor;

  // V8.3 Fix #3: Read contextual memory baseline for this region
  let baselineCostPerSqm = 0;
  try {
    const { contextualMemoryService } = require('../../services/contextualMemoryService');
    const baseline = contextualMemoryService.getBaseline('villa', region);
    if (baseline && baseline.confidence >= 0.5) {
      baselineCostPerSqm = baseline.avgCostPerSqm;
      console.log(`🧠 Contextual baseline: ${baselineCostPerSqm} SAR/m² (confidence: ${(baseline.confidence * 100).toFixed(0)}%, samples: ${baseline.sampleSize})`);
    }
  } catch { /* contextualMemoryService not available */ }

  const items: ProcessedItem[] = rawItems.map(raw => {
    // Step 1: Sanitize (V8.3: now includes canonical multilingual form)
    const { sanitized: sanitizedDesc, canonical } = sanitizeItem(raw.description);

    // Step 2: Classify (V8.3: pass canonical for multilingual fallback)
    const classification = classifyItem(sanitizedDesc, canonical);

    // Step 3: 3-Tier Pricing
    let pricingTier: 'original' | 'benchmark' | 'unpriced';
    let costRate: number;

    if (raw.originalRate > 0) {
      // Tier 1: Use original price from file
      costRate = raw.originalRate;
      pricingTier = 'original';
    } else if (classification.baseRate > 0) {
      // Tier 2: Use brain-learned rate (if available) or benchmark × location multiplier
      const learnedRate = classification.ruleId ? getEffectiveRate(classification.ruleId) : 0;
      costRate = Math.round((learnedRate || classification.baseRate) * multiplier);
      pricingTier = 'benchmark';
    } else {
      // Tier 3: Unpriced
      costRate = 0;
      pricingTier = 'unpriced';
    }

    // Apply commodity risk factor (V8.3)
    let commodityRiskFactor = 1.0;
    try {
      commodityEngine.initialize();
      commodityRiskFactor = commodityEngine.getCategoryRiskFactor(classification.category);
    } catch { /* non-blocking */ }

    const costTotal = Math.round(costRate * commodityRiskFactor * raw.qty);
    const sellRate = Math.round(costRate * commodityRiskFactor * (1 + profitMargin));
    const sellTotal = Math.round(sellRate * raw.qty);
    const profit = sellTotal - costTotal;

    // Category display
    const catInfo = CATEGORY_LABELS[classification.category] || CATEGORY_LABELS.unclassified;

    // Step 4: Scope Audit (V8.2 — detect exclusions/inclusions)
    const scopeResult = auditScope(raw.description);
    const features = extractFeatures(raw.description);

    const processed: ProcessedItem = {
      ...raw,
      sanitizedDesc,
      classification,
      pricingTier,
      costRate,
      costTotal,
      sellRate,
      sellTotal,
      profit,
      sanityFlag: 'ok',
      sanityNote: '',
      scopeAudit: scopeResult.status !== 'APPROVED' ? scopeResult : undefined,
      extractedFeatures: features.dimensions.length > 0 || features.materials.length > 0 ? features : undefined,
      commodityRiskFactor: commodityRiskFactor !== 1.0 ? Math.round(commodityRiskFactor * 1000) / 1000 : undefined,
      categoryIcon: catInfo.icon,
      categoryLabel: catInfo.ar,
    };

    // Step 5: Sanity Check
    const sanity = sanityCkeck(processed);
    processed.sanityFlag = sanity.flag;
    processed.sanityNote = sanity.note;

    return processed;
  });

  // Stats
  const classified = items.filter(i => i.classification.matched).length;
  const totalCost = items.reduce((s, i) => s + i.costTotal, 0);
  const totalSell = items.reduce((s, i) => s + i.sellTotal, 0);

  const categoryBreakdown: Record<string, { count: number; total: number }> = {};
  items.forEach(i => {
    const cat = i.classification.category;
    if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { count: 0, total: 0 };
    categoryBreakdown[cat].count++;
    categoryBreakdown[cat].total += i.sellTotal;
  });

  return {
    items,
    stats: {
      total: items.length,
      classified,
      classificationRate: items.length > 0 ? Math.round((classified / items.length) * 100) : 0,
      totalCost,
      totalSell,
      totalProfit: totalSell - totalCost,
      profitMargin: profitMargin * 100,
      tier1Count: items.filter(i => i.pricingTier === 'original').length,
      tier2Count: items.filter(i => i.pricingTier === 'benchmark').length,
      tier3Count: items.filter(i => i.pricingTier === 'unpriced').length,
      warningCount: items.filter(i => i.sanityFlag === 'warning').length,
      criticalCount: items.filter(i => i.sanityFlag === 'critical').length,
      categoryBreakdown,
    },
    region: regionInfo.nameAr,
    regionMultiplier: multiplier,
    commodityRiskApplied: items.some(i => i.commodityRiskFactor !== undefined),
    processedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════
// Export to Excel
// ═══════════════════════════════════════════════════

export function exportToExcel(result: ProcessingResult): Blob {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Priced BOQ
  const data = result.items.map(i => ({
    '#': i.seq,
    'الفئة': `${i.categoryIcon} ${i.categoryLabel}`,
    'وصف البند': i.description,
    'الوحدة': i.unit,
    'الكمية': i.qty,
    'سعر التكلفة': i.costRate,
    'إجمالي التكلفة': i.costTotal,
    'سعر البيع': i.sellRate,
    'إجمالي البيع': i.sellTotal,
    'الربح': i.profit,
    'مصدر السعر': i.pricingTier === 'original' ? '📁 الملف' : i.pricingTier === 'benchmark' ? '📊 مرجعي' : '❌ بدون',
    'مراجعة': i.sanityFlag === 'critical' ? '🔴 ' + i.sanityNote : i.sanityFlag === 'warning' ? '🟠 ' + i.sanityNote : '✅',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 55 }, { wch: 8 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'جدول الكميات المسعّر');

  // Sheet 2: Summary
  const summary = [
    { البند: 'عدد البنود', القيمة: result.stats.total },
    { البند: 'نسبة التصنيف', القيمة: `${result.stats.classificationRate}%` },
    { البند: 'إجمالي التكلفة', القيمة: result.stats.totalCost },
    { البند: `إجمالي البيع (+${result.stats.profitMargin}%)`, القيمة: result.stats.totalSell },
    { البند: 'الربح', القيمة: result.stats.totalProfit },
    { البند: 'شامل الضريبة 15%', القيمة: Math.round(result.stats.totalSell * 1.15) },
    { البند: '---', القيمة: '---' },
    { البند: 'أسعار من الملف', القيمة: result.stats.tier1Count },
    { البند: 'أسعار مرجعية', القيمة: result.stats.tier2Count },
    { البند: 'بدون سعر', القيمة: result.stats.tier3Count },
    { البند: 'تحذيرات', القيمة: result.stats.warningCount },
    { البند: 'أخطاء حرجة', القيمة: result.stats.criticalCount },
    { البند: 'المنطقة', القيمة: result.region },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, ws2, 'ملخص مالي');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
