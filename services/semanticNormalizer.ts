/**
 * ARBA v8.5 — Semantic Normalizer (المصفاة الذكية)
 * طبقة تنظيف البيانات اللغوية والرياضية
 * 
 * PURPOSE:
 * - تصحيح الأخطاء الإملائية الشائعة في توصيفات المقاولات
 * - توحيد أشكال الألف والياء والهاء
 * - ربط المصطلحات السوقية بالـ ID القياسي في قاعدة بيانات آربا
 * - تصحيح وحدات القياس المبهمة بناءً على سياق البند
 * 
 * DOES NOT modify the original data — returns a normalized copy.
 */

import { FULL_ITEMS_DATABASE } from '../constants';

// =================== 1. المعالج اللغوي (Linguistic Analyzer) ===================

/** إزالة التطويل (Tatweel) والتشكيل والمسافات الزائدة */
export function cleanArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\u0640/g, '')           // إزالة التطويل (ـ)
    .replace(/[\u064B-\u065F]/g, '')  // إزالة التشكيل
    .replace(/\s+/g, ' ')            // توحيد المسافات
    .trim();
}

/** توحيد أشكال الحروف العربية (Normalization) */
export function normalizeArabicChars(text: string): string {
  if (!text) return '';
  return text
    .replace(/[أإآٱ]/g, 'ا')   // توحيد أشكال الألف
    .replace(/ى/g, 'ي')        // الألف المقصورة → ياء
    .replace(/ة/g, 'ه')        // التاء المربوطة → هاء (للمقارنة فقط)
    .replace(/ؤ/g, 'و')        // الواو بالهمزة → واو
    .replace(/ئ/g, 'ي');       // الياء بالهمزة → ياء
}

/** قاموس تصحيح الأخطاء الإملائية الشائعة في المقاولات */
const SPELLING_CORRECTIONS: Record<string, string> = {
  // خرسانة
  'خارسانه': 'خرسانة', 'خارسانة': 'خرسانة', 'خرسانه': 'خرسانة',
  'خرصانة': 'خرسانة', 'خرصانه': 'خرسانة',
  // بلوك
  'بلك': 'بلوك', 'بولك': 'بلوك', 'بلوكات': 'بلوك', 'بلكات': 'بلوك',
  // لياسة
  'لياسه': 'لياسة', 'ليسه': 'لياسة', 'لياسات': 'لياسة',
  // سيراميك
  'سراميك': 'سيراميك', 'سرميك': 'سيراميك',
  // حديد
  'حدبد': 'حديد', 'حداد': 'حديد',
  // دهان
  'دهانات': 'دهان', 'دهانه': 'دهان', 'دهن': 'دهان',
  // كهرباء
  'كهربا': 'كهرباء', 'كهربه': 'كهرباء', 'كهرباي': 'كهرباء',
  // سباكة
  'سباكه': 'سباكة', 'سبكه': 'سباكة',
  // تكييف
  'تكيف': 'تكييف', 'تكيبف': 'تكييف', 'تكييفات': 'تكييف',
  // مصعد
  'مصاعد': 'مصعد', 'اسانسير': 'مصعد', 'اسنسير': 'مصعد',
  // حريق
  'حربق': 'حريق', 'حرق': 'حريق',
  // عزل
  'عازل': 'عزل', 'عوازل': 'عزل',
  // قواعد
  'قعد': 'قواعد', 'قاعده': 'قواعد',
  // ميد / ميدات
  'ميده': 'ميدة', 'ميدات': 'ميدة',
  // صبة / صب
  'صبه': 'صبة', 'صبات': 'صبة',
};

/** تصحيح الإملاء */
export function correctSpelling(text: string): string {
  if (!text) return text;
  let result = text;
  for (const [wrong, correct] of Object.entries(SPELLING_CORRECTIONS)) {
    // \b doesn't work with Arabic Unicode — use space/start/end boundaries
    const regex = new RegExp(`(?:^|\\s)${wrong}(?:\\s|$)`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve surrounding whitespace
      const leading = match.startsWith(' ') ? ' ' : '';
      const trailing = match.endsWith(' ') ? ' ' : '';
      return leading + correct + trailing;
    });
  }
  // Also try exact full match (single word input)
  if (SPELLING_CORRECTIONS[result.trim()]) {
    result = SPELLING_CORRECTIONS[result.trim()];
  }
  return result.trim();
}

// =================== 2. المعالج الدلالي (Semantic Mapper) ===================

/** خريطة المصطلحات السوقية → ID في قاعدة بيانات آربا */
const KEYWORD_TO_ITEM_MAP: Record<string, string[]> = {
  // Concrete keywords → possible IDs
  'خرسانة قواعد':     ['03.02'],
  'خرسانة اسقف':      ['04.03', 'super_slabs'],
  'خرسانة اعمدة':     ['04.01', 'super_columns'],
  'خرسانة ميدات':     ['03.03'],
  'خرسانة نظافة':     ['03.01'],
  'صبة':              ['03.02', '04.03'],
  // Masonry
  'بلوك خارجي':       ['05.04'],
  'بلوك داخلي':       ['05.05'],
  'بلوك':             ['05.04', '05.05'],
  // Plaster
  'لياسة داخلية':     ['07.01'],
  'لياسة خارجية':     ['07.02'],
  'لياسة':            ['07.01', '07.02'],
  // Steel
  'حديد تسليح':       ['03.05', '05.03'],
  'حديد':             ['03.05'],
  // MEP
  'سباكة':            ['08.01', '08.02'],
  'كهرباء':           ['09.03', '09.04'],
  'تكييف':            ['10.01', '10.04'],
  'مصعد':             ['17.01'],
  // Fire
  'مضخة حريق':        ['15.06'],
  'مضخات حريق':       ['15.06'],
  'رشاشات':           ['15.05'],
  'طفايات':           ['15.01'],
  'حريق':             ['15.01', '15.05', '15.06'],
  // Advanced
  'bms':               ['18.10'],
  'تشيلر':            ['10.04'],
  'مولد':             ['19.04'],
  'محول':             ['09.16', '19.03'],
};

/**
 * يحاول ربط نص حر بالـ ID الأقرب في قاعدة البيانات
 * يستخدم أولوية: مطابقة كاملة → مطابقة جزئية → لا نتيجة
 */
export function matchTextToItemId(rawText: string): string | null {
  if (!rawText) return null;

  const cleaned = cleanArabicText(rawText);
  const normalized = normalizeArabicChars(cleaned);
  const corrected = correctSpelling(normalized);

  // 1. مطابقة مباشرة مع خريطة المصطلحات
  for (const [keyword, ids] of Object.entries(KEYWORD_TO_ITEM_MAP)) {
    const normalizedKeyword = normalizeArabicChars(keyword);
    if (corrected.includes(normalizedKeyword)) {
      return ids[0]; // أعلى أولوية
    }
  }

  // 2. مطابقة مع أسماء قاعدة البيانات (fuzzy)
  const words = corrected.split(' ').filter(w => w.length > 2);
  let bestMatch: { id: string; score: number } | null = null;

  for (const item of FULL_ITEMS_DATABASE) {
    const itemNameNorm = normalizeArabicChars(item.name?.ar || '');
    let matchScore = 0;

    for (const word of words) {
      if (itemNameNorm.includes(word)) {
        matchScore += word.length; // كلمات أطول = ثقة أعلى
      }
    }

    if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
      bestMatch = { id: item.id, score: matchScore };
    }
  }

  return bestMatch && bestMatch.score >= 4 ? bestMatch.id : null;
}

// =================== 3. المعالج الرياضي (Mathematical Normalizer) ===================

/** وحدات القياس المقبولة لكل فئة */
const EXPECTED_UNITS: Record<string, string[]> = {
  structure: ['م3', 'م³', 'طن'],
  masonry:   ['م2', 'م²', 'حبة'],
  finishes:  ['م2', 'م²'],
  plumbing:  ['م.ط', 'نقطة', 'عدد'],
  electrical: ['م.ط', 'نقطة', 'عدد', 'لوحة'],
  hvac:      ['عدد', 'طن تبريد', 'م2', 'م²'],
  safety:    ['عدد', 'مجموعة', 'م.ط'],
};

/** تصحيح وحدات القياس المبهمة */
export function normalizeUnit(rawUnit: string, category: string): string {
  if (!rawUnit) return rawUnit;
  const cleaned = rawUnit.trim();

  // 1. استنتاج من السياق أولاً — لأن "متر" و "م" تعني أشياء مختلفة حسب الفئة
  if (cleaned === 'متر' || cleaned === 'م') {
    if (category === 'structure') return 'م3';
    if (category === 'masonry' || category === 'finishes') return 'م2';
    return 'م.ط'; // default fallback
  }

  // 2. تصحيحات شائعة (وحدات واضحة لا تحتاج سياق)
  const UNIT_CORRECTIONS: Record<string, string> = {
    'م٢':     'م2',
    'م٣':     'م3',
    'متر مربع': 'م2',
    'متر مكعب': 'م3',
    'طولي':   'م.ط',
    'مسطح':   'م2',
    'حبه':    'حبة',
    'عد':     'عدد',
    'مقطوعيه': 'مقطوعية',
    'مجموعه': 'مجموعة',
  };

  if (UNIT_CORRECTIONS[cleaned]) {
    return UNIT_CORRECTIONS[cleaned];
  }

  return cleaned;
}

// =================== 4. المعالج الشامل (Full Pipeline) ===================

export interface NormalizedInput {
  originalText: string;
  correctedText: string;
  matchedItemId: string | null;
  normalizedUnit: string;
  corrections: string[];  // قائمة التصحيحات التي تمت
}

/**
 * المعالجة الشاملة: ينظف النص → يصحح الإملاء → يربط بالـ ID → يوحد الوحدة
 */
export function normalizeInput(
  rawText: string,
  rawUnit: string,
  category: string = ''
): NormalizedInput {
  const corrections: string[] = [];

  // الخطوة 1: تنظيف لغوي
  const cleaned = cleanArabicText(rawText);
  if (cleaned !== rawText) corrections.push('تنظيف نص');

  // الخطوة 2: تصحيح إملائي
  const corrected = correctSpelling(cleaned);
  if (corrected !== cleaned) corrections.push('تصحيح إملائي');

  // الخطوة 3: ربط دلالي
  const matchedId = matchTextToItemId(corrected);
  if (matchedId) corrections.push(`ربط بالبند ${matchedId}`);

  // الخطوة 4: توحيد وحدة القياس
  const normalizedUnit = normalizeUnit(rawUnit, category);
  if (normalizedUnit !== rawUnit) corrections.push(`وحدة: ${rawUnit} → ${normalizedUnit}`);

  return {
    originalText: rawText,
    correctedText: corrected,
    matchedItemId: matchedId,
    normalizedUnit,
    corrections,
  };
}
