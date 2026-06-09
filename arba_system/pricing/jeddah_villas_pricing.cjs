const xlsx = require('xlsx');
const OUTPUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\المرحلة الثانية\\فلل جدة\\Arba_Jeddah_Villas_Pricing.xlsx';
const PROFIT = 1.25;

// Villa types from extracted PDF data
const VILLAS = [
  { type:'01-A', area:245.12, ground:108.73, first:104.95, annex:31.44, rooms:5, count:8, oldPrice:867364 },
  { type:'01-B', area:227.64, ground:108.73, first:104.95, annex:13.96, rooms:5, count:12, oldPrice:829799 },
  { type:'01-C', area:198.08, ground:108.73, first:89.35, annex:0, rooms:5, count:14, oldPrice:763172 },
  { type:'02-A', area:265.02, ground:117.93, first:111.83, annex:35.26, rooms:5, count:14, oldPrice:903650 },
  { type:'02-B', area:244.08, ground:117.93, first:111.83, annex:14.32, rooms:5, count:33, oldPrice:868492 },
  { type:'02-C', area:221.92, ground:117.93, first:89.67, annex:14.32, rooms:4, count:29, oldPrice:826144 },
  { type:'03-A', area:269.68, ground:119.81, first:115.82, annex:34.05, rooms:5, count:15, oldPrice:912880 },
  { type:'03-B', area:239.98, ground:119.81, first:102.25, annex:17.92, rooms:5, count:19, oldPrice:875712 },
  { type:'04',   area:289.92, ground:128.67, first:124.61, annex:36.64, rooms:5, count:8, oldPrice:987117 },
];

// Jeddah market BOQ items per villa
function generateBOQ(v) {
  const items = [];
  let n = 0;
  const add = (cat, desc, unit, qty, rate) => {
    n++;
    const arba = Math.round(rate * PROFIT);
    items.push({ '#':n, القسم:cat, 'وصف البند':desc, الوحدة:unit, الكمية:qty,
      'سعر الوحدة (عرض)':rate, 'سعر أربا +25%':arba,
      'الإجمالي (عرض)':qty*rate, 'إجمالي أربا':qty*arba });
  };

  // 1. Site Works
  const siteArea = v.ground * 1.3;
  add('أعمال الموقع','حفر وتسوية الموقع','م3', Math.round(siteArea*0.8), 22);
  add('أعمال الموقع','ردم وتدك بمواد مختارة','م3', Math.round(siteArea*0.5), 35);
  add('أعمال الموقع','معالجة التربة ضد النمل الأبيض','م2', Math.round(v.ground), 18);
  add('أعمال الموقع','شبكة تصريف مياه أمطار','مقطوعية', 1, 8500);

  // 2. Plain Concrete
  add('خرسانة عادية','خرسانة نظافة أسفل القواعد C15 سماكة 10سم','م3', Math.round(v.ground*0.1), 280);
  add('خرسانة عادية','خرسانة عادية للأرصفة والممرات','م3', Math.round(v.ground*0.05), 300);

  // 3. Reinforced Concrete
  add('خرسانة مسلحة','قواعد خرسانية مسلحة C30','م3', Math.round(v.ground*0.12), 850);
  add('خرسانة مسلحة','رقاب أعمدة','م3', Math.round(v.ground*0.03), 1395);
  add('خرسانة مسلحة','ميدات أرضية','م3', Math.round(v.ground*0.08), 1180);
  add('خرسانة مسلحة','أعمدة الدور الأرضي','م3', Math.round(v.ground*0.04), 1375);
  add('خرسانة مسلحة','أعمدة الدور الأول','م3', Math.round(v.first*0.04), 1400);
  add('خرسانة مسلحة','كمرات الدور الأرضي','م3', Math.round(v.ground*0.06), 1180);
  add('خرسانة مسلحة','كمرات الدور الأول','م3', Math.round(v.first*0.06), 1200);
  add('خرسانة مسلحة','بلاطة سقف الأرضي سماكة 20سم','م3', Math.round(v.ground*0.2), 942);
  add('خرسانة مسلحة','بلاطة سقف الأول سماكة 20سم','م3', Math.round(v.first*0.2), 960);
  add('خرسانة مسلحة','درج خرساني مسلح','م3', 3, 1195);
  if(v.annex>0) add('خرسانة مسلحة','خرسانة ملحق علوي','م3', Math.round(v.annex*0.15), 980);
  add('خرسانة مسلحة','جدران خرسانية خزان مياه','م3', 4, 1080);
  add('خرسانة مسلحة','بلاطة أرضية على التربة SOG','م3', Math.round(v.ground*0.15), 708);

  // 4. Insulation
  add('أعمال العزل','عزل مائي للأساسات (بيتومين)','م2', Math.round(v.ground*1.5), 35);
  add('أعمال العزل','عزل مائي للحمامات','م2', Math.round(v.area*0.12), 55);
  add('أعمال العزل','عزل حراري للأسقف (فوم 5سم)','م2', Math.round(v.ground), 45);
  add('أعمال العزل','عزل حراري للجدران الخارجية','م2', Math.round(v.area*0.6), 38);

  // 5. Masonry
  add('أعمال البناء','بلوك أسمنتي 20سم للجدران الخارجية','م2', Math.round(v.area*0.8), 75);
  add('أعمال البناء','بلوك أسمنتي 15سم للجدران الداخلية','م2', Math.round(v.area*0.5), 60);
  add('أعمال البناء','بلوك أسمنتي 10سم للحمامات','م2', Math.round(v.area*0.15), 50);

  // 6. Plaster
  add('أعمال اللياسة','لياسة خارجية إسمنتية','م2', Math.round(v.area*0.8), 42);
  add('أعمال اللياسة','لياسة داخلية جبسية','م2', Math.round(v.area*1.2), 35);

  // 7. Tiling & Marble
  add('أعمال البلاط','بلاط أرضيات بورسلين 60×60','م2', Math.round(v.area*0.7), 120);
  add('أعمال البلاط','بلاط جدران حمامات سيراميك','م2', Math.round(v.area*0.2), 95);
  add('أعمال البلاط','رخام درج وبسطات','م2', 18, 280);
  add('أعمال البلاط','بلاط أرضيات خارجية إنترلوك','م2', Math.round(siteArea*0.3), 85);

  // 8. Paint
  add('أعمال الدهانات','دهان داخلي (جوتن أو معادل) 3 أوجه','م2', Math.round(v.area*2.2), 28);
  add('أعمال الدهانات','دهان خارجي مقاوم للعوامل الجوية','م2', Math.round(v.area*0.6), 38);

  // 9. Gypsum
  add('أعمال الجبس','أسقف جبس بورد مستعار','م2', Math.round(v.area*0.6), 75);
  add('أعمال الجبس','كرانيش وديكورات جبسية','م.ط', Math.round(v.area*0.3), 45);

  // 10. Woodwork
  add('أعمال الخشب','أبواب داخلية خشب HDF','عدد', v.rooms*3, 1200);
  add('أعمال الخشب','باب رئيسي خشب فاخر','عدد', 1, 4500);
  add('أعمال الخشب','دولاب مطبخ ألومنيوم/خشب','م.ط', 6, 1800);

  // 11. Aluminum & Glass
  add('أعمال الألمنيوم','نوافذ ألمنيوم زجاج مزدوج','م2', Math.round(v.area*0.08), 650);
  add('أعمال الألمنيوم','باب ألمنيوم خارجي','عدد', 2, 3200);

  // 12. Electrical
  add('أعمال الكهرباء','تأسيس كهربائي شامل (نقاط+أسلاك+لوحات)','مقطوعية', 1, Math.round(v.area*120));
  add('أعمال الكهرباء','إنارة داخلية LED','مقطوعية', 1, Math.round(v.area*45));
  add('أعمال الكهرباء','إنارة خارجية','مقطوعية', 1, 5500);
  add('أعمال الكهرباء','نظام إنذار حريق','مقطوعية', 1, 8000);

  // 13. Plumbing
  add('أعمال السباكة','تأسيس سباكة شامل (مواسير+صرف+تغذية)','مقطوعية', 1, Math.round(v.area*85));
  add('أعمال السباكة','أطقم حمامات (مغسلة+مرحاض+خلاط)','طقم', v.rooms, 2800);
  add('أعمال السباكة','خزان مياه علوي 2000 لتر','عدد', 1, 3500);
  add('أعمال السباكة','سخان مياه مركزي','عدد', 1, 4200);
  add('أعمال السباكة','مضخة مياه','عدد', 1, 2800);

  // 14. HVAC
  add('تكييف','تأسيس تكييف سبليت (مواسير+تصريف+كهرباء)','نقطة', v.rooms+2, 1200);
  add('تكييف','وحدات تكييف سبليت','عدد', v.rooms+1, 3800);

  // 15. Fence & External
  add('أعمال خارجية','سور خارجي بلوك 20سم + لياسة + دهان','م.ط', Math.round(Math.sqrt(siteArea)*4), 450);
  add('أعمال خارجية','بوابة حديد رئيسية','عدد', 1, 12000);
  add('أعمال خارجية','بوابة مشاة','عدد', 1, 3500);

  return items;
}

// Generate workbook
const wb = xlsx.utils.book_new();

// Summary sheet
const summary = VILLAS.map(v => {
  const boq = generateBOQ(v);
  const totalOld = boq.reduce((s,i) => s + i['الإجمالي (عرض)'], 0);
  const totalArba = boq.reduce((s,i) => s + i['إجمالي أربا'], 0);
  const profit = totalArba - totalOld;
  return {
    'نوع الفيلا': 'Type ' + v.type,
    'المساحة م²': v.area,
    'الأرضي م²': v.ground,
    'الأول م²': v.first,
    'الملحق م²': v.annex || '—',
    'عدد الغرف': v.rooms,
    'عدد الفلل': v.count,
    'سعر العرض القديم': v.oldPrice,
    'تكلفة أربا (فيلا)': totalOld,
    'سعر أربا +25% (فيلا)': totalArba,
    'الربح لكل فيلا': profit,
    'نسبة الربح': Math.round(profit/totalOld*100) + '%',
    'إجمالي النوع (عرض)': v.oldPrice * v.count,
    'إجمالي النوع (أربا)': totalArba * v.count,
    'سعر م² (عرض)': Math.round(v.oldPrice / v.area),
    'سعر م² (أربا)': Math.round(totalArba / v.area),
  };
});

const summSheet = xlsx.utils.json_to_sheet(summary);
summSheet['!cols'] = Array(16).fill({ wch: 18 });
xlsx.utils.book_append_sheet(wb, summSheet, 'ملخص المشروع');

// Grand total sheet
const grandOld = summary.reduce((s,r) => s + r['إجمالي النوع (عرض)'], 0);
const grandArba = summary.reduce((s,r) => s + r['إجمالي النوع (أربا)'], 0);
const grandData = [
  { البند: 'إجمالي 152 فيلا (بدون ضريبة)', 'سعر العرض': grandOld, 'سعر أربا +25%': grandArba },
  { البند: 'ضريبة القيمة المضافة 15%', 'سعر العرض': Math.round(grandOld*0.15), 'سعر أربا +25%': Math.round(grandArba*0.15) },
  { البند: 'الإجمالي شامل الضريبة', 'سعر العرض': Math.round(grandOld*1.15), 'سعر أربا +25%': Math.round(grandArba*1.15) },
  { البند: 'الربح الإجمالي', 'سعر العرض': '', 'سعر أربا +25%': grandArba - grandOld },
];
const grandSheet = xlsx.utils.json_to_sheet(grandData);
grandSheet['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 20 }];
xlsx.utils.book_append_sheet(wb, grandSheet, 'الإجمالي العام');

// Per-villa BOQ sheets
VILLAS.forEach(v => {
  const boq = generateBOQ(v);
  const sheet = xlsx.utils.json_to_sheet(boq);
  sheet['!cols'] = [
    { wch: 4 }, { wch: 15 }, { wch: 50 }, { wch: 10 }, { wch: 8 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
  ];
  xlsx.utils.book_append_sheet(wb, sheet, 'Type_' + v.type);
});

xlsx.writeFile(wb, OUTPUT);

// Print summary
console.log('✅ ملف الإكسل جاهز!');
console.log('📁 المسار:', OUTPUT);
console.log('\n=== ملخص التسعير ===');
summary.forEach(s => {
  console.log(`  ${s['نوع الفيلا']} | ${s['عدد الفلل']} فيلا | عرض: ${s['سعر العرض القديم'].toLocaleString()} | أربا: ${s['سعر أربا +25% (فيلا)'].toLocaleString()} | ربح: ${s['نسبة الربح']}`);
});
console.log(`\n💰 إجمالي العرض: ${grandOld.toLocaleString()} ر.س`);
console.log(`💰 إجمالي أربا: ${grandArba.toLocaleString()} ر.س`);
console.log(`📈 الربح: ${(grandArba-grandOld).toLocaleString()} ر.س`);
