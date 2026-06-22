import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'training_data', 'pending', 'raw_extracts');

function main() {
  const filePath = path.join(RAW_DIR, 'extracted_raw_full_pdf.txt');
  if (!fs.existsSync(filePath)) {
    console.log('File not found');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`File Size: ${(content.length / 1024).toFixed(1)} KB`);
  console.log(`First 1500 chars:\n`);
  console.log(content.substring(0, 1500));
}

main();
