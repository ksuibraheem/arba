import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { extractSpecs } from '../services/specExtractor.ts';
import { normalizeInput } from '../services/semanticNormalizer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FOLDER = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة';
const FILE_HAFR = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بحفر الباطن للتسعير.xlsx');
const FILE_RIYADH = path.join(FOLDER, 'مسودة مشروع قوات الدفاع الجوي بالرياض للتسعير.xlsx');

const STOP_WORDS = new Set(['supply', 'install', 'test', 'commission', 'commissioning', 'including', 'provide', 'complete', 'all', 'with', 'for', 'and', 'the', 'per', 'new', 'from', 'type', 'size', 'each', 'set', 'work', 'item', 'general', 'according', 'approved', 'equal', 'similar', 'specification', 'testing', 'installation', 'material', 'materials', 'shall', 'necessary', 'required', 'accessories']);

const SPEC_TO_DB_CATEGORY = {
  electrical: ['mep_elec', 'elec_advanced'],
  plumbing: ['mep_plumb'],
  hvac: ['mep_hvac', 'hvac_central'],
  fire: ['fire_protection', 'fire_advanced', 'safety'],
  structural: ['structure', 'site'],
  finishes: ['architecture', 'insulation'],
  general: [],
};

// Simple text normalizer
function normText(t) {
  if (!t) return '';
  return String(t).trim().replace(/\s+/g, ' ').toLowerCase();
}

function testMatch(desc, unit) {
  const specs = extractSpecs(desc, unit);
  const normalized = normalizeInput(desc, unit);

  // Direct code matching
  const codeMatch = desc.match(/\b(ESMDB|EMDB)\b/i);
  if (codeMatch) {
    const item = FULL_ITEMS_DATABASE.find(i => i.id === 'EL-P-14');
    if (item) return { specs, bestItem: item, bestScore: 0.85 };
  }

  let candidates = FULL_ITEMS_DATABASE;
  const dbCats = SPEC_TO_DB_CATEGORY[specs.category] || [];
  if (specs.category !== 'general' && dbCats.length > 0) {
    const filtered = candidates.filter(i => dbCats.includes(i.category));
    if (filtered.length > 0) candidates = filtered;
  }

  const text = normalized.correctedText || desc;
  const words = text.split(/\s+/).filter(w => w.length > 2);
  
  let bestItem = null, bestScore = 0;
  for (const dbItem of candidates) {
    const dbName = dbItem.name?.ar || '';
    const dbNameEn = dbItem.name?.en || '';
    let score = 0, matchCount = 0;

    for (const word of words) {
      if (dbName.includes(word)) { score += word.length; matchCount++; }
    }
    if (matchCount === 0 && /[a-zA-Z]/.test(desc)) {
      const engWords = desc.toLowerCase().split(/[\s,;()]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
      for (const word of engWords) {
        if (dbNameEn.toLowerCase().includes(word)) { score += word.length; matchCount++; }
      }
    }
    
    let specBonus = 0;
    if (specs.subCategory !== 'general' && specs.subCategory !== 'unknown') {
      if (dbNameEn.toLowerCase().includes(specs.subCategory)) specBonus += 5;
    }
    if (specs.size && (dbName.includes(specs.size) || dbNameEn.includes(specs.size))) specBonus += 8;
    if (specs.capacity && (dbName.includes(specs.capacity) || dbNameEn.includes(specs.capacity))) specBonus += 8;
    if (specs.material && dbNameEn.toLowerCase().includes(specs.material.toLowerCase())) specBonus += 4;
    
    const totalScore = score + specBonus;
    const minMatch = (specBonus >= 8 && specs.confidence >= 0.5) ? 1 : 2;
    const minScore = (specs.category !== 'general' && dbCats.length > 0) ? 8 : 10;
    if (totalScore > bestScore && totalScore >= minScore && matchCount >= minMatch) {
      bestItem = dbItem; bestScore = totalScore;
    }
  }
  
  return { specs, bestItem, bestScore };
}

function parseProjectFile(filePath) {
  const wb = XLSX.readFile(filePath);
  const allItems = [];
  
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // Find header row
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

function analyze() {
  console.log('🔍 Running Deep Pricing Brain & Duplicate File Audit...');
  
  if (!fs.existsSync(FILE_HAFR) || !fs.existsSync(FILE_RIYADH)) {
    console.log('❌ Error: Input files are missing.');
    return;
  }
  
  const hafrItems = parseProjectFile(FILE_HAFR);
  const riyadhItems = parseProjectFile(FILE_RIYADH);
  
  console.log(`\n📋 Project 1: Hafr Al-Batin - Total parsed BOQ items: ${hafrItems.length}`);
  console.log(`📋 Project 2: Riyadh - Total parsed BOQ items: ${riyadhItems.length}`);
  
  // 1. Audit for duplicate files / duplication between projects
  console.log('\n========================================================================');
  console.log('🛡️  Audit 1: Cross-Project Scope & Duplication Analysis');
  console.log('========================================================================');
  
  let exactDuplicates = 0;
  let textMatchNoQty = 0;
  const hafrDescs = new Set(hafrItems.map(i => normText(i.desc)));
  const riyadhDescs = new Set(riyadhItems.map(i => normText(i.desc)));
  
  riyadhItems.forEach(ri => {
    const norm = normText(ri.desc);
    if (hafrDescs.has(norm)) {
      // Find matching item in Hafr
      const matchingHafr = hafrItems.find(hi => normText(hi.desc) === norm);
      if (matchingHafr) {
        textMatchNoQty++;
        if (matchingHafr.qty === ri.qty && matchingHafr.unit === ri.unit) {
          exactDuplicates++;
        }
      }
    }
  });
  
  const overlapPct = (textMatchNoQty / Math.max(hafrItems.length, riyadhItems.length)) * 100;
  console.log(`- Items with identical descriptions in both files: ${textMatchNoQty} items (${overlapPct.toFixed(1)}% overlap)`);
  console.log(`- Items with identical descriptions AND identical quantities: ${exactDuplicates} items`);
  
  if (overlapPct > 80) {
    console.log('\n⚠️  ALERT: Extremely high overlap detected between Riyadh and Hafr Al-Batin projects!');
    console.log('   These files represent the same project scope copied over, but with different quantities (e.g. site size) and locations.');
    if (exactDuplicates > 50) {
      console.log('   🚨 CRITICAL: The files appear to be copies of each other with minimal changes!');
    }
  } else {
    console.log('\n✅ No absolute file duplication. The scopes are distinct or partially overlapping.');
  }

  // 2. Pricing & Brain verification
  console.log('\n========================================================================');
  console.log('🧠 Audit 2: Pricing Brain Matching & Supplier Verification');
  console.log('========================================================================');
  
  function priceProject(name, items, regionalIndex) {
    console.log(`\n💲 Pricing Project: ${name} (Regional Factor: ${regionalIndex})`);
    console.log('------------------------------------------------------------------------');
    
    let matchedCount = 0;
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    const unmatched = [];
    const duplicatesInProject = new Map();
    
    items.forEach((item, idx) => {
      // Check for internal duplicates within the same project
      const norm = normText(item.desc);
      if (duplicatesInProject.has(norm)) {
        duplicatesInProject.get(norm).push(item);
      } else {
        duplicatesInProject.set(norm, [item]);
      }
      
      const { bestItem, bestScore } = testMatch(item.desc, item.unit);
      
      if (bestItem) {
        matchedCount++;
        // Apply regional index to price
        const rawMat = bestItem.baseMaterial * (1 + bestItem.waste);
        const rawLab = bestItem.baseLabor;
        const adjustedMat = rawMat * regionalIndex;
        const adjustedLab = rawLab * regionalIndex;
        
        totalMaterialCost += adjustedMat * item.qty;
        totalLaborCost += adjustedLab * item.qty;
        
        if (idx < 5) {
          console.log(`  Row ${item.rowNum} [${item.sheet}]: "${item.desc.substring(0, 40)}..."`);
          console.log(`    ✅ Matched DB item: "${bestItem.name.ar}" (ID: ${bestItem.id})`);
          console.log(`    💰 Base Rate: Mat=${bestItem.baseMaterial} Lab=${bestItem.baseLabor} -> Adjusted: Mat=${adjustedMat.toFixed(1)} Lab=${adjustedLab.toFixed(1)}`);
          console.log(`    🏢 Allocated Supplier: ${bestItem.suppliers[0].name.ar} (Multiplier: ${bestItem.suppliers[0].priceMultiplier})`);
        }
      } else {
        unmatched.push(item);
      }
    });
    
    const matchRate = (matchedCount / items.length) * 100;
    console.log(`\n  📊 Statistics for ${name}:`);
    console.log(`    - Total items matched: ${matchedCount} / ${items.length} (${matchRate.toFixed(1)}% match rate)`);
    console.log(`    - Total material cost estimate: ${totalMaterialCost.toFixed(2)} SAR`);
    console.log(`    - Total labor cost estimate: ${totalLaborCost.toFixed(2)} SAR`);
    console.log(`    - Total estimated project cost: ${(totalMaterialCost + totalLaborCost).toFixed(2)} SAR`);
    
    // Internal duplicates
    let internalDupCount = 0;
    for (const [desc, occurrences] of duplicatesInProject.entries()) {
      if (occurrences.length > 1) {
        internalDupCount += occurrences.length - 1;
        if (internalDupCount < 5) {
          console.log(`    ⚠️  Internal Duplicate Item: "${occurrences[0].desc.substring(0, 50)}..." appears ${occurrences.length} times in sheets: ${occurrences.map(o => o.sheet).join(', ')}`);
        }
      }
    }
    console.log(`    - Total internal duplicate rows (repeated items): ${internalDupCount}`);
  }

  // Price Hafr Al-Batin (Hafr Al-Batin regional index = 0.95, Riyadh = 1.0)
  priceProject('Hafr Al-Batin Project', hafrItems, 0.95);
  priceProject('Riyadh Project', riyadhItems, 1.0);
}

analyze();
