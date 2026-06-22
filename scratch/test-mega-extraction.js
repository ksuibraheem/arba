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

function main() {
  const megaPath = path.join(TRAINED_DIR, 'brain_mega_training.json');
  if (!fs.existsSync(megaPath)) {
    console.log('Error: brain_mega_training.json not found');
    return;
  }

  const raw = fs.readFileSync(megaPath, 'utf8');
  const data = JSON.parse(raw);
  
  let totalRawItems = 0;
  let validItems = 0;
  const uniqueItems = new Map();

  if (data.sources) {
    for (const [sourceKey, source] of Object.entries(data.sources)) {
      if (!source.items || !Array.isArray(source.items)) continue;
      
      for (const item of source.items) {
        totalRawItems++;
        
        // 1. Get description
        const desc = cleanText(item.desc || item.description || item.spec || '');
        if (desc.length < 5) continue;

        // 2. Get price
        const price = parseFloat(item.unitPrice || item.boqPrice || item.avgPrice || item.rate || 0);
        if (price <= 0 || price > 250000) continue;

        // Filter out summary/header rows
        const lowerDesc = desc.toLowerCase();
        const summaryKeywords = ['total', 'subtotal', 'collection', 'summary', 'scope of work', 'vat', 'tax', 'discount', 'allowance', 'grand total', 'carried to', 'إجمالي', 'مجموع', 'الخلاصة', 'ضريبة'];
        const isSummary = summaryKeywords.some(kw => lowerDesc.includes(kw));
        if (isSummary) continue;

        const unit = item.unit || 'L.S';

        // Save
        validItems++;
        
        // Use normalized description as key to deduplicate
        const key = desc.toLowerCase().substring(0, 150);
        if (!uniqueItems.has(key)) {
          uniqueItems.set(key, {
            source: sourceKey,
            desc,
            unit,
            price
          });
        }
      }
    }
  }

  console.log(`Total raw items in mega training: ${totalRawItems}`);
  console.log(`Valid non-summary items with positive prices: ${validItems}`);
  console.log(`Unique items after deduplication: ${uniqueItems.size}`);

  // Show a few samples
  const samples = Array.from(uniqueItems.values()).slice(0, 5);
  console.log('\nSamples:', JSON.stringify(samples, null, 2));
}

main();
