import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PENDING_DIR = path.join(ROOT, 'training_data', 'pending');

function main() {
  const filePath = path.join(PENDING_DIR, 'ingested_projects.json');
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const proj = data.projects['TBC_FM_Pricing_Sheet'];
  if (proj && proj.sheets) {
    for (let i = 1; i <= 5; i++) {
      const sheet = proj.sheets[String(i)];
      if (sheet) {
        console.log(`\nSheet "${i}" | items: ${sheet.items.length}`);
        if (sheet.items.length > 0) {
          console.log(`  Item 0:`, JSON.stringify(sheet.items[0]));
          if (sheet.items.length > 1) {
            console.log(`  Item 1:`, JSON.stringify(sheet.items[1]));
          }
        }
      }
    }
  }
}

main();
