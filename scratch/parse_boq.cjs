const XLSX = require('xlsx');
const path = require('path');

const projectDir = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة\\تسعير مستودع بالرياض';
const xlsxPath = path.join(projectDir, 'مسودة مشروع مستودع الرياض.xlsx');
const workbook = XLSX.readFile(xlsxPath);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Parse all items into structured JSON
const sections = [];
let currentSection = null;
let items = [];

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) continue;
    
    // Check if it's a section header
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    
    // Section headers: rows where first cell has text but no number, and it's NOT the column header row
    if (firstCell && isNaN(Number(firstCell)) && firstCell !== 'الرقم التسلسلي') {
        // Check if this is a section divider
        if (!firstCell.startsWith('انشاء') && !firstCell.startsWith('الغرض') && 
            !firstCell.startsWith('الرقم المرجعي') && !firstCell.startsWith('ملف') && 
            !firstCell.startsWith('آخر') && !firstCell.startsWith('مكان')) {
            if (currentSection && items.length > 0) {
                sections.push({ section: currentSection, items: [...items] });
            }
            currentSection = firstCell;
            items = [];
            continue;
        }
        continue;
    }
    
    // Column header row
    if (firstCell === 'الرقم التسلسلي') continue;
    
    // Data row
    const num = Number(row[0]);
    if (!isNaN(num) && num > 0) {
        items.push({
            no: num,
            unit: row[3] || '',
            qty: Number(row[4]) || 0,
            description: String(row[5] || '').trim(),
            mandatory: row[7] || '',
            unitPrice: Number(row[8]) || 0,
            totalPrice: Number(row[9]) || 0,
        });
    }
}

// Push last section
if (currentSection && items.length > 0) {
    sections.push({ section: currentSection, items: [...items] });
}

// Output as JSON
console.log(JSON.stringify(sections, null, 2));
