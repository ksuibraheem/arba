const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

// All known keywords (expanded)
const KNOWN = [
  'حفر','ردم','خرسانة','حديد تسليح','بلوك','لياسة','عزل مائي','عزل حراري',
  'بورسلان','سيراميك','دهانات','دهان','شبابيك','الومنيوم','باب خشب','باب حديد',
  'كرسي افرنجي','مغسلة','مواسير','ppr','طفاية','انذار','كهرب','لوحة كهرب',
  'تكييف','مكيف','سبليت','اسفلت','بلاط','رخام','جرانيت','انترلوك',
  'مكبر صوت','لاقط صوت','wifi','جرس','سبورة','صاري علم',
  'لوحة تعريف','لوحة فلين','حمالة ملابس','محبس برونز','مروحة سحب',
  'بروفايل','تدعيم','قمصان خرسانية','الدفاع المدني','مجمع توصيل','patch panel',
  'نقطة وصول','access point','كبينة توزيع','حاقن صابون','مساند','معاق',
  'استقبال لاسلكي','ميكرفون','مخرج','لاقط','كوابل',
  'جاليتراب','بردور','طرفيات خرسانية','براد مياه','فلتر',
  'هدف كرة','هدفي كرة','عشب صناعي','صواعق','حماية من الصواعق',
  'ايبوكسي','فواصل التمدد','دكة خرسانية','دكة خرسانيه',
  'غرف تفتيش','غرفة تفتيش','صرف مياه','مظلة','مظله','مظلات',
  'ربر','لوحات ارشادية','دولاليب','دواليب','غطاء غرفة',
  'كبينة توزيع','عازلة للرطوبة','عازله للرطوبه',
  // NEW - covering remaining 148 items:
  'خزانات المياه','خزانات مياه','فايبرجلاس','فايبر جلاس',
  'مضخات','مضخة','جرجورى','جرجوري','تسليك شبكة',
  'لوحة توزيع','قاطع','قواطع','كيبل نحاس','كيبل',
  'led','صيانة اللوحة','فحص واختبار','مراوح التهوية',
  'إزالة السواتر','ازالة السواتر','إزالة الأسوار','ازالة الاسوار',
  'شنكو','سواتر','فك وازالة','فك وإزالة',
  'قواطع حمامات','فينوليك','تقليم','نخل',
  'حوض أوانى','حوض اوانى','ستانلس','مطبخ',
  'غرف صرف','حوض',
  // More specific patterns for remaining items
  'ارضيات','طبقات الارضيات','كسوات','قيشاني',
  'صرف الامطار','صرف المطر','مياه الامطار',
  'مجموعة مضخات','سقيا','ضغط',
  'صاج','معدني','معدنية','مجلفن',
  'اللوحة الرئيسية','لوحة الرئيسية','استبدال القواطع',
  'إنارة','انارة','وحدة إنارة','وحدة انارة',
  'كابلات','كوابل','تأريض',
  'خيام','pvdf','pvc',
  'أسوار','اسوار','ملعب',
  'إزالة','ازالة',
];

const unmatchedMap = {};

for (let si = 1; si <= 7; si++) {
  const ws = wb.Sheets[wb.SheetNames[si]];
  if (!ws) continue;
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  for (const row of data) {
    if (typeof row[0] !== 'number' || typeof row[1] !== 'string' || row[1].length < 10) continue;
    const desc = row[1].trim();
    const unit = (row[2] || '').toString().trim();
    const d = desc.toLowerCase().replace(/\r\n/g, ' ');

    let matched = false;
    for (const kw of KNOWN) {
      if (d.includes(kw.toLowerCase())) { matched = true; break; }
    }

    if (!matched) {
      const key = desc.substring(0, 80);
      if (!unmatchedMap[key]) unmatchedMap[key] = { desc: desc.substring(0, 120), unit, count: 0 };
      unmatchedMap[key].count++;
    }
  }
}

const sorted = Object.values(unmatchedMap).sort((a, b) => b.count - a.count);
console.log('=== بنود لا تزال غير مطابقة (' + sorted.length + ' بند فريد) ===\n');
sorted.forEach((item, i) => {
  console.log((i+1) + '. [' + item.count + 'x] [' + item.unit + '] ' + item.desc);
});
