import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';

const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

console.log('Total Sheets:', wb.SheetNames.length);
console.log('Sheets:', wb.SheetNames);
