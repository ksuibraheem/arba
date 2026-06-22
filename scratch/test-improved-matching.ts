import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling } from '../services/semanticNormalizer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FOLDER = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة';
const FILE_HAFR = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بحفر الباطن للتسعير.xlsx');
const FILE_RIYADH = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بالرياض للتسعير.xlsx');

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

// Improved matching logic
function matchTextImproved(desc: string): { id: string; name: string; score: number } | null {
  const cleaned = cleanArabicText(desc);
  const normalized = normalizeArabicChars(cleaned);
  const corrected = correctSpelling(normalized);

  const rawWords = corrected.split(' ').filter(w => w.length > 2);
  const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));
  
  if (words.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of FULL_ITEMS_DATABASE) {
    const itemNameNorm = normalizeArabicChars(item.name?.ar || '');
    const itemWords = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripAl(w));
    
    let matchScore = 0;
    let matchCount = 0;

    words.forEach((word, idx) => {
      const qStem = stripAl(word);
      const isMatched = itemWords.some(iw => iw === qStem || iw.includes(qStem) || qStem.includes(iw));
      
      if (isMatched) {
        let wordScore = qStem.length;
        // Subject weighting: first noun gets 4x weight, second gets 2x weight
        if (idx === 0) wordScore *= 4.0;
        else if (idx === 1) wordScore *= 2.0;
        
        matchScore += wordScore;
        matchCount++;
      }
    });

    if (matchScore > 0 && matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = item;
    }
  }

  // Threshold check
  if (bestMatch && bestScore >= 4.0) {
    return { id: bestMatch.id, name: bestMatch.name.ar, score: bestScore };
  }
  return null;
}

function parseFirstFewRows(filePath) {
  const wb = XLSX.readFile(filePath);
  
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    let headerIdx = -1;
    for (let i = 0; i < Math.min(30, rawRows.length); i++) {
      const row = rawRows[i];
      if (row && row.includes('وصف البند')) {
        headerIdx = i;
        break;
      }
    }
    
    if (headerIdx !== -1) {
      const headers = rawRows[headerIdx];
      const descCol = headers.indexOf('وصف البند');
      const unitCol = headers.indexOf('وحدة القياس');
      
      const items = [];
      for (let r = headerIdx + 1; r < headerIdx + 15; r++) {
        const row = rawRows[r];
        if (row && row[descCol]) {
          items.push({
            desc: String(row[descCol]).trim(),
            unit: String(row[unitCol] || 'عدد').trim()
          });
        }
      }
      return items;
    }
  }
  return [];
}

console.log('🧪 Testing Improved Arabic Matching Engine...');
const items = parseFirstFewRows(FILE_HAFR);

items.forEach((item, idx) => {
  const match = matchTextImproved(item.desc);
  console.log(`\n📋 Query ${idx + 1}: "${item.desc.substring(0, 70)}..."`);
  if (match) {
    console.log(`  ✨ MATCHED: "${match.name}" (ID: ${match.id}) | Score: ${match.score.toFixed(1)}`);
  } else {
    console.log('  ❌ NO MATCH FOUND');
  }
});
