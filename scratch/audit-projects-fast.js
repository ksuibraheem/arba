import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { cleanArabicText, normalizeArabicChars, correctSpelling, cleanPunctuation, stripArabicPrefixes } from '../services/semanticNormalizer.ts';

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
  'انهاء', 'إنهاء', 'العمل', 'عمل', 'صنع', 'نوع', 'لزوم', 'اللازمة', 'لازمة',
  'اعاده', 'إعادة'
]);

// 1. Pre-compute stems for all 17,000+ items in the database
console.log('⚡ Pre-computing stems for FULL_ITEMS_DATABASE...');
const dbItemsPrepared = FULL_ITEMS_DATABASE.map(item => {
  const itemNameClean = cleanPunctuation(item.name?.ar || '');
  const itemNameNorm = normalizeArabicChars(cleanArabicText(itemNameClean));
  const itemWordsStems = itemNameNorm.split(' ').filter(w => w.length > 2).map(w => stripArabicPrefixes(w));
  return {
    item,
    stems: itemWordsStems
  };
});
console.log(`✅ Pre-computed ${dbItemsPrepared.length} database items.`);

const localKeywordMap = {
  'خرسانة قواعد':     ['03.02'],
  'خرسانة اسقف':      ['04.03'],
  'خرسانة اعمدة':     ['04.01'],
  'خرسانة ميدات':     ['03.03'],
  'خرسانة نظافة':     ['03.01'],
  'خرسانة عادية':     ['03.01'],
  'فرشة نظافة':       ['03.01'],
  'فرشات نظافة':      ['03.01'],
  'صبة':              ['03.02', '04.03'],
  'بلوك خارجي':       ['05.04'],
  'بلوك داخلي':       ['05.05'],
  'بلوك':             ['05.04', '05.05'],
  'لياسة داخلية':     ['07.01'],
  'لياسة خارجية':     ['07.02'],
  'لياسة':            ['07.01', '07.02'],
  'حديد تسليح':       ['03.05'],
  'حديد':             ['03.05'],
  'سباكة':            ['08.01'],
  'كهرباء':           ['09.03'],
  'تكييف':            ['10.01'],
  'مصعد':             ['17.01'],
  'مضخة حريق':        ['15.06'],
  'مضخات حريق':       ['15.06'],
  'رشاشات':           ['15.05'],
  'طفايات':           ['15.01'],
  'حريق':             ['15.01'],
  'bms':              ['18.10'],
  'تشيلر':            ['10.04'],
  'مولد':             ['19.04'],
  'محول':             ['09.16'],
};

const GENERIC_KEYWORDS = new Set([
  'حديد', 'بلوك', 'لياسة', 'سباكة', 'كهرباء', 'تكييف', 'حريق', 'صبة'
]);

// Optimized match function
function matchTextOptimized(desc) {
  if (!desc) return null;
  const cleaned = cleanArabicText(desc);
  const corrected = correctSpelling(cleaned);
  const normalized = normalizeArabicChars(corrected);

  const queryWordsCount = normalized.split(/\s+/).filter(w => w.length > 0).length;

  // 1. Direct Keyword Map lookup
  for (const [keyword, ids] of Object.entries(localKeywordMap)) {
    if (GENERIC_KEYWORDS.has(keyword) && queryWordsCount >= 4) {
      continue;
    }
    const normalizedKeyword = normalizeArabicChars(keyword);
    if (normalized.includes(normalizedKeyword)) {
      const dbItem = FULL_ITEMS_DATABASE.find(item => item.id === ids[0]);
      if (dbItem) {
        return { item: dbItem, score: 100 };
      }
    }
  }

  const cleanedPunc = cleanPunctuation(normalized);
  const rawWords = cleanedPunc.split(' ').filter(w => w.length > 2);
  const words = rawWords.filter(w => !AR_STOP_WORDS.has(w));

  if (words.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  const queryStems = words.map(w => stripArabicPrefixes(w));

  for (const dbItem of dbItemsPrepared) {
    let matchScore = 0;

    queryStems.forEach((qStem, idx) => {
      const isMatched = dbItem.stems.includes(qStem);
      if (isMatched) {
        let wordScore = qStem.length;
        if (idx === 0) wordScore *= 4.0;
        else if (idx === 1) wordScore *= 2.0;
        matchScore += wordScore;
      }
    });

    if (matchScore > 0 && matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = dbItem.item;
    }
  }

  if (bestMatch && bestScore >= 4) {
    return { item: bestMatch, score: bestScore };
  }
  return null;
}

function parseProjectFile(filePath) {
  const wb = XLSX.readFile(filePath);
  const allItems = [];
  
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
    
    if (headerIdx === -1) continue;
    
    const headers = rawRows[headerIdx];
    const descCol = headers.indexOf('وصف البند');
    const unitCol = headers.indexOf('وحدة القياس');
    const qtyCol = headers.indexOf('الكمية');
    
    for (let r = headerIdx + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || !row[descCol]) continue;
      
      const desc = String(row[descCol]).trim();
      if (desc.length < 5) continue;
      
      const unit = String(row[unitCol] || 'عدد').trim();
      const qty = parseFloat(row[qtyCol]) || 0;
      
      allItems.push({
        sheet: name,
        desc,
        unit,
        qty,
        rowNum: r + 1
      });
    }
  }
  return allItems;
}

function normText(t) {
  if (!t) return '';
  return String(t).trim().replace(/\s+/g, ' ').toLowerCase();
}

function runAudit() {
  console.log('\n📊 Starting Fast Project Audit & Supplier Price Match Verification...\n');
  
  const hafrItems = parseProjectFile(FILE_HAFR);
  const riyadhItems = parseProjectFile(FILE_RIYADH);
  
  console.log(`📋 Project 1: Hafr Al-Batin - Total BOQ items: ${hafrItems.length}`);
  console.log(`📋 Project 2: Riyadh - Total BOQ items: ${riyadhItems.length}`);
  
  // 1. Cross-Project Duplication Audit
  console.log('\n=========================================');
  console.log('🛡️ Audit 1: Cross-Project Duplicate Analysis');
  console.log('=========================================');
  
  const hafrDescs = new Set(hafrItems.map(i => normText(i.desc)));
  const riyadhDescs = new Set(riyadhItems.map(i => normText(i.desc)));
  
  let crossDupCount = 0;
  let crossDupExactQtyCount = 0;
  
  riyadhItems.forEach(ri => {
    const norm = normText(ri.desc);
    if (hafrDescs.has(norm)) {
      crossDupCount++;
      const matchingHafr = hafrItems.find(hi => normText(hi.desc) === norm);
      if (matchingHafr && matchingHafr.qty === ri.qty && matchingHafr.unit === ri.unit) {
        crossDupExactQtyCount++;
      }
    }
  });
  
  const overlapPct = (crossDupCount / Math.max(hafrItems.length, riyadhItems.length)) * 100;
  console.log(`- Overlapping descriptions in both projects: ${crossDupCount} items (${overlapPct.toFixed(2)}% overlap)`);
  console.log(`- Exact duplicates (description, unit, and qty): ${crossDupExactQtyCount} items`);
  console.log(`- Conclusion: ${overlapPct > 80 ? '⚠️ Files represent duplicates' : '✅ Files represent different projects with minimal overlap.'}`);

  // 2. Internal Duplicate Items Audit
  console.log('\n=========================================');
  console.log('🛡️ Audit 2: Internal Duplication within same Project');
  console.log('=========================================');
  
  function getInternalDups(name, items) {
    const counts = new Map();
    items.forEach(item => {
      const norm = normText(item.desc);
      if (counts.has(norm)) {
        counts.get(norm).push(item);
      } else {
        counts.set(norm, [item]);
      }
    });
    
    let dupRows = 0;
    let dupGroups = 0;
    const examples = [];
    
    for (const [desc, occurrences] of counts.entries()) {
      if (occurrences.length > 1) {
        dupRows += occurrences.length - 1;
        dupGroups++;
        if (examples.length < 3) {
          examples.push({
            desc: occurrences[0].desc,
            count: occurrences.length,
            sheets: occurrences.map(o => o.sheet)
          });
        }
      }
    }
    
    console.log(`- Project: ${name}`);
    console.log(`  - Total items: ${items.length}`);
    console.log(`  - Repeated description groups: ${dupGroups}`);
    console.log(`  - Total repeated rows: ${dupRows}`);
    if (examples.length > 0) {
      console.log('  - Examples of repeated items:');
      examples.forEach(ex => {
        console.log(`    • "${ex.desc.substring(0, 70)}..." repeated ${ex.count} times in sheets: [${ex.sheets.join(', ')}]`);
      });
    }
    return { dupRows, dupGroups };
  }
  
  const hafrDups = getInternalDups('Hafr Al-Batin', hafrItems);
  const riyadhDups = getInternalDups('Riyadh', riyadhItems);

  // 3. Pricing & Supplier Match Verification
  console.log('\n=========================================');
  console.log('🧠 Audit 3: Pricing Brain matching & Supplier Verification');
  console.log('=========================================');
  
  function verifyPricing(name, items, regionalFactor) {
    let matchedCount = 0;
    let totalCost = 0;
    let verifiedSuppliersCount = 0;
    
    console.log(`💲 Pricing ${name} (Regional Factor: ${regionalFactor})`);
    
    const sampleMatches = [];
    
    items.forEach((item, idx) => {
      const match = matchTextOptimized(item.desc);
      if (match) {
        matchedCount++;
        const dbItem = match.item;
        
        // Base cost
        const costPerUnit = (dbItem.baseMaterial * (1 + dbItem.waste) + dbItem.baseLabor) * regionalFactor;
        totalCost += costPerUnit * item.qty;
        
        const supplier = dbItem.suppliers?.[0];
        
        if (sampleMatches.length < 8 && (
          dbItem.id.startsWith('01.') || 
          dbItem.id.startsWith('02.') || 
          dbItem.id.startsWith('03.') || 
          dbItem.id.startsWith('05.') || 
          dbItem.id.startsWith('06.') ||
          dbItem.id.includes('props')
        )) {
          sampleMatches.push({
            desc: item.desc,
            qty: item.qty,
            unit: item.unit,
            dbName: dbItem.name.ar,
            dbId: dbItem.id,
            costPerUnit,
            supplierName: supplier ? supplier.name.ar : 'N/A',
            priceMultiplier: supplier ? supplier.priceMultiplier : 1
          });
        }
      }
    });
    
    console.log(`  - Match Rate: ${matchedCount} / ${items.length} (${(matchedCount / items.length * 100).toFixed(1)}%)`);
    console.log(`  - Total Cost (Estimated): ${totalCost.toLocaleString(undefined, {maximumFractionDigits: 2})} SAR`);
    
    console.log('  - Key pricing details:');
    sampleMatches.forEach(m => {
      console.log(`    • Item: "${m.desc.substring(0, 60)}..."`);
      console.log(`      Matched DB: "${m.dbName}" (ID: ${m.dbId})`);
      console.log(`      Supplier: ${m.supplierName} | Est Unit Price: ${m.costPerUnit.toFixed(2)} SAR`);
    });
  }
  
  verifyPricing('Hafr Al-Batin', hafrItems, 1.13); // Using the official hafr_albatin factor 1.13 from database
  verifyPricing('Riyadh', riyadhItems, 1.0);
}

runAudit();
