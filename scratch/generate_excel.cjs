const XLSX = require('xlsx');
const path = require('path');

// ===== ALL PRICED DATA =====

const section1 = {
  name: "مستودع السلاح",
  total: 295350,
  items: [
    { no: 1, unit: "م3", qty: 236, description: "حفر لزوم الأساسات شاملة القواعد و الميدات وكل العناصر تحت منسوب الأرض", unitPrice: 35, totalPrice: 8260, mandatory: "لا" },
    { no: 2, unit: "م3", qty: 198, description: "إعـادة ردم حول الأسـاسات مع الدك للوصول النسبة 95%", unitPrice: 30, totalPrice: 5940, mandatory: "لا" },
    { no: 3, unit: "م3", qty: 35, description: "طبقة حصوية بسمك 150مم أسفل البلاطة المسلحة مع الدك 95%", unitPrice: 60, totalPrice: 2100, mandatory: "لا" },
    { no: 4, unit: "م3", qty: 6, description: "خرسانة عادية أسفل القواعد والكمرات الأرضية", unitPrice: 450, totalPrice: 2700, mandatory: "نعم" },
    { no: 5, unit: "م3", qty: 19, description: "خرسانة مسلحة للقواعد المسلحة ورقاب الأعمدة والكمرات الارضية", unitPrice: 1650, totalPrice: 31350, mandatory: "نعم" },
    { no: 6, unit: "م3", qty: 8, description: "خرسانة مسلحة لبلاطة الأرضيات سمك 14 سم", unitPrice: 1800, totalPrice: 14400, mandatory: "نعم" },
    { no: 7, unit: "م3", qty: 19, description: "خرسانة للأعمدة وكمرات السقف والبلاطة المسلحة وحوائط الدراوي", unitPrice: 2000, totalPrice: 38000, mandatory: "نعم" },
    { no: 8, unit: "م2", qty: 135, description: "طبقة حماية بولي إيثيلين سمك 0.20 مم", unitPrice: 20, totalPrice: 2700, mandatory: "نعم" },
    { no: 9, unit: "م2", qty: 136, description: "دهان بيتومين عازل للرطوبة وجهين متعامدين", unitPrice: 35, totalPrice: 4760, mandatory: "نعم" },
    { no: 10, unit: "م2", qty: 98, description: "بلوك أسمنتي معزول 200مم حوائط خارجية", unitPrice: 110, totalPrice: 10780, mandatory: "نعم" },
    { no: 11, unit: "م2", qty: 60, description: "بلوك أسمنتي غير معزول 200مم حوائط داخلية", unitPrice: 80, totalPrice: 4800, mandatory: "نعم" },
    { no: 12, unit: "م2", qty: 5, description: "ألواح جيبس بورد", unitPrice: 110, totalPrice: 550, mandatory: "نعم" },
    { no: 13, unit: "م2", qty: 157, description: "لياسة/طرطشة أسمنتية للأسطح الخارجية", unitPrice: 50, totalPrice: 7850, mandatory: "نعم" },
    { no: 14, unit: "م2", qty: 253, description: "لياسة/طرطشة أسمنتية للأسطح الداخلية", unitPrice: 45, totalPrice: 11385, mandatory: "نعم" },
    { no: 15, unit: "م2", qty: 71, description: "لياسة للأسقف", unitPrice: 55, totalPrice: 3905, mandatory: "نعم" },
    { no: 16, unit: "م2", qty: 371, description: "دهانات للواجهات الخارجية", unitPrice: 35, totalPrice: 12985, mandatory: "نعم" },
    { no: 17, unit: "م2", qty: 263, description: "دهان الحوائط الداخلية", unitPrice: 30, totalPrice: 7890, mandatory: "نعم" },
    { no: 18, unit: "م2", qty: 12, description: "بلاط سيراميك مزجج 150×150×6 مم", unitPrice: 160, totalPrice: 1920, mandatory: "نعم" },
    { no: 19, unit: "م2", qty: 71, description: "دهانات أسقف", unitPrice: 30, totalPrice: 2130, mandatory: "نعم" },
    { no: 20, unit: "م2", qty: 3, description: "شرائح ألومنيوم بعرض 100مم", unitPrice: 250, totalPrice: 750, mandatory: "نعم" },
    { no: 21, unit: "م2", qty: 72, description: "بلاط سيراميك غير مزجج 300×300×9 مم", unitPrice: 120, totalPrice: 8640, mandatory: "نعم" },
    { no: 22, unit: "م2", qty: 7, description: "بلاط سيراميك غير مزجج 150×150×7.5 مم", unitPrice: 140, totalPrice: 980, mandatory: "نعم" },
    { no: 23, unit: "عدد", qty: 1, description: "لوح رخام تحت الأبواب (نعلة) سمك 30مم وعمق 200مم", unitPrice: 350, totalPrice: 350, mandatory: "لا" },
    { no: 24, unit: "عدد", qty: 1, description: "رخام درج نائم وقائم مع مادة عدم الانزلاق", unitPrice: 1200, totalPrice: 1200, mandatory: "لا" },
    { no: 25, unit: "متر", qty: 76, description: "وزرة سيراميك مزجج 300×100 مم", unitPrice: 45, totalPrice: 3420, mandatory: "نعم" },
    { no: 26, unit: "عدد", qty: 1, description: "باب D-1 مقاس 2200×1500 مم", unitPrice: 3200, totalPrice: 3200, mandatory: "نعم" },
    { no: 27, unit: "عدد", qty: 2, description: "باب D-2 مقاس 2200×1000 مم", unitPrice: 2500, totalPrice: 5000, mandatory: "نعم" },
    { no: 28, unit: "عدد", qty: 1, description: "باب D-3 مقاس 2200×900 مم", unitPrice: 2200, totalPrice: 2200, mandatory: "نعم" },
    { no: 29, unit: "عدد", qty: 1, description: "باب D-4 مقاس 2200×800 مم", unitPrice: 2000, totalPrice: 2000, mandatory: "نعم" },
    { no: 30, unit: "عدد", qty: 1, description: "باب D-5 مقاس 2200×800 مم", unitPrice: 2000, totalPrice: 2000, mandatory: "نعم" },
    { no: 31, unit: "عدد", qty: 1, description: "شباك w-1 مقاس 1200×900 مم", unitPrice: 1400, totalPrice: 1400, mandatory: "نعم" },
    { no: 32, unit: "عدد", qty: 1, description: "شباك w-2 مقاس 600×600 مم", unitPrice: 900, totalPrice: 900, mandatory: "نعم" },
    { no: 33, unit: "عدد", qty: 1, description: "شباك w-3 مقاس 1400×1000 مم", unitPrice: 1600, totalPrice: 1600, mandatory: "نعم" },
    { no: 34, unit: "عدد", qty: 2, description: "شباك w-4 مقاس 500×2000 مم", unitPrice: 1500, totalPrice: 3000, mandatory: "نعم" },
    { no: 35, unit: "م2", qty: 86, description: "نظام العزل الأفقي للسطح (خرسانة ميول+بيتومين+بوليسترين+بحص)", unitPrice: 250, totalPrice: 21500, mandatory: "نعم" },
    { no: 36, unit: "متر", qty: 39, description: "قضيب ألومنيوم upstand 100مم مع فلاش", unitPrice: 100, totalPrice: 3900, mandatory: "لا" },
    { no: 37, unit: "عدد", qty: 1, description: "مرحاض شرقي صيني كامل بصندوق الطرد والشاطف", unitPrice: 800, totalPrice: 800, mandatory: "نعم" },
    { no: 38, unit: "عدد", qty: 1, description: "حوض غسيل مفرد مع مرآة 800×900 وخلاط", unitPrice: 1500, totalPrice: 1500, mandatory: "نعم" },
    { no: 39, unit: "عدد", qty: 1, description: "حامل ورق تواليت ستانلس ستيل", unitPrice: 150, totalPrice: 150, mandatory: "نعم" },
    { no: 40, unit: "عدد", qty: 1, description: "موزع ورق مغاسل ستانلس ستيل", unitPrice: 350, totalPrice: 350, mandatory: "نعم" },
    { no: 41, unit: "عدد", qty: 1, description: "حامل مناشف ستانلس ستيل", unitPrice: 180, totalPrice: 180, mandatory: "نعم" },
    { no: 42, unit: "عدد", qty: 1, description: "حامل صابون ستانلس ستيل", unitPrice: 120, totalPrice: 120, mandatory: "نعم" },
    { no: 43, unit: "عدد", qty: 1, description: "حاملة ملابس ستانلس ستيل 3 قطع", unitPrice: 250, totalPrice: 250, mandatory: "نعم" },
    { no: 44, unit: "عدد", qty: 1, description: "لوحات إرشادية داخلية وخارجية عربي/انجليزي", unitPrice: 3500, totalPrice: 3500, mandatory: "لا" },
    { no: 45, unit: "عدد", qty: 1, description: "نظام المفتاح الرئيسي مع مفاتيح فرعية", unitPrice: 8000, totalPrice: 8000, mandatory: "لا" },
    { no: 46, unit: "عدد", qty: 1, description: "سلم معدني حديد مجلفن ارتفاع 4.50م", unitPrice: 12000, totalPrice: 12000, mandatory: "نعم" },
    { no: 47, unit: "عدد", qty: 1, description: "صندوق معدني لمفاتيح كبائن السلاح (مواصفات وزارة الدفاع)", unitPrice: 12000, totalPrice: 12000, mandatory: "لا" },
    { no: 48, unit: "متر", qty: 2, description: "مواسير قطر 32 مم", unitPrice: 55, totalPrice: 110, mandatory: "نعم" },
    { no: 49, unit: "متر", qty: 3, description: "مواسير قطر 25 مم", unitPrice: 45, totalPrice: 135, mandatory: "نعم" },
    { no: 50, unit: "متر", qty: 2, description: "مواسير قطر 20 مم", unitPrice: 40, totalPrice: 80, mandatory: "نعم" },
    { no: 51, unit: "متر", qty: 3, description: "مواسير قطر 25 مم (صرف)", unitPrice: 40, totalPrice: 120, mandatory: "نعم" },
    { no: 52, unit: "متر", qty: 2, description: "مواسير قطر 20 مم (صرف)", unitPrice: 35, totalPrice: 70, mandatory: "نعم" },
    { no: 53, unit: "عدد", qty: 1, description: "سخان مياه كهربائي 50 لتر 2KW", unitPrice: 1600, totalPrice: 1600, mandatory: "نعم" },
    { no: 54, unit: "متر", qty: 2, description: "مواسير صرف قطر 110مم", unitPrice: 85, totalPrice: 170, mandatory: "نعم" },
    { no: 55, unit: "متر", qty: 2, description: "مواسير صرف قطر 50مم", unitPrice: 55, totalPrice: 110, mandatory: "نعم" },
    { no: 56, unit: "متر", qty: 6, description: "مواسير صرف قطر 50مم", unitPrice: 55, totalPrice: 330, mandatory: "نعم" },
    { no: 57, unit: "عدد", qty: 1, description: "أغطية مواسير قطر 50مم", unitPrice: 80, totalPrice: 80, mandatory: "لا" },
    { no: 58, unit: "عدد", qty: 1, description: "صفاية أرضية قطر 50 مم", unitPrice: 120, totalPrice: 120, mandatory: "لا" },
    { no: 59, unit: "عدد", qty: 2, description: "طبة تسليك أرضية قطر 110 مم", unitPrice: 100, totalPrice: 200, mandatory: "لا" },
    { no: 60, unit: "عدد", qty: 2, description: "صفايات سطح مع مصافي 110مم حديد زهر", unitPrice: 450, totalPrice: 900, mandatory: "لا" },
    { no: 61, unit: "متر", qty: 9, description: "مواسير 75مم بولي إيثيلين درجة رابعة", unitPrice: 75, totalPrice: 675, mandatory: "نعم" },
    { no: 62, unit: "عدد", qty: 1, description: "طفاية حريق بودرة جافة 30 كيلو متحركة على عجل", unitPrice: 3200, totalPrice: 3200, mandatory: "لا" },
    { no: 63, unit: "عدد", qty: 2, description: "اسطوانات سعة 28 لتر", unitPrice: 2800, totalPrice: 5600, mandatory: "لا" },
    { no: 64, unit: "عدد", qty: 2, description: "صمامات تحكم قطر 1/4-1 بوصة", unitPrice: 350, totalPrice: 700, mandatory: "لا" },
    { no: 65, unit: "عدد", qty: 8, description: "رشاشات قطر 3/4 بوصة", unitPrice: 250, totalPrice: 2000, mandatory: "لا" },
    { no: 66, unit: "عدد", qty: 2, description: "وحدة سحب يدوية (إنذار حريق)", unitPrice: 650, totalPrice: 1300, mandatory: "لا" },
    { no: 67, unit: "عدد", qty: 1, description: "جرس انذار مزود بمؤشر بصري", unitPrice: 1200, totalPrice: 1200, mandatory: "لا" },
    { no: 68, unit: "عدد", qty: 2, description: "حساسات دخان", unitPrice: 450, totalPrice: 900, mandatory: "لا" },
    { no: 69, unit: "عدد", qty: 1, description: "لوحة تحكم إنذار حريق", unitPrice: 8500, totalPrice: 8500, mandatory: "لا" },
  ]
};

const section2 = {
  name: "أعمال الموقع العام",
  total: 185535,
  items: [
    { no: 1, unit: "م2", qty: 382, description: "طبقة أساس حصوية سمك 200مم أسفل الأسفلت والأرصفة مع دك 95%", unitPrice: 40, totalPrice: 15280, mandatory: "نعم" },
    { no: 2, unit: "م2", qty: 260, description: "توريد وتنفيذ طبقة أسفلت بسمك 50مم", unitPrice: 95, totalPrice: 24700, mandatory: "نعم" },
    { no: 3, unit: "متر", qty: 72, description: "بردورات خرسانية سابقة الصب مقاس 150×300×500 مم", unitPrice: 85, totalPrice: 6120, mandatory: "نعم" },
    { no: 4, unit: "م2", qty: 55, description: "بلاط متداخل بسمك 80مم لمواقف السيارات", unitPrice: 155, totalPrice: 8525, mandatory: "نعم" },
    { no: 5, unit: "م2", qty: 67, description: "أرصفة بلاط متداخل بسمك 60مم", unitPrice: 130, totalPrice: 8710, mandatory: "نعم" },
    { no: 6, unit: "عدد", qty: 10, description: "حواجز خرسانية (بولارد) بأبعاد 150×700مم", unitPrice: 1200, totalPrice: 12000, mandatory: "نعم" },
    { no: 7, unit: "متر", qty: 92, description: "سور شبك حديدي بارتفاع 2 متر على قواعد خرسانية", unitPrice: 185, totalPrice: 17020, mandatory: "نعم" },
    { no: 8, unit: "عدد", qty: 1, description: "بوابة حديدية جرارة بعرض 6 متر وارتفاع 2 متر مع محرك كهربائي وريموت", unitPrice: 45000, totalPrice: 45000, mandatory: "نعم" },
    { no: 9, unit: "عدد", qty: 1, description: "بوابة حديدية مشاة بعرض 1 متر وارتفاع 2 متر", unitPrice: 4500, totalPrice: 4500, mandatory: "نعم" },
    { no: 10, unit: "م2", qty: 104, description: "مظلات معدنية مقاومة للحريق من هيكل حديدي وتغطية ساندوتش بانل", unitPrice: 420, totalPrice: 43680, mandatory: "نعم" },
  ]
};

const section3 = {
  name: "أعمال الكهرباء والإتصالات",
  total: 826650,
  items: [
    { no: 1, unit: "عدد", qty: 1, description: "لوحة توزيع داخلية DB (380/220V, 60Hz) بقاطع رئيسي 80A مع قواطع فرعية", unitPrice: 22000, totalPrice: 22000, mandatory: "نعم" },
    { no: 2, unit: "عدد", qty: 2, description: "مروحة شفط 50 CFM مع مجرى ومخرج", unitPrice: 1500, totalPrice: 3000, mandatory: "نعم" },
    { no: 3, unit: "عدد", qty: 8, description: "مفتاح إنارة مفرد 10A", unitPrice: 220, totalPrice: 1760, mandatory: "نعم" },
    { no: 4, unit: "عدد", qty: 6, description: "بريزة كهرباء أرضية 16A مزدوجة", unitPrice: 550, totalPrice: 3300, mandatory: "نعم" },
    { no: 5, unit: "عدد", qty: 1, description: "نقطة هاتف", unitPrice: 450, totalPrice: 450, mandatory: "نعم" },
    { no: 6, unit: "عدد", qty: 3, description: "إنارة فلورسنت LED 2x18W مقاس 600×600", unitPrice: 950, totalPrice: 2850, mandatory: "نعم" },
    { no: 7, unit: "عدد", qty: 3, description: "إنارة فلورسنت LED 1x18W مقاس 600×200", unitPrice: 750, totalPrice: 2250, mandatory: "نعم" },
    { no: 8, unit: "عدد", qty: 2, description: "إنارة فلورسنت LED 2x18W مقاس 600×300 مقاومة للرطوبة IP54", unitPrice: 1200, totalPrice: 2400, mandatory: "نعم" },
    { no: 9, unit: "عدد", qty: 1, description: "إنارة LED خارجية 60W بجسم ألومنيوم مقاوم للماء IP65", unitPrice: 1800, totalPrice: 1800, mandatory: "نعم" },
    { no: 10, unit: "عدد", qty: 1, description: "نظام أرضي (Earthing) للمبنى", unitPrice: 15000, totalPrice: 15000, mandatory: "نعم" },
    { no: 11, unit: "عدد", qty: 6, description: "أعمدة إنارة LED بارتفاع 4 متر حديد مجلفن ذراع واحد IP65", unitPrice: 5200, totalPrice: 31200, mandatory: "نعم" },
    { no: 12, unit: "عدد", qty: 2, description: "وحدة إنارة سقف مظلات 1x100W SA IP65", unitPrice: 2200, totalPrice: 4400, mandatory: "نعم" },
    { no: 13, unit: "عدد", qty: 1, description: "محطة تحويل مدمجة 200 KVA مع RMU 17.5kV + لوحة MDPB بقاطع 300A", unitPrice: 265000, totalPrice: 265000, mandatory: "نعم" },
    { no: 14, unit: "عدد", qty: 1, description: "لوحة توزيع إنارة SLP (380/220V) بقاطع MCCB 100A تركيب خارجي", unitPrice: 28000, totalPrice: 28000, mandatory: "نعم" },
    { no: 15, unit: "متر", qty: 360, description: "كابل ضغط متوسط 3Cx300mm² CU/XLPE/SWA/PVC 15KV تحت الأرض مع حفر وردم", unitPrice: 1100, totalPrice: 396000, mandatory: "نعم" },
    { no: 16, unit: "متر", qty: 17, description: "كابل 4Cx10mm² + 1x6mm² E 0.6/1KV تحت الأرض", unitPrice: 120, totalPrice: 2040, mandatory: "نعم" },
    { no: 17, unit: "متر", qty: 40, description: "كابل 4Cx25mm² + 1Cx16mm² E 0.6/1KV تحت الأرض", unitPrice: 180, totalPrice: 7200, mandatory: "نعم" },
    { no: 18, unit: "عدد", qty: 1, description: "غرفة تفتيش كهرباء 800×800مم خرسانة مسلحة مع غطاء حديد زهر", unitPrice: 6500, totalPrice: 6500, mandatory: "نعم" },
    { no: 19, unit: "عدد", qty: 1, description: "غرفة تفتيش كهرباء 400×400مم", unitPrice: 3500, totalPrice: 3500, mandatory: "لا" },
    { no: 20, unit: "عدد", qty: 2, description: "غرفة تفتيش اتصالات 400×400مم", unitPrice: 3500, totalPrice: 7000, mandatory: "نعم" },
    { no: 21, unit: "متر", qty: 60, description: "حفر لمجارى كابلات بيانات مع ماسورة PVC 110مم + كابل تلفون + فايبر", unitPrice: 350, totalPrice: 21000, mandatory: "نعم" },
  ]
};

const section4 = {
  name: "الأثاث",
  total: 462500,
  items: [
    { no: 1, unit: "عدد", qty: 37, description: "خزانة أسلحة متنوعة مع كامل المحتويات والاكسسوارات طبقا لمواصفات وزارة الدفاع CODE-12643-6", unitPrice: 12500, totalPrice: 462500, mandatory: "لا" },
  ]
};

const allSections = [section1, section2, section3, section4];

// ===== BUILD WORKBOOK =====
const wb = XLSX.utils.book_new();

// === SHEET 1: Summary ===
const summaryData = [
  ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي"],
  ["الرقم المرجعي: 260439007329"],
  ["مدة التنفيذ: 360 يوم"],
  ["مكان التنفيذ: الرياض"],
  ["تاريخ التسعير: " + new Date().toLocaleDateString('ar-SA')],
  [],
  ["ملخص التسعير"],
  ["م", "القسم", "عدد البنود", "الإجمالي (ريال)"],
];

let grandTotal = 0;
allSections.forEach((s, i) => {
  summaryData.push([i + 1, s.name, s.items.length, s.total]);
  grandTotal += s.total;
});

summaryData.push([]);
summaryData.push(["", "الإجمالي قبل الضريبة", "", grandTotal]);
const vat = Math.round(grandTotal * 0.15);
summaryData.push(["", "ضريبة القيمة المضافة (15%)", "", vat]);
summaryData.push(["", "الإجمالي بعد الضريبة", "", grandTotal + vat]);

const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

// Set column widths
summarySheet['!cols'] = [
  { wch: 5 },
  { wch: 35 },
  { wch: 15 },
  { wch: 20 }
];

XLSX.utils.book_append_sheet(wb, summarySheet, "ملخص التسعير");

// === SHEET 2-5: Each Section ===
allSections.forEach((section, sIdx) => {
  const sheetData = [
    ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي - 360 يوم"],
    [],
    [section.name],
    ["الرقم التسلسلي", "البند", "وحدة القياس", "الكمية", "وصف البند", "منتج من القائمة الإلزامية", "السعر الافرادي", "السعر الإجمالي"],
  ];

  section.items.forEach(item => {
    sheetData.push([
      item.no,
      item.no,
      item.unit,
      item.qty,
      item.description,
      item.mandatory,
      item.unitPrice,
      item.totalPrice
    ]);
  });

  sheetData.push([]);
  sheetData.push(["", "", "", "", "إجمالي " + section.name, "", "", section.total]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 8 },
    { wch: 6 },
    { wch: 12 },
    { wch: 8 },
    { wch: 80 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 }
  ];

  // Right-to-left
  ws['!sheetViews'] = [{ rightToLeft: true }];

  XLSX.utils.book_append_sheet(wb, ws, section.name.substring(0, 31));
});

// === SHEET 6: Combined BOQ ===
const combinedData = [
  ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي - 360 يوم"],
  ["الرقم المرجعي 260439007329"],
  [],
];

allSections.forEach(section => {
  combinedData.push([section.name]);
  combinedData.push(["الرقم التسلسلي", "الفئة", "البند", "وحدة القياس", "الكمية", "وصف البند", "المواصفات", "منتج من القائمة الإلزامية", "السعر الافرادي", "السعر الإجمالي"]);
  
  section.items.forEach(item => {
    combinedData.push([
      item.no,
      "",
      item.no,
      item.unit,
      item.qty,
      item.description,
      "",
      item.mandatory,
      item.unitPrice,
      item.totalPrice
    ]);
  });

  combinedData.push([]);
  combinedData.push(["", "", "", "", "", "إجمالي " + section.name, "", "", "", section.total]);
  combinedData.push([]);
});

combinedData.push([]);
combinedData.push(["", "", "", "", "", "الإجمالي قبل الضريبة", "", "", "", grandTotal]);
combinedData.push(["", "", "", "", "", "ضريبة القيمة المضافة (15%)", "", "", "", vat]);
combinedData.push(["", "", "", "", "", "الإجمالي بعد الضريبة", "", "", "", grandTotal + vat]);

const combinedSheet = XLSX.utils.aoa_to_sheet(combinedData);
combinedSheet['!cols'] = [
  { wch: 8 },
  { wch: 6 },
  { wch: 6 },
  { wch: 12 },
  { wch: 8 },
  { wch: 80 },
  { wch: 12 },
  { wch: 18 },
  { wch: 15 },
  { wch: 18 }
];

XLSX.utils.book_append_sheet(wb, combinedSheet, "جدول الكميات المسعر");

// Write file
const outputPath = path.join('C:\\Users\\ksuib\\Desktop\\ملفات جديدة\\تسعير مستودع بالرياض', 'مسودة مشروع مستودع الرياض - مسعر.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('Excel file created successfully at:');
console.log(outputPath);
console.log('\nGrand Total (excl. VAT): ' + grandTotal.toLocaleString() + ' SAR');
console.log('VAT (15%): ' + vat.toLocaleString() + ' SAR');
console.log('Grand Total (incl. VAT): ' + (grandTotal + vat).toLocaleString() + ' SAR');
console.log('\nSection Breakdown:');
allSections.forEach(s => {
  console.log('  ' + s.name + ': ' + s.total.toLocaleString() + ' SAR (' + s.items.length + ' items)');
});
