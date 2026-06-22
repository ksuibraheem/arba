import XLSX from 'xlsx';
import path from 'path';
import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer.ts';

const FILE_RIYADH = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة\\مسودة مشروع قوات الدفاع الجوي بالرياض للتسعير.xlsx';

const wb = XLSX.readFile(FILE_RIYADH);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const targetRows = [];
rows.forEach((r, idx) => {
  const desc = String(r[5] || '');
  if (desc.includes('محابس') || desc.includes('تفتيش')) {
    targetRows.push({ rowNum: idx + 1, desc });
  }
});

const AR_STOP_WORDS = new Set([
  'توريد', 'تركيب', 'توصيل', 'اختبار', 'تشغيل', 'شامل', 'شاملة', 'شاملا', 
  'جميع', 'كل', 'ما', 'يلزم', 'اعمال', 'أعمال', 'طبقا', 'طبقاً', 'مخططات', 
  'المخططات', 'مواصفات', 'المواصفات', 'المهندس', 'المشرف', 'تعليمات', 
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

targetRows.forEach(tr => {
  console.log(`\n-----------------------------------------`);
  console.log(`Row ${tr.rowNum}: "${tr.desc}"`);
  
  const cleaned = cleanArabicText(tr.desc);
  const corrected = correctSpelling(cleaned);
  const normalized = normalizeArabicChars(corrected);

  const cleanedPunc = cleanPunctuation(normalized);
  const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
  const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));
  const queryStems = words.map(w => stripArabicPrefixes(w));
  
  console.log('Stems:', queryStems);
  
  const traces = [];
  for (const item of FULL_ITEMS_DATABASE) {
    const itemNameClean = cleanPunctuation(item.name?.ar || '');
    const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
    const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));

    let matchScore = 0;
    const matchedStems = [];

    queryStems.forEach((qStem, idx) => {
      const isMatched = itemWords.includes(qStem);
      if (isMatched) {
        let wordScore = qStem.length;
        if (idx === 0) wordScore *= 4.0;
        else if (idx === 1) wordScore *= 2.0;
        matchScore += wordScore;
        matchedStems.push({ qStem, wordScore });
      }
    });

    if (matchScore > 0) {
      traces.push({ id: item.id, name: item.name.ar, score: matchScore, matchedStems });
    }
  }
  
  traces.sort((a, b) => b.score - a.score);
  console.log('Top 3 matches:');
  traces.slice(0, 3).forEach((t, i) => {
    console.log(`  #${i+1}: ${t.name} (ID: ${t.id}) | Score: ${t.score} | Matched: ${JSON.stringify(t.matchedStems)}`);
  });
});
