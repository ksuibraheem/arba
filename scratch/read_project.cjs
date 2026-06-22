const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const projectDir = 'C:\\Users\\ksuib\\Desktop\\ملفات جديدة\\تسعير مستودع بالرياض';

// 1. Read Excel file
console.log('========== EXCEL FILE ==========');
try {
    const xlsxPath = path.join(projectDir, 'مسودة مشروع مستودع الرياض.xlsx');
    const workbook = XLSX.readFile(xlsxPath);
    
    for (const sheetName of workbook.SheetNames) {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row.some(cell => cell !== '' && cell !== null && cell !== undefined)) {
                console.log(`Row ${i}: ${JSON.stringify(row)}`);
            }
        }
    }
} catch (err) {
    console.error('Excel error:', err.message);
}

console.log('\n\n========== END EXCEL ==========');
