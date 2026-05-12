/**
 * ARBA Engine V8.1 — Sanitizer Engine (Browser-Compatible TypeScript)
 * محرك التنظيف والتجميد
 * 
 * Responsibilities:
 * 1. Freeze original text (Shadow Array)
 * 2. Normalize Arabic/Hindi numerals
 * 3. Tokenize stuck dimensions
 * 4. Expand common BOQ abbreviations
 * 5. Fix common Arabic typos
 */

const ABBREVIATIONS: Record<string, string> = {
  'ت.و.ت': 'توريد وتركيب',
  'ت و ت': 'توريد وتركيب',
  'م.م': 'متر مربع',
  'م.ط': 'متر طولي',
  'م.ك': 'متر مكعب',
  'ر.س': 'ريال سعودي',
  'خ.م': 'خرسانة مسلحة',
  'خ.ع': 'خرسانة عادية',
  'ح.ت': 'حديد تسليح',
  'ع.م': 'عزل مائي',
  'ع.ح': 'عزل حراري',
};

const TYPO_CORRECTIONS: Record<string, string> = {
  'خراسانة': 'خرسانة',
  'خراسانه': 'خرسانة',
  'خرسانه': 'خرسانة',
  'المنيوم': 'ألمنيوم',
  'المونيوم': 'ألمنيوم',
  'الومنيوم': 'ألمنيوم',
  'بورسلين': 'بورسلان',
  'سيرميك': 'سيراميك',
  'سراميك': 'سيراميك',
  'جبسم': 'جبس',
  'لياسه': 'لياسة',
  'دهانات': 'دهان',
  'سباكه': 'سباكة',
  'كهربا': 'كهرباء',
  'تكيف': 'تكييف',
  'مكيفات': 'تكييف',
  'بلوكات': 'بلوك',
  'بلكات': 'بلوك',
  'اناره': 'إنارة',
  'ماصوره': 'ماسورة',
  'ابواب': 'أبواب',
  'شبابيك': 'نوافذ',
};

/** Converts Hindi/Arabic numerals (٠١٢٣) to standard numerals (0123) */
function normalizeArabicNumbers(text: string): string {
  if (!text) return '';
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[٠-٩]/g, (w) => String(arabicNumbers.indexOf(w)));
}

/** Separates numbers attached to Arabic units (e.g. 20سم -> 20 سم) */
function tokenizeDimensions(text: string): string {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/(\d+)(سم|مم|ملم|م)(?!\w)/g, '$1 $2');
  cleaned = cleaned.replace(/(سماكة|سمك|ارتفاع|عرض|طول|قطر)(\d+)/g, '$1 $2');
  cleaned = cleaned.replace(/(\d+)\s*[xX×]\s*(\d+)/g, '$1 × $2');
  return cleaned;
}

/** Expands common BOQ abbreviations */
function expandAbbreviations(text: string): string {
  if (!text) return '';
  let expanded = text;
  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    expanded = expanded.replace(new RegExp(abbr.replace(/\./g, '\\.'), 'g'), full);
  }
  return expanded;
}

/** Fixes common Arabic typos in construction terminology */
function fixTypos(text: string): string {
  if (!text) return '';
  let fixed = text;
  for (const [typo, correct] of Object.entries(TYPO_CORRECTIONS)) {
    fixed = fixed.replace(new RegExp(typo, 'g'), correct);
  }
  return fixed;
}

export interface SanitizedResult {
  frozen: string;
  sanitized: string;
  /** V8.3: Canonical English form (for multilingual classification) */
  canonical?: string;
  /** V8.3: Detected language */
  detectedLang?: string;
}

/**
 * Main sanitizer pipeline: takes a BOQ item description
 * and returns FROZEN original + SANITIZED text + CANONICAL form
 */
export function sanitizeItem(originalText: string): SanitizedResult {
  const frozenText = originalText || '';

  // Arabic-specific pipeline
  let sanitizedText = frozenText;
  sanitizedText = normalizeArabicNumbers(sanitizedText);
  sanitizedText = expandAbbreviations(sanitizedText);
  sanitizedText = fixTypos(sanitizedText);
  sanitizedText = tokenizeDimensions(sanitizedText);
  sanitizedText = sanitizedText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  // V8.3: Multilingual normalization (lazy import to avoid circular deps)
  let canonical: string | undefined;
  let detectedLang: string | undefined;
  try {
    // Dynamic require to keep backward compat
    const { normalizeToCanonical } = require('./multilingualDictionary');
    const result = normalizeToCanonical(frozenText);
    if (result.replacements > 0) {
      canonical = result.normalized;
      detectedLang = result.detectedLang;
    }
  } catch { /* multilingualDictionary not available — backward compat */ }

  return { frozen: frozenText, sanitized: sanitizedText, canonical, detectedLang };
}
