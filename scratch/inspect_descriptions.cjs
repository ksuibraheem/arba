const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const hbPricedPath = path.join(__dirname, '..', 'pricing_files', 'hafr_albatin_raw_ARBA_PRICED.xlsx');
const ryPricedPath = path.join(__dirname, '..', 'pricing_files', 'riyadh_raw_ARBA_PRICED.xlsx');

function inspectProjectWords(filePath, name) {
    if (!fs.existsSync(filePath)) return;
    const wb = xlsx.readFile(filePath);
    const sheet = wb.Sheets['جدول الكميات المسعر'];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`\n--- Keywords in ${name} ---`);
    
    const matched = [];
    rows.forEach(r => {
        const desc = String(r['وصف البند'] || '');
        const keywords = ['حفر', 'ردم', 'سقالة', 'خرسانة', 'حديد', 'سعر', 'أنابيب', 'كابل', 'بلوك', 'لياسة', 'دهان', 'أبواب', 'شباك'];
        keywords.forEach(kw => {
            if (desc.includes(kw)) {
                matched.push({ kw, desc: desc.substring(0, 80), rate: r['سعر التكلفة'], source: r['مصدر السعر'] });
            }
        });
    });

    console.log(`Total rows with structural/architectural keywords: ${matched.length}`);
    const counts = {};
    matched.forEach(m => {
        counts[m.kw] = (counts[m.kw] || 0) + 1;
    });
    console.log('Keyword distribution:', counts);
    if (matched.length > 0) {
        console.log('Sample matches:');
        console.table(matched.slice(0, 15));
    }
}

inspectProjectWords(hbPricedPath, 'Hafr Al-Batin');
inspectProjectWords(ryPricedPath, 'Riyadh');
