/**
 * 🧠 ARBA — تصدير عرض سعر Excel لمشروع طريف
 */
const XLSX = require('xlsx');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/tarif_v2.json','utf8').replace(/^\uFEFF/,''));

// === إنشاء Excel ===
const wb = XLSX.utils.book_new();

// Sheet 1: عرض السعر الكامل
const rows = [
  ['عرض سعر — مشروع إنشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية'],
  ['الموقع: طريف - الحدود الشمالية | هامش الربح: 15% | معامل الموقع: ×1.15'],
  [],
  ['م', 'التصنيف', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة (ر.س)', 'الإجمالي (ر.س)', 'ملاحظات']
];

data.items.forEach(it => {
  rows.push([it.no, it.cat, it.note, it.unit, it.qty, it.finalRate, it.total, it.key]);
});

rows.push([]);
rows.push(['', '', '', '', '', 'الإجمالي قبل الضريبة', data.grandTotal, '']);
rows.push(['', '', '', '', '', 'ضريبة القيمة المضافة 15%', data.vat, '']);
rows.push(['', '', '', '', '', 'الإجمالي مع الضريبة', data.withVat, '']);

const ws1 = XLSX.utils.aoa_to_sheet(rows);
ws1['!cols'] = [{wch:5},{wch:18},{wch:40},{wch:10},{wch:8},{wch:18},{wch:15},{wch:20}];
XLSX.utils.book_append_sheet(wb, ws1, 'عرض السعر');

// Sheet 2: ملخص التصنيفات
const catRows = [
  ['ملخص التصنيفات'],
  [],
  ['التصنيف', 'عدد البنود', 'الإجمالي (ر.س)', 'النسبة']
];
data.categories.forEach(c => catRows.push([c.category, c.count, c.total, c.pct]));
catRows.push([]);
catRows.push(['الإجمالي', data.totalItems, data.grandTotal, '100%']);

const ws2 = XLSX.utils.aoa_to_sheet(catRows);
ws2['!cols'] = [{wch:20},{wch:12},{wch:15},{wch:10}];
XLSX.utils.book_append_sheet(wb, ws2, 'ملخص التصنيفات');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\عرض_سعر_طريف_ARBA.xlsx';
XLSX.writeFile(wb, outPath);
console.log('✅ Excel saved:', outPath);
console.log('Items:', data.totalItems);
console.log('Total:', data.grandTotal.toLocaleString(), 'SAR');
console.log('With VAT:', data.withVat.toLocaleString(), 'SAR');
