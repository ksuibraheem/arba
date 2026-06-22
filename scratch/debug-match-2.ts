import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling } from '../services/semanticNormalizer.ts';

const desc = "إعـادة ردم الأسـاسات (القواعـد ، الميــدات..,) وحول المبني والردم للوص...";
const targetId = "EXT-QS-QSFU-DIV2-0836";

const cleaned = cleanArabicText(desc);
const normalized = normalizeArabicChars(cleaned);
const corrected = correctSpelling(normalized);

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة'
]);

function stripAl(word: string): string {
  if (word.startsWith('ال') && word.length > 3) {
    return word.substring(2);
  }
  return word;
}

const rawWords = corrected.split(' ').filter(w => w.length > 2);
const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));

const item = FULL_ITEMS_DATABASE.find(i => i.id === targetId);
if (!item) {
  console.log('Target item not found!');
  process.exit(1);
}

const itemNameNorm = normalizeArabicChars(item.name?.ar || '');
const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripAl(w));

console.log('Query Words (Stems):', words.map(w => `${w} -> ${stripAl(w)}`));
console.log('Item Words (Stems):', itemWords);

words.forEach((word, idx) => {
  const qStem = stripAl(word);
  console.log(`\nChecking query word: ${word} (stem: ${qStem})`);
  
  itemWords.forEach(iw => {
    const cond1 = iw === qStem;
    const cond2 = iw.includes(qStem);
    const cond3 = qStem.includes(iw);
    if (cond1 || cond2 || cond3) {
      console.log(`  Match found with item word: ${iw}`);
      console.log(`    iw === qStem: ${cond1}`);
      console.log(`    iw.includes(qStem): ${cond2}`);
      console.log(`    qStem.includes(iw): ${cond3}`);
    }
  });
});
