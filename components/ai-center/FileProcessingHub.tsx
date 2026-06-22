import React, { useState, useRef, useEffect, useMemo } from 'react';
import { normalizeInput, matchTextToItemId } from '../../services/semanticNormalizer';
import { itemCostAnalyzer } from '../../services/itemCostAnalyzer';
import { extractSpecs, type ExtractedSpecs, type SpecCategory } from '../../services/specExtractor';
import { FULL_ITEMS_DATABASE } from '../../constants';
import * as XLSX from 'xlsx';
import { priceProtectionService, type PriceValidation } from '../../services/priceProtectionService';

const glass: React.CSSProperties = { backdropFilter: 'blur(16px)', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '1.5rem' };
const gridRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };

// ─── Smart BOQ Column Keywords (Arabic + English) ───
const HEADER_KEYWORDS = {
  desc: /وصف|description|بند|item|desc|الـ.*ـوصـ|scope|work|نوع العمل|بيان|تفاصيل|المواصفات/i,
  qty: /كمية|qty|quantity|كميه/i,
  unit: /وحدة|unit|وحده/i,
  price: /سعر|price|rate|ريال|cost|إجمالي/i,
  itemNo: /رقم|م$|no\.?|#|البند|ref/i,
};

type PriceSource = 'database' | 'recipe' | 'estimate' | 'original' | 'auto_detected';

interface SmartBOQItem {
  itemNo: string;
  description: string;
  qty: number | null;
  unit: string;
  estimatedPrice: number | null;
  baseUnitCost: number | null; // raw cost before profit/overhead/waste — for dynamic recalc
  sheet: string;
  confidence: number;
  source: PriceSource;
  matchedItem: string;
  sbcRef: string;
  warnings: string[];
  isAccessory: boolean;
  severity?: 'critical' | 'important' | 'recommended';
}

interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  status: 'waiting' | 'processing' | 'analyzing' | 'done' | 'error';
  result?: any;
  error?: string;
  boqItems?: SmartBOQItem[];
  summary?: FileSummary;
  validation?: PriceValidation;
}

interface FileSummary {
  totalSheets: number;
  totalRows: number;
  boqItemsFound: number;
  sheetsAnalyzed: string[];
  headerRowDetected: number;
  columnsDetected: string[];
  processingTimeMs: number;
  estimatedTotalCost: number;
}

// ─── Cost Breakdown Engine (Saudi Construction Methodology) ───
const UNIT_PRICE_ESTIMATES: Record<string, Record<string, number>> = {
  'عدد': { 'تكيف': 850, 'صحي': 450, 'كهرباء': 320, 'default': 500 },
  'م.ط': { 'تكيف': 120, 'صحي': 85, 'كهرباء': 65, 'default': 90 },
  'م2': { 'default': 180 },
  'م3': { 'default': 350 },
  'طن': { 'default': 5500 },
  'كجم': { 'default': 12 },
  'default': { 'default': 300 },
};

// Cost breakdown percentages by category — dynamic ratios (user-adjustable)
const BASE_RATIOS: Record<string, { materials: number; labor: number; transport: number; installation: number }> = {
  'تكيف': { materials: 0.42, labor: 0.18, transport: 0.05, installation: 0.12 },
  'صحي': { materials: 0.38, labor: 0.22, transport: 0.06, installation: 0.14 },
  'كهرباء': { materials: 0.40, labor: 0.20, transport: 0.04, installation: 0.13 },
  'إنشائي': { materials: 0.45, labor: 0.20, transport: 0.08, installation: 0.10 },
  'معماري': { materials: 0.35, labor: 0.25, transport: 0.05, installation: 0.15 },
  'default': { materials: 0.40, labor: 0.20, transport: 0.05, installation: 0.12 },
};

function buildRatios(wastePct: number, overheadPct: number, profitPct: number) {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(BASE_RATIOS)) {
    const w = wastePct / 100, o = overheadPct / 100, p = profitPct / 100;
    const baseSum = v.materials + v.labor + v.transport + v.installation;
    const scale = (1 - w - o - p) / baseSum;
    result[k] = { materials: v.materials * scale, labor: v.labor * scale, transport: v.transport * scale, installation: v.installation * scale, waste: w, overhead: o, profit: p };
  }
  return result;
}

interface CostBreakdown {
  unitPrice: number;
  materials: number;
  labor: number;
  transport: number;
  installation: number;
  waste: number;
  overhead: number;
  profit: number;
  subtotal: number;
  vat: number;
  total: number;
  wastePercent: number;
  profitPercent: number;
  overheadPercent: number;
}

function getBreakdown(unit: string, sheetName: string, qty: number | null, wastePct = 5, overheadPct = 8, profitPct = 10): CostBreakdown | null {
  if (!qty || qty <= 0) return null;
  const unitPrices = UNIT_PRICE_ESTIMATES[unit] || UNIT_PRICE_ESTIMATES['default'];
  const sheetKey = Object.keys(unitPrices).find(k => sheetName.includes(k)) || 'default';
  const unitPrice = unitPrices[sheetKey] || unitPrices['default'] || 300;
  const totalBase = unitPrice * qty;

  const BREAKDOWN_RATIOS = buildRatios(wastePct, overheadPct, profitPct);
  const ratioKey = Object.keys(BREAKDOWN_RATIOS).find(k => sheetName.includes(k)) || 'default';
  const ratios = BREAKDOWN_RATIOS[ratioKey];

  const materials = Math.round(totalBase * ratios.materials);
  const labor = Math.round(totalBase * ratios.labor);
  const transport = Math.round(totalBase * ratios.transport);
  const installation = Math.round(totalBase * ratios.installation);
  const waste = Math.round(totalBase * ratios.waste);
  const overhead = Math.round(totalBase * ratios.overhead);
  const profit = Math.round(totalBase * ratios.profit);
  const subtotal = materials + labor + transport + installation + waste + overhead + profit;
  const vat = Math.round(subtotal * 0.15);

  return {
    unitPrice, materials, labor, transport, installation, waste, overhead, profit,
    subtotal, vat, total: subtotal + vat,
    wastePercent: ratios.waste * 100, profitPercent: ratios.profit * 100, overheadPercent: ratios.overhead * 100,
  };
}

function estimatePrice(unit: string, sheetName: string, qty: number | null): number | null {
  const bd = getBreakdown(unit, sheetName, qty);
  return bd ? bd.total : null;
}

// ─── Smart Matching: desc → 874-item database ───
// Price cap per unit type (prevents runaway pricing)
// NOTE: High caps for generators/panels/transformers that cost 100K+
const MAX_UNIT_PRICE: Record<string, number> = {
  'عدد': 500000, 'م.ط': 1500, 'م2': 800, 'م3': 2500,
  'طن': 8000, 'كجم': 25, 'مقطوعية': 200000, 'طقم': 50000,
  'نقطة': 800, 'مجموعة': 100000, 'default': 50000,
  // English units from BOQ files
  "No's": 500000, 'Nos': 500000, 'No': 500000, 'Set': 50000,
  'Lot': 500000, 'LS': 500000, 'EA': 500000, 'm': 1500, 'LM': 1500,
};

// ─── Spec-Category → DB-Category mapping ───
const SPEC_TO_DB_CATEGORY: Record<SpecCategory, string[]> = {
  electrical: ['mep_elec', 'elec_advanced'],
  plumbing: ['mep_plumb'],
  hvac: ['mep_hvac', 'hvac_central'],
  fire: ['fire_protection', 'fire_advanced', 'safety'],
  structural: ['structure', 'site'],
  finishes: ['architecture', 'insulation'],
  general: [],
};

function matchToDatabase(desc: string, unit: string): {
  itemId: string | null; itemName: string; confidence: number;
  baseMaterial: number; baseLabor: number; waste: number; sbc: string;
  source: 'database' | 'recipe' | 'none';
} {
  const noMatch = { itemId: null, itemName: '', confidence: 0, baseMaterial: 0, baseLabor: 0, waste: 0, sbc: '', source: 'none' as const };
  try {
    // ═══ Step 0: Extract specs from description ═══
    const specs = extractSpecs(desc, unit);

    // ═══ Step 0.5: Direct code matching for common panel/equipment codes ═══
    const codeMatch = desc.match(/\b(ESMDB|EMDB)\b/i);
    if (codeMatch) {
      const item = FULL_ITEMS_DATABASE.find((i: any) => i.id === 'EL-P-14'); // لوحة طوارئ ESMDB
      if (item) return {
        itemId: item.id, itemName: item.name?.ar || item.id,
        confidence: 0.85, baseMaterial: item.baseMaterial || 0, baseLabor: item.baseLabor || 0,
        waste: item.waste || 0, sbc: item.sbc || '', source: 'database' as const
      };
    }

    // ═══ Step 1: Semantic normalizer direct match (highest priority) ═══
    const normalized = normalizeInput(desc, unit);
    if (normalized.matchedItemId) {
      const item = FULL_ITEMS_DATABASE.find((i: any) => i.id === normalized.matchedItemId);
      if (item) return {
        itemId: item.id, itemName: item.name?.ar || item.id,
        confidence: 0.95, baseMaterial: item.baseMaterial || 0, baseLabor: item.baseLabor || 0,
        waste: item.waste || 0, sbc: item.sbc || '', source: 'database'
      };
    }

    // ═══ Step 2: Filter candidates by spec category ═══
    let candidates: any[] = FULL_ITEMS_DATABASE as any[];
    const dbCategories = SPEC_TO_DB_CATEGORY[specs.category];
    if (specs.category !== 'general' && dbCategories.length > 0) {
      const filtered = candidates.filter((item: any) =>
        dbCategories.includes(item.category)
      );
      // Only use filtered if we got results — don't lose all candidates
      if (filtered.length > 0) candidates = filtered;
    }

    // ═══ Step 3: Keyword matching with spec-boosted scoring ═══
    // English stop words to exclude from matching
    const STOP_WORDS = new Set(['supply', 'install', 'test', 'commission', 'commissioning', 'including', 'provide', 'complete', 'all', 'with', 'for', 'and', 'the', 'per', 'new', 'from', 'type', 'size', 'each', 'set', 'work', 'item', 'general', 'according', 'approved', 'equal', 'similar', 'specification', 'testing', 'installation', 'material', 'materials', 'shall', 'necessary', 'required', 'accessories']);
    const text = normalized.correctedText || desc;
    const words = text.split(/\s+/).filter((w: string) => w.length > 2);
    // Skip matching for very short descriptions
    if (words.length < 2) return noMatch;

    let bestItem: any = null, bestScore = 0, bestMatchCount = 0;
    for (const dbItem of candidates) {
      const dbName = dbItem.name?.ar || '';
      const dbNameEn = dbItem.name?.en || '';
      let score = 0, matchCount = 0;

      // Arabic word matching
      for (const word of words) {
        if (dbName.includes(word)) { score += word.length; matchCount++; }
      }
      // English word matching (for English BOQ descriptions)
      if (matchCount === 0 && /[a-zA-Z]/.test(desc)) {
        const engWords = desc.toLowerCase().split(/[\s,;()]+/).filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));
        for (const word of engWords) {
          if (dbNameEn.toLowerCase().includes(word)) { score += word.length; matchCount++; }
        }
      }

      // ═══ Spec-based score boosting ═══
      let specBonus = 0;
      // Boost if subCategory keyword appears in item name
      if (specs.subCategory !== 'general' && specs.subCategory !== 'unknown') {
        const subCatLower = specs.subCategory.toLowerCase();
        if (dbNameEn.toLowerCase().includes(subCatLower) || dbName.includes(subCatLower)) {
          specBonus += 5;
        }
      }
      // Boost for size match in item name
      if (specs.size && (dbName.includes(specs.size) || dbNameEn.includes(specs.size))) {
        specBonus += 8;
      }
      // Boost for capacity match in item name
      if (specs.capacity && (dbName.includes(specs.capacity) || dbNameEn.includes(specs.capacity))) {
        specBonus += 8;
      }
      // Boost for material match
      if (specs.material && dbNameEn.toLowerCase().includes(specs.material.toLowerCase())) {
        specBonus += 4;
      }

      const totalScore = score + specBonus;

      // Allow matchCount >= 1 when spec has high confidence with size/capacity match
      const minMatch = (specBonus >= 8 && specs.confidence >= 0.5) ? 1 : 2;
      // Require total score ≥10 (or spec-filtered category with ≥8)
      const minScore = (specs.category !== 'general' && dbCategories.length > 0) ? 8 : 10;
      if (totalScore > bestScore && totalScore >= minScore && matchCount >= minMatch) {
        // Also check unit compatibility
        const dbUnit = dbItem.unit || '';
        if (unit && dbUnit && unit !== dbUnit) {
          // Unit mismatch: reduce confidence, only accept very high scores
          if (totalScore < 15) continue;
        }
        bestItem = dbItem; bestScore = totalScore; bestMatchCount = matchCount;
      }
      // Tie-breaker: prefer MEP-specific items (EL-*, PL-*, HV-*, FR-*) over generic ones
      else if (totalScore === bestScore && totalScore >= minScore && matchCount >= minMatch && bestItem) {
        const isMEPItem = /^(EL|PL|HV|FR)-/.test(dbItem.id);
        const bestIsMEP = /^(EL|PL|HV|FR)-/.test(bestItem.id);
        if (isMEPItem && !bestIsMEP) {
          bestItem = dbItem; bestScore = totalScore; bestMatchCount = matchCount;
        }
      }
    }
    if (bestItem) {
      // ═══ Confidence calculation with spec awareness ═══
      let confidence = bestScore >= 25 ? 0.92 : bestScore >= 20 ? 0.90 : bestScore >= 15 ? 0.80 : 0.65;
      // Boost confidence if specs matched
      if (specs.confidence >= 0.5) confidence = Math.min(confidence + 0.05, 0.95);
      if (specs.size || specs.capacity) confidence = Math.min(confidence + 0.03, 0.95);

      return {
        itemId: bestItem.id, itemName: bestItem.name?.ar || bestItem.id,
        confidence,
        baseMaterial: bestItem.baseMaterial || 0,
        baseLabor: bestItem.baseLabor || 0, waste: bestItem.waste || 0,
        sbc: bestItem.sbc || '', source: 'database'
      };
    }
  } catch {}
  return noMatch;
}

// ─── Smart Pricing: multi-source cascade ───
function smartPriceItem(desc: string, unit: string, qty: number | null, sheetName: string, profitPct: number): {
  price: number | null; source: PriceSource; confidence: number;
  matchedItem: string; sbcRef: string; warnings: string[];
  _rawBaseMaterial?: number;
  _rawBaseLabor?: number;
} {
  const q = qty || 1;
  const warnings: string[] = [];
  const maxUnitPrice = MAX_UNIT_PRICE[unit] || MAX_UNIT_PRICE['default'];
  
  // ═══ Pre-check: Is this specification text? ═══
  const isSpecText = (text: string): boolean => {
    // English specification patterns
    if (/\b(shall be|scope of work|contractor|specification|in accordance|approved by|prior to|comply with|commissioning|installation shall|as per|unless otherwise|note:|the works|all materials|first-class|site verification|tender submission|discrepanc|government fees|clarified|coordination)\b/i.test(text)) return true;
    // Arabic specification patterns
    if (/\b(يجب أن|وفقاً لـ|طبقاً|المواصفات|المقاول|الاشتراطات|ملاحظة|الرسومات التنفيذية)\b/.test(text)) return true;
    // Multiple sentences = paragraph
    if ((text.match(/[.;:]/g) || []).length >= 3) return true;
    // Very long text = paragraph
    if (text.length > 180) return true;
    return false;
  };
  
  // If it's spec text — DON'T price it at all
  if (isSpecText(desc)) {
    return { 
      price: null, source: 'estimate', confidence: 0.05,
      matchedItem: '', sbcRef: '', 
      warnings: ['📄 نص مواصفات — ليس بند تسعير']
    };
  }
  
  // Source 1: 874-item database (only high-confidence matches)
  const dbMatch = matchToDatabase(desc, unit);
  if (dbMatch.source === 'database' && dbMatch.confidence >= 0.65) {
    // Bug #9 fix: DON'T apply waste here — the slider controls waste
    let unitPrice = Math.round((dbMatch.baseMaterial + dbMatch.baseLabor) * 1.10); // 10% general markup only
    
    // ═══ Price Guard: cap per unit type ═══
    if (unitPrice > maxUnitPrice) {
      warnings.push(`⚠️ سعر وحدة مرتفع (${unitPrice}) — تم تحديده بـ ${maxUnitPrice}`);
      unitPrice = maxUnitPrice;
    }
    
    return {
      price: unitPrice * q, source: 'database', confidence: dbMatch.confidence,
      matchedItem: dbMatch.itemName, sbcRef: dbMatch.sbc, warnings,
      // Pass raw costs for dynamic slider recalculation
      _rawBaseMaterial: dbMatch.baseMaterial, _rawBaseLabor: dbMatch.baseLabor,
    };
  }
  
  // Source 2: 120+ recipes (require higher confidence)
  try {
    const result = itemCostAnalyzer.analyze(desc, unit, profitPct / 100, 'riyadh');
    if (result && result.confidence >= 70) {
      let recipeUnitPrice = result.sellingPrice;
      // Price guard for recipes too
      if (recipeUnitPrice > maxUnitPrice) {
        warnings.push(`⚠️ وصفة غالية — تم التحديد بـ ${maxUnitPrice}`);
        recipeUnitPrice = maxUnitPrice;
      }
      return {
        price: Math.round(recipeUnitPrice * q), source: 'recipe',
        confidence: result.confidence / 100, matchedItem: result.itemDescription || desc,
        sbcRef: '', warnings: [...warnings, ...(result.warnings || [])]
      };
    }
  } catch {}
  
  // Source 3: Static estimate — ONLY for Arabic items with qty & unit
  const hasQtyAndUnit = !!qty && qty > 0 && !!unit;
  
  // Bug #5 fix: Allow English items with qty+unit to get estimates too
  if (hasQtyAndUnit) {
    const bd = getBreakdown(unit, sheetName, qty);
    if (bd) {
      warnings.push('🤖 يحتاج مراجعة — تقدير تلقائي بدون مطابقة');
      return {
        price: bd.total, source: 'estimate', confidence: 0.35,
        matchedItem: '', sbcRef: '', warnings
      };
    }
  }
  
  // ═══ NO MATCH — Flag for AI review instead of blind pricing ═══
  const hasArabic = /[\u0600-\u06FF]/.test(desc);
  const reviewWarnings = ['🔴 لم يتم التعرف على البند — يحتاج مراجعة يدوية أو استعانة بذكاء اصطناعي'];
  if (!hasArabic) reviewWarnings.push('📝 نص إنجليزي بدون مطابقة في القاعدة');
  if (!hasQtyAndUnit) reviewWarnings.push('⚠️ لا توجد كمية أو وحدة');
  
  return { price: null, source: 'estimate', confidence: 0.05, matchedItem: '', sbcRef: '', warnings: reviewWarnings };
}

// ─── Smart Header Detection ───
function findHeaderRow(rows: any[][]): { rowIndex: number; cols: Record<string, number> } {
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    
    let matchCount = 0;
    const cols: Record<string, number> = { desc: -1, qty: -1, unit: -1, price: -1, itemNo: -1 };
    
    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').trim();
      if (cell.length < 1) continue;
      
      if (HEADER_KEYWORDS.desc.test(cell) && cols.desc === -1) { cols.desc = j; matchCount++; }
      else if (HEADER_KEYWORDS.qty.test(cell) && cols.qty === -1) { cols.qty = j; matchCount++; }
      else if (HEADER_KEYWORDS.unit.test(cell) && cols.unit === -1) { cols.unit = j; matchCount++; }
      else if (HEADER_KEYWORDS.price.test(cell) && cols.price === -1) { cols.price = j; matchCount++; }
      else if (HEADER_KEYWORDS.itemNo.test(cell) && cols.itemNo === -1) { cols.itemNo = j; }
    }
    
    if (matchCount >= 2) return { rowIndex: i, cols };
  }
  return { rowIndex: -1, cols: { desc: -1, qty: -1, unit: -1, price: -1, itemNo: -1 } };
}

const FileProcessingHub: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);
  const [showValidationDetail, setShowValidationDetail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [profitPct, setProfitPct] = useState(15);
  const [overheadPct, setOverheadPct] = useState(8);
  const [wastePct, setWastePct] = useState(5);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatNum = (n: number) => n.toLocaleString('ar-SA');

  // ─── Aggregated Stats (dynamic — recalculates when sliders change) ───
  const totalBOQItems = files.reduce((sum, f) => sum + (f.boqItems?.length || 0), 0);
  const totalEstimatedCost = useMemo(() => {
    const markup = 1 + (profitPct + overheadPct + wastePct) / 100;
    return files.reduce((sum, f) => {
      if (!f.boqItems) return sum;
      return sum + f.boqItems.reduce((s, item) => {
        if (item.source === 'original') return s + (item.estimatedPrice || 0);
        if (!item.baseUnitCost || !item.qty) return s + (item.estimatedPrice || 0);
        return s + Math.round(item.baseUnitCost * item.qty * markup);
      }, 0);
    }, 0);
  }, [files, profitPct, overheadPct, wastePct]);
  const doneFiles = files.filter(f => f.status === 'done').length;
  const errorFiles = files.filter(f => f.status === 'error').length;

  // ─── Smart File Processing ───
  const handleFiles = async (fileList: FileList) => {
    // ═══ Duplicate Detection ═══
    const FILE_HISTORY_KEY = 'arba_processed_files_history';
    let fileHistory: { name: string; size: number; timestamp: string; itemCount?: number }[] = [];
    try { fileHistory = JSON.parse(localStorage.getItem(FILE_HISTORY_KEY) || '[]'); } catch {}

    const filteredFiles: File[] = [];
    const duplicates: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      // Check 1: Already in current session
      const inSession = files.some(ef => ef.name === f.name && ef.size === f.size);
      // Check 2: In processing history
      const inHistory = fileHistory.find(h => h.name === f.name && h.size === f.size);

      if (inSession) {
        duplicates.push(`"${f.name}" — موجود في الجلسة الحالية`);
      } else if (inHistory) {
        const daysAgo = Math.round((Date.now() - new Date(inHistory.timestamp).getTime()) / (1000*60*60*24));
        const reprocess = window.confirm(
          `⚠️ تم معالجة "${f.name}" سابقاً (قبل ${daysAgo} يوم${inHistory.itemCount ? ` — ${inHistory.itemCount} بند` : ''})\n\nهل تريد إعادة المعالجة؟`
        );
        if (reprocess) {
          filteredFiles.push(f);
        } else {
          duplicates.push(`"${f.name}" — تم تخطيه (معالج سابقاً)`);
        }
      } else {
        filteredFiles.push(f);
      }
    }

    if (duplicates.length > 0 && filteredFiles.length === 0) {
      alert(`🔄 كل الملفات مكررة:\n${duplicates.join('\n')}`);
      return;
    }

    const newFiles: ProcessedFile[] = filteredFiles.map(f => ({
      name: f.name, type: f.type, size: f.size, status: 'waiting' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < filteredFiles.length; i++) {
      const file = filteredFiles[i];
      const startTime = Date.now();
      
      // Phase 1: Processing
      setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'processing' } : f));
      
      try {
        const { fileReaderService } = await import('../../services/fileReaderService');
        const result = await fileReaderService.readFile(file);
        
        if (!result.success) {
          setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error', error: result.error } : f));
          continue;
        }

        // Phase 2: Smart Analysis
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'analyzing' } : f));

        const boqItems: SmartBOQItem[] = [];
        const sheetsAnalyzed: string[] = [];
        let headerRow = -1;
        const columnsDetected: string[] = [];

        if (result.tables && result.tables.length > 0) {
          for (const table of result.tables) {
            // Fix 4: Skip summary/index sheets
            if (/ملخص|summary|index|فهرس|cover|غلاف/i.test(table.name)) continue;
            
            // Reconstruct full rows: [headers, ...rows]
            const allRows = [table.headers, ...table.rows];
            const { rowIndex, cols } = findHeaderRow(allRows);
            
            if (rowIndex >= 0) {
              sheetsAnalyzed.push(table.name);
              headerRow = rowIndex;
              if (cols.desc >= 0) columnsDetected.push('الوصف');
              if (cols.qty >= 0) columnsDetected.push('الكمية');
              if (cols.unit >= 0) columnsDetected.push('الوحدة');
              if (cols.price >= 0) columnsDetected.push('السعر');
              
              const dataRows = allRows.slice(rowIndex + 1);
              
              // Fix 2: Validate desc column — if mostly numbers, find real text column
              let actualDescCol = cols.desc;
              if (actualDescCol >= 0 && dataRows.length > 0) {
                const sample = dataRows.slice(0, 8);
                let numericCount = 0;
                for (const sr of sample) {
                  const v = String(sr?.[actualDescCol] || '').trim();
                  if (!v || v.length < 2 || /^\d+\.?\d*$/.test(v)) numericCount++;
                }
                if (numericCount / sample.length > 0.6) {
                  let bestCol = actualDescCol, bestScore = 0;
                  const maxC = Math.max(...sample.map(r => (r || []).length));
                  for (let c = 0; c < maxC; c++) {
                    if ([actualDescCol, cols.qty, cols.unit, cols.price].includes(c)) continue;
                    let score = 0;
                    for (const sr of sample) {
                      const v = String(sr?.[c] || '').trim();
                      if (v.length >= 5 && /[\u0600-\u06FF]/.test(v)) score += 3;
                      else if (v.length >= 3 && !/^\d+$/.test(v)) score += 1;
                    }
                    if (score > bestScore) { bestCol = c; bestScore = score; }
                  }
                  if (bestScore > 0) actualDescCol = bestCol;
                }
              }
              
              
              // ═══ Chunked async processing — prevents browser freeze ═══
              const CHUNK_SIZE = 50;
              const totalDataRows = dataRows.length;
              for (let ci = 0; ci < totalDataRows; ci += CHUNK_SIZE) {
                const chunk = dataRows.slice(ci, ci + CHUNK_SIZE);
                for (const row of chunk) {
                  if (!row || row.length < 2) continue;
                  
                  let desc = actualDescCol >= 0 ? String(row[actualDescCol] || '').trim() : '';
                  const itemNo = cols.itemNo >= 0 ? String(row[cols.itemNo] || '').trim() : '';
                  
                  if (desc.length < 3 || /^\d+\.?\d*$/.test(desc)) {
                    let bestText = '';
                    for (let c = 0; c < row.length; c++) {
                      if ([cols.qty, cols.unit, cols.price].includes(c)) continue;
                      const v = String(row[c] || '').trim();
                      if (v.length > bestText.length && /[\u0600-\u06FF]/.test(v) && v.length >= 5) bestText = v;
                    }
                    if (bestText.length >= 5) desc = bestText;
                  }
                  
                  const rawQty = cols.qty >= 0 ? row[cols.qty] : null;
                  const qty = rawQty !== null && rawQty !== '' ? Number(rawQty) : null;
                  const unit = cols.unit >= 0 ? String(row[cols.unit] || '').trim() : '';
                  
                  if (desc.length < 2 && itemNo.length < 1) continue;
                  if (/^(البند|الوصف|#|م|item|desc|أعمال$)$/i.test(desc)) continue;
                  
                  const rawPrice = cols.price >= 0 ? row[cols.price] : null;
                  const existingPrice = rawPrice !== null && rawPrice !== '' ? Number(rawPrice) : null;
                  
                  // ╔══════════════════════════════════════════════════════════╗
                  // ║  CRITICAL: If NO quantity AND NO unit → NOT a BOQ item  ║
                  // ║  Real BOQ items ALWAYS have qty + unit.                 ║
                  // ║  Headers, scope text, and section titles don't.         ║
                  // ╚══════════════════════════════════════════════════════════╝
                  const hasQuantity = qty !== null && !isNaN(qty) && qty > 0;
                  const hasUnit = unit.length >= 1;
                  const hasPrice = existingPrice !== null && !isNaN(existingPrice) && existingPrice > 0;
                  
                  // Rule 1: MUST have quantity OR unit — otherwise it's a header/spec
                  if (!hasQuantity && !hasUnit) continue;
                  
                  // Rule 2: If has unit but no quantity — suspicious, only allow if short
                  if (hasUnit && !hasQuantity && desc.length > 100) continue;
                  
                  // Rule 3: Spec keywords — skip even if has qty (misdetected)
                  const specPattern = /\b(scope of work|shall be|contractor shall|specification|in accordance|approved by|prior to|comply with|commissioning of|installation shall|unless otherwise|site verification|tender submission|government fees|guarantee|warranty|safety and|standards and codes|discrepanc|coordination|the works|first-class|all materials shall|note:|ملاحظة|المواصفات|المقاول|الاشتراطات|يجب أن|وفقاً|طبقاً)\b/i;
                  if (specPattern.test(desc) && !hasPrice) continue;
                  
                  // Rule 4: ALL CAPS section header (ELECTRICAL WORKS, PANEL BOARDS, etc.)
                  if (/^[A-Z\s\d\-\/&,.()]+$/.test(desc) && !hasQuantity) continue;
                  
                  // Rule 5: Section number only (04-01, 04-02, etc.)
                  if (/^[\d\-\.\/\s]+$/.test(desc.trim())) continue;
                  
                  // Rule 6: Paragraph (>200 chars OR ≥3 sentences)
                  if (desc.length > 200) continue;
                  const sentenceCount = (desc.match(/[.;:]/g) || []).length;
                  if (sentenceCount >= 3) continue;
                  
                  // Rule 7: Long description without price — likely scope/preamble
                  if (desc.length > 100 && !hasPrice && !hasQuantity) continue;
                  
                  const displayDesc = desc.length > 2 ? desc : itemNo;
                  
                  let finalPrice = existingPrice;
                  let priceSource: PriceSource = existingPrice ? 'original' : 'estimate';
                  let matchedItem = '';
                  let sbcRef = '';
                  let itemWarnings: string[] = [];
                  let itemConfidence = 0.5;
                  let smartResult: any = null;
                  
                  if (!existingPrice) {
                    smartResult = smartPriceItem(desc, unit, qty, table.name, profitPct);
                    finalPrice = smartResult.price;
                    priceSource = smartResult.source;
                    matchedItem = smartResult.matchedItem;
                    sbcRef = smartResult.sbcRef;
                    itemWarnings = smartResult.warnings;
                    itemConfidence = smartResult.confidence;
                    
                    // ═══ Confidence adjustments ═══
                    // Long desc without match = likely wrong identification
                    if (desc.length > 100 && priceSource === 'estimate') itemConfidence = Math.min(itemConfidence, 0.25);
                    // No qty/unit = uncertain
                    if (!qty && !unit) itemConfidence = Math.min(itemConfidence, 0.3);
                    // English text without match = likely spec fragment
                    if (!/[\u0600-\u06FF]/.test(desc) && priceSource !== 'database') itemConfidence = Math.min(itemConfidence, 0.35);
                  } else {
                    priceSource = 'original';
                    itemConfidence = 0.98;
                  }

                  // Bug #1 fix: Use RAW DB costs as base, not reverse-engineered from final price
                  let baseUnitCost: number | null = null;
                  if (smartResult && priceSource === 'database' && smartResult._rawBaseMaterial > 0) {
                    // Direct from database — most accurate
                    baseUnitCost = (smartResult._rawBaseMaterial || 0) + (smartResult._rawBaseLabor || 0);
                  } else if (finalPrice && qty && qty > 0) {
                    // Fallback: estimate base from final price (remove 10% general markup)
                    baseUnitCost = Math.round(finalPrice / qty / 1.10);
                  } else if (finalPrice) {
                    baseUnitCost = Math.round(finalPrice / 1.10);
                  }

                  boqItems.push({
                    itemNo: itemNo || displayDesc,
                    description: desc || itemNo,
                    qty: (qty && !isNaN(qty)) ? qty : null,
                    unit,
                    estimatedPrice: (finalPrice && !isNaN(finalPrice)) ? Math.round(finalPrice) : null,
                    baseUnitCost,
                    source: priceSource,
                    matchedItem,
                    sbcRef,
                    warnings: itemWarnings,
                    confidence: itemConfidence,
                    sheet: table.name,
                    isAccessory: false,
                  });
                }
                // Yield to browser — prevents freeze
                setProgress(Math.round(((ci + chunk.length) / totalDataRows) * 90));
                await new Promise(r => setTimeout(r, 0));
              }
            }
          }
        }
        setProgress(95);
        // ═══ Phase 3: Missing Item Detection (27 rules) ═══
        try {
          const { missingItemDetector } = await import('../../services/missingItemDetector');
          const detectItems = boqItems.map(i => ({
            description: i.description, category: i.sheet,
            qty: i.qty || 1, unit: i.unit
          }));
          const enriched = missingItemDetector.enrichBOQ(detectItems, 500);
          
          if (enriched.suggestedItems && enriched.suggestedItems.length > 0) {
            for (const missing of enriched.suggestedItems) {
              boqItems.push({
                itemNo: `⚠️ ${missing.ruleId || 'AUTO'}`,
                description: `⚠️ ${missing.nameAr}`,
                qty: missing.suggestedQty || 1,
                unit: missing.suggestedUnit || 'طقم',
                estimatedPrice: (missing.estimatedPrice || 0) * (missing.suggestedQty || 1),
                baseUnitCost: missing.estimatedPrice || 0,
                sheet: 'اكسسوارات مفقودة',
                confidence: 0.75,
                source: 'auto_detected',
                matchedItem: missing.nameAr,
                sbcRef: '',
                warnings: [missing.reason || 'تمت الإضافة تلقائياً'],
                isAccessory: true,
                severity: missing.severity,
              });
            }
          }
        } catch (e) {
          console.warn('Missing item detection skipped:', e);
        }

        // ═══ Phase 4: Price Protection — validate before display ═══
        const validation = priceProtectionService.validate(boqItems, 500);
        
        const totalCost = boqItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
        const totalRows = result.tables?.reduce((sum: number, t: any) => sum + t.rowCount, 0) || 0;

        const summary: FileSummary = {
          totalSheets: result.tables?.length || 0,
          totalRows,
          boqItemsFound: boqItems.length,
          sheetsAnalyzed,
          headerRowDetected: headerRow + 1,
          columnsDetected: [...new Set(columnsDetected)],
          processingTimeMs: Date.now() - startTime,
          estimatedTotalCost: totalCost,
        };

        setFiles(prev => prev.map(f => f.name === file.name ? {
          ...f, status: 'done', result, boqItems, summary, validation
        } : f));

        // Auto-expand first file
        if (i === 0 && boqItems.length > 0) setExpandedFile(file.name);

        // ═══ Save to file history (cross-session duplicate detection) ═══
        try {
          const hKey = 'arba_processed_files_history';
          const history = JSON.parse(localStorage.getItem(hKey) || '[]');
          history.push({ name: file.name, size: file.size, timestamp: new Date().toISOString(), itemCount: boqItems.length });
          if (history.length > 200) history.splice(0, history.length - 200);
          localStorage.setItem(hKey, JSON.stringify(history));
        } catch {}
        setProgress(100);

      } catch (err) {
        setFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: 'error', error: String(err) } : f));
      }
    }
  };

  const removeFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    if (expandedFile === name) setExpandedFile(null);
  };

  const clearAll = () => { setFiles([]); setExpandedFile(null); };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') return '📊';
    if (ext === 'pdf') return '📕';
    if (ext === 'dxf') return '📐';
    if (ext === 'docx') return '📝';
    return '📄';
  };

  const formatCurrency = (n: number) => n.toLocaleString('ar-SA') + ' ر.س';

  // ═══════════════════════════════════════════════════════
  // ─── Export Functions ───
  // ═══════════════════════════════════════════════════════

  const SOURCE_LABELS: Record<PriceSource, string> = {
    database: '🟢 قاعدة بيانات',
    recipe: '🔵 وصفة تسعير',
    original: '💰 سعر أصلي',
    estimate: '🟠 تقدير',
    auto_detected: '⚠️ مفقود (تلقائي)',
  };

  const exportToExcel = (file: ProcessedFile) => {
    if (!file.boqItems || file.boqItems.length === 0) return;
    const wb = XLSX.utils.book_new();
    const items = file.boqItems;

    // Group items by sheet
    const sheets = new Map<string, SmartBOQItem[]>();
    items.forEach(item => {
      const key = item.sheet || 'عام';
      if (!sheets.has(key)) sheets.set(key, []);
      sheets.get(key)!.push(item);
    });

    // Create a sheet per category
    sheets.forEach((sheetItems, sheetName) => {
      const headerRow = [
        'م', 'وصف البند', 'الوحدة', 'الكمية',
        'سعر الوحدة', 'الإجمالي', 'مصدر السعر',
        'البند المطابق', 'مرجع SBC', 'الدقة %', 'ملاحظات'
      ];

      const dataRows = sheetItems.map((item, idx) => {
        const unitPrice = (item.estimatedPrice && item.qty) ? Math.round(item.estimatedPrice / item.qty) : (item.estimatedPrice || 0);
        return [
          idx + 1,
          item.description,
          item.unit || '',
          item.qty ?? '',
          unitPrice,
          item.estimatedPrice ?? '',
          SOURCE_LABELS[item.source] || item.source,
          item.matchedItem || '',
          item.sbcRef || '',
          Math.round(item.confidence * 100) + '%',
          item.warnings?.join(' | ') || (item.isAccessory ? '⚠️ اكسسوار مضاف تلقائياً' : ''),
        ];
      });

      // Total row
      const totalPrice = sheetItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
      dataRows.push([
        '', '═══ الإجمالي ═══', '', sheetItems.reduce((s, i) => s + (i.qty || 0), 0),
        '', totalPrice, '', '', '', '', ''
      ]);

      const wsData = [headerRow, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column widths
      ws['!cols'] = [
        { wch: 5 },   // م
        { wch: 55 },  // وصف
        { wch: 8 },   // وحدة
        { wch: 10 },  // كمية
        { wch: 14 },  // سعر وحدة
        { wch: 16 },  // إجمالي
        { wch: 18 },  // مصدر
        { wch: 30 },  // مطابق
        { wch: 14 },  // SBC
        { wch: 8 },   // دقة
        { wch: 35 },  // ملاحظات
      ];

      // RTL
      ws['!rtl'] = true;

      // Style header — cell formatting
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[addr]) {
          ws[addr].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
            fill: { fgColor: { rgb: '4F46E5' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              bottom: { style: 'medium', color: { rgb: '312E81' } },
            },
          };
        }
      }

      // Style total row
      const totalRowIdx = dataRows.length;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c });
        if (ws[addr]) {
          ws[addr].s = {
            font: { bold: true, sz: 12, color: { rgb: '065F46' } },
            fill: { fgColor: { rgb: 'D1FAE5' } },
          };
        }
      }

      // Style accessory rows
      sheetItems.forEach((item, idx) => {
        if (item.isAccessory) {
          for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r: idx + 1, c });
            if (ws[addr]) {
              ws[addr].s = {
                font: { color: { rgb: 'B45309' } },
                fill: { fgColor: { rgb: 'FEF3C7' } },
              };
            }
          }
        }
      });

      // Sanitize sheet name for Excel
      const safeName = sheetName.replace(/[\[\]\*\?\/\\:]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

    // ─── Summary Sheet ───
    const summaryData = [
      ['📊 ملخص التسعير الذكي — ARBA V11.3'],
      [],
      ['المشروع', 'قوات الدفاع الجوي — حفر الباطن'],
      ['تاريخ التسعير', new Date().toLocaleDateString('ar-SA')],
      ['اسم الملف', file.name],
      [],
      ['الشيت', 'عدد البنود', 'الإجمالي (ر.س)'],
    ];

    let grandTotal = 0;
    sheets.forEach((sheetItems, sheetName) => {
      const total = sheetItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
      grandTotal += total;
      summaryData.push([sheetName, String(sheetItems.length), String(total)]);
    });

    summaryData.push([]);
    summaryData.push(['═══ الإجمالي الكلي ═══', String(items.length), String(grandTotal)]);
    summaryData.push([]);
    summaryData.push(['مصادر التسعير', '']);

    const dbCount = items.filter(i => i.source === 'database').length;
    const recipeCount = items.filter(i => i.source === 'recipe').length;
    const origCount = items.filter(i => i.source === 'original').length;
    const estCount = items.filter(i => i.source === 'estimate').length;
    const autoCount = items.filter(i => i.source === 'auto_detected').length;

    summaryData.push(['🟢 قاعدة بيانات (420 بند)', String(dbCount)]);
    summaryData.push(['🔵 وصفة تسعير (120+ وصفة)', String(recipeCount)]);
    summaryData.push(['💰 سعر أصلي من الملف', String(origCount)]);
    summaryData.push(['🟠 تقدير ثابت', String(estCount)]);
    summaryData.push(['⚠️ اكسسوارات مفقودة', String(autoCount)]);
    summaryData.push([]);
    summaryData.push(['المنطقة', 'حفر الباطن (+13% معامل إقليمي)']);

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData as any[][]);
    summaryWs['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 20 }];
    summaryWs['!rtl'] = true;
    XLSX.utils.book_append_sheet(wb, summaryWs, 'ملخص');

    // Move summary to first position
    const sheetNames = wb.SheetNames;
    const lastIdx = sheetNames.length - 1;
    sheetNames.unshift(sheetNames.splice(lastIdx, 1)[0]);

    // Download
    const fileName = `تسعير_${file.name.replace(/\.[^.]+$/, '')}_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToCSV = (file: ProcessedFile) => {
    if (!file.boqItems || file.boqItems.length === 0) return;
    const BOM = '\uFEFF';
    const headers = 'م\tالشيت\tوصف البند\tالوحدة\tالكمية\tالإجمالي\tمصدر السعر\tالبند المطابق\tSBC\tالدقة\tملاحظات';
    const rows = file.boqItems.map((item, i) => [
      i + 1, item.sheet, item.description, item.unit || '', item.qty ?? '',
      item.estimatedPrice ?? '', SOURCE_LABELS[item.source] || item.source,
      item.matchedItem || '', item.sbcRef || '',
      Math.round(item.confidence * 100) + '%',
      item.warnings?.join(' | ') || ''
    ].join('\t'));

    const csv = BOM + headers + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تسعير_${file.name.replace(/\.[^.]+$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPrint = (file: ProcessedFile) => {
    if (!file.boqItems || file.boqItems.length === 0) return;
    const items = file.boqItems;
    const totalCost = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

    // Group by sheet
    const sheets = new Map<string, SmartBOQItem[]>();
    items.forEach(item => {
      const key = item.sheet || 'عام';
      if (!sheets.has(key)) sheets.set(key, []);
      sheets.get(key)!.push(item);
    });

    let tablesHTML = '';
    sheets.forEach((sheetItems, sheetName) => {
      const sheetTotal = sheetItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
      tablesHTML += `
        <h2 style="color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:8px;margin-top:30px">${sheetName}</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px">
          <thead><tr style="background:#4f46e5;color:#fff">
            <th style="padding:8px;border:1px solid #312e81">م</th>
            <th style="padding:8px;border:1px solid #312e81">وصف البند</th>
            <th style="padding:8px;border:1px solid #312e81">الوحدة</th>
            <th style="padding:8px;border:1px solid #312e81">الكمية</th>
            <th style="padding:8px;border:1px solid #312e81">الإجمالي</th>
            <th style="padding:8px;border:1px solid #312e81">المصدر</th>
          </tr></thead><tbody>`;
      sheetItems.forEach((item, idx) => {
        const bg = item.isAccessory ? '#fef3c7' : idx % 2 === 0 ? '#f8fafc' : '#fff';
        const color = item.isAccessory ? '#b45309' : '#1e293b';
        tablesHTML += `<tr style="background:${bg};color:${color}">
          <td style="padding:6px;border:1px solid #e2e8f0;text-align:center">${idx + 1}</td>
          <td style="padding:6px;border:1px solid #e2e8f0">${item.description}</td>
          <td style="padding:6px;border:1px solid #e2e8f0;text-align:center">${item.unit || ''}</td>
          <td style="padding:6px;border:1px solid #e2e8f0;text-align:center">${item.qty?.toLocaleString('ar-SA') ?? ''}</td>
          <td style="padding:6px;border:1px solid #e2e8f0;text-align:left;font-family:monospace">${item.estimatedPrice?.toLocaleString('ar-SA') ?? ''} ر.س</td>
          <td style="padding:6px;border:1px solid #e2e8f0;text-align:center;font-size:11px">${SOURCE_LABELS[item.source] || ''}</td>
        </tr>`;
      });
      tablesHTML += `<tr style="background:#d1fae5;font-weight:700">
        <td colspan="4" style="padding:8px;border:1px solid #e2e8f0">إجمالي ${sheetName}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;font-family:monospace">${sheetTotal.toLocaleString('ar-SA')} ر.س</td>
        <td></td></tr></tbody></table>`;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
      <meta charset="UTF-8"><title>تسعير — ${file.name}</title>
      <style>@media print{body{margin:0;font-size:11px}h1{font-size:18px}h2{font-size:14px;page-break-after:avoid}table{page-break-inside:auto}tr{page-break-inside:avoid}}</style>
    </head><body style="font-family:'Segoe UI',Tahoma,sans-serif;padding:30px;direction:rtl">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#4f46e5;margin:0">🧠 ARBA — تقرير التسعير الذكي</h1>
        <p style="color:#64748b;margin:4px 0">مشروع: قوات الدفاع الجوي — حفر الباطن</p>
        <p style="color:#64748b;margin:4px 0">ملف: ${file.name} | تاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        <div style="display:inline-block;background:#f0fdf4;border:1px solid #86efac;padding:8px 20px;border-radius:8px;margin-top:10px">
          <strong style="color:#065f46;font-size:18px">الإجمالي الكلي: ${totalCost.toLocaleString('ar-SA')} ر.س</strong>
        </div>
      </div>
      ${tablesHTML}
      <div style="margin-top:30px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:11px;color:#64748b">
        <strong>دليل المصادر:</strong>
        🟢 قاعدة بيانات (420 بند) |
        🔵 وصفة تسعير (120+ وصفة) |
        💰 سعر أصلي من الملف |
        🟠 تقدير |
        ⚠️ اكسسوار مفقود مضاف تلقائياً
      </div>
    </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div>
      {/* ─── Summary Dashboard (shows after processing) ─── */}
      {files.length > 0 && (
        <div style={gridRow}>
          <div style={{ ...glass, textAlign: 'center', borderTop: '3px solid #818cf8' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📁</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>ملفات معالجة</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>{doneFiles}/{files.length}</div>
          </div>
          <div style={{ ...glass, textAlign: 'center', borderTop: '3px solid #34d399' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎯</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>بنود BOQ مكتشفة</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>{totalBOQItems}</div>
          </div>
          <div style={{ ...glass, textAlign: 'center', borderTop: '3px solid #fbbf24' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💰</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>تكلفة تقديرية</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
              {totalEstimatedCost > 0 ? formatCurrency(totalEstimatedCost) : '—'}
            </div>
          </div>
          <div style={{ ...glass, textAlign: 'center', borderTop: errorFiles > 0 ? '3px solid #f87171' : '3px solid #64748b' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{errorFiles > 0 ? '⚠️' : '✅'}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>الحالة</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: errorFiles > 0 ? '#f87171' : '#34d399' }}>
              {files.some(f => f.status === 'processing' || f.status === 'analyzing') ? '🔄 يحلل...' : errorFiles > 0 ? `${errorFiles} خطأ` : '✅ مكتمل'}
            </div>
          </div>
        </div>
      )}

      {/* ─── Drop Zone ─── */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          ...glass, textAlign: 'center', cursor: 'pointer', marginBottom: '1.5rem',
          border: isDragging ? '2px dashed #6366f1' : '2px dashed rgba(99,102,241,0.3)',
          background: isDragging ? 'rgba(99,102,241,0.1)' : 'rgba(15, 23, 42, 0.8)',
          transition: 'all 0.3s', padding: files.length > 0 ? '1.5rem' : '3rem',
        }}
      >
        <div style={{ fontSize: files.length > 0 ? '2rem' : '3rem', marginBottom: '0.5rem' }}>📂</div>
        <div style={{ color: '#a5b4fc', fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>اسحب الملفات هنا أو انقر للرفع</div>
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>يدعم: Excel (.xlsx, .xls) • PDF • AutoCAD (.dxf) • Word (.docx) • صور</div>
        <input ref={inputRef} type="file" multiple accept=".xlsx,.xls,.csv,.pdf,.dxf,.docx,.doc,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
      </div>

      {/* ─── File Cards with Inline Results ─── */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1rem' }}>📋 نتائج التحليل ({files.length} ملفات)</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
               <>
                  <button onClick={() => { const f = files.find(f => f.status === 'done' && f.boqItems?.length); if (f) exportToExcel(f); }}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', color: '#34d399', border: '1px solid rgba(34,197,94,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                  >📊 Excel</button>
                  <button onClick={() => { const f = files.find(f => f.status === 'done' && f.boqItems?.length); if (f) exportToCSV(f); }}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                  >📄 CSV</button>
                  <button onClick={() => { const f = files.find(f => f.status === 'done' && f.boqItems?.length); if (f) exportPrint(f); }}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                  >🖨️ طباعة</button>
                  <button onClick={() => {
                    const f = files.find(f => f.status === 'done' && f.boqItems?.length);
                    if (!f || !f.boqItems) return;
                    const total = f.boqItems.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
                    const vat = Math.round(total * 0.15);
                    const w = window.open('', '_blank');
                    if (!w) return;
                    w.document.write(`<html dir="rtl"><head><title>عرض سعر</title><style>body{font-family:Tajawal,sans-serif;padding:2rem;color:#1e293b}table{width:100%;border-collapse:collapse;margin:1.5rem 0}th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:right;font-size:0.85rem}th{background:#4f46e5;color:#fff}.total{font-weight:700;font-size:1rem;background:#f1f5f9}h1{color:#4f46e5;border-bottom:3px solid #4f46e5;padding-bottom:0.5rem}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}.meta{color:#64748b;font-size:0.85rem}.footer{margin-top:2rem;padding-top:1rem;border-top:2px solid #e2e8f0;color:#64748b;font-size:0.8rem}@media print{body{padding:1rem}}</style></head><body><div class="header"><div><h1>📋 عرض سعر</h1><div class="meta">رقم العرض: QT-${Date.now().toString(36).toUpperCase()}</div><div class="meta">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div></div><div style="text-align:left"><div style="font-size:1.2rem;font-weight:700;color:#4f46e5">ARBA</div><div class="meta">منصة التسعير الذكية</div></div></div><table><thead><tr><th>#</th><th>البند</th><th>الوحدة</th><th>الكمية</th><th>السعر</th></tr></thead><tbody>${f.boqItems.filter(i => !i.isAccessory).map((item, idx) => `<tr><td>${idx+1}</td><td>${item.description}</td><td>${item.unit || '-'}</td><td>${item.qty?.toLocaleString('ar-SA') || '-'}</td><td>${item.estimatedPrice?.toLocaleString('ar-SA') || '-'} ر.س</td></tr>`).join('')}</tbody><tfoot><tr class="total"><td colspan="4">الإجمالي قبل الضريبة</td><td>${total.toLocaleString('ar-SA')} ر.س</td></tr><tr class="total"><td colspan="4">ضريبة القيمة المضافة (15%)</td><td>${vat.toLocaleString('ar-SA')} ر.س</td></tr><tr class="total" style="background:#4f46e5;color:#fff"><td colspan="4">الإجمالي شامل الضريبة</td><td>${(total + vat).toLocaleString('ar-SA')} ر.س</td></tr></tfoot></table><div class="footer"><strong>الشروط والأحكام:</strong><ul><li>العرض ساري لمدة 30 يوم من تاريخه</li><li>الأسعار شاملة التوريد والتركيب ما لم يُذكر خلاف ذلك</li><li>هامش الربح: ${profitPct}% | المصاريف العمومية: ${overheadPct}% | الهالك: ${wastePct}%</li></ul></div></body></html>`);
                    w.document.close();
                    w.print();
                  }}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                  >📋 عرض سعر</button>
                  <button onClick={() => setShowSettings(!showSettings)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: showSettings ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.05)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >⚙️ إعدادات</button>
                </>
              <button onClick={clearAll} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: '0.75rem' }}>🗑️ مسح</button>
            </div>
          </div>

          {/* ─── Pricing Settings Panel ─── */}
          {showSettings && (
            <div style={{ ...glass, marginBottom: '1rem', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1rem' }}>⚙️</span>
                <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem' }}>إعدادات التسعير</span>
                <span style={{ color: '#475569', fontSize: '0.7rem', marginRight: 'auto' }}>تعديل النسب يعيد حساب التفكيك عند فتح البنود</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {[
                  { label: '💰 هامش الربح', value: profitPct, set: setProfitPct, color: '#22c55e', min: 0, max: 35 },
                  { label: '🏢 مصاريف عمومية', value: overheadPct, set: setOverheadPct, color: '#64748b', min: 0, max: 25 },
                  { label: '📉 نسبة الهالك', value: wastePct, set: setWastePct, color: '#ef4444', min: 0, max: 15 },
                ].map((s, si) => (
                  <div key={si}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>{s.value}%</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={1} value={s.value}
                      onChange={e => s.set(Number(e.target.value))}
                      style={{ width: '100%', accentColor: s.color, height: '6px', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#475569', marginTop: '0.2rem' }}>
                      <span>{s.min}%</span><span>{s.max}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(99,102,241,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#94a3b8' }}>إجمالي النسب: <strong style={{ color: profitPct + overheadPct + wastePct > 40 ? '#f87171' : '#34d399' }}>{profitPct + overheadPct + wastePct}%</strong></span>
                <span style={{ color: '#64748b' }}>المتبقي للتكاليف المباشرة: <strong>{100 - profitPct - overheadPct - wastePct}%</strong></span>
              </div>
            </div>
          )}

          {/* ─── Processing Progress Bar ─── */}
          {files.some(f => f.status === 'processing' || f.status === 'analyzing') && progress > 0 && progress < 100 && (
            <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#a5b4fc' }}>⏳ جاري التحليل...</span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'monospace' }}>{progress}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(99,102,241,0.1)' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}
          {files.map((file, i) => {
            const isExpanded = expandedFile === file.name;
            const hasItems = (file.boqItems?.length || 0) > 0;
            const isLoading = file.status === 'processing' || file.status === 'analyzing' || file.status === 'waiting';
            const progressPct = file.status === 'waiting' ? 10 : file.status === 'processing' ? 50 : file.status === 'analyzing' ? progress : 100;

            return (
              <div key={i} style={{ ...glass, marginBottom: '1rem', padding: 0, overflow: 'hidden', transition: 'all 0.3s' }}>
                {/* File Header Bar */}
                <div
                  onClick={() => (hasItems || file.status === 'done') && setExpandedFile(isExpanded ? null : file.name)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem 1.25rem', cursor: hasItems ? 'pointer' : 'default',
                    background: isExpanded ? 'rgba(99,102,241,0.1)' : 'transparent',
                    borderBottom: isExpanded || isLoading ? '1px solid rgba(99,102,241,0.15)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isLoading ? (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>{file.status === 'error' ? '❌' : getFileIcon(file.name)}</span>
                    )}
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', gap: '0.75rem', marginTop: '0.15rem' }}>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        {file.summary && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#34d399' }}>🎯 {file.summary.boqItemsFound} بند</span>
                            <span>•</span>
                            <span style={{ color: '#fbbf24' }}>⏱ {file.summary.processingTimeMs}ms</span>
                            {file.summary.estimatedTotalCost > 0 && (
                              <>
                                <span>•</span>
                                <span style={{ color: '#a5b4fc' }}>💰 {formatCurrency(file.summary.estimatedTotalCost)}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {file.status === 'error' && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>❌ {file.error?.substring(0, 40)}</span>}
                    {file.status === 'done' && hasItems && (
                      <span style={{ color: '#94a3b8', fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    )}
                    {file.status === 'done' && !hasItems && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>📄 بدون بنود</span>}
                    <button onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}>✕</button>
                  </div>
                </div>

                {/* ─── Loading Progress Bar with Phases ─── */}
                {isLoading && (
                  <div style={{ padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.03)' }}>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(99,102,241,0.1)', marginBottom: '1rem', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPct}%`, height: '100%', borderRadius: '3px',
                        background: 'linear-gradient(90deg, #6366f1, #818cf8, #a78bfa)',
                        backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    {/* Phase Steps */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {[
                        { label: '📥 قراءة الملف', active: file.status === 'processing' || file.status === 'analyzing', done: file.status === 'analyzing' || file.status === 'done' },
                        { label: '🧠 تحليل BOQ', active: file.status === 'analyzing', done: file.status === 'done' },
                        { label: '💰 تقدير الأسعار', active: false, done: file.status === 'done' },
                        { label: '✅ مكتمل', active: false, done: file.status === 'done' },
                      ].map((step, si) => (
                        <div key={si} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700,
                            background: step.done ? '#34d399' : step.active ? '#818cf8' : 'rgba(99,102,241,0.15)',
                            color: step.done || step.active ? '#fff' : '#64748b',
                            animation: step.active ? 'pulse 1.5s infinite' : 'none',
                            boxShadow: step.active ? '0 0 12px rgba(129,140,248,0.4)' : 'none',
                          }}>
                            {step.done ? '✓' : si + 1}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: step.active ? '#a5b4fc' : step.done ? '#34d399' : '#475569', fontWeight: step.active ? 700 : 400 }}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded: BOQ Items Table */}
                {isExpanded && hasItems && file.boqItems && (
                  <div style={{ padding: '1.25rem' }}>
                    {/* Analysis Info Bar */}
                    {file.summary && (
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '0.75rem' }}>
                          📋 أوراق: {file.summary.sheetsAnalyzed.join(', ')}
                        </span>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.75rem' }}>
                          🎯 صف الأعمدة: #{file.summary.headerRowDetected}
                        </span>
                        <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '0.75rem' }}>
                          📊 أعمدة: {file.summary.columnsDetected.join(' + ')}
                        </span>
                      </div>
                    )}

                    {/* ═══ Price Validation Alert Banner ═══ */}
                    {file.validation && (() => {
                      const v = file.validation;
                      const bgColor = v.overallSeverity === 'critical' ? 'rgba(239,68,68,0.08)' 
                        : v.overallSeverity === 'warning' ? 'rgba(251,191,36,0.08)' 
                        : 'rgba(34,197,94,0.08)';
                      const borderColor = v.overallSeverity === 'critical' ? 'rgba(239,68,68,0.3)' 
                        : v.overallSeverity === 'warning' ? 'rgba(251,191,36,0.3)' 
                        : 'rgba(34,197,94,0.3)';
                      const textColor = v.overallSeverity === 'critical' ? '#f87171' 
                        : v.overallSeverity === 'warning' ? '#fbbf24' 
                        : '#34d399';
                      const icon = v.overallSeverity === 'critical' ? '🔴' 
                        : v.overallSeverity === 'warning' ? '🟡' : '🟢';

                      return (
                        <div style={{ 
                          marginBottom: '1rem', borderRadius: '12px', border: `1px solid ${borderColor}`,
                          background: bgColor, overflow: 'hidden',
                          animation: v.overallSeverity === 'critical' ? 'pulse 2s infinite' : 'none',
                        }}>
                          {/* Main status bar */}
                          <div style={{ 
                            padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', 
                            alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: '0.5rem',
                          }}
                            onClick={() => setShowValidationDetail(!showValidationDetail)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                              <span style={{ color: textColor, fontWeight: 700, fontSize: '0.85rem' }}>{v.summary}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              {v.corrections > 0 && (
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 600 }}>
                                  🔧 تم تصحيح {v.corrections} بند
                                </span>
                              )}
                              {v.estimatedCostPerM2 !== null && (
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#94a3b8', fontSize: '0.7rem' }}>
                                  📐 {Math.round(v.estimatedCostPerM2).toLocaleString('ar-SA')} ر.س/م²
                                </span>
                              )}
                              {v.anomalyCount.critical > 0 && (
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '0.7rem', fontWeight: 600 }}>
                                  🔴 {v.anomalyCount.critical} حرج
                                </span>
                              )}
                              {v.anomalyCount.warning > 0 && (
                                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600 }}>
                                  🟡 {v.anomalyCount.warning} تنبيه
                                </span>
                              )}
                              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{showValidationDetail ? '▲' : '▼'}</span>
                            </div>
                          </div>

                          {/* Expandable anomaly details */}
                          {showValidationDetail && v.anomalies.length > 0 && (
                            <div style={{ borderTop: `1px solid ${borderColor}`, padding: '0.75rem 1rem', maxHeight: '200px', overflowY: 'auto' }}>
                              {v.anomalies.slice(0, 20).map((a, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '0.35rem 0', borderBottom: '1px solid rgba(99,102,241,0.05)',
                                  fontSize: '0.72rem', gap: '0.5rem',
                                }}>
                                  <span style={{ color: a.severity === 'critical' ? '#f87171' : '#fbbf24' }}>
                                    {a.severity === 'critical' ? '🔴' : '🟡'} {a.description}
                                  </span>
                                  <span style={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.65rem' }}>
                                    {a.autoFixed ? `✅ ${a.fixedValue?.toLocaleString('ar-SA')} ر.س` : 'يحتاج مراجعة'}
                                  </span>
                                </div>
                              ))}
                              {v.anomalies.length > 20 && (
                                <div style={{ textAlign: 'center', padding: '0.3rem', color: '#64748b', fontSize: '0.7rem' }}>
                                  +{v.anomalies.length - 20} تنبيه إضافي...
                                </div>
                              )}
                            </div>
                          )}

                          {/* Cost comparison bar */}
                          {v.totalCost !== v.correctedTotalCost && (
                            <div style={{ 
                              borderTop: `1px solid ${borderColor}`, padding: '0.5rem 1rem',
                              display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem',
                              background: 'rgba(34,197,94,0.05)',
                            }}>
                              <span style={{ color: '#f87171', textDecoration: 'line-through' }}>
                                قبل: {v.totalCost.toLocaleString('ar-SA')} ر.س
                              </span>
                              <span style={{ color: '#34d399', fontWeight: 700 }}>
                                ← بعد التصحيح: {v.correctedTotalCost.toLocaleString('ar-SA')} ر.س
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Sheet Filter (if multi-sheet) */}
                    {file.summary && file.summary.sheetsAnalyzed.length > 1 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button onClick={() => setActiveSheet('')} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeSheet === '' ? '#4f46e5' : 'rgba(30,41,59,0.8)', color: activeSheet === '' ? '#fff' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>الكل</button>
                        {file.summary.sheetsAnalyzed.map(s => (
                          <button key={s} onClick={() => setActiveSheet(s)} style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeSheet === s ? '#4f46e5' : 'rgba(30,41,59,0.8)', color: activeSheet === s ? '#fff' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>{s}</button>
                        ))}
                      </div>
                    )}

                    {/* BOQ Table */}
                    {(() => {
                      // ═══ Dynamic price recalculation from sliders ═══
                      const calcDynamicPrice = (item: SmartBOQItem): number | null => {
                        if (!item.estimatedPrice && !item.baseUnitCost) return null;
                        if (item.source === 'original') return item.estimatedPrice; // don't touch original prices
                        if (!item.baseUnitCost || !item.qty) return item.estimatedPrice;
                        const markup = 1 + (profitPct + overheadPct + wastePct) / 100;
                        return Math.round(item.baseUnitCost * item.qty * markup);
                      };
                      
                      const filteredItems = file.boqItems!.filter(item => !activeSheet || item.sheet === activeSheet);
                      const needsReview = filteredItems.filter(it => it.confidence < 0.5 && it.estimatedPrice !== null).length;
                      const unpriced = filteredItems.filter(it => !it.estimatedPrice && it.confidence > 0.1).length;
                      const dynamicTotal = filteredItems.reduce((sum, it) => sum + (calcDynamicPrice(it) || 0), 0);
                      
                      return (
                      <>
                      {/* AI Review Summary */}
                      {(needsReview > 0 || unpriced > 0) && (
                        <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>🤖 يحتاج مراجعة</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginRight: '0.75rem' }}>
                              {needsReview > 0 && <span> • {needsReview} بند ثقة منخفضة</span>}
                              {unpriced > 0 && <span> • {unpriced} بند بدون سعر</span>}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{ padding: '0.3rem 0.75rem', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}
                              onClick={() => alert('🤖 هذه الميزة تحتاج API Key لنموذج ذكاء اصطناعي خارجي (Claude / Gemini / GPT-4).\n\nأضف مفتاح API في الإعدادات لتفعيل المراجعة التلقائية.')}
                            >🧠 طلب مراجعة AI</button>
                          </div>
                        </div>
                      )}
                      
                      {/* Dynamic Total */}
                      <div style={{ marginBottom: '0.75rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#94a3b8' }}>💰 الإجمالي (ديناميكي حسب الإعدادات):</span>
                        <span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>{dynamicTotal.toLocaleString('ar-SA')} ر.س</span>
                      </div>

                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'right', fontWeight: 700 }}>البند</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'right', fontWeight: 700 }}>الورقة</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'center', fontWeight: 700 }}>الكمية</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'center', fontWeight: 700 }}>الوحدة</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'left', fontWeight: 700 }}>تقدير التكلفة</th>
                            <th style={{ padding: '0.6rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', textAlign: 'center', fontWeight: 700 }}>الثقة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((item, j) => {
                            const isSelected = selectedItemIdx === j;
                            const bd = isSelected ? getBreakdown(item.unit, item.sheet, item.qty, wastePct, overheadPct, profitPct) : null;
                            const dynPrice = calcDynamicPrice(item);
                            return (
                            <React.Fragment key={j}>
                            <tr
                              onClick={() => setSelectedItemIdx(isSelected ? null : j)}
                              style={{ transition: 'background 0.2s', cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent' }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', color: '#64748b', whiteSpace: 'nowrap' }}>{j + 1}</td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', color: item.isAccessory ? '#fbbf24' : item.confidence <= 0.1 ? '#64748b' : '#e2e8f0', fontWeight: 500, opacity: item.confidence <= 0.1 ? 0.5 : 1 }}>
                                {item.description || item.itemNo}
                                {item.matchedItem && !item.isAccessory && <span style={{ color: '#6366f1', fontSize: '0.6rem', marginRight: '0.5rem' }}> ← {item.matchedItem}</span>}
                                {item.warnings && item.warnings.length > 0 && (
                                  <div style={{ marginTop: '0.2rem' }}>
                                    {item.warnings.slice(0, 2).map((w: string, wi: number) => (
                                      <div key={wi} style={{ fontSize: '0.6rem', color: w.includes('🔴') ? '#f87171' : w.includes('📄') ? '#94a3b8' : '#fbbf24', lineHeight: 1.3 }}>{w}</div>
                                    ))}
                                  </div>
                                )}
                                {!isSelected && item.confidence > 0.1 && <span style={{ color: '#475569', fontSize: '0.65rem', marginRight: '0.5rem' }}> 🔍</span>}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', color: '#64748b', fontSize: '0.75rem' }}>{item.sheet}</td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', color: item.qty ? '#e2e8f0' : '#475569', textAlign: 'center', fontWeight: 600 }}>
                                {item.qty !== null ? item.qty.toLocaleString('ar-SA') : '—'}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', textAlign: 'center' }}>
                                <span style={{ padding: '0.15rem 0.4rem', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '0.7rem' }}>{item.unit || '—'}</span>
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', textAlign: 'left', fontWeight: 600, fontFamily: 'monospace' }}>
                                {dynPrice ? (
                                  <>
                                    <span style={{ fontSize: '0.65rem', marginLeft: '0.3rem' }}>
                                      {item.source === 'database' ? '🟢' : item.source === 'recipe' ? '🔵' : item.source === 'original' ? '💰' : item.source === 'auto_detected' ? '⚠️' : '🟠'}
                                    </span>
                                    <span style={{ color: item.confidence > 0.5 ? '#34d399' : '#fbbf24' }}>{' '}{formatCurrency(dynPrice)}</span>
                                    {dynPrice !== item.estimatedPrice && <span style={{ fontSize: '0.55rem', color: '#64748b', marginRight: '0.3rem' }}> (معدّل)</span>}
                                  </>
                                ) : item.confidence <= 0.1 ? (
                                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'inherit', fontWeight: 400 }}>📄 ليس بند</span>
                                ) : (
                                  <span style={{ fontSize: '0.65rem', color: '#f87171', fontFamily: 'inherit', fontWeight: 400 }}>🔴 يحتاج مراجعة</span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(99,102,241,0.05)', textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace', color: item.confidence > 0.8 ? '#34d399' : item.confidence > 0.5 ? '#fbbf24' : '#f87171' }}>
                                    {Math.round(item.confidence * 100)}%
                                  </span>
                                  <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(99,102,241,0.1)', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.confidence * 100}%`, height: '100%', borderRadius: '2px', background: item.confidence > 0.8 ? '#34d399' : item.confidence > 0.5 ? '#fbbf24' : '#f87171' }} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {/* ─── Cost Breakdown Detail Panel ─── */}
                            {isSelected && bd && (
                              <tr>
                                <td colSpan={7} style={{ padding: 0, borderBottom: '2px solid rgba(99,102,241,0.2)' }}>
                                  <div style={{ padding: '1.25rem', background: 'rgba(15,23,42,0.95)', animation: 'fadeIn 0.3s ease' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a5b4fc' }}>📊 تفكيك التسعير — {item.description || item.itemNo}</div>
                                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>سعر الوحدة: {formatNum(bd.unitPrice)} ر.س × {formatNum(item.qty || 0)} {item.unit}</div>
                                    </div>

                                    {/* Visual Bar Chart */}
                                    <div style={{ display: 'flex', height: '28px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(99,102,241,0.1)' }}>
                                      {[
                                        { label: 'مواد', value: bd.materials, color: '#6366f1' },
                                        { label: 'عمالة', value: bd.labor, color: '#f59e0b' },
                                        { label: 'نقل', value: bd.transport, color: '#06b6d4' },
                                        { label: 'تنفيذ', value: bd.installation, color: '#8b5cf6' },
                                        { label: 'هالك', value: bd.waste, color: '#ef4444' },
                                        { label: 'مصاريف', value: bd.overhead, color: '#64748b' },
                                        { label: 'ربح', value: bd.profit, color: '#22c55e' },
                                      ].map((seg, si) => {
                                        const pct = bd.subtotal > 0 ? (seg.value / bd.subtotal * 100) : 0;
                                        return pct > 0 ? (
                                          <div key={si} title={`${seg.label}: ${formatNum(seg.value)} ر.س (${pct.toFixed(1)}%)`}
                                            style={{ width: `${pct}%`, background: seg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: '#fff', fontWeight: 700, minWidth: pct > 5 ? '0' : '2px', transition: 'width 0.3s' }}>
                                            {pct > 8 ? seg.label : ''}
                                          </div>
                                        ) : null;
                                      })}
                                    </div>

                                    {/* Detailed Table */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                      {/* Left: Cost Items */}
                                      <div>
                                        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                                          <tbody>
                                            {[
                                              { icon: '🧱', label: 'تكلفة المواد (التوريد)', value: bd.materials, color: '#6366f1', desc: 'أسعار المواد الخام من الموردين' },
                                              { icon: '👷', label: 'تكلفة العمالة', value: bd.labor, color: '#f59e0b', desc: 'أجور العمال + إقامة + تأمين + نطاقات' },
                                              { icon: '🚛', label: 'النقل والتوصيل', value: bd.transport, color: '#06b6d4', desc: 'نقل المواد للموقع + تفريغ' },
                                              { icon: '🔧', label: 'التنفيذ والتركيب', value: bd.installation, color: '#8b5cf6', desc: 'أعمال التركيب والتنفيذ في الموقع' },
                                              { icon: '📉', label: `الهالك (${bd.wastePercent.toFixed(0)}%)`, value: bd.waste, color: '#ef4444', desc: 'نسبة الفاقد والتالف أثناء العمل' },
                                              { icon: '🏢', label: `مصاريف عمومية (${bd.overheadPercent.toFixed(0)}%)`, value: bd.overhead, color: '#64748b', desc: 'إيجار مكاتب + كهرباء + إدارة' },
                                              { icon: '💰', label: `هامش الربح (${bd.profitPercent.toFixed(0)}%)`, value: bd.profit, color: '#22c55e', desc: 'صافي ربح المقاول' },
                                            ].map((row, ri) => (
                                              <tr key={ri}>
                                                <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(99,102,241,0.05)', whiteSpace: 'nowrap' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: row.color, flexShrink: 0 }} />
                                                    <span style={{ color: '#cbd5e1' }}>{row.icon} {row.label}</span>
                                                  </div>
                                                  <div style={{ fontSize: '0.6rem', color: '#475569', paddingRight: '1.2rem', marginTop: '0.1rem' }}>{row.desc}</div>
                                                </td>
                                                <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(99,102,241,0.05)', textAlign: 'left', fontFamily: 'monospace', fontWeight: 600, color: row.color, whiteSpace: 'nowrap' }}>
                                                  {formatNum(row.value)} ر.س
                                                </td>
                                              </tr>
                                            ))}
                                            {/* Subtotal */}
                                            <tr style={{ borderTop: '2px solid rgba(99,102,241,0.2)' }}>
                                              <td style={{ padding: '0.5rem', color: '#a5b4fc', fontWeight: 700 }}>المجموع الفرعي</td>
                                              <td style={{ padding: '0.5rem', textAlign: 'left', fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>{formatNum(bd.subtotal)} ر.س</td>
                                            </tr>
                                            {/* VAT */}
                                            <tr>
                                              <td style={{ padding: '0.5rem', color: '#94a3b8' }}>🏛️ ضريبة القيمة المضافة (15%)</td>
                                              <td style={{ padding: '0.5rem', textAlign: 'left', fontFamily: 'monospace', fontWeight: 600, color: '#94a3b8' }}>{formatNum(bd.vat)} ر.س</td>
                                            </tr>
                                            {/* Grand Total */}
                                            <tr style={{ background: 'rgba(52,211,153,0.08)' }}>
                                              <td style={{ padding: '0.6rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>✅ الإجمالي النهائي</td>
                                              <td style={{ padding: '0.6rem', textAlign: 'left', fontFamily: 'monospace', fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>{formatNum(bd.total)} ر.س</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Right: Summary Cards */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>📋 ملخص العمليات</div>
                                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                            • توريد المواد من المورد بسعر {formatNum(bd.materials)} ر.س<br/>
                                            • تشغيل {item.qty && item.qty > 10 ? 'فريق عمل' : 'عامل'} بتكلفة {formatNum(bd.labor)} ر.س<br/>
                                            • نقل وتوصيل للموقع {formatNum(bd.transport)} ر.س<br/>
                                            • أعمال التنفيذ والتركيب {formatNum(bd.installation)} ر.س
                                          </div>
                                        </div>
                                        <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                                          <div style={{ fontSize: '0.7rem', color: '#fbbf24', marginBottom: '0.25rem' }}>⚡ لماذا هذا السعر؟</div>
                                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                                            • نسبة المواد: <strong style={{ color: '#6366f1' }}>{((bd.materials/bd.subtotal)*100).toFixed(0)}%</strong> من الإجمالي<br/>
                                            • نسبة العمالة: <strong style={{ color: '#f59e0b' }}>{((bd.labor/bd.subtotal)*100).toFixed(0)}%</strong> تشمل إقامة وتأمين<br/>
                                            • الهالك: <strong style={{ color: '#ef4444' }}>{bd.wastePercent.toFixed(0)}%</strong> فاقد طبيعي للمواد<br/>
                                            • الربح: <strong style={{ color: '#22c55e' }}>{bd.profitPercent.toFixed(0)}%</strong> هامش ربح المقاول
                                          </div>
                                        </div>
                                        <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
                                          <div style={{ fontSize: '0.7rem', color: '#34d399', marginBottom: '0.25rem' }}>🎯 سعر الوحدة الواحدة</div>
                                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
                                            {item.qty && item.qty > 0 ? formatNum(Math.round(bd.total / item.qty)) : '—'} ر.س / {item.unit}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            </React.Fragment>
                            );
                          })}
                        </tbody>
                        {/* Footer Total */}
                        <tfoot>
                          <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                            <td colSpan={3} style={{ padding: '0.75rem', color: '#a5b4fc', fontWeight: 700 }}>
                              الإجمالي ({file.boqItems.filter(item => !activeSheet || item.sheet === activeSheet).length} بند)
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', color: '#e2e8f0', fontWeight: 700 }}>
                              {file.boqItems.filter(item => !activeSheet || item.sheet === activeSheet).reduce((s, i) => s + (i.qty || 0), 0).toLocaleString('ar-SA')}
                            </td>
                            <td></td>
                            <td style={{ padding: '0.75rem', textAlign: 'left', color: '#34d399', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                              {formatCurrency(dynamicTotal)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    </>
                    );
                    })()}

                    {/* Confidence Note + Export Buttons */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)', fontSize: '0.7rem', color: '#fbbf24', flex: 1 }}>
                        📊 مصادر الأسعار: 🟢 قاعدة بيانات | 🔵 وصفة | 💰 أصلي | 🟠 تقدير | ⚠️ اكسسوار تلقائي
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => exportToExcel(file)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', color: '#34d399', border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(34,197,94,0.25)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))'; }}
                        >📊 تحميل Excel</button>
                        <button onClick={() => exportToCSV(file)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >📄 CSV</button>
                        <button onClick={() => exportPrint(file)}
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >🖨️ طباعة</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default FileProcessingHub;
