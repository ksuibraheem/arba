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
  'خرسانة عادية':     ['03.01'],
  'فرشة نظافة':       ['03.01'],
  'فرشات نظافة':      ['03.01'],
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

export function cleanPunctuation(text: string): string {
  return text.replace(/[()\[\]\.,\/#!$%\^&\*;:{}=\-_`~?؟،]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stripArabicPrefixes(word: string): string {
  let stem = word;
  if (stem.startsWith('و') && stem.length > 3) {
    stem = stem.substring(1);
  }
  if (stem.startsWith('ال') && stem.length > 3) {
    stem = stem.substring(2);
  }
  if ((stem.startsWith('ب') || stem.startsWith('ل') || stem.startsWith('ف')) && stem.length > 3) {
    if (stem.substring(1).startsWith('ال')) {
      stem = stem.substring(3);
    } else {
      stem = stem.substring(1);
    }
  }
  return stem;
}

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

const EN_STOP_WORDS = new Set([
  'supply', 'install', 'test', 'commission', 'commissioning', 'including', 
  'provide', 'complete', 'all', 'with', 'for', 'and', 'the', 'per', 'new', 
  'from', 'type', 'size', 'each', 'set', 'work', 'item', 'general', 'according', 
  'approved', 'equal', 'similar', 'specification', 'testing', 'installation', 
  'material', 'materials', 'shall', 'necessary', 'required', 'accessories'
]);

const GENERIC_KEYWORDS = new Set([
  'حديد', 'بلوك', 'لياسة', 'سباكة', 'كهرباء', 'تكييف', 'حريق', 'صبة'
]);

/**
 * يحاول ربط نص حر بالـ ID الأقرب في قاعدة البيانات
 * يستخدم أولوية: مطابقة كاملة ← مطابقة جزئية ← لا نتيجة
 */
export function matchTextToItemId(rawText: string): string | null {
  if (!rawText) return null;

  const cleaned = cleanArabicText(rawText);
  const corrected = correctSpelling(cleaned);
  const normalized = normalizeArabicChars(corrected);

  // حساب عدد الكلمات في الاستعلام
  const queryWordsCount = normalized.split(/\s+/).filter(w => w.length > 0).length;

  // 1. مطابقة مباشرة مع خريطة المصطلحات
  for (const [keyword, ids] of Object.entries(KEYWORD_TO_ITEM_MAP)) {
    if (GENERIC_KEYWORDS.has(keyword) && queryWordsCount >= 4) {
      continue; // تخطي الكلمات العامة في التوصيفات الطويلة لمنع الاختطاف
    }
    const normalizedKeyword = normalizeArabicChars(keyword);
    if (normalized.includes(normalizedKeyword)) {
      return ids[0]; // أعلى أولوية
    }
  }

  // 2. التحقق من وجود نصوص باللغة الإنجليزية
  const hasEnglish = /[a-zA-Z]/.test(normalized);
  let bestEngMatch: { id: string; score: number } | null = null;
  if (hasEnglish) {
    const engWords = normalized.toLowerCase().split(/[\s,;()\[\]\.,\-]+/g).filter(w => w.length > 2 && !EN_STOP_WORDS.has(w));
    if (engWords.length > 0) {
      for (const item of FULL_ITEMS_DATABASE) {
        const itemNameEn = (item.name?.en || '').toLowerCase();
        let matchScore = 0;
        engWords.forEach((word, idx) => {
          if (itemNameEn.includes(word)) {
            let wordScore = word.length;
            let multiplier = 1.0;
            if (idx === 0) multiplier = 4.0;
            else if (idx === 1) multiplier = 2.0;
            else if (idx === 2) multiplier = 1.5;
            else if (idx === 3) multiplier = 1.2;
            else multiplier = Math.max(0.2, 1.0 - (idx - 3) * 0.05);
            wordScore *= multiplier;
            matchScore += wordScore;
          }
        });
        if (matchScore > 0 && (!bestEngMatch || matchScore > bestEngMatch.score)) {
          bestEngMatch = { id: item.id, score: matchScore };
        }
      }
    }
  }

  // 3. مطابقة جذعية دقيقة للغة العربية
  const cleanedPunc = cleanPunctuation(normalized);
  const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
  // تطبيق الجذع أولاً ثم تصفية كلمات التوقف لضمان إزالة المسبوقة بـ (و، بـ، إلخ)
  const stems = rawWords.map(w => stripArabicPrefixes(w));
  const queryStems = stems.filter(w => !AR_STOP_WORDS.has(w));

  let bestArMatch: { id: string; score: number } | null = null;
  if (queryStems.length > 0) {
    for (const item of FULL_ITEMS_DATABASE) {
      const itemNameClean = cleanPunctuation(item.name?.ar || '');
      const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
      const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2)
        .map(w => stripArabicPrefixes(w))
        .filter(w => !AR_STOP_WORDS.has(w));

      let matchScore = 0;

      queryStems.forEach((qStem, idx) => {
        const matchedIw = itemWords.find(iw => iw === qStem);

        if (matchedIw) {
          let wordScore = qStem.length;
          let multiplier = 1.0;
          if (idx === 0) multiplier = 4.0;
          else if (idx === 1) multiplier = 2.0;
          else if (idx === 2) multiplier = 1.5;
          else if (idx === 3) multiplier = 1.2;
          else multiplier = Math.max(0.2, 1.0 - (idx - 3) * 0.05);
          wordScore *= multiplier;
          matchScore += wordScore;
        }
      });

      if (matchScore > 0 && (!bestArMatch || matchScore > bestArMatch.score)) {
        bestArMatch = { id: item.id, score: matchScore };
      }
    }
  }

  // الموازنة بين المطابقة العربية والإنجليزية
  let bestMatch: { id: string; score: number } | null = null;
  if (bestArMatch && bestEngMatch) {
    bestMatch = bestArMatch.score >= bestEngMatch.score ? bestArMatch : bestEngMatch;
  } else {
    bestMatch = bestArMatch || bestEngMatch || null;
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
