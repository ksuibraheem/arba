const xlsx = require('xlsx');

const inputPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\item priced للتسعير.xlsx';
const workbook = xlsx.readFile(inputPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const unknownItems = [];

for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (!Array.isArray(row) || row.length < 2) continue;
  
  const unit = String(row[0] || '').trim();
  const desc = String(row[1] || '').trim().toLowerCase();
  
  if (!unit || unit === 'الوحدة' || desc.length < 5) continue;
  if (unit.includes('سعر') || unit.includes('معدل')) continue;

  // Check if it's already covered by my previous logic
  const isCovered = 
    (desc.includes('حفر') && !desc.includes('ردم')) ||
    desc.includes('ردم') ||
    desc.includes('نمل أبيض') ||
    desc.includes('خرسانة عادية') ||
    desc.includes('فرشات نظافة') ||
    desc.includes('خرسانة مسلحة') ||
    desc.includes('جدران خرسانة') ||
    desc.includes('رقاب');

  if (!isCovered) {
    unknownItems.push({ unit, desc, row: i });
  }
}

console.log(JSON.stringify(unknownItems, null, 2));
