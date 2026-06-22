import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');
const OUTPUT_FILE = path.join(ROOT, 'constants', 'extendedSupplierItems.ts');

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

// Map categories to registered suppliers
const SUPPLIERS_MAP = {
  'supplier-steel': { id: 'supplier-steel', name: { ar: 'شركة الحديد المتحد', en: 'United Steel', fr: 'Acier Uni', zh: '联合钢铁' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-cement': { id: 'supplier-cement', name: { ar: 'مصانع الإسمنت الخليجية', en: 'Gulf Cement', fr: 'Ciment du Golfe', zh: '海湾水泥' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-electrical': { id: 'supplier-electrical', name: { ar: 'المعدات الكهربائية المتقدمة', en: 'Advanced Electrical', fr: 'Équip Élec', zh: '先进电气设备' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-plumbing': { id: 'supplier-plumbing', name: { ar: 'مؤسسة أنابيب الخليج', en: 'Gulf Pipes', fr: 'Tuyaux du Golfe', zh: '海湾管道' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-rental': { id: 'supplier-rental', name: { ar: 'شركة المعدات الثقيلة للتأجير', en: 'Heavy Equipment Rental', fr: 'Location Équip Lourd', zh: '重型设备租赁公司' }, tier: 'standard', priceMultiplier: 1 },
  'sample-2': { id: 'sample-2', name: { ar: 'مؤسسة التوريد الذهبي', en: 'Golden Ingestion', fr: 'Golden Supply', zh: '黄金供应' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-tools': { id: 'supplier-tools', name: { ar: 'مؤسسة العدد والأدوات المتخصصة', en: 'Specialized Tools', fr: 'Outils Spéciaux', zh: '专业工具' }, tier: 'standard', priceMultiplier: 1 }
};

function main() {
  const excelPath = path.join(TRAINED_DIR, 'extracted_all_excel.json');
  if (!fs.existsSync(excelPath)) {
    console.error('Error: extracted_all_excel.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(excelPath, 'utf8');
  const data = JSON.parse(raw);
  
  const extractedItems = [];
  let indexCounter = 1;

  for (const [sourceKey, source] of Object.entries(data.sources)) {
    for (const [sheetName, sheet] of Object.entries(source.sheets)) {
      if (!sheet.allItems) continue;
      
      const sourceShort = sourceKey.replace(/_/g, '').substring(0, 4).toUpperCase();
      const sheetShort = sheetName.replace(/[\s-_]/g, '').substring(0, 4).toUpperCase();

      for (const row of sheet.allItems) {
        const cells = row.cells;
        if (!cells || cells.length < 3) continue;

        let enDesc = '';
        let arDesc = '';
        let unit = '';
        let qty = 0;
        let price = 0;

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

        // Extract descriptions
        let longestAr = '';
        let longestEn = '';
        
        stringCells.forEach(sc => {
          const text = sc.val;
          if (text.length <= 4 && !isArabic(text)) return;
          if (isArabic(text)) {
            if (text.length > longestAr.length) longestAr = text;
          } else {
            if (/[a-zA-Z]/.test(text) && text.length > longestEn.length) longestEn = text;
          }
        });

        enDesc = longestEn;
        arDesc = longestAr;

        // Filter out summary/header rows
        const lowerEn = enDesc.toLowerCase();
        const lowerAr = arDesc.toLowerCase();
        const summaryKeywords = ['total', 'subtotal', 'collection', 'summary', 'scope of work', 'vat', 'tax', 'discount', 'allowance', 'grand total', 'carried to', 'إجمالي', 'مجموع', 'الخلاصة', 'ضريبة'];
        
        const isSummary = summaryKeywords.some(kw => lowerEn.includes(kw) || lowerAr.includes(kw));
        if (isSummary) continue;

        // Extract Unit
        const unitKeywords = ['م²', 'م2', 'sqm', 'م³', 'م3', 'cbm', 'م.ط', 'متر', 'meter', 'm', 'عدد', 'حبة', 'no', "no's", 'no.', 'set', 'item', 'l.s', 'مقطوعية', 'رول', 'roll', 'طقم', 'برميل', 'drum', 'طن', 'ton', 'bag', 'كيس', 'kg', 'كجم', 'pcs', 'piece'];
        
        stringCells.forEach(sc => {
          const text = sc.val.toLowerCase().replace(/[\.\(\)]/g, '').trim();
          if (unitKeywords.includes(text)) {
            unit = sc.val;
          }
        });

        if (!unit) {
          const shortStrings = stringCells.filter(sc => sc.val.length > 0 && sc.val.length <= 4);
          if (shortStrings.length > 0) {
            unit = shortStrings[0].val;
          }
        }

        // Extract Unit Rate/Price
        const positiveNumbers = numberCells.filter(nc => nc.val > 0);
        
        if (positiveNumbers.length > 0) {
          let foundPattern = false;
          for (let i = 0; i < positiveNumbers.length; i++) {
            for (let j = 0; j < positiveNumbers.length; j++) {
              if (i === j) continue;
              for (let k = 0; k < positiveNumbers.length; k++) {
                if (i === k || j === k) continue;
                const qCandidate = positiveNumbers[i].val;
                const rCandidate = positiveNumbers[j].val;
                const tCandidate = positiveNumbers[k].val;
                
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
            const sortedNums = positiveNumbers.sort((a, b) => a.idx - b.idx);
            if (sortedNums.length === 1) {
              price = sortedNums[0].val;
            } else if (sortedNums.length === 2) {
              price = sortedNums[1].val;
            } else if (sortedNums.length >= 3) {
              const n0 = sortedNums[0].val;
              const n1 = sortedNums[1].val;
              const n2 = sortedNums[2].val;
              if (Math.abs(n0 * n1 - n2) < 0.1 * n2) {
                qty = n0;
                price = n1;
              } else {
                price = n1;
              }
            }
          }
        }

        // Validate
        const hasDesc = (enDesc && enDesc.length > 5) || (arDesc && arDesc.length > 5);
        // Exclude extremely high values or zero/negative prices
        const hasValidPrice = price > 0.5 && price < 150000;
        
        if (hasDesc && hasValidPrice) {
          // Categorize based on sheet/div name
          let category = 'architecture';
          const lowerSheet = sheetName.toLowerCase();
          
          if (lowerSheet.includes('elec') || lowerSheet.includes('div-26') || lowerSheet.includes('div-27')) {
            category = 'mep_elec';
          } else if (lowerSheet.includes('plumb') || lowerSheet.includes('drain') || lowerSheet.includes('water') || lowerSheet.includes('div-10') || lowerSheet.includes('div-22')) {
            category = 'mep_plumb';
          } else if (lowerSheet.includes('hvac') || lowerSheet.includes('ac') || lowerSheet.includes('cool') || lowerSheet.includes('div-23')) {
            category = 'mep_hvac';
          } else if (lowerSheet.includes('fire') || lowerSheet.includes('safety') || lowerSheet.includes('div-21') || lowerSheet.includes('div-28')) {
            category = 'safety';
          } else if (lowerSheet.includes('insul') || lowerSheet.includes('waterproof') || lowerSheet.includes('div-7')) {
            category = 'insulation';
          } else if (lowerSheet.includes('block') || lowerSheet.includes('brick') || lowerSheet.includes('masonry') || lowerSheet.includes('div-4') || lowerSheet.includes('structure')) {
            category = 'structure';
          } else if (lowerSheet.includes('site') || lowerSheet.includes('excavation') || lowerSheet.includes('earth') || lowerSheet.includes('div-2')) {
            category = 'site';
          }

          // Supplier Option assignment
          let supplierKey = 'sample-2';
          if (category === 'mep_elec' || category === 'mep_hvac') {
            supplierKey = 'supplier-electrical';
          } else if (category === 'mep_plumb') {
            supplierKey = 'supplier-plumbing';
          } else if (category === 'structure') {
            const descLower = (enDesc + ' ' + arDesc).toLowerCase();
            if (descLower.includes('حديد') || descLower.includes('rebar') || descLower.includes('steel')) {
              supplierKey = 'supplier-steel';
            } else {
              supplierKey = 'supplier-cement';
            }
          } else if (category === 'site') {
            supplierKey = 'supplier-rental';
          } else if (category === 'safety') {
            supplierKey = 'supplier-tools';
          }

          const activeSupplier = SUPPLIERS_MAP[supplierKey] || SUPPLIERS_MAP['sample-2'];

          // Generate proper language names
          const arName = arDesc || enDesc;
          const enName = enDesc || arDesc;

          // Split price realistically (75% material, 25% labor)
          const baseMaterial = Math.round(price * 0.75 * 100) / 100;
          const baseLabor = Math.round(price * 0.25 * 100) / 100;

          extractedItems.push({
            id: `EXT-${sourceShort}-${sheetShort}-${indexCounter.toString().padStart(4, '0')}`,
            category: category,
            type: 'all',
            name: {
              ar: arName,
              en: enName,
              fr: enName,
              zh: enName
            },
            unit: unit || 'مقطوعية',
            qty: qty || 1,
            baseMaterial: baseMaterial,
            baseLabor: baseLabor,
            waste: 0.05,
            suppliers: [activeSupplier],
            sbc: `SBC-EXT-${category.toUpperCase()}`,
            soilFactor: category === 'site' || category === 'structure'
          });

          indexCounter++;
        }
      }
    }
  }

  // Deduplicate items with exact same English or Arabic descriptions
  const uniqueItems = [];
  const seenNames = new Set();
  
  for (const item of extractedItems) {
    const key = item.name.en.toLowerCase().substring(0, 150) + '|' + item.name.ar.substring(0, 150);
    if (!seenNames.has(key)) {
      seenNames.add(key);
      uniqueItems.push(item);
    }
  }

  console.log(`\nExtracted ${extractedItems.length} items. Unique count: ${uniqueItems.length}`);

  // Emit TypeScript file
  let code = `/**\n * Extended Supplier Items Database\n * Auto-generated by import-extended-items.js\n */\n\nimport { BaseItem } from '../types';\n\nexport const EXTENDED_SUPPLIER_ITEMS: BaseItem[] = [\n`;
  
  for (const item of uniqueItems) {
    code += `  {\n`;
    code += `    id: "${item.id}",\n`;
    code += `    category: "${item.category}",\n`;
    code += `    type: "${item.type}",\n`;
    code += `    name: {\n`;
    code += `      ar: ${JSON.stringify(item.name.ar)},\n`;
    code += `      en: ${JSON.stringify(item.name.en)},\n`;
    code += `      fr: ${JSON.stringify(item.name.fr)},\n`;
    code += `      zh: ${JSON.stringify(item.name.zh)}\n`;
    code += `    },\n`;
    code += `    unit: "${item.unit}",\n`;
    code += `    qty: ${item.qty},\n`;
    code += `    baseMaterial: ${item.baseMaterial},\n`;
    code += `    baseLabor: ${item.baseLabor},\n`;
    code += `    waste: ${item.waste},\n`;
    code += `    suppliers: [\n`;
    code += `      { id: "${item.suppliers[0].id}", name: { ar: ${JSON.stringify(item.suppliers[0].name.ar)}, en: ${JSON.stringify(item.suppliers[0].name.en)}, fr: ${JSON.stringify(item.suppliers[0].name.fr)}, zh: ${JSON.stringify(item.suppliers[0].name.zh)} }, tier: "${item.suppliers[0].tier}", priceMultiplier: ${item.suppliers[0].priceMultiplier} }\n`;
    code += `    ],\n`;
    code += `    sbc: "${item.sbc}",\n`;
    code += `    soilFactor: ${item.soilFactor}\n`;
    code += `  },\n`;
  }
  
  code += `];\n`;

  fs.writeFileSync(OUTPUT_FILE, code, 'utf8');
  console.log(`✅ Extended items saved to ${OUTPUT_FILE} (${uniqueItems.length} items)`);
}

main();
