import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

function runTest() {
  const excelPath = path.join(TRAINED_DIR, 'extracted_all_excel.json');
  if (!fs.existsSync(excelPath)) {
    console.log('Error: extracted_all_excel.json not found');
    return;
  }

  const raw = fs.readFileSync(excelPath, 'utf8');
  const data = JSON.parse(raw);
  
  let totalExtracted = 0;
  const samples = [];

  for (const [sourceKey, source] of Object.entries(data.sources)) {
    console.log(`\nSource: ${sourceKey}`);
    for (const [sheetName, sheet] of Object.entries(source.sheets)) {
      if (!sheet.allItems) continue;
      
      let sheetCount = 0;
      for (const row of sheet.allItems) {
        const cells = row.cells;
        if (!cells || cells.length < 3) continue;

        // 1. Identify potential descriptions
        let enDesc = '';
        let arDesc = '';
        let unit = '';
        let qty = 0;
        let price = 0;

        // Clean cells and find types
        const stringCells = [];
        const numberCells = [];
        
        cells.forEach((c, idx) => {
          if (c === null || c === undefined || c === '') return;
          if (typeof c === 'number') {
            numberCells.push({ val: c, idx });
          } else if (typeof c === 'string') {
            const cleaned = cleanText(c);
            if (cleaned.length > 0) {
              stringCells.push({ val: cleaned, idx });
            }
          }
        });

        // Heuristic 1: Find English and Arabic descriptions
        let longestAr = '';
        let longestEn = '';
        
        stringCells.forEach(sc => {
          const text = sc.val;
          // Skip cell if it looks like a unit or short code
          if (text.length <= 4 && !isArabic(text)) return;
          
          if (isArabic(text)) {
            if (text.length > longestAr.length) {
              longestAr = text;
            }
          } else {
            // Must contain letters, not just numbers/symbols
            if (/[a-zA-Z]/.test(text) && text.length > longestEn.length) {
              longestEn = text;
            }
          }
        });

        enDesc = longestEn;
        arDesc = longestAr;

        // Heuristic 2: Find Unit
        const unitKeywords = ['م²', 'م2', 'sqm', 'م³', 'م3', 'cbm', 'م.ط', 'متر', 'meter', 'm', 'عدد', 'حبة', 'no', "no's", 'no.', 'set', 'item', 'l.s', 'مقطوعية', 'رول', 'roll', 'طقم', 'برميل', 'drum', 'طن', 'ton', 'bag', 'كيس', 'kg', 'كجم', 'pcs', 'piece'];
        
        stringCells.forEach(sc => {
          const text = sc.val.toLowerCase().replace(/[\.\(\)]/g, '').trim();
          if (unitKeywords.includes(text) || unitKeywords.some(kw => text === kw)) {
            unit = sc.val;
          }
        });

        // Fallback for Unit if not found by strict keyword matching
        if (!unit) {
          // Look for short string cells (1-4 chars)
          const shortStrings = stringCells.filter(sc => sc.val.length > 0 && sc.val.length <= 4);
          if (shortStrings.length > 0) {
            unit = shortStrings[0].val;
          }
        }

        // Heuristic 3: Find Price (Rate)
        // If we have numbers, let's check for quantity and rate relations
        // Let's filter number cells
        const positiveNumbers = numberCells.filter(nc => nc.val > 0);
        
        if (positiveNumbers.length > 0) {
          // Look for typical qty/rate/total pattern
          // If we have at least 3 positive numbers:
          let foundPattern = false;
          for (let i = 0; i < positiveNumbers.length; i++) {
            for (let j = 0; j < positiveNumbers.length; j++) {
              if (i === j) continue;
              for (let k = 0; k < positiveNumbers.length; k++) {
                if (i === k || j === k) continue;
                
                const qCandidate = positiveNumbers[i].val;
                const rCandidate = positiveNumbers[j].val;
                const tCandidate = positiveNumbers[k].val;
                
                // check if q * r = t
                if (Math.abs(qCandidate * rCandidate - tCandidate) < 0.05 * tCandidate) {
                  qty = qCandidate;
                  price = rCandidate;
                  foundPattern = true;
                  break;
                }
              }
              if (foundPattern) break;
            }
            if (foundPattern) break;
          }

          if (!foundPattern) {
            // Fallback heuristics:
            // If we have 2 positive numbers, maybe one is qty, one is total or rate.
            // In BOQ templates, columns are often ordered: qty, then rate, then total.
            // So positiveNumbers sorted by index:
            const sortedNums = positiveNumbers.sort((a, b) => a.idx - b.idx);
            if (sortedNums.length === 1) {
              price = sortedNums[0].val;
            } else if (sortedNums.length === 2) {
              // Usually one is qty and one is rate, or rate and total.
              // Let's assume the one with higher index is rate or total.
              price = sortedNums[1].val;
            } else if (sortedNums.length >= 3) {
              // index 0: index or serial or qty
              // index 1: qty or rate
              // index 2: total or rate
              // Let's look for a rate in the middle indexes.
              // Let's check if the last number is roughly the product of two previous ones.
              const n0 = sortedNums[0].val;
              const n1 = sortedNums[1].val;
              const n2 = sortedNums[2].val;
              if (Math.abs(n0 * n1 - n2) < 0.1 * n2) {
                qty = n0;
                price = n1;
              } else {
                price = n1; // assume middle one is unit rate
              }
            }
          }
        }

        // Validate we got at least descriptions and a price
        const hasDesc = (enDesc && enDesc.length > 3) || (arDesc && arDesc.length > 3);
        const hasPrice = price > 0;
        
        if (hasDesc && hasPrice) {
          sheetCount++;
          totalExtracted++;
          if (samples.length < 5) {
            samples.push({
              source: sourceKey,
              sheet: sheetName,
              enDesc,
              arDesc,
              unit: unit || 'L.S',
              qty: qty || 1,
              price
            });
          }
        }
      }
      if (sheetCount > 0) {
        console.log(`  Sheet: "${sheetName}" -> Extracted ${sheetCount} valid items`);
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`Total Extracted Items: ${totalExtracted}`);
  console.log(`==========================================`);
  console.log('Sample Extracted Items:', JSON.stringify(samples, null, 2));
}

runTest();
