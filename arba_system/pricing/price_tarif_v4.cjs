const XLSX = require('xlsx');
const fs = require('fs');

const BOQ_PATH = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\جدول الكميات - قبل التسعير.xlsx';

// التكلفة الصافية (بدون أي ربح) — أسعار سوق طريف الحقيقية
const cost = {
  1: { c: 18, cat:'أعمال ترابية', note:'حفريات عامة' },
  2: { c: 25, cat:'أعمال ترابية', note:'ردم وتسوية بمواد مختارة' },
  3: { c: 200, cat:'خرسانة', note:'خرسانة نظافة عادية' },
  4: { c: 650, cat:'خرسانة', note:'خرسانة مسلحة أساسات (أسمنت V مقاوم)' },
  5: { c: 800, cat:'خرسانة', note:'خرسانة مسلحة عناصر إنشائية (أسمنت I)' },
  6: { c: 800, cat:'خرسانة', note:'خرسانة مسلحة عناصر إنشائية (أسمنت I)' },
  7: { c: 65, cat:'بناء', note:'بلوك أسمنتي معزول 20سم خارجي' },
  8: { c: 48, cat:'بناء', note:'بلوك أسمنتي داخلي 15سم' },
  9: { c: 30, cat:'لياسة', note:'لياسة أسمنتية داخلية وخارجية' },
  10: { c: 22, cat:'دهانات', note:'دهانات داخلية 3 أوجه' },
  11: { c: 95, cat:'أرضيات', note:'بورسلين أرضيات' },
  12: { c: 14, cat:'عزل', note:'طلاء بتوميني أساسات (طبقتين)' },
  13: { c: 200, cat:'خرسانة', note:'خرسانة عادية تحت البلاط' },
  14: { c: 95, cat:'أرضيات', note:'بورسلين أرضيات 9مم مطفي' },
  15: { c: 65, cat:'أعمال خارجية', note:'أسفلت' },
  16: { c: 70, cat:'أرضيات', note:'بلاط كيشاني جدران' },
  17: { c: 200, cat:'أرضيات', note:'رخام أرضيات ودرج 25مم' },
  18: { c: 55, cat:'أعمال خارجية', note:'بردورات 15×50×30' },
  19: { c: 60, cat:'أعمال خارجية', note:'بلاط أسمنتي ملون أرصفة' },
  20: { c: 2200, cat:'أبواب', note:'باب ألمنيوم D1 ضلفتين 120×300' },
  21: { c: 2800, cat:'أبواب', note:'باب خشب سنديان ضلفتين' },
  22: { c: 1400, cat:'أبواب', note:'باب خشب سنديان ضلفة' },
  23: { c: 900, cat:'أبواب', note:'باب ألمنيوم D4 مطابخ' },
  24: { c: 1600, cat:'أبواب', note:'باب حديد مجلفن' },
  25: { c: 2200, cat:'نوافذ', note:'شباك W1 (2.4×2)م' },
  26: { c: 4400, cat:'نوافذ', note:'شباك W2 (4.8×2)م' },
  27: { c: 3300, cat:'نوافذ', note:'شباك W3 (3.6×2)م' },
  28: { c: 550, cat:'نوافذ', note:'شباك W4 (1×1.2)م' },
  29: { c: 280, cat:'نوافذ', note:'شباك W5 (0.6×1)م' },
  30: { c: 900, cat:'نوافذ', note:'شباك W6 (1×2)م' },
  31: { c: 70, cat:'أسقف مستعارة', note:'جبس بورد مقاوم حريق' },
  32: { c: 55, cat:'أسقف مستعارة', note:'أرمسترونج 60×60' },
  33: { c: 60, cat:'أسقف مستعارة', note:'أرمسترونج 30×30' },
  34: { c: 80, cat:'عزل', note:'عزل أسطح مائي وحراري' },
  35: { c: 28000, cat:'تكييف', note:'وحدة VRF خارجية كاملة' },
  36: { c: 18, cat:'كهرباء', note:'مفتاح إنارة 1P' },
  37: { c: 25, cat:'كهرباء', note:'مفتاح إنارة 2P' },
  38: { c: 32, cat:'كهرباء', note:'مفتاح إنارة 3P' },
  39: { c: 18, cat:'كهرباء', note:'مقبس 13A' },
  40: { c: 25, cat:'كهرباء', note:'مقبس مزدوج' },
  41: { c: 35, cat:'كهرباء', note:'مقبس 3 فاز' },
  42: { c: 65, cat:'كهرباء', note:'مقبس أرضي Floor Box' },
  43: { c: 180, cat:'تيار خفيف', note:'نقطة بيانات' },
  44: { c: 750, cat:'سباكة', note:'طقم مرحاض غربي كامل' },
  45: { c: 500, cat:'سباكة', note:'مغسلة + خلاط' },
  46: { c: 350, cat:'سباكة', note:'خلاط مياه' },
  47: { c: 65, cat:'سباكة', note:'صرف أرضي' },
  48: { c: 18, cat:'سباكة', note:'مواسير PPR ساخن' },
  49: { c: 22, cat:'سباكة', note:'مواسير PPR بارد' },
  50: { c: 35, cat:'سباكة', note:'شبكة CPVC داخلية' },
  51: { c: 1200, cat:'سباكة', note:'محبس تخفيض ضغط' },
  52: { c: 5000, cat:'سباكة', note:'سخان 300 لتر كهربائي' },
  53: { c: 3500, cat:'سباكة', note:'خزان فايبر 5000 لتر' },
  54: { c: 9000, cat:'سباكة', note:'مضخة 3HP + خزان ضغط 750L' },
  55: { c: 50, cat:'سباكة', note:'صرف UPVC داخلي' },
  56: { c: 70, cat:'سباكة', note:'صرف UPVC خارجي' },
  57: { c: 90, cat:'سباكة', note:'صرف رئيسي' },
  58: { c: 2800, cat:'سباكة', note:'غرفة تفتيش صرف' },
  59: { c: 2800, cat:'سباكة', note:'غرفة تفتيش خارجية' },
  60: { c: 250, cat:'سباكة', note:'جالي تراب 30×30' },
  61: { c: 2500, cat:'سباكة', note:'حاجز دهون' },
  62: { c: 8000, cat:'سباكة', note:'خزان أرضي' },
  63: { c: 160, cat:'كهرباء', note:'إنارة LED 60×60 مكاتب' },
  64: { c: 130, cat:'كهرباء', note:'إنارة ممرات' },
  65: { c: 280, cat:'كهرباء', note:'إنارة طوارئ EXIT' },
  66: { c: 220, cat:'كهرباء', note:'إنارة خارجية' },
  67: { c: 130, cat:'كهرباء', note:'إنارة دورات مياه' },
  68: { c: 180, cat:'كهرباء', note:'إنارة درج' },
  69: { c: 350, cat:'كهرباء', note:'كشاف Projector خارجي' },
  70: { c: 160, cat:'كهرباء', note:'إنارة مطبخ' },
  71: { c: 1400, cat:'كهرباء', note:'عمود إنارة خارجي' },
  72: { c: 18, cat:'كهرباء', note:'مقابس متنوعة' },
  73: { c: 180, cat:'تيار خفيف', note:'نقطة هاتف' },
  74: { c: 180, cat:'تيار خفيف', note:'نقطة بيانات' },
  75: { c: 250, cat:'تيار خفيف', note:'نقطة انتركم' },
  76: { c: 18, cat:'كهرباء', note:'Switch 2P 1Way 13A' },
  77: { c: 200, cat:'تيار خفيف', note:'سماعة PA' },
  78: { c: 120, cat:'كهرباء', note:'AC Isolator 3P 40A' },
  79: { c: 28000, cat:'حريق', note:'لوحة إنذار حريق رئيسية' },
  80: { c: 180, cat:'حريق', note:'كاشف/جهاز إنذار' },
  81: { c: 1800, cat:'حريق', note:'صندوق حريق' },
  82: { c: 200, cat:'حريق', note:'طفاية 6كج' },
  83: { c: 1800, cat:'حريق', note:'نظام رشاش' },
  84: { c: 1800, cat:'تيار خفيف', note:'ODF ألياف بصرية' },
  85: { c: 1000, cat:'تيار خفيف', note:'UTP Patch Panel' },
  86: { c: 28000, cat:'تيار خفيف', note:'Cisco Catalyst 3850 Switch' },
  87: { c: 2200, cat:'تيار خفيف', note:'Access Control' },
  88: { c: 450, cat:'كهرباء', note:'حوامل كابلات' },
  89: { c: 85, cat:'كهرباء', note:'كابل 4×10+6 XLPE' },
  90: { c: 25, cat:'كهرباء', note:'أسلاك كهربائية' },
  91: { c: 1400, cat:'أبواب', note:'باب خشب D5' },
  92: { c: 2400, cat:'أبواب', note:'باب خشب ضلفتين D3' },
  93: { c: 2500, cat:'تيار خفيف', note:'شاشة LED 40"' },
  94: { c: 2500, cat:'تيار خفيف', note:'كابينة راك U16' },
  95: { c: 6500, cat:'تيار خفيف', note:'DVR 35 قناة 4TB' },
  96: { c: 18000, cat:'كهرباء', note:'لوحة رئيسية MDB' },
  97: { c: 16000, cat:'كهرباء', note:'لوحة طوارئ EMDB' },
  98: { c: 14000, cat:'كهرباء', note:'لوحة تكييف ACLP' },
  99: { c: 9000, cat:'كهرباء', note:'لوحة إنارة LP' },
  100: { c: 7500, cat:'كهرباء', note:'لوحة طوارئ إنارة' },
  101: { c: 7500, cat:'كهرباء', note:'لوحة مقابس PP' },
  102: { c: 6000, cat:'كهرباء', note:'لوحة مقابس طوارئ EPP' },
  103: { c: 5000, cat:'كهرباء', note:'لوحة فرعية ELP1' },
  104: { c: 5000, cat:'كهرباء', note:'لوحة فرعية ELP2' },
  105: { c: 85, cat:'كهرباء', note:'كابل 4×10+6 مدرع' },
  106: { c: 130, cat:'كهرباء', note:'كابل 4×16+10 مدرع' },
  107: { c: 480, cat:'كهرباء', note:'كابل 4×185+90 مدرع' },
  108: { c: 280, cat:'كهرباء', note:'كابل 4×120+70 مدرع' },
  109: { c: 28000, cat:'تأريض', note:'نظام مانعة صواعق' },
  110: { c: 14000, cat:'تأريض', note:'تأريض داخل الخرسانة' },
  111: { c: 1800, cat:'تأريض', note:'Earthpit حفرة تأريض' },
};

const PROFIT = 1.15; // 15% ربح صافي فقط

const wb = XLSX.readFile(BOQ_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

const items = [];
for(let i = 4; i < raw.length; i++) {
  const num = parseInt(raw[i][0]);
  if(isNaN(num)) continue;
  const unit = String(raw[i][2]||'').trim();
  const qty = parseFloat(raw[i][3]) || 0;
  if(!qty) continue;
  const p = cost[num] || { c:200, cat:'أخرى', note:'تقدير' };
  const sell = Math.round(p.c * PROFIT);
  const total = sell * qty;
  const profit = total - (p.c * qty);
  items.push({ no:num, unit, qty, cat:p.cat, note:p.note, cost:p.c, sell, total, profit });
}

const totalCost = items.reduce((s,i) => s + (i.cost * i.qty), 0);
const totalSell = items.reduce((s,i) => s + i.total, 0);
const totalProfit = totalSell - totalCost;
const vat = Math.round(totalSell * 0.15);

console.log('========================================');
console.log('  عرض سعر مشروع قيادة قوى طريف V4');
console.log('  صافي الربح: 15% فقط');
console.log('========================================');
console.log('التكلفة الصافية:', totalCost.toLocaleString('en'));
console.log('سعر البيع:     ', totalSell.toLocaleString('en'));
console.log('صافي الربح:    ', totalProfit.toLocaleString('en'), '(' + ((totalProfit/totalCost)*100).toFixed(1) + '%)');
console.log('VAT 15%:       ', vat.toLocaleString('en'));
console.log('الإجمالي+ضريبة:', (totalSell+vat).toLocaleString('en'));

console.log('\n=== التصنيفات ===');
const byCat = {};
items.forEach(i => {
  if(!byCat[i.cat]) byCat[i.cat] = {cost:0, sell:0, profit:0, count:0};
  byCat[i.cat].cost += i.cost * i.qty;
  byCat[i.cat].sell += i.total;
  byCat[i.cat].profit += i.profit;
  byCat[i.cat].count++;
});
Object.entries(byCat).sort((a,b)=>b[1].sell-a[1].sell).forEach(([cat,d]) => {
  console.log(cat.padEnd(16) + '| ' + String(d.count).padStart(2) + ' بند | تكلفة ' + 
    String(d.cost.toLocaleString('en')).padStart(10) + ' | بيع ' +
    String(d.sell.toLocaleString('en')).padStart(10) + ' | ربح ' +
    String(d.profit.toLocaleString('en')).padStart(9) + ' | ' +
    ((d.sell/totalSell)*100).toFixed(1) + '%');
});

// === Excel ===
const wbOut = XLSX.utils.book_new();
const rows = [
  ['عرض سعر — مشروع إنشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية'],
  ['صافي الربح: 15% | بدون معامل موقع مضاعف'],
  [],
  ['م','التصنيف','الوصف','الوحدة','الكمية','التكلفة','سعر البيع','الإجمالي','الربح']
];
items.forEach(i => rows.push([i.no, i.cat, i.note, i.unit, i.qty, i.cost, i.sell, i.total, i.profit]));
rows.push([]);
rows.push(['','','','','','التكلفة الصافية','',totalCost,'']);
rows.push(['','','','','','سعر البيع','',totalSell,'']);
rows.push(['','','','','','صافي الربح','','',totalProfit]);
rows.push(['','','','','','VAT 15%','',vat,'']);
rows.push(['','','','','','الإجمالي مع الضريبة','',(totalSell+vat),'']);

const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:4},{wch:14},{wch:40},{wch:8},{wch:7},{wch:10},{wch:10},{wch:12},{wch:10}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'عرض السعر');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\عرض_سعر_طريف_ARBA.xlsx';
XLSX.writeFile(wbOut, outPath);
console.log('\n✅ Excel:', outPath);
