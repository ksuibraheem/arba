import { matchTextToItemId } from '../services/semanticNormalizer';
import { FULL_ITEMS_DATABASE } from '../constants';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer';

const query = "إنشاء غرفة تفتيش قطر (800 مم ) وأعماق مختلفة حسب الموقع من الطوب المصمت المحمى جيدا باللياسة والبيتومين من الداخل والخارج مع توريد وتركيب غطاء زهر مرن من الحديد الزهر";

console.log("Query:", query);

const cleaned = cleanArabicText(query);
const corrected = correctSpelling(cleaned);
const normalized = normalizeArabicChars(corrected);

console.log("Normalized:", normalized);

// Trace Step 1: KEYWORD_TO_ITEM_MAP
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

const GENERIC_KEYWORDS = new Set([
  'حديد', 'بلوك', 'لياسة', 'سباكة', 'كهرباء', 'تكييف', 'حريق', 'صبة'
]);

const queryWordsCount = normalized.split(/\s+/).filter(w => w.length > 0).length;

console.log("queryWordsCount:", queryWordsCount);

let matchedKeyword: string | null = null;
for (const [keyword, ids] of Object.entries(KEYWORD_TO_ITEM_MAP)) {
  if (GENERIC_KEYWORDS.has(keyword) && queryWordsCount >= 4) {
    continue;
  }
  const normalizedKeyword = normalizeArabicChars(keyword);
  if (normalized.includes(normalizedKeyword)) {
    matchedKeyword = keyword;
    console.log(`Matched keyword map: "${keyword}" -> ID ${ids[0]}`);
    break;
  }
}

// Trace Step 2: English Match
const hasEnglish = /[a-zA-Z]/.test(normalized);
console.log("hasEnglish:", hasEnglish);

// Trace Step 3: Arabic Stem Match
const cleanedPunc = cleanPunctuation(normalized);
const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);
const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));
console.log("Filtered words for stems:", words);

let bestMatch: { id: string; score: number; name: string } | null = null;

for (const item of FULL_ITEMS_DATABASE) {
  const itemNameClean = cleanPunctuation(item.name?.ar || '');
  const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
  const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));

  let matchScore = 0;

  words.forEach((word, idx) => {
    const qStem = stripArabicPrefixes(word);
    const matchedIw = itemWords.find(iw => iw === qStem);

    if (matchedIw) {
      let wordScore = qStem.length;
      if (idx === 0) wordScore *= 4.0;
      else if (idx === 1) wordScore *= 2.0;
      matchScore += wordScore;
    }
  });

  if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
    bestMatch = { id: item.id, score: matchScore, name: item.name.ar };
  }
}

console.log("Best Arabic stem match:", bestMatch);
console.log("Actual matchTextToItemId returned:", matchTextToItemId(query));
