const xlsx = require('xlsx');

const inputPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\item priced للتسعير.xlsx';
const outputPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Arba_Detailed_Priced_Items.xlsx';

const workbook = xlsx.readFile(inputPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const auditedData = [];

// Base current market rates (Q1 2026, Saudi Arabia)
// Rates are Supply + Install unless specified
const MARKET_RATES = {
  excavation: 20, // SR/m3
  backfill: 30, // SR/m3
  antiTermite: 5, // SR/m2
  plainConcrete: 350, // SR/m3 (Blinding)
  rc_sog: 950, // SR/m3 (Slab on grade with rebar & formwork)
  rc_footings: 1050, // SR/m3 (Isolated footings with rebar & formwork)
  rc_raft: 1000, // SR/m3 (Raft foundation with rebar)
  rc_walls: 1300, // SR/m3 (Retaining walls with rebar & complex formwork)
  rc_columns: 1400, // SR/m3 (Columns)
  rc_slabs: 1200, // SR/m3 (Suspended slabs)
  masonry_200: 55, // SR/m2 (Blockwork 20cm)
  plastering: 25, // SR/m2
  painting: 35, // SR/m2
  tiles_ceramic: 85, // SR/m2
  tiles_porcelain: 120, // SR/m2
  supply_only_rebar: 2900, // SR/ton
  supply_only_concrete: 250 // SR/m3
};

for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  if (!Array.isArray(row) || row.length < 2) continue;
  
  const unit = String(row[0] || '').trim();
  const desc = String(row[1] || '').trim();
  
  // Skip headers or empty rows
  if (!unit || unit === 'الوحدة' || desc.length < 5) continue;
  if (unit.includes('سعر') || unit.includes('معدل')) continue;
  
  // Find the rate. In the sample, index 8 seemed to be the base rate.
  // Sometimes it's at index 5, 6, 7, 8. Let's find the first valid number after description that isn't the item ID.
  let originalRate = row[8] !== undefined ? parseFloat(row[8]) : 0;
  if (isNaN(originalRate) || originalRate === 0) {
    // try to find a number in columns 5 to 10
    for(let c = 5; c <= 10; c++) {
      if (typeof row[c] === 'number') {
        originalRate = row[c];
        break;
      }
    }
  }

  // Determine Type: Supply & Install vs Supply Only
  let itemType = 'توريد وتنفيذ';
  if (desc.includes('توريد فقط') || desc.includes('دون تركيب') || desc.includes('بدون مصنعية')) {
    itemType = 'توريد فقط';
  } else if (desc.includes('مصنعية فقط') || desc.includes('تركيب فقط') || desc.includes('بدون مواد')) {
    itemType = 'تنفيذ فقط (مصنعية)';
  } else if (desc.includes('توريد وتركيب') || desc.includes('توريد وتنفيذ') || desc.includes('بما في ذلك') || desc.includes('مصبوبة في الموقع')) {
    itemType = 'توريد وتنفيذ';
  }

  // Brain Cognitive Pricing Logic
  let arbaRate = originalRate;
  let status = 'يحتاج تسعير يدوي';
  let notes = '';

  const d = desc.toLowerCase();
  
  if (d.includes('حفر') && !d.includes('ردم')) {
    arbaRate = itemType === 'تنفيذ فقط (مصنعية)' ? 12 : MARKET_RATES.excavation;
  } else if (d.includes('ردم')) {
    arbaRate = itemType === 'توريد فقط' ? 15 : MARKET_RATES.backfill;
  } else if (d.includes('نمل أبيض')) {
    arbaRate = MARKET_RATES.antiTermite;
  } else if (d.includes('خرسانة عادية') || d.includes('فرشات نظافة')) {
    arbaRate = itemType === 'توريد فقط' ? MARKET_RATES.supply_only_concrete : MARKET_RATES.plainConcrete;
  } else if (d.includes('خرسانة مسلحة')) {
    // Check if it includes rebar
    const hasRebar = d.includes('حديد التسليح') || d.includes('تسليح');
    
    if (itemType === 'توريد فقط') {
      arbaRate = MARKET_RATES.supply_only_concrete;
      notes = 'تسعير كخرسانة موردة فقط بدون حديد أو صب';
    } else if (!hasRebar) {
      arbaRate = 450; // Concrete + Pump + Labor, NO Rebar
      notes = 'خرسانة مسلحة مصبوبة ولكن الوصف لا يشمل الحديد. تم تسعيرها بدون حديد.';
    } else {
      // It has rebar and formwork
      if (d.includes('بلاطة أرضية') || d.includes('sog')) arbaRate = MARKET_RATES.rc_sog;
      else if (d.includes('قواعد')) arbaRate = MARKET_RATES.rc_footings;
      else if (d.includes('أساسات الحصيرة') || d.includes('لبشة')) arbaRate = MARKET_RATES.rc_raft;
      else if (d.includes('حوائط') || d.includes('جدران')) arbaRate = MARKET_RATES.rc_walls;
      else if (d.includes('أعمدة') || d.includes('رقاب')) arbaRate = MARKET_RATES.rc_columns;
      else if (d.includes('كمرات') || d.includes('بلاطات')) arbaRate = MARKET_RATES.rc_slabs;
      else arbaRate = 1100; // Default RC
      notes = 'بند متكامل (خرسانة + حديد + شدة خشبية + صب). السعر يشمل الجميع.';
    }
  }

  // Compare and set status
  if (arbaRate > 0) {
    const diff = originalRate - arbaRate;
    const diffPercent = Math.abs(diff / arbaRate);
    
    if (originalRate === 0) {
       status = 'غير مسعر في الأصل';
       if (!notes) notes = 'تم وضع السعر العادل من أربا';
    } else if (diffPercent <= 0.15) {
      status = 'سعر عادل وممتاز ✅';
      if (!notes) notes = 'السعر مطابق لمتوسط السوق الحالي.';
    } else if (diff < 0) {
      status = 'سعر منخفض جداً (مخاطرة) ⚠️';
      if (!notes) notes = `السعر المعروض (${originalRate}) أقل بكثير من التكلفة الفعلية (${arbaRate}). احذر من الجودة أو الكميات المخفية.`;
    } else {
      status = 'سعر مبالغ فيه 📈';
      if (!notes) notes = `السعر المعروض (${originalRate}) أعلى بكثير من السعر العادل (${arbaRate}). يجب التفاوض.`;
    }
  }

  auditedData.push({
    'الوحدة': unit,
    'وصف البند': desc,
    'نوع البند (توريد / تنفيذ)': itemType,
    'السعر القديم في الملف (ريال)': originalRate || 'غير متوفر',
    'السعر المعتمد من أربا (ريال)': arbaRate,
    'حالة السعر': status,
    'ملاحظات الدماغ الذكي': notes
  });
}

const outWorkbook = xlsx.utils.book_new();
const outSheet = xlsx.utils.json_to_sheet(auditedData);

outSheet['!cols'] = [
  { wch: 8 },  // الوحدة
  { wch: 80 }, // وصف البند
  { wch: 25 }, // نوع البند
  { wch: 25 }, // السعر القديم
  { wch: 25 }, // السعر المعتمد
  { wch: 30 }, // حالة السعر
  { wch: 80 }  // ملاحظات الدماغ
];

xlsx.utils.book_append_sheet(outWorkbook, outSheet, 'Arba_Smart_Priced');

xlsx.writeFile(outWorkbook, outputPath);
console.log(`Successfully processed ${auditedData.length} items.`);
console.log(`Saved to ${outputPath}`);
