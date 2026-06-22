import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');

console.log('═══════════════════════════════════════════');
console.log('📊 ARBA Training Data & Catalogs Volume Survey');
console.log('═══════════════════════════════════════════\n');

const files = fs.readdirSync(TRAINED_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(TRAINED_DIR, file);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    let count = 0;
    
    if (Array.isArray(data)) {
      count = data.length;
    } else if (data.items && Array.isArray(data.items)) {
      count = data.items.length;
    } else if (data.totalItems) {
      count = data.totalItems;
    } else if (typeof data === 'object') {
      // Check if it has sources
      if (data.sources) {
        for (const src of Object.values(data.sources)) {
          if (src.items) count += src.items.length;
          else if (src.itemCount) count += src.itemCount;
        }
      } else {
        count = Object.keys(data).length;
      }
    }
    
    console.log(`  📄 ${file.padEnd(40)} | Items Count: ${count.toString().padStart(8)} | Size: ${(fs.statSync(filePath).size / 1024).toFixed(1).padStart(6)} KB`);
  } catch (err) {
    console.log(`  ❌ Error reading ${file}: ${err.message}`);
  }
}
console.log('\n═'.repeat(55));
