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
  console.log(`Ingested projects version: ${data.version}`);
  if (data.projects) {
    for (const [projKey, proj] of Object.entries(data.projects)) {
      console.log(`\nProject: ${projKey}`);
      if (proj.sheets) {
        console.log(`  Sheets:`, Object.keys(proj.sheets));
        // print a sample item from one of the sheets
        for (const [sheetName, sheet] of Object.entries(proj.sheets)) {
          if (sheet.items && sheet.items.length > 0) {
            console.log(`    Sheet "${sheetName}" | items count: ${sheet.items.length}`);
            console.log(`      Sample item 0:`, JSON.stringify(sheet.items[0]));
            if (sheet.items.length > 1) {
              console.log(`      Sample item 1:`, JSON.stringify(sheet.items[1]));
            }
            break;
          }
        }
      }
    }
  }
}

main();
