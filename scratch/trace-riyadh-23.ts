import { matchTextToItemId } from '../services/semanticNormalizer';
import { FULL_ITEMS_DATABASE } from '../constants';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer';

const query = "إنشاء غرفة تفتيش قطر (800 مم ) وأعماق مختلفة حسب الموقع من الطوب المصمت المحمى جيدا باللياسة والبيتومين من الداخل والخارج مع توريد وتركيب غطاء زهر مرن من الحديد الزهر";

const cleaned = cleanArabicText(query);
const corrected = correctSpelling(cleaned);
const normalized = normalizeArabicChars(corrected);
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
const queryStems = words.map(w => stripArabicPrefixes(w));

console.log("Query Stems:", queryStems);

const targetIds = ["EXT-QS-QSFU-DIV9-1129", "PL-D-03", "PL-M-02"];

for (const id of targetIds) {
  const item = FULL_ITEMS_DATABASE.find(i => i.id === id);
  if (!item) {
    console.log(`Item ${id} not found`);
    continue;
  }
  
  const itemNameClean = cleanPunctuation(item.name?.ar || '');
  const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
  const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));
  
  console.log(`\nItem ID: ${id} (${item.name?.ar})`);
  console.log("Item stems:", itemWords);
  
  let score = 0;
  words.forEach((word, idx) => {
    const qStem = stripArabicPrefixes(word);
    const matchedIw = itemWords.find(iw => iw === qStem);
    if (matchedIw) {
      let wordScore = qStem.length;
      if (idx === 0) wordScore *= 4.0;
      else if (idx === 1) wordScore *= 2.0;
      score += wordScore;
      console.log(`  Word: "${word}" (stem: "${qStem}") matched! Query idx: ${idx} -> score contribution: ${wordScore}`);
    }
  });
  console.log("Total Score:", score);
}
