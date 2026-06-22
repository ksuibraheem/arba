/**
 * Test BOQ filters against the ACTUAL user file
 * Run: node scratch/test-boq-filters.js
 */
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Find BOQ files on the Desktop
const oneDrivePath = path.join(process.env.USERPROFILE, 'OneDrive');
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');

// Search for BOQ files
function findBOQFiles(searchPath) {
  const results = [];
  try {
    const items = fs.readdirSync(searchPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(searchPath, item.name);
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        try { results.push(...findBOQFiles(fullPath)); } catch {}
      } else if (/\.(xlsx?|xls)$/i.test(item.name) && /BOQ|boq/i.test(item.name)) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

// Look in common places
const allFiles = [
  ...findBOQFiles(desktopPath),
  ...findBOQFiles(path.join(desktopPath, 'Ibrahim AL-duaydi')),
].filter((v, i, a) => a.indexOf(v) === i);

console.log('\n=== BOQ Files Found ===');
allFiles.forEach(f => console.log('  📄', f));

if (allFiles.length === 0) {
  // Try the training_data or pricing_files folder
  const altPaths = [
    path.join(__dirname, '..', 'pricing_files'),
    path.join(__dirname, '..', 'training_data'),
    path.join(__dirname, '..', 'data'),
  ];
  for (const p of altPaths) {
    if (fs.existsSync(p)) {
      const found = findBOQFiles(p);
      allFiles.push(...found);
    }
  }
  console.log('\nAlternative search:');
  allFiles.forEach(f => console.log('  📄', f));
}

if (allFiles.length === 0) {
  console.log('\n❌ No BOQ files found. Looking in project...');
  // Just list all xlsx files in project
  const projFiles = findBOQFiles(path.join(__dirname, '..'));
  projFiles.forEach(f => console.log('  📄', f));
  if (projFiles.length > 0) allFiles.push(...projFiles);
}

// Now test with the first file
const testFile = allFiles[0];
if (!testFile) {
  console.log('\n❌ No xlsx files found. Please specify a path.');
  process.exit(1);
}

console.log('\n=== Testing with:', testFile, '===\n');

const wb = XLSX.readFile(testFile);
const HEADER_KEYWORDS = {
  desc: /وصف|description|بند|item|desc|scope|work|نوع العمل|بيان|تفاصيل|المواصفات/i,
  qty: /كمية|qty|quantity|كميه/i,
  unit: /وحدة|unit|وحده/i,
  price: /سعر|price|rate|ريال|cost|إجمالي/i,
  itemNo: /رقم|م$|no\.?|#|البند|ref/i,
};

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  if (data.length < 3) continue;
  
  console.log(`\n📊 Sheet: "${sheetName}" — ${data.length} rows`);
  
  // Find header row
  let headerRow = -1;
  let cols = { desc: -1, qty: -1, unit: -1, price: -1, itemNo: -1 };
  
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (!row || row.length < 3) continue;
    let matchCount = 0;
    const tempCols = { desc: -1, qty: -1, unit: -1, price: -1, itemNo: -1 };
    
    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').trim();
      if (cell.length < 1) continue;
      if (HEADER_KEYWORDS.desc.test(cell) && tempCols.desc === -1) { tempCols.desc = j; matchCount++; }
      else if (HEADER_KEYWORDS.qty.test(cell) && tempCols.qty === -1) { tempCols.qty = j; matchCount++; }
      else if (HEADER_KEYWORDS.unit.test(cell) && tempCols.unit === -1) { tempCols.unit = j; matchCount++; }
      else if (HEADER_KEYWORDS.price.test(cell) && tempCols.price === -1) { tempCols.price = j; matchCount++; }
      else if (HEADER_KEYWORDS.itemNo.test(cell) && tempCols.itemNo === -1) { tempCols.itemNo = j; matchCount++; }
    }
    if (matchCount >= 2 && headerRow === -1) {
      headerRow = i;
      cols = tempCols;
    }
  }
  
  if (headerRow === -1) { console.log('  ⚠️ No header detected'); continue; }
  
  console.log(`  Header row: ${headerRow + 1}, Cols: desc=${cols.desc} qty=${cols.qty} unit=${cols.unit} price=${cols.price}`);
  
  const dataRows = data.slice(headerRow + 1);
  let passed = 0, filtered = 0;
  const issues = [];
  
  for (const row of dataRows) {
    if (!row || row.length < 2) continue;
    
    let desc = cols.desc >= 0 ? String(row[cols.desc] || '').trim() : '';
    const itemNo = cols.itemNo >= 0 ? String(row[cols.itemNo] || '').trim() : '';
    const rawQty = cols.qty >= 0 ? row[cols.qty] : null;
    const qty = rawQty !== null && rawQty !== '' ? Number(rawQty) : null;
    const unit = cols.unit >= 0 ? String(row[cols.unit] || '').trim() : '';
    const rawPrice = cols.price >= 0 ? row[cols.price] : null;
    const existingPrice = rawPrice !== null && rawPrice !== '' ? Number(rawPrice) : null;
    
    if (desc.length < 2 && itemNo.length < 1) { filtered++; continue; }
    if (/^(البند|الوصف|#|م|item|desc|أعمال$)$/i.test(desc)) { filtered++; continue; }
    
    // Filter 1: Too long
    if (desc.length > 200) { filtered++; issues.push(`[LONG>200] ${desc.substring(0, 60)}...`); continue; }
    
    // Filter 2: Spec keywords
    const specPattern = /\b(scope of work|shall be|contractor|specification|regulation|drawing|submission|verification|commissioning|in accordance|as per|clarified|discrepanc|approved by|prior to|comply|compliance|unless otherwise|note:|ملاحظة|المواصفات|المقاول|الاشتراطات|الرسومات|يجب أن|وفقاً|طبقاً)\b/i;
    if (specPattern.test(desc) && (!qty || qty === 0)) { filtered++; issues.push(`[SPEC] ${desc.substring(0, 60)}...`); continue; }
    
    // Filter 3: No qty + no unit + long
    if ((!qty || qty === 0) && !unit && desc.length > 80) { filtered++; issues.push(`[NOQTY>80] ${desc.substring(0, 60)}...`); continue; }
    
    // Filter 4: Multiple sentences
    const sentenceCount = (desc.match(/[.。;؛]/g) || []).length;
    if (sentenceCount >= 3) { filtered++; issues.push(`[SENTENCES] ${desc.substring(0, 60)}...`); continue; }
    
    // Filter 5: ALL CAPS
    if (/^[A-Z\s\d\-\/&,.()]+$/.test(desc) && desc.length < 80 && (!qty || qty === 0)) { filtered++; issues.push(`[ALLCAPS] "${desc}"`); continue; }
    
    // Filter 6: Numbered section
    if (/^(\d+\.?\d*\.?|[A-Z]\.?|[IVX]+\.?)\s*$/.test(desc.trim())) { filtered++; issues.push(`[NUMHDR] "${desc}"`); continue; }
    
    // Filter 7: Short without data
    if (desc.length < 50 && (!qty || qty === 0) && !unit && (!existingPrice || existingPrice === 0)) { filtered++; issues.push(`[SHORT] "${desc}"`); continue; }
    
    // Filter 8: Section header words
    if (/^(works|system|general|section|part|item|division|schedule|total|sub.?total|summary|grand)/i.test(desc) && (!qty || qty === 0)) { filtered++; issues.push(`[SECTION] "${desc}"`); continue; }
    
    // PASSED all filters
    passed++;
    
    // Check if this looks like a real BOQ item
    const isLikelySpec = desc.length > 100 && (!qty || qty === 0) && !unit;
    if (isLikelySpec) {
      console.log(`  ⚠️ PASSED BUT SUSPICIOUS (no qty/unit, long): "${desc.substring(0, 80)}..."`);
    }
  }
  
  console.log(`  ✅ Passed: ${passed} | ❌ Filtered: ${filtered}`);
  console.log(`  📋 Filter reasons (first 10):`);
  issues.slice(0, 10).forEach(i => console.log(`    ${i}`));
  if (issues.length > 10) console.log(`    ... +${issues.length - 10} more`);
}
