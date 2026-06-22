import { matchTextToItemId } from '../services/semanticNormalizer';
import { FULL_ITEMS_DATABASE } from '../constants';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer';

const queries = [
  "إنشاء غرفة تفتيش قطر (800 مم ) وأعماق مختلفة حسب الموقع من الطوب المصمت المحمى جيدا باللياسة والبيتومين من الداخل والخارج مع توريد وتركيب غطاء زهر مرن من الحديد الزهر",
];

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

for (const query of queries) {
  console.log("\n====================================");
  console.log("Query:", query);
  
  const cleaned = cleanArabicText(query);
  const corrected = correctSpelling(cleaned);
  const normalized = normalizeArabicChars(corrected);
  const cleanedPunc = cleanPunctuation(normalized);
  const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
  const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));
  const queryStems = words.map(w => stripArabicPrefixes(w));
  
  console.log("Query Stems:", queryStems);
  
  let candidates: { item: any, score: number }[] = [];
  
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
    
    if (matchScore > 0) {
      candidates.push({ item, score: matchScore });
    }
  }
  
  candidates.sort((a, b) => b.score - a.score);
  console.log("\nTop 15 candidates by score:");
  candidates.slice(0, 15).forEach(c => {
    console.log(`  ID: ${c.item.id} | Score: ${c.score} | Name: ${c.item.name.ar} | Stems: ${JSON.stringify(c.item.id.startsWith('PL-M-02') ? c.item.name.ar : c.item.name.ar)}`);
  });
}
