const xlsx = require('xlsx');
const fs = require('fs');

const inputPath = './extracted_boq.json';
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

let totalConcreteM3 = 0;
let originalTotalCost = 0;
let newTotalCost = 0;

const auditedData = [];

// First pass to get total concrete
data.forEach(item => {
  if (item.unit && item.unit.toLowerCase().includes('m3') && (item.desc.toLowerCase().includes('concrete') || item.sheet.includes('Concrete'))) {
    totalConcreteM3 += item.qty;
  }
});

// Second pass to reprice and validate
data.forEach(item => {
  let newRate = item.rate;
  let newQty = item.qty;
  let notes = 'سليم (مطابق للسوق)';
  
  const desc = item.desc.toLowerCase();
  const unit = item.unit ? item.unit.toLowerCase() : '';
  
  // 1. Concrete logic
  if (unit.includes('m3') && (desc.includes('concrete') || item.sheet.includes('Concrete'))) {
    if (item.rate < 200) {
      newRate = 320;
      notes = `⚠️ تعديل السعر: سعر ${item.rate} غير واقعي للخرسانة، تم الرفع للسعر العادل 320 ر.س`;
    } else if (item.rate > 600) {
      newRate = 350;
      notes = `⚠️ تعديل السعر: سعر ${item.rate} مبالغ فيه (ربما يشمل الحديد)، تم التخفيض لـ 350 ر.س (خرسانة صافي)`;
    }
  }
  
  // 2. Masonry logic
  else if (item.sheet.includes('Masonry') && unit === 'm2') {
    if (item.rate < 40 || item.rate > 80) {
      newRate = 55;
      notes = `⚠️ تعديل السعر: متوسط سعر البلك مع المونة هو 55 ر.س/م²`;
    }
  }
  
  // 3. Doors & Windows logic
  else if (item.sheet.includes('Doors') && unit === 'nr') {
    if (item.rate < 300) {
      newRate = 800;
      notes = `⚠️ السعر منخفض جداً، تم تعديله لسعر باب قياسي (800 ر.س)`;
    }
  }
  
  // 4. Finishes (Thermal/Tiles)
  else if (item.sheet.includes('Thermal') || item.sheet.includes('Finishes')) {
    if (unit === 'm2' && item.rate < 15) {
      newRate = 45; // Minimum standard for proper waterproofing / tiles
      notes = `⚠️ سعر توريد وتنفيذ منخفض جداً، تم التصحيح لـ 45 ر.س`;
    }
  }

  const originalAmount = item.amount;
  const newAmount = newQty * newRate;
  
  originalTotalCost += originalAmount;
  newTotalCost += newAmount;

  auditedData.push({
    'القسم': item.sheet,
    'وصف البند': item.desc,
    'الكمية الأصلية': item.qty,
    'الوحدة': item.unit,
    'السعر القديم (ريال)': item.rate,
    'الإجمالي القديم (ريال)': originalAmount,
    'الكمية المصححة': newQty,
    'السعر المعتمد من أربا (ريال)': newRate,
    'الإجمالي الجديد (ريال)': newAmount,
    'ملاحظات الدماغ': notes
  });
});

// Add missing steel
const expectedSteelTons = totalConcreteM3 * 0.12; // 120kg per m3 average for heavy structures
const missingSteel = expectedSteelTons - (3200 / 3200); // the 1 item was 3200 total amount... basically nothing
if (missingSteel > 0) {
  const steelRate = 3200; // SAR per ton
  const steelAmount = missingSteel * steelRate;
  newTotalCost += steelAmount;
  
  auditedData.push({
    'القسم': '5-Metals (إضافة مفقودة)',
    'وصف البند': 'حديد تسليح مقاسات مختلفة (بند مضاف تلقائياً من الدماغ)',
    'الكمية الأصلية': 0,
    'الوحدة': 'Ton',
    'السعر القديم (ريال)': 0,
    'الإجمالي القديم (ريال)': 0,
    'الكمية المصححة': Math.round(missingSteel),
    'السعر المعتمد من أربا (ريال)': steelRate,
    'الإجمالي الجديد (ريال)': Math.round(steelAmount),
    'ملاحظات الدماغ': `🚨 بند مفقود حرج! بناءً على كمية الخرسانة (${Math.round(totalConcreteM3)} م³) يحتاج المشروع إلى ${Math.round(missingSteel)} طن حديد.`
  });
}

// Write to Excel
const outWorkbook = xlsx.utils.book_new();
const outSheet = xlsx.utils.json_to_sheet(auditedData);

// Set column widths
outSheet['!cols'] = [
  { wch: 15 }, // القسم
  { wch: 50 }, // وصف البند
  { wch: 15 }, // الكمية الأصلية
  { wch: 10 }, // الوحدة
  { wch: 18 }, // السعر القديم
  { wch: 20 }, // الإجمالي القديم
  { wch: 15 }, // الكمية المصححة
  { wch: 25 }, // السعر المعتمد
  { wch: 20 }, // الإجمالي الجديد
  { wch: 80 }  // ملاحظات
];

xlsx.utils.book_append_sheet(outWorkbook, outSheet, 'Arba_Audited_BOQ');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Arba_Audited_BOQ.xlsx';
xlsx.writeFile(outWorkbook, outPath);

console.log(`Audited BOQ generated at: ${outPath}`);
console.log(`Original Cost: ${originalTotalCost}`);
console.log(`New Cost: ${newTotalCost}`);

fs.writeFileSync('audit_summary.json', JSON.stringify({
  originalCost: originalTotalCost,
  newCost: newTotalCost,
  totalConcreteM3,
  expectedSteelTons,
  itemsAudited: auditedData.length
}, null, 2));
