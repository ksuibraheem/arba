import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer.ts';

const desc = "خرسانة عادية أسفل القواعد والميد الأرضية طبقا للمخططات ....";

const cleaned = cleanArabicText(desc);
const corrected = correctSpelling(cleaned);
const normalized = normalizeArabicChars(corrected);

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

const cleanedPunc = cleanPunctuation(normalized);
const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));
const queryStems = words.map(w => stripArabicPrefixes(w));

console.log('Query description:', desc);
console.log('Normalized query:', corrected);
console.log('Query stems:', queryStems);

const traces = [];

for (const item of FULL_ITEMS_DATABASE) {
  const itemNameClean = cleanPunctuation(item.name?.ar || '');
  const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
  const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));

  let matchScore = 0;
  const matchedWords = [];

  queryStems.forEach((qStem, idx) => {
    const isMatched = itemWords.includes(qStem);
    if (isMatched) {
      let wordScore = qStem.length;
      if (idx === 0) wordScore *= 4.0;
      else if (idx === 1) wordScore *= 2.0;
      matchScore += wordScore;
      matchedWords.push({ qStem, wordScore });
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
}

traces.sort((a, b) => b.score - a.score);

console.log('\nTop 10 matched items:');
traces.slice(0, 10).forEach((t, i) => {
  console.log(`#${i+1}: ${t.name} (ID: ${t.id}) | Score: ${t.score}`);
  console.log('  Details:', JSON.stringify(t.matchedWords));
});
