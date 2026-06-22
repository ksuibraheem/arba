import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling } from '../services/semanticNormalizer.ts';

const desc = "إعـادة ردم الأسـاسات (القواعـد ، الميــدات..,) وحول المبني والردم للوصول للمناسيب المطلوبة علي طبقات مع الدك الجيد.";

function cleanPunctuation(text: string): string {
  return text.replace(/[()\[\]\.,\/#!$%\^&\*;:{}=\-_`~?؟،]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripArabicPrefixes(word: string): string {
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

const cleaned = cleanArabicText(cleanPunctuation(desc));
const normalized = normalizeArabicChars(cleaned);
const corrected = correctSpelling(normalized);

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

const rawWords = corrected.split(' ').filter(w => w.length > 2);
const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));

console.log('Query Stems:', words.map(w => stripArabicPrefixes(w)));

let bestMatch = null;
let bestScore = 0;
const traces = [];

for (const item of FULL_ITEMS_DATABASE) {
  const itemNameClean = cleanPunctuation(item.name?.ar || '');
  const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
  const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));
  
  let matchScore = 0;
  const matchedWords = [];

  words.forEach((word, idx) => {
    const qStem = stripArabicPrefixes(word);
    const matchedIw = itemWords.find(iw => iw === qStem);
    
    if (matchedIw) {
      let wordScore = qStem.length;
      if (idx === 0) wordScore *= 4.0;
      else if (idx === 1) wordScore *= 2.0;
      
      matchScore += wordScore;
      matchedWords.push({ word, qStem, iw: matchedIw, score: wordScore });
    }
  });

  if (matchScore > 0) {
    traces.push({
      id: item.id,
      name: item.name.ar,
      score: matchScore,
      matchedWords
    });
  }

  if (matchScore > bestScore) {
    bestScore = matchScore;
    bestMatch = item;
  }
}

traces.sort((a, b) => b.score - a.score);

console.log('\nTop 5 matched items in database:');
traces.slice(0, 5).forEach((t, i) => {
  console.log(`\n#${i+1}: ${t.name} (ID: ${t.id}) | Score: ${t.score}`);
  console.log('  Matched Words Details:', JSON.stringify(t.matchedWords, null, 2));
});
