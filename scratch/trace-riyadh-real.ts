import { matchTextToItemId } from '../services/semanticNormalizer';
import { FULL_ITEMS_DATABASE } from '../constants';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer';

const queries = [
  "إنشاء غرفة تفتيش قطر (800 مم ) وأعماق مختلفة حسب الموقع من الخرسانة المسلحة سابقة الصب مع السلم المطلي PVC والغطاء من الحديد الزهر والإطار قطر 600 مم والدهان الداخلي والخارجي وكل ما يلزم ليكون جاهز للتشغيل حسب المواصفات والمخططات",
  "إنشاء غرفة تفتيش قطر (800 مم ) وأعماق مختلفة حسب الموقع من الخرسانة المسلحة سابقة الصب مع السلم المطلي PVC والغطاء من الحديد الزهر والإطار قطر 600 مم والدهان الداخلي والخارجي بالإضافة إلي مصيدة وصمامي عدم الرجوع قطر 110 مم وكل ما يلزم ليكون جاهز للتشغيل حسب المواصفات والمخططات",
  "إنشاء غرفة تفتيش كهرباء مقاس 1200×1200مم وأعماق مختلفة حسب الموقع من الخرسانة المسلحة مسبقة الصب ويشمل البند أعمال الحفر والردم وأي أعمال خرسانية مطلوبة لإتمام العمل مع أعمال العزل والحماية مع السلم المطلي PVC والغطاء مع الإطار من الحديد الزهر وخطاف الكابلات والتثبيت اللازم والدهان الداخلي والخارجي وكل ما يلزم ليكون جاهز للتشغيل وإتمام العمل طبقا للمواصفات والمخططات وتعليمات جهة الإشراف.",
  "إنشاء غرفة تفتيش إتصالات مقاس 1000×1000مم وأعماق مختلفة حسب الموقع من الخرسانة المسلحة مسبقة الصب ويشمل البند أعمال الحفر والردم وأي أعمال خرسانية مطلوبة لإتمام العمل مع أعمال العزل والحماية مع السلم المطلي PVC والغطاء مع الإطار من الحديد الزهر وخطاف الكابلات والتثبيت اللازم والدهان الداخلي والخارجي وكل ما يلزم ليكون جاهز للتشغيل وإتمام العمل طبقا للمواصفات والمخططات وتعليمات جهة الإشراف."
];

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

queries.forEach((query, qidx) => {
  console.log(`\n====================================`);
  console.log(`Query ${qidx + 23}:`, query.substring(0, 100) + "...");
  
  const cleaned = cleanArabicText(query);
  const corrected = correctSpelling(cleaned);
  const normalized = normalizeArabicChars(corrected);
  const cleanedPunc = cleanPunctuation(normalized);
  const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
  const stems = rawWords.map(w => stripArabicPrefixes(w));
  const queryStems = stems.filter(w => !AR_STOP_WORDS.has(w));
  
  console.log("Query Stems:", queryStems);
  
  let candidates: { item: any, score: number }[] = [];
  
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
  console.log("Top 5 candidates:");
  candidates.slice(0, 5).forEach(c => {
    console.log(`  ID: ${c.item.id} | Score: ${c.score} | Name: ${c.item.name.ar}`);
  });
  console.log("Actual matchTextToItemId returned:", matchTextToItemId(query));
});
