const XLSX = require('xlsx');
const fs = require('fs');

const BOQ_PATH = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\جدول الكميات - قبل التسعير.xlsx';

const wb = XLSX.readFile(BOQ_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

const items = [
  {n:1,cat:'أعمال ترابية',note:'حفريات عامة',v2:33,v4:21,problem:'تضخم بمعامل مضاعف'},
  {n:2,cat:'أعمال ترابية',note:'ردم وتسوية',v2:51,v4:29,problem:'تضخم بمعامل مضاعف'},
  {n:3,cat:'خرسانة',note:'خرسانة نظافة',v2:397,v4:230,problem:'سُعّرت كخرسانة مسلحة'},
  {n:4,cat:'خرسانة',note:'خرسانة أساسات مسلحة (أسمنت V)',v2:1164,v4:748,problem:'مضاعفة: سعر السوق+موقع+ربح'},
  {n:5,cat:'خرسانة',note:'خرسانة مسلحة إنشائية (أسمنت I)',v2:1587,v4:920,problem:'معامل ×1.32 على سعر مرتفع أصلاً'},
  {n:6,cat:'خرسانة',note:'خرسانة مسلحة إنشائية (أسمنت I)',v2:1878,v4:920,problem:'سُعّر كرقاب أعمدة بسعر أعلى'},
  {n:7,cat:'بناء',note:'بلوك معزول خارجي 20سم',v2:106,v4:75,problem:'مضاعفة الربح'},
  {n:8,cat:'بناء',note:'بلوك داخلي 15سم',v2:86,v4:55,problem:'مضاعفة الربح'},
  {n:9,cat:'لياسة',note:'لياسة أسمنتية داخلية وخارجية',v2:53,v4:35,problem:'معامل مضاعف'},
  {n:10,cat:'دهانات',note:'دهانات داخلية 3 أوجه',v2:46,v4:25,problem:'معامل مضاعف'},
  {n:11,cat:'أرضيات',note:'بورسلين أرضيات',v2:159,v4:109,problem:'سعر مبالغ للسوق'},
  {n:12,cat:'عزل',note:'طلاء بتوميني أساسات (طبقتين)',v2:72,v4:16,problem:'❌ سُعّر كعزل مائي كامل بدل طلاء بسيط'},
  {n:13,cat:'خرسانة',note:'خرسانة عادية تحت البلاط',v2:965,v4:230,problem:'❌ سُعّر كخرسانة SOG مسلحة!'},
  {n:14,cat:'أرضيات',note:'بورسلين أرضيات داخلية 9مم',v2:118,v4:109,problem:'صُنّف كإنترلوك خارجي'},
  {n:15,cat:'أعمال خارجية',note:'أسفلت',v2:113,v4:75,problem:'تضخم'},
  {n:16,cat:'أرضيات',note:'بلاط كيشاني جدران',v2:132,v4:81,problem:'تضخم بالمعامل'},
  {n:17,cat:'أرضيات',note:'رخام أرضيات ودرج 25مم',v2:397,v4:230,problem:'تضخم'},
  {n:18,cat:'أعمال خارجية',note:'بردورات 15×50×30',v2:113,v4:63,problem:'تضخم'},
  {n:19,cat:'أعمال خارجية',note:'بلاط أسمنتي ملون أرصفة',v2:118,v4:69,problem:'تضخم'},
  {n:20,cat:'أبواب',note:'باب ألمنيوم D1 ضلفتين 120×300',v2:4629,v4:2530,problem:'سعر ألمنيوم مبالغ'},
  {n:21,cat:'أبواب',note:'باب خشب سنديان ضلفتين',v2:5951,v4:3220,problem:'تضخم'},
  {n:22,cat:'أبواب',note:'باب خشب سنديان ضلفة',v2:2910,v4:1610,problem:'مضاعفة'},
  {n:23,cat:'أبواب',note:'باب ألمنيوم D4 مطابخ',v2:2381,v4:1035,problem:'سُعّر كباب فاخر'},
  {n:24,cat:'أبواب',note:'باب حديد مجلفن',v2:3306,v4:1840,problem:'مبالغ'},
  {n:25,cat:'نوافذ',note:'شباك W1 (2.4×2)م',v2:4497,v4:2530,problem:'تضخم'},
  {n:26,cat:'نوافذ',note:'شباك W2 (4.8×2)م',v2:8861,v4:5060,problem:'تضخم'},
  {n:27,cat:'نوافذ',note:'شباك W3 (3.6×2)م',v2:6745,v4:3795,problem:'تضخم — 50 شباك!'},
  {n:28,cat:'نوافذ',note:'شباك W4 (1×1.2)م',v2:1124,v4:633,problem:'تضخم'},
  {n:29,cat:'نوافذ',note:'شباك W5 (0.6×1)م',v2:596,v4:322,problem:'تضخم'},
  {n:30,cat:'نوافذ',note:'شباك W6 (1×2)م',v2:1851,v4:1035,problem:'تضخم'},
  {n:31,cat:'أسقف مستعارة',note:'جبس بورد مقاوم حريق',v2:125,v4:81,problem:'تضخم'},
  {n:32,cat:'أسقف مستعارة',note:'أرمسترونج 60×60',v2:99,v4:63,problem:'تضخم'},
  {n:33,cat:'أسقف مستعارة',note:'أرمسترونج 30×30',v2:113,v4:69,problem:'تضخم'},
  {n:34,cat:'عزل',note:'عزل أسطح مائي وحراري',v2:159,v4:92,problem:'تضخم'},
  {n:35,cat:'تكييف',note:'وحدة VRF خارجية كاملة',v2:5951,v4:32200,problem:'⚠️ كان أقل! V2 سعّرها رخيص'},
  {n:36,cat:'كهرباء',note:'مفتاح إنارة 1P 10A',v2:113,v4:21,problem:'❌ مفتاح بسيط سُعّر ×6'},
  {n:37,cat:'كهرباء',note:'مفتاح إنارة 2P 10A',v2:113,v4:29,problem:'تضخم'},
  {n:38,cat:'كهرباء',note:'مفتاح إنارة 3P 10A',v2:125,v4:37,problem:'تضخم'},
  {n:39,cat:'كهرباء',note:'مقبس 13A',v2:113,v4:21,problem:'❌ مقبس بسيط سُعّر ×6'},
  {n:40,cat:'كهرباء',note:'مقبس مزدوج 13A',v2:125,v4:29,problem:'تضخم'},
  {n:41,cat:'كهرباء',note:'مقبس 3 فاز 32A',v2:113,v4:40,problem:'تضخم'},
  {n:42,cat:'كهرباء',note:'مقبس أرضي Floor Box',v2:159,v4:75,problem:'تضخم'},
  {n:43,cat:'تيار خفيف',note:'نقطة بيانات Data',v2:462,v4:207,problem:'تضخم'},
  {n:44,cat:'سباكة',note:'طقم مرحاض غربي',v2:1587,v4:863,problem:'مضاعف'},
  {n:45,cat:'سباكة',note:'مغسلة + خلاط',v2:1058,v4:575,problem:'مضاعف'},
  {n:46,cat:'سباكة',note:'خلاط مياه',v2:859,v4:403,problem:'مضاعف'},
  {n:47,cat:'سباكة',note:'صرف أرضي',v2:159,v4:75,problem:'تضخم'},
  {n:48,cat:'سباكة',note:'مواسير PPR ساخن',v2:37,v4:21,problem:'مضاعف'},
  {n:49,cat:'سباكة',note:'مواسير PPR بارد',v2:51,v4:25,problem:'مضاعف'},
  {n:50,cat:'سباكة',note:'شبكة CPVC داخلية',v2:72,v4:40,problem:'مضاعف'},
  {n:51,cat:'سباكة',note:'محبس تخفيض ضغط',v2:3306,v4:1380,problem:'مضاعف'},
  {n:52,cat:'سباكة',note:'سخان 300 لتر',v2:11241,v4:5750,problem:'مبالغة كبيرة'},
  {n:53,cat:'سباكة',note:'خزان فايبر 5000 لتر',v2:8596,v4:4025,problem:'مبالغة'},
  {n:54,cat:'سباكة',note:'مضخة 3HP + خزان ضغط',v2:23805,v4:10350,problem:'مبالغة كبيرة'},
  {n:55,cat:'سباكة',note:'صرف UPVC داخلي',v2:113,v4:58,problem:'مضاعف'},
  {n:56,cat:'سباكة',note:'صرف UPVC خارجي',v2:145,v4:81,problem:'مضاعف'},
  {n:57,cat:'سباكة',note:'صرف رئيسي',v2:199,v4:104,problem:'مضاعف'},
  {n:58,cat:'سباكة',note:'غرفة تفتيش صرف',v2:5951,v4:3220,problem:'مضاعف'},
  {n:59,cat:'سباكة',note:'غرفة تفتيش خارجية',v2:5951,v4:3220,problem:'مضاعف'},
  {n:60,cat:'سباكة',note:'جالي تراب 30×30',v2:46288,v4:288,problem:'❌❌ سُعّر كخزان تحليل!!!'},
  {n:61,cat:'سباكة',note:'حاجز دهون',v2:5951,v4:2875,problem:'مضاعف'},
  {n:62,cat:'سباكة',note:'خزان أرضي',v2:19838,v4:9200,problem:'مبالغة'},
  {n:63,cat:'كهرباء',note:'إنارة LED 60×60 مكاتب',v2:370,v4:184,problem:'تضخم ×2'},
  {n:64,cat:'كهرباء',note:'إنارة ممرات',v2:423,v4:150,problem:'تضخم ×3'},
  {n:65,cat:'كهرباء',note:'إنارة طوارئ EXIT',v2:596,v4:322,problem:'تضخم'},
  {n:66,cat:'كهرباء',note:'إنارة خارجية',v2:462,v4:253,problem:'تضخم'},
  {n:67,cat:'كهرباء',note:'إنارة دورات مياه',v2:331,v4:150,problem:'تضخم ×2'},
  {n:68,cat:'كهرباء',note:'إنارة درج',v2:503,v4:207,problem:'تضخم'},
  {n:69,cat:'كهرباء',note:'كشاف Projector خارجي',v2:728,v4:403,problem:'تضخم'},
  {n:70,cat:'كهرباء',note:'إنارة مطبخ',v2:370,v4:184,problem:'تضخم ×2'},
  {n:71,cat:'كهرباء',note:'عمود إنارة خارجي',v2:3306,v4:1610,problem:'تضخم'},
  {n:72,cat:'كهرباء',note:'مقابس 13A متنوعة',v2:113,v4:21,problem:'❌ مقبس بسيط سُعّر ×6'},
  {n:73,cat:'تيار خفيف',note:'نقطة هاتف',v2:462,v4:207,problem:'تضخم'},
  {n:74,cat:'تيار خفيف',note:'نقطة بيانات',v2:462,v4:207,problem:'تضخم'},
  {n:75,cat:'تيار خفيف',note:'نقطة انتركم',v2:2910,v4:288,problem:'❌ نقطة سُعّرت كنظام كامل!'},
  {n:76,cat:'كهرباء',note:'Switch 2P 1Way 13A',v2:2381,v4:21,problem:'❌❌ مفتاح صُنّف ككاميرا!!!'},
  {n:77,cat:'تيار خفيف',note:'سماعة PA',v2:462,v4:230,problem:'تضخم'},
  {n:78,cat:'كهرباء',note:'AC Isolator 3P 40A',v2:11241,v4:138,problem:'❌❌ قاطع عازل صُنّف كوحدة تكييف!!!'},
  {n:79,cat:'حريق',note:'لوحة إنذار حريق رئيسية',v2:59512,v4:32200,problem:'مبالغة'},
  {n:80,cat:'حريق',note:'كاشف إنذار حريق',v2:398,v4:207,problem:'تضخم'},
  {n:81,cat:'حريق',note:'صندوق حريق',v2:3703,v4:2070,problem:'تضخم'},
  {n:82,cat:'حريق',note:'طفاية 6كج',v2:462,v4:230,problem:'تضخم'},
  {n:83,cat:'حريق',note:'نظام رشاش',v2:4232,v4:2070,problem:'تضخم'},
  {n:84,cat:'تيار خفيف',note:'ODF ألياف بصرية',v2:33063,v4:2070,problem:'❌❌ لوحة ألياف سُعّرت كـ UPS!!!'},
  {n:85,cat:'تيار خفيف',note:'UTP Patch Panel',v2:46288,v4:1150,problem:'❌❌ باتش بانل سُعّر كـ ATS!!!'},
  {n:86,cat:'تيار خفيف',note:'Cisco Catalyst 3850',v2:238050,v4:32200,problem:'❌❌ سويتش شبكات سُعّر كمولد!!!'},
  {n:87,cat:'تيار خفيف',note:'Access Control',v2:4629,v4:2530,problem:'تضخم'},
  {n:88,cat:'كهرباء',note:'حوامل كابلات',v2:1124,v4:518,problem:'مبالغة'},
  {n:89,cat:'كهرباء',note:'كابل 4×10+6 XLPE',v2:238,v4:98,problem:'مبالغة'},
  {n:90,cat:'كهرباء',note:'أسلاك كهربائية',v2:60,v4:29,problem:'تضخم'},
  {n:91,cat:'أبواب',note:'باب خشب D5',v2:2910,v4:1610,problem:'مضاعف'},
  {n:92,cat:'أبواب',note:'باب خشب ضلفتين D3',v2:5026,v4:2760,problem:'مضاعف'},
  {n:93,cat:'تيار خفيف',note:'شاشة LED 40 بوصة',v2:125637,v4:2875,problem:'❌❌ شاشة سُعّرت كمحول كهربائي!!!'},
  {n:94,cat:'تيار خفيف',note:'كابينة راك U16',v2:11241,v4:2875,problem:'❌ مبالغة كبيرة'},
  {n:95,cat:'تيار خفيف',note:'DVR 35 قناة 4TB',v2:2381,v4:7475,problem:'⚠️ كان أقل من اللازم في V2'},
  {n:96,cat:'كهرباء',note:'لوحة رئيسية MDB',v2:46288,v4:20700,problem:'مبالغة ×2.2'},
  {n:97,cat:'كهرباء',note:'لوحة طوارئ EMDB',v2:46288,v4:18400,problem:'مبالغة ×2.5'},
  {n:98,cat:'كهرباء',note:'لوحة تكييف ACLP',v2:37030,v4:16100,problem:'مبالغة ×2.3'},
  {n:99,cat:'كهرباء',note:'لوحة إنارة LP',v2:19838,v4:10350,problem:'مبالغة'},
  {n:100,cat:'كهرباء',note:'لوحة طوارئ إنارة',v2:15870,v4:8625,problem:'مضاعف'},
  {n:101,cat:'كهرباء',note:'لوحة مقابس PP',v2:15870,v4:8625,problem:'مضاعف'},
  {n:102,cat:'كهرباء',note:'لوحة مقابس طوارئ EPP',v2:13225,v4:6900,problem:'مضاعف'},
  {n:103,cat:'كهرباء',note:'لوحة فرعية ELP1',v2:10580,v4:5750,problem:'مضاعف'},
  {n:104,cat:'كهرباء',note:'لوحة فرعية ELP2',v2:10580,v4:5750,problem:'مضاعف'},
  {n:105,cat:'كهرباء',note:'كابل 4×10+6 مدرع',v2:238,v4:98,problem:'مبالغة'},
  {n:106,cat:'كهرباء',note:'كابل 4×16+10 مدرع',v2:331,v4:150,problem:'مبالغة ×2.2'},
  {n:107,cat:'كهرباء',note:'كابل 4×185+90 مدرع',v2:1124,v4:552,problem:'مبالغة ×2'},
  {n:108,cat:'كهرباء',note:'كابل 4×120+70 مدرع',v2:728,v4:322,problem:'مبالغة ×2.3 (1150م!)'},
  {n:109,cat:'تأريض',note:'نظام مانعة صواعق',v2:59512,v4:32200,problem:'مضاعف'},
  {n:110,cat:'تأريض',note:'تأريض داخل الخرسانة',v2:33063,v4:16100,problem:'مضاعف'},
  {n:111,cat:'تأريض',note:'Earthpit حفرة تأريض',v2:4629,v4:2070,problem:'مضاعف'},
];

// Get quantities from BOQ
const qtyMap = {};
for(let i=4;i<raw.length;i++){
  const num=parseInt(raw[i][0]);
  if(!isNaN(num)) qtyMap[num] = parseFloat(raw[i][3])||0;
}

// Build Excel
const wbOut = XLSX.utils.book_new();
const rows = [
  ['تحليل مراجعة الأسعار — مشروع قيادة قوى طريف'],
  ['V2 = السعر القديم (الضارب) | V4 = السعر المصحح (العادل) | الربح الصافي 15%'],
  [],
  ['م','التصنيف','وصف البند','الوحدة','الكمية',
   'سعر V2','إجمالي V2','سعر V4','إجمالي V4',
   'الفرق','فرق%','نوع المشكلة','التفاصيل']
];

let totV2=0, totV4=0;
items.forEach(it => {
  const qty = qtyMap[it.n] || 0;
  const unit = it.n<=2?'م³':it.n<=6?'م³':'—';
  const tv2 = it.v2 * qty;
  const tv4 = it.v4 * qty;
  const diff = tv2 - tv4;
  const pct = tv2>0 ? Math.round((diff/tv2)*100) : 0;
  totV2 += tv2; totV4 += tv4;
  
  let severity;
  if(pct > 80) severity = '🔴 خطأ فادح';
  else if(pct > 50) severity = '🟠 مبالغة كبيرة';
  else if(pct > 30) severity = '🟡 تضخم';
  else if(pct > 0) severity = '🔵 تضخم طفيف';
  else severity = '⚠️ كان أقل';

  // Get actual unit from BOQ
  let realUnit = '—';
  for(let i=4;i<raw.length;i++){
    if(parseInt(raw[i][0])===it.n){ realUnit=String(raw[i][2]||'').trim(); break; }
  }
  
  rows.push([it.n, it.cat, it.note, realUnit, qty, it.v2, tv2, it.v4, tv4, diff, pct+'%', severity, it.problem]);
});

rows.push([]);
rows.push(['','','','','','إجمالي V2',totV2,'إجمالي V4',totV4, totV2-totV4, Math.round((totV2-totV4)/totV2*100)+'%','','']);
rows.push(['','','','','','','','VAT 15%',Math.round(totV4*0.15),'','','','']);
rows.push(['','','','','','','','إجمالي+ضريبة',totV4+Math.round(totV4*0.15),'','','','']);

const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [
  {wch:4},{wch:14},{wch:35},{wch:8},{wch:7},
  {wch:10},{wch:12},{wch:10},{wch:12},
  {wch:11},{wch:7},{wch:16},{wch:40}
];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'تحليل المراجعة');

// Sheet 2: ملخص المشاكل
const sumRows = [
  ['ملخص أنواع المشاكل'],
  [],
  ['نوع المشكلة','عدد البنود','إجمالي الفرق (ر.س)','النسبة من الفرق الكلي']
];
const types = {'🔴 خطأ فادح':0,'🟠 مبالغة كبيرة':0,'🟡 تضخم':0,'🔵 تضخم طفيف':0};
const typeTotals = {'🔴 خطأ فادح':0,'🟠 مبالغة كبيرة':0,'🟡 تضخم':0,'🔵 تضخم طفيف':0};
items.forEach(it => {
  const qty=qtyMap[it.n]||0;
  const diff=it.v2*qty - it.v4*qty;
  const pct=it.v2*qty>0?Math.round(diff/(it.v2*qty)*100):0;
  let sev = pct>80?'🔴 خطأ فادح':pct>50?'🟠 مبالغة كبيرة':pct>30?'🟡 تضخم':'🔵 تضخم طفيف';
  if(diff>0){types[sev]++;typeTotals[sev]+=diff;}
});
const totalDiff=totV2-totV4;
Object.entries(types).forEach(([k,v])=>{
  if(v>0) sumRows.push([k, v, typeTotals[k], Math.round(typeTotals[k]/totalDiff*100)+'%']);
});
sumRows.push([]);
sumRows.push(['الإجمالي', items.length, totalDiff, '100%']);

const ws2 = XLSX.utils.aoa_to_sheet(sumRows);
ws2['!cols'] = [{wch:18},{wch:12},{wch:18},{wch:18}];
XLSX.utils.book_append_sheet(wbOut, ws2, 'ملخص المشاكل');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\تحليل_مراجعة_الأسعار_ARBA.xlsx';
XLSX.writeFile(wbOut, outPath);
console.log('✅ تم حفظ ملف التحليل:', outPath);
console.log('V2:', totV2.toLocaleString('en'), '| V4:', totV4.toLocaleString('en'), '| فرق:', (totV2-totV4).toLocaleString('en'));
