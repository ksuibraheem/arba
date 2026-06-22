import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');

function main() {
  const megaPath = path.join(TRAINED_DIR, 'brain_mega_training.json');
  if (!fs.existsSync(megaPath)) return;

  const data = JSON.parse(fs.readFileSync(megaPath, 'utf8'));
  
  if (data.sources) {
    const keys = ['TBC_FM_Pricing_Sheet', 'Tender_Real_Root', 'tbc_fm_1226_feed', 'v11_price_history'];
    for (const key of keys) {
      const src = data.sources[key];
      if (src) {
        console.log(`\nSource: ${key} | itemCount: ${src.itemCount}`);
        if (src.items && src.items.length > 0) {
          console.log(`  Item 0:`, JSON.stringify(src.items[0]));
          if (src.items.length > 1) {
            console.log(`  Item 1:`, JSON.stringify(src.items[1]));
          }
        }
      } else {
        console.log(`\nSource: ${key} not found`);
      }
    }
  }
}

main();
