/**
 * Full pipeline test AFTER all bug fixes
 * Tests: MAX_UNIT_PRICE, waste, English matching, spec-aware matching
 */
import { extractSpecs } from '../services/specExtractor.ts';
import { FULL_ITEMS_DATABASE } from '../constants.ts';
import { normalizeInput } from '../services/semanticNormalizer.ts';

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

function testMatch(desc, unit) {
  const specs = extractSpecs(desc, unit);

  // Step 0.5: Direct code matching
  const codeMatch = desc.match(/\b(ESMDB|EMDB)\b/i);
  if (codeMatch) {
    const item = FULL_ITEMS_DATABASE.find(i => i.id === 'EL-P-14');
    if (item) return { specs, bestItem: item, bestScore: 0.85 };
  }

  const normalized = normalizeInput(desc, unit);

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
    else if (totalScore === bestScore && totalScore >= minScore && matchCount >= minMatch && bestItem) {
      const isMEPItem = /^(EL|PL|HV|FR)-/.test(dbItem.id);
      const bestIsMEP = /^(EL|PL|HV|FR)-/.test(bestItem.id);
      if (isMEPItem && !bestIsMEP) {
        bestItem = dbItem; bestScore = totalScore;
      }
    }
  }
  
  return { specs, bestItem, bestScore };
}

const testItems = [
  { desc: 'Generator 500 KVA Capacity', unit: "No's" },
  { desc: 'Generator 1000 KVA Capacity', unit: "No's" },
  { desc: 'ATS 400 AMP UL FM Approved for Fire Pump only', unit: "No's" },
  { desc: 'ATS 1600 AMP', unit: "No's" },
  { desc: 'Main-distribution board (MDB-GF-A) with a 4P, 1000 AT/1000AF main breaker', unit: "No's" },
  { desc: 'Main-distribution board (MDB-GF-D) with a 4P, 1400AT/1600AF main breaker', unit: "No's" },
  { desc: 'Emergency main-distribution board (ESMDB-B1-A)', unit: "No's" },
  { desc: 'Supply cable from ATS to MDB, 4C X 240 mm2 XLPE/SWA LV cable', unit: 'm' },
  { desc: 'Supply cable 4C X 95 mm2 XLPE/SWA LV cable', unit: 'm' },
  { desc: 'LED Downlight 18W recessed in false ceiling', unit: "No's" },
  { desc: 'Cable tray perforated 300x100mm hot-dip galvanized', unit: 'm' },
  { desc: 'PVC conduit 20mm concealed in slab', unit: 'm' },
  // Arabic items
  { desc: 'خرسانة مسلحة C40 للأعمدة', unit: 'م3' },
  { desc: 'خرسانة نظافة C20', unit: 'م3' },
];

console.log(`\n📊 FULL_ITEMS_DATABASE: ${FULL_ITEMS_DATABASE.length} items\n`);
console.log('═'.repeat(95));

for (const test of testItems) {
  const { specs, bestItem, bestScore } = testMatch(test.desc, test.unit);
  const rawPrice = bestItem ? (bestItem.baseMaterial + bestItem.baseLabor) : 0;
  // NEW: no waste factor, just 10% general markup
  const unitPrice = Math.round(rawPrice * 1.10);
  
  // Check against MAX_UNIT_PRICE
  const maxP = {'عدد': 500000, "No's": 500000, 'm': 1500, 'م.ط': 1500, 'م3': 2500}[test.unit] || 50000;
  const capped = unitPrice > maxP;
  
  console.log(`\n📋 ${test.desc.substring(0, 65)}`);
  console.log(`   Spec: ${specs.category}/${specs.subCategory} | size=${specs.size || '-'} | cap=${specs.capacity || '-'} | mat=${specs.material || '-'}`);
  if (bestItem) {
    console.log(`   ✅ Match: ${bestItem.name?.ar} (${bestItem.id}) | Score: ${bestScore}`);
    console.log(`   💰 Raw: ${rawPrice} → After 10%: ${unitPrice} SAR/unit${capped ? ' ⚠️ WOULD BE CAPPED' : ' ✅ OK'}`);
  } else {
    console.log(`   ❌ No match found`);
  }
}
