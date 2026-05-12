/**
 * ARBA V8.2 — Scope Auditor (Browser-Compatible)
 * مراجع النطاق — يفحص استثناءات وتضمينات البنود
 * Converted from double_agent_extractor.cjs for browser use
 */

export interface ScopeAuditResult {
  status: 'APPROVED' | 'WARNING' | 'REJECTED';
  severity: 'NONE' | 'YELLOW' | 'RED';
  reason: string;
  details: string[];
  action?: string;
}

export interface DimensionExtraction {
  dimensions: string[];   // e.g., ['20 سم', '60×60']
  materials: string[];    // e.g., ['خرسانة', 'بلوك']
  quantities: string[];   // e.g., ['3 أوجه', '2 ساعة']
}

// ═══ EXCLUSION / INCLUSION KEYWORDS (V8.3: Multilingual) ═══

import { EXCLUSION_TERMS, INCLUSION_TERMS, type SupportedLang } from './multilingualDictionary';

/** Flatten all exclusion keywords from all languages */
function getAllExclusionWords(): string[] {
  const all: string[] = [];
  for (const words of Object.values(EXCLUSION_TERMS)) {
    all.push(...words);
  }
  return all;
}

/** Flatten all inclusion keywords from all languages */
function getAllInclusionWords(): string[] {
  const all: string[] = [];
  for (const words of Object.values(INCLUSION_TERMS)) {
    all.push(...words);
  }
  return all;
}

// ═══ AGENT A: Regex-based Dimension/Material Extractor ═══

const DIMENSION_PATTERNS = [
  /(\d+)\s*[×xX]\s*(\d+)/g,               // 60×60, 20x20
  /(\d+(?:\.\d+)?)\s*(سم|ملم|مم|م|cm|mm|m)/gi, // 20 سم, 1.5م, 20cm
  /سماكة?\s*(\d+(?:\.\d+)?)\s*(سم|ملم|مم)/gi, // سماكة 20 سم
  /قطر\s*(\d+(?:\.\d+)?)\s*(ملم|مم|mm)/gi,     // قطر 16 ملم
  /(\d+(?:\.\d+)?)\s*(inch|in|ft|feet)/gi,      // English units
  /épaisseur\s*(\d+(?:\.\d+)?)\s*(cm|mm)/gi,    // French: épaisseur 20 cm
];

const MATERIAL_KEYWORDS = [
  // Arabic
  'خرسانة', 'بلوك', 'بورسلان', 'سيراميك', 'رخام', 'جرانيت',
  'حديد', 'حجر', 'زجاج', 'ألمنيوم', 'خشب', 'جبس',
  'دهان', 'إيبوكسي', 'بوليسترين', 'اسمنت', 'مونة',
  // English
  'concrete', 'steel', 'block', 'porcelain', 'marble', 'granite',
  'aluminum', 'timber', 'gypsum', 'paint', 'epoxy', 'cement',
  // French
  'béton', 'acier', 'marbre', 'granit', 'aluminium', 'peinture',
  'plâtre', 'bois', 'ciment',
  // Chinese
  '混凝土', '钢筋', '大理石', '花岗岩', '铝', '油漆',
  // Turkish
  'beton', 'çelik', 'mermer', 'granit', 'alüminyum', 'boya',
];

const QUANTITY_PATTERNS = [
  /(\d+)\s*(أوجه|وجه|طبقة|طبقات|ساعة|ساعات)/g,
  /(\d+)\s*(layers?|faces?|coats?)/gi,
];

/**
 * Agent A: Extract dimensions, materials, and embedded quantities
 */
export function extractFeatures(text: string): DimensionExtraction {
  const dimensions: string[] = [];
  const materials: string[] = [];
  const quantities: string[] = [];

  // Extract dimensions
  for (const pattern of DIMENSION_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      dimensions.push(match[0].trim());
    }
  }

  // Extract materials
  const lowerText = text.toLowerCase();
  for (const mat of MATERIAL_KEYWORDS) {
    if (lowerText.includes(mat.toLowerCase())) {
      materials.push(mat);
    }
  }

  // Extract quantities
  for (const pattern of QUANTITY_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      quantities.push(match[0].trim());
    }
  }

  return { dimensions, materials, quantities };
}

// ═══ AGENT B: Scope Auditor ═══

/**
 * Agent B: Audit scope for legal exclusions/inclusions
 */
export function auditScope(text: string): ScopeAuditResult {
  const exclusions: { word: string; context: string }[] = [];
  const inclusions: { word: string; context: string }[] = [];
  const lowerText = text.toLowerCase();

  for (const word of getAllExclusionWords()) {
    if (lowerText.includes(word.toLowerCase())) {
      const idx = lowerText.indexOf(word.toLowerCase());
      const context = text.substring(idx, Math.min(idx + 50, text.length)).trim();
      exclusions.push({ word, context });
    }
  }

  for (const word of getAllInclusionWords()) {
    if (lowerText.includes(word.toLowerCase())) {
      const idx = lowerText.indexOf(word.toLowerCase());
      const context = text.substring(idx, Math.min(idx + 50, text.length)).trim();
      inclusions.push({ word, context });
    }
  }

  if (exclusions.length > 0) {
    return {
      status: 'REJECTED',
      severity: 'RED',
      reason: 'EXCLUSION_DETECTED',
      details: exclusions.map(e => `🚨 "${e.word}" → السياق: "${e.context}"`),
      action: 'يجب مراجعة بشرية: البند يستبعد مكونات قد تؤثر على السعر',
    };
  }

  if (inclusions.length > 0) {
    return {
      status: 'WARNING',
      severity: 'YELLOW',
      reason: 'INCLUSION_DETECTED',
      details: inclusions.map(e => `⚠️ "${e.word}" → السياق: "${e.context}"`),
      action: 'تأكد أن التسعير يغطي جميع المكونات المذكورة',
    };
  }

  return {
    status: 'APPROVED',
    severity: 'NONE',
    reason: 'CLEAN_SCOPE',
    details: [],
  };
}

/**
 * Full double-agent consensus: extract + audit
 */
export function runDoubleAgent(description: string) {
  const extraction = extractFeatures(description);
  const audit = auditScope(description);

  return {
    extraction,
    audit,
    canAutoPrice: audit.status === 'APPROVED',
    needsHumanReview: audit.status === 'REJECTED',
  };
}
