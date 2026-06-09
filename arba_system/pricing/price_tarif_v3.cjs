/**
 * 🧠 ARBA Brain V3 — تسعير مشروع طريف (مصحح ومراجع)
 */
const XLSX = require('xlsx');
const fs = require('fs');
const LOC = 1.15; // طريف
const PROFIT = 0.15;

const BOQ_PATH = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\جدول الكميات - قبل التسعير.xlsx';

// === أسعار مصححة ومراجعة بعناية ===
const prices = {
  1: { rate: 22, cat: 'أعمال ترابية', note: 'حفريات عامة' },
  2: { rate: 30, cat: 'أعمال ترابية', note: 'ردم وتسوية بمواد مختارة' },
  3: { rate: 250, cat: 'أعمال خرسانية', note: 'خرسانة نظافة عادية' },
  4: { rate: 750, cat: 'أعمال خرسانية', note: 'خرسانة مسلحة أساسات (أسمنت مقاوم V)' },
  5: { rate: 950, cat: 'أعمال خرسانية', note: 'خرسانة مسلحة عناصر إنشائية (أسمنت عادي I)' },
  6: { rate: 950, cat: 'أعمال خرسانية', note: 'خرسانة مسلحة عناصر إنشائية (أسمنت عادي I)' },
  7: { rate: 75, cat: 'أعمال بناء', note: 'بلوك أسمنتي معزول 20سم خارجي' },
  8: { rate: 55, cat: 'أعمال بناء', note: 'بلوك أسمنتي داخلي 15سم' },
  9: { rate: 35, cat: 'لياسة', note: 'لياسة أسمنتية داخلية وخارجية' },
  10: { rate: 28, cat: 'دهانات', note: 'دهانات داخلية (3 أوجه)' },
  11: { rate: 110, cat: 'أرضيات وتكسيات', note: 'بلاط أرضيات بورسلين' },
  12: { rate: 18, cat: 'عزل مائي', note: 'طلاء بتوميني للأساسات (طبقتين)' },
  13: { rate: 250, cat: 'أعمال خرسانية', note: 'خرسانة عادية تحت البلاط' },
  14: { rate: 110, cat: 'أرضيات وتكسيات', note: 'بورسلين أرضيات 9مم مطفي مقاوم انزلاق' },
  15: { rate: 75, cat: 'أعمال خارجية', note: 'أسفلت مواقف' },
  16: { rate: 85, cat: 'أرضيات وتكسيات', note: 'بلاط كيشاني جدران دورات مياه' },
  17: { rate: 250, cat: 'أرضيات وتكسيات', note: 'رخام أرضيات خارجية ودرج 25مم' },
  18: { rate: 70, cat: 'أعمال خارجية', note: 'بردورات خرسانية 15×50×30' },
  19: { rate: 75, cat: 'أعمال خارجية', note: 'بلاط أسمنتي ملون 40×40 أرصفة' },
  20: { rate: 2800, cat: 'أبواب', note: 'باب ألمنيوم ضلفتين D1 120×300' },
  21: { rate: 3500, cat: 'أبواب', note: 'باب خشب سنديان ضلفتين 1000×2200' },
  22: { rate: 1800, cat: 'أبواب', note: 'باب خشب سنديان ضلفة 1000×2200' },
  23: { rate: 1200, cat: 'أبواب', note: 'باب ألمنيوم مطابخ/دورات D4 1000×2100' },
  24: { rate: 2000, cat: 'أبواب', note: 'باب حديد مجلفن 1100×2200' },
  25: { rate: 2800, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W1 (2.4×2)م' },
  26: { rate: 5500, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W2 (4.8×2)م' },
  27: { rate: 4200, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W3 (3.6×2)م' },
  28: { rate: 700, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W4 (1×1.2)م' },
  29: { rate: 350, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W5 (0.6×1)م' },
  30: { rate: 1100, cat: 'نوافذ وألمنيوم', note: 'شباك ألمنيوم W6 (1×2)م' },
  31: { rate: 85, cat: 'أسقف مستعارة', note: 'جبس بورد مقاوم حريق ورطوبة' },
  32: { rate: 65, cat: 'أسقف مستعارة', note: 'أسقف أرمسترونج ألمنيوم 60×60' },
  33: { rate: 75, cat: 'أسقف مستعارة', note: 'أسقف أرمسترونج ألمنيوم 30×30' },
  34: { rate: 95, cat: 'عزل مائي وحراري', note: 'عزل أسطح مائي وحراري كامل' },
  // === تكييف VRF ===
  35: { rate: 35000, cat: 'تكييف', note: 'وحدة VRF خارجية كاملة مع مواسير نحاس' },
  // === كهرباء — مفاتيح ومقابس ===
  36: { rate: 25, cat: 'أعمال كهربائية', note: 'مفتاح إنارة 1P 10A' },
  37: { rate: 35, cat: 'أعمال كهربائية', note: 'مفتاح إنارة 2P 10A' },
  38: { rate: 45, cat: 'أعمال كهربائية', note: 'مفتاح إنارة 3P 10A' },
  39: { rate: 25, cat: 'أعمال كهربائية', note: 'مقبس كهربائي 13A' },
  40: { rate: 35, cat: 'أعمال كهربائية', note: 'مقبس كهربائي مزدوج 13A' },
  41: { rate: 45, cat: 'أعمال كهربائية', note: 'مقبس 3 فاز 32A' },
  42: { rate: 85, cat: 'أعمال كهربائية', note: 'مقبس أرضي Floor Box' },
  43: { rate: 250, cat: 'تيار خفيف', note: 'نقطة بيانات Data Outlet' },
  // === سباكة — أدوات صحية ===
  44: { rate: 950, cat: 'أعمال سباكة', note: 'طقم مرحاض غربي كامل' },
  45: { rate: 650, cat: 'أعمال سباكة', note: 'مغسلة مع خلاط' },
  46: { rate: 450, cat: 'أعمال سباكة', note: 'خلاط مياه' },
  47: { rate: 85, cat: 'أعمال سباكة', note: 'كرسي صرف أرضي' },
  48: { rate: 22, cat: 'أعمال سباكة', note: 'مواسير PPR ساخن' },
  49: { rate: 30, cat: 'أعمال سباكة', note: 'مواسير PPR بارد' },
  50: { rate: 45, cat: 'أعمال سباكة', note: 'شبكة مواسير CPVC داخلية' },
  51: { rate: 1800, cat: 'أعمال سباكة', note: 'محبس تخفيض ضغط' },
  52: { rate: 6500, cat: 'أعمال سباكة', note: 'سخان مياه كهربائي 300 لتر' },
  53: { rate: 4500, cat: 'أعمال سباكة', note: 'خزان مياه فايبر جلاس 5000 لتر' },
  54: { rate: 12000, cat: 'أعمال سباكة', note: 'مضخة تعزيز 3 حصان + خزان ضغط 750 لتر' },
  55: { rate: 65, cat: 'أعمال سباكة', note: 'مواسير صرف UPVC داخلية' },
  56: { rate: 85, cat: 'أعمال سباكة', note: 'مواسير صرف UPVC خارجية' },
  57: { rate: 120, cat: 'أعمال سباكة', note: 'مواسير صرف رئيسية خارجية' },
  58: { rate: 3500, cat: 'أعمال سباكة', note: 'غرفة تفتيش صرف صحي' },
  59: { rate: 3500, cat: 'أعمال سباكة', note: 'غرفة تفتيش خارجية' },
  60: { rate: 350, cat: 'أعمال سباكة', note: 'جالي تراب 30×30 مع توصيل صرف' },  // ✅ مصحح
  61: { rate: 3500, cat: 'أعمال سباكة', note: 'حاجز دهون' },
  62: { rate: 12000, cat: 'أعمال سباكة', note: 'خزان أرضي' },
  // === إنارة ===
  63: { rate: 220, cat: 'أعمال كهربائية', note: 'إنارة LED 60×60 مكاتب' },
  64: { rate: 180, cat: 'أعمال كهربائية', note: 'إنارة LED ممرات' },
  65: { rate: 350, cat: 'أعمال كهربائية', note: 'إنارة طوارئ EXIT' },
  66: { rate: 280, cat: 'أعمال كهربائية', note: 'إنارة LED خارجية' },
  67: { rate: 180, cat: 'أعمال كهربائية', note: 'إنارة LED دورات مياه مقاومة رطوبة' },
  68: { rate: 250, cat: 'أعمال كهربائية', note: 'إنارة درج' },
  69: { rate: 450, cat: 'أعمال كهربائية', note: 'كشاف إنارة خارجي Projector' },
  70: { rate: 220, cat: 'أعمال كهربائية', note: 'إنارة مطبخ' },
  71: { rate: 1800, cat: 'أعمال كهربائية', note: 'عمود إنارة خارجي 6م' },
  // === مقابس ونقاط ===
  72: { rate: 25, cat: 'أعمال كهربائية', note: 'مقابس كهربائية 13A متنوعة' },  // ✅ مفاتيح ومقابس بسيطة
  73: { rate: 250, cat: 'تيار خفيف', note: 'نقطة هاتف' },
  74: { rate: 250, cat: 'تيار خفيف', note: 'نقطة بيانات Data' },
  75: { rate: 350, cat: 'تيار خفيف', note: 'نقطة اتصال داخلي Intercom' },
  76: { rate: 25, cat: 'أعمال كهربائية', note: 'مفتاح Switch 2P 1Way 13A' },  // ✅ مصحح — مفتاح وليس كاميرا!
  77: { rate: 280, cat: 'تيار خفيف', note: 'سماعة صوتية PA Speaker' },
  // === تكييف — معزل ===
  78: { rate: 180, cat: 'أعمال كهربائية', note: 'AC Isolator 3P 40A (قاطع عازل تكييف)' },  // ✅ مصحح
  // === أنظمة حريق ===
  79: { rate: 35000, cat: 'أنظمة الحريق', note: 'لوحة إنذار حريق رئيسية مع برمجة' },
  80: { rate: 250, cat: 'أنظمة الحريق', note: 'كاشفات/أجهزة إنذار حريق' },
  81: { rate: 2200, cat: 'أنظمة الحريق', note: 'صناديق حريق كاملة' },
  82: { rate: 280, cat: 'أنظمة الحريق', note: 'طفاية حريق 6 كج' },
  83: { rate: 2500, cat: 'أنظمة الحريق', note: 'نظام رشاش حريق' },
  // === تيار خفيف — الأجهزة المصححة ===
  84: { rate: 2500, cat: 'تيار خفيف', note: 'لوحة تجميع ألياف بصرية ODF' },  // ✅ مصحح
  85: { rate: 1500, cat: 'تيار خفيف', note: 'لوحة تجميع UTP Patch Panel' },  // ✅ مصحح
  86: { rate: 35000, cat: 'تيار خفيف', note: 'Cisco Catalyst 3850 Switch' },  // ✅ مصحح
  87: { rate: 3000, cat: 'تيار خفيف', note: 'نظام تحكم دخول Access Control' },
  88: { rate: 650, cat: 'أعمال كهربائية', note: 'حوامل ومواسير كابلات' },
  89: { rate: 120, cat: 'أعمال كهربائية', note: 'كابل XLPE 4×10+6 نحاس مدرع' },
  90: { rate: 35, cat: 'أعمال كهربائية', note: 'أسلاك كهربائية' },
  // === أبواب إضافية ===
  91: { rate: 1800, cat: 'أبواب', note: 'باب خشب ضلفة D5' },
  92: { rate: 3000, cat: 'أبواب', note: 'باب خشب ضلفتين D3' },
  // === تيار خفيف ===
  93: { rate: 3500, cat: 'تيار خفيف', note: 'شاشة LED 40 بوصة لكاميرات' },  // ✅ مصحح
  94: { rate: 3500, cat: 'تيار خفيف', note: 'كابينة راك U16' },  // ✅ مصحح
  95: { rate: 8500, cat: 'تيار خفيف', note: 'جهاز DVR 35 قناة 4TB' },
  // === لوحات توزيع كهربائية ===
  96: { rate: 25000, cat: 'أعمال كهربائية', note: 'لوحة توزيع رئيسية MDB' },
  97: { rate: 22000, cat: 'أعمال كهربائية', note: 'لوحة توزيع طوارئ EMDB' },
  98: { rate: 18000, cat: 'أعمال كهربائية', note: 'لوحة توزيع تكييف ACLP' },
  99: { rate: 12000, cat: 'أعمال كهربائية', note: 'لوحة توزيع إنارة LP' },
  100: { rate: 10000, cat: 'أعمال كهربائية', note: 'لوحة طوارئ إنارة ELP' },
  101: { rate: 10000, cat: 'أعمال كهربائية', note: 'لوحة مقابس PP' },
  102: { rate: 8000, cat: 'أعمال كهربائية', note: 'لوحة مقابس طوارئ EPP' },
  103: { rate: 6500, cat: 'أعمال كهربائية', note: 'لوحة فرعية ELP1 50A 24خط' },
  104: { rate: 6500, cat: 'أعمال كهربائية', note: 'لوحة فرعية ELP2 50A 24خط' },
  // === كوابل ===
  105: { rate: 120, cat: 'أعمال كهربائية', note: 'كابل XLPE 4×10+6 نحاس مدرع' },
  106: { rate: 180, cat: 'أعمال كهربائية', note: 'كابل XLPE 4×16+10 نحاس مدرع' },
  107: { rate: 650, cat: 'أعمال كهربائية', note: 'كابل XLPE 4×185+90 نحاس مدرع' },
  108: { rate: 380, cat: 'أعمال كهربائية', note: 'كابل XLPE 4×120+70 نحاس مدرع' },
  // === تأريض وصواعق ===
  109: { rate: 35000, cat: 'تأريض وصواعق', note: 'نظام مانعة صواعق كامل' },
  110: { rate: 18000, cat: 'تأريض وصواعق', note: 'نظام تأريض داخل الخرسانة كامل' },
  111: { rate: 2500, cat: 'تأريض وصواعق', note: 'حفرة تأريض Earthpit' },
};

// === قراءة ومعالجة ===
const wb = XLSX.readFile(BOQ_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

const items = [];
for(let i = 4; i < raw.length; i++) {
  const row = raw[i];
  const num = parseInt(row[0]);
  if(isNaN(num)) continue;
  const unit = String(row[2] || '').trim();
  const qty = parseFloat(row[3]) || 0;
  const desc = String(row[4] || '').trim();
  if(!desc || qty === 0) continue;

  const p = prices[num] || { rate: 300, cat: 'أخرى', note: 'تقدير' };
  const locRate = Math.round(p.rate * LOC);
  const finalRate = Math.round(locRate * (1 + PROFIT));
  const total = Math.round(finalRate * qty);
  items.push({ no: num, unit, qty, cat: p.cat, note: p.note, baseRate: p.rate, finalRate, total });
}

const grandTotal = items.reduce((s,i) => s + i.total, 0);
const vat = Math.round(grandTotal * 0.15);

// === تجميع ===
const byCat = {};
items.forEach(it => {
  if(!byCat[it.cat]) byCat[it.cat] = { items:[], total:0 };
  byCat[it.cat].items.push(it); byCat[it.cat].total += it.total;
});

console.log('=== ملخص عرض السعر المصحح ===');
console.log('البنود:', items.length);
console.log('الإجمالي:', grandTotal.toLocaleString('en'), 'ر.س');
console.log('VAT 15%:', vat.toLocaleString('en'), 'ر.س');
console.log('مع الضريبة:', (grandTotal+vat).toLocaleString('en'), 'ر.س');
console.log('\n=== التصنيفات ===');
Object.entries(byCat).sort((a,b) => b[1].total - a[1].total).forEach(([cat, d]) => {
  console.log(cat.padEnd(20) + ' | ' + String(d.items.length).padStart(3) + ' بند | ' + 
    String(d.total.toLocaleString('en')).padStart(12) + ' | ' + 
    ((d.total/grandTotal)*100).toFixed(1) + '%');
});

console.log('\n=== أهم التصحيحات ===');
const oldPrices = {76:1800, 86:180000, 85:35000, 84:25000, 93:95000, 94:8500, 78:8500, 60:35000, 108:550};
Object.entries(oldPrices).forEach(([n, old]) => {
  const p = prices[parseInt(n)];
  console.log('بند ' + n + ': ' + p.note + ' | قبل: ' + old + ' → بعد: ' + p.rate + ' ر.س');
});

// === تصدير Excel ===
const wbOut = XLSX.utils.book_new();
const rows = [
  ['عرض سعر — مشروع إنشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية'],
  ['الموقع: طريف - الحدود الشمالية | هامش الربح: 15% | معامل الموقع: ×1.15'],
  [],
  ['م', 'التصنيف', 'الوصف', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي']
];
items.forEach(it => rows.push([it.no, it.cat, it.note, it.unit, it.qty, it.finalRate, it.total]));
rows.push([]);
rows.push(['', '', '', '', '', 'الإجمالي', grandTotal]);
rows.push(['', '', '', '', '', 'ضريبة 15%', vat]);
rows.push(['', '', '', '', '', 'الإجمالي+ضريبة', grandTotal+vat]);

const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:5},{wch:18},{wch:45},{wch:10},{wch:8},{wch:12},{wch:14}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'عرض السعر');

// ملخص
const catRows = [['التصنيف','عدد البنود','الإجمالي','النسبة']];
Object.entries(byCat).sort((a,b)=>b[1].total-a[1].total).forEach(([c,d]) => 
  catRows.push([c, d.items.length, d.total, ((d.total/grandTotal)*100).toFixed(1)+'%'])
);
const ws2 = XLSX.utils.aoa_to_sheet(catRows);
XLSX.utils.book_append_sheet(wbOut, ws2, 'ملخص');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\عرض_سعر_طريف_ARBA.xlsx';
XLSX.writeFile(wbOut, outPath);
console.log('\n✅ Excel محدّث:', outPath);
