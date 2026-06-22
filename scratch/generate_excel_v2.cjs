const XLSX = require('xlsx');
const path = require('path');

// ===== REVISED PRICING BASED ON REAL SAUDI MARKET DATA 2026 =====
// Key corrections:
// 1. Concrete: Ready-mix 200-230 SAR/m³, total with rebar+formwork ~800-1200 SAR/m³
// 2. MV Cable: ~395 SAR/m for cable only, with trenching ~550-650 SAR/m 
// 3. Compact Substation: Transformer 15-20K, RMU 35-45K, total ~120-160K
// 4. Weapons cabinets: Military spec via manufacturers, realistic 4,000-8,000 SAR/ea
// 5. Sliding gate: Body 3-5K + motor 3-4.5K = total 8-15K not 45K
// 6. Fence: 80-150 SAR/m not 185

const section1 = {
  name: "مستودع السلاح",
  items: [
    { no: 1, unit: "م3", qty: 236, description: "حفر لزوم الأساسات شاملة القواعد و الميدات وكل العناصر تحت منسوب الأرض", unitPrice: 25, mandatory: "لا" },
    { no: 2, unit: "م3", qty: 198, description: "إعـادة ردم حول الأسـاسات مع الدك للوصول النسبة 95%", unitPrice: 22, mandatory: "لا" },
    { no: 3, unit: "م3", qty: 35, description: "طبقة حصوية بسمك 150مم أسفل البلاطة المسلحة مع الدك 95%", unitPrice: 45, mandatory: "لا" },
    { no: 4, unit: "م3", qty: 6, description: "خرسانة عادية أسفل القواعد والكمرات الأرضية", unitPrice: 280, mandatory: "نعم" },
    { no: 5, unit: "م3", qty: 19, description: "خرسانة مسلحة للقواعد المسلحة ورقاب الأعمدة والكمرات الارضية", unitPrice: 1100, mandatory: "نعم" },
    { no: 6, unit: "م3", qty: 8, description: "خرسانة مسلحة لبلاطة الأرضيات سمك 14 سم", unitPrice: 1200, mandatory: "نعم" },
    { no: 7, unit: "م3", qty: 19, description: "خرسانة للأعمدة وكمرات السقف والبلاطة المسلحة وحوائط الدراوي", unitPrice: 1400, mandatory: "نعم" },
    { no: 8, unit: "م2", qty: 135, description: "طبقة حماية بولي إيثيلين سمك 0.20 مم", unitPrice: 12, mandatory: "نعم" },
    { no: 9, unit: "م2", qty: 136, description: "دهان بيتومين عازل للرطوبة وجهين متعامدين", unitPrice: 25, mandatory: "نعم" },
    { no: 10, unit: "م2", qty: 98, description: "بلوك أسمنتي معزول 200مم حوائط خارجية", unitPrice: 85, mandatory: "نعم" },
    { no: 11, unit: "م2", qty: 60, description: "بلوك أسمنتي غير معزول 200مم حوائط داخلية", unitPrice: 65, mandatory: "نعم" },
    { no: 12, unit: "م2", qty: 5, description: "ألواح جيبس بورد", unitPrice: 85, mandatory: "نعم" },
    { no: 13, unit: "م2", qty: 157, description: "لياسة/طرطشة أسمنتية للأسطح الخارجية", unitPrice: 38, mandatory: "نعم" },
    { no: 14, unit: "م2", qty: 253, description: "لياسة/طرطشة أسمنتية للأسطح الداخلية", unitPrice: 35, mandatory: "نعم" },
    { no: 15, unit: "م2", qty: 71, description: "لياسة للأسقف", unitPrice: 42, mandatory: "نعم" },
    { no: 16, unit: "م2", qty: 371, description: "دهانات للواجهات الخارجية", unitPrice: 28, mandatory: "نعم" },
    { no: 17, unit: "م2", qty: 263, description: "دهان الحوائط الداخلية", unitPrice: 22, mandatory: "نعم" },
    { no: 18, unit: "م2", qty: 12, description: "بلاط سيراميك مزجج 150×150×6 مم", unitPrice: 120, mandatory: "نعم" },
    { no: 19, unit: "م2", qty: 71, description: "دهانات أسقف", unitPrice: 25, mandatory: "نعم" },
    { no: 20, unit: "م2", qty: 3, description: "شرائح ألومنيوم بعرض 100مم", unitPrice: 180, mandatory: "نعم" },
    { no: 21, unit: "م2", qty: 72, description: "بلاط سيراميك غير مزجج 300×300×9 مم", unitPrice: 95, mandatory: "نعم" },
    { no: 22, unit: "م2", qty: 7, description: "بلاط سيراميك غير مزجج 150×150×7.5 مم", unitPrice: 110, mandatory: "نعم" },
    { no: 23, unit: "عدد", qty: 1, description: "لوح رخام تحت الأبواب (نعلة) سمك 30مم وعمق 200مم", unitPrice: 250, mandatory: "لا" },
    { no: 24, unit: "عدد", qty: 1, description: "رخام درج نائم وقائم مع مادة عدم الانزلاق", unitPrice: 800, mandatory: "لا" },
    { no: 25, unit: "متر", qty: 76, description: "وزرة سيراميك مزجج 300×100 مم", unitPrice: 35, mandatory: "نعم" },
    { no: 26, unit: "عدد", qty: 1, description: "باب D-1 مقاس 2200×1500 مم", unitPrice: 2800, mandatory: "نعم" },
    { no: 27, unit: "عدد", qty: 2, description: "باب D-2 مقاس 2200×1000 مم", unitPrice: 2000, mandatory: "نعم" },
    { no: 28, unit: "عدد", qty: 1, description: "باب D-3 مقاس 2200×900 مم", unitPrice: 1800, mandatory: "نعم" },
    { no: 29, unit: "عدد", qty: 1, description: "باب D-4 مقاس 2200×800 مم", unitPrice: 1500, mandatory: "نعم" },
    { no: 30, unit: "عدد", qty: 1, description: "باب D-5 مقاس 2200×800 مم", unitPrice: 1500, mandatory: "نعم" },
    { no: 31, unit: "عدد", qty: 1, description: "شباك w-1 مقاس 1200×900 مم", unitPrice: 1000, mandatory: "نعم" },
    { no: 32, unit: "عدد", qty: 1, description: "شباك w-2 مقاس 600×600 مم", unitPrice: 650, mandatory: "نعم" },
    { no: 33, unit: "عدد", qty: 1, description: "شباك w-3 مقاس 1400×1000 مم", unitPrice: 1200, mandatory: "نعم" },
    { no: 34, unit: "عدد", qty: 2, description: "شباك w-4 مقاس 500×2000 مم", unitPrice: 1100, mandatory: "نعم" },
    { no: 35, unit: "م2", qty: 86, description: "نظام العزل الأفقي للسطح (خرسانة ميول+بيتومين+بوليسترين+بحص)", unitPrice: 180, mandatory: "نعم" },
    { no: 36, unit: "متر", qty: 39, description: "قضيب ألومنيوم upstand 100مم مع فلاش", unitPrice: 75, mandatory: "لا" },
    { no: 37, unit: "عدد", qty: 1, description: "مرحاض شرقي صيني كامل بصندوق الطرد والشاطف", unitPrice: 550, mandatory: "نعم" },
    { no: 38, unit: "عدد", qty: 1, description: "حوض غسيل مفرد مع مرآة 800×900 وخلاط", unitPrice: 1100, mandatory: "نعم" },
    { no: 39, unit: "عدد", qty: 1, description: "حامل ورق تواليت ستانلس ستيل", unitPrice: 85, mandatory: "نعم" },
    { no: 40, unit: "عدد", qty: 1, description: "موزع ورق مغاسل ستانلس ستيل", unitPrice: 250, mandatory: "نعم" },
    { no: 41, unit: "عدد", qty: 1, description: "حامل مناشف ستانلس ستيل", unitPrice: 120, mandatory: "نعم" },
    { no: 42, unit: "عدد", qty: 1, description: "حامل صابون ستانلس ستيل", unitPrice: 80, mandatory: "نعم" },
    { no: 43, unit: "عدد", qty: 1, description: "حاملة ملابس ستانلس ستيل 3 قطع", unitPrice: 150, mandatory: "نعم" },
    { no: 44, unit: "عدد", qty: 1, description: "لوحات إرشادية داخلية وخارجية عربي/انجليزي", unitPrice: 2500, mandatory: "لا" },
    { no: 45, unit: "عدد", qty: 1, description: "نظام المفتاح الرئيسي مع مفاتيح فرعية", unitPrice: 4000, mandatory: "لا" },
    { no: 46, unit: "عدد", qty: 1, description: "سلم معدني حديد مجلفن ارتفاع 4.50م", unitPrice: 8000, mandatory: "نعم" },
    { no: 47, unit: "عدد", qty: 1, description: "صندوق معدني لمفاتيح كبائن السلاح (مواصفات وزارة الدفاع)", unitPrice: 5000, mandatory: "لا" },
    { no: 48, unit: "متر", qty: 2, description: "مواسير قطر 32 مم", unitPrice: 45, mandatory: "نعم" },
    { no: 49, unit: "متر", qty: 3, description: "مواسير قطر 25 مم", unitPrice: 38, mandatory: "نعم" },
    { no: 50, unit: "متر", qty: 2, description: "مواسير قطر 20 مم", unitPrice: 32, mandatory: "نعم" },
    { no: 51, unit: "متر", qty: 3, description: "مواسير قطر 25 مم (صرف)", unitPrice: 35, mandatory: "نعم" },
    { no: 52, unit: "متر", qty: 2, description: "مواسير قطر 20 مم (صرف)", unitPrice: 30, mandatory: "نعم" },
    { no: 53, unit: "عدد", qty: 1, description: "سخان مياه كهربائي 50 لتر 2KW", unitPrice: 1200, mandatory: "نعم" },
    { no: 54, unit: "متر", qty: 2, description: "مواسير صرف قطر 110مم", unitPrice: 65, mandatory: "نعم" },
    { no: 55, unit: "متر", qty: 2, description: "مواسير صرف قطر 50مم", unitPrice: 45, mandatory: "نعم" },
    { no: 56, unit: "متر", qty: 6, description: "مواسير صرف قطر 50مم", unitPrice: 45, mandatory: "نعم" },
    { no: 57, unit: "عدد", qty: 1, description: "أغطية مواسير قطر 50مم", unitPrice: 50, mandatory: "لا" },
    { no: 58, unit: "عدد", qty: 1, description: "صفاية أرضية قطر 50 مم", unitPrice: 80, mandatory: "لا" },
    { no: 59, unit: "عدد", qty: 2, description: "طبة تسليك أرضية قطر 110 مم", unitPrice: 65, mandatory: "لا" },
    { no: 60, unit: "عدد", qty: 2, description: "صفايات سطح مع مصافي 110مم حديد زهر", unitPrice: 300, mandatory: "لا" },
    { no: 61, unit: "متر", qty: 9, description: "مواسير 75مم بولي إيثيلين درجة رابعة", unitPrice: 55, mandatory: "نعم" },
    { no: 62, unit: "عدد", qty: 1, description: "طفاية حريق بودرة جافة 30 كيلو متحركة على عجل", unitPrice: 2500, mandatory: "لا" },
    { no: 63, unit: "عدد", qty: 2, description: "اسطوانات سعة 28 لتر", unitPrice: 1800, mandatory: "لا" },
    { no: 64, unit: "عدد", qty: 2, description: "صمامات تحكم قطر 1/4-1 بوصة", unitPrice: 250, mandatory: "لا" },
    { no: 65, unit: "عدد", qty: 8, description: "رشاشات قطر 3/4 بوصة", unitPrice: 180, mandatory: "لا" },
    { no: 66, unit: "عدد", qty: 2, description: "وحدة سحب يدوية (إنذار حريق)", unitPrice: 450, mandatory: "لا" },
    { no: 67, unit: "عدد", qty: 1, description: "جرس انذار مزود بمؤشر بصري", unitPrice: 800, mandatory: "لا" },
    { no: 68, unit: "عدد", qty: 2, description: "حساسات دخان", unitPrice: 300, mandatory: "لا" },
    { no: 69, unit: "عدد", qty: 1, description: "لوحة تحكم إنذار حريق", unitPrice: 5500, mandatory: "لا" },
  ]
};

const section2 = {
  name: "أعمال الموقع العام",
  items: [
    { no: 1, unit: "م2", qty: 382, description: "طبقة أساس حصوية سمك 200مم أسفل الأسفلت والأرصفة مع دك 95%", unitPrice: 30, mandatory: "نعم" },
    { no: 2, unit: "م2", qty: 260, description: "توريد وتنفيذ طبقة أسفلت بسمك 50مم", unitPrice: 70, mandatory: "نعم" },
    { no: 3, unit: "متر", qty: 72, description: "بردورات خرسانية سابقة الصب مقاس 150×300×500 مم", unitPrice: 65, mandatory: "نعم" },
    { no: 4, unit: "م2", qty: 55, description: "بلاط متداخل بسمك 80مم لمواقف السيارات", unitPrice: 120, mandatory: "نعم" },
    { no: 5, unit: "م2", qty: 67, description: "أرصفة بلاط متداخل بسمك 60مم", unitPrice: 100, mandatory: "نعم" },
    { no: 6, unit: "عدد", qty: 10, description: "حواجز خرسانية (بولارد) بأبعاد 150×700مم", unitPrice: 800, mandatory: "نعم" },
    { no: 7, unit: "متر", qty: 92, description: "سور شبك حديدي بارتفاع 2 متر على قواعد خرسانية", unitPrice: 130, mandatory: "نعم" },
    { no: 8, unit: "عدد", qty: 1, description: "بوابة حديدية جرارة بعرض 6 متر وارتفاع 2 متر مع محرك كهربائي وريموت", unitPrice: 18000, mandatory: "نعم" },
    { no: 9, unit: "عدد", qty: 1, description: "بوابة حديدية مشاة بعرض 1 متر وارتفاع 2 متر", unitPrice: 3000, mandatory: "نعم" },
    { no: 10, unit: "م2", qty: 104, description: "مظلات معدنية مقاومة للحريق من هيكل حديدي وتغطية ساندوتش بانل", unitPrice: 320, mandatory: "نعم" },
  ]
};

const section3 = {
  name: "أعمال الكهرباء والإتصالات",
  items: [
    { no: 1, unit: "عدد", qty: 1, description: "لوحة توزيع داخلية DB (380/220V, 60Hz) بقاطع رئيسي 80A مع قواطع فرعية", unitPrice: 15000, mandatory: "نعم" },
    { no: 2, unit: "عدد", qty: 2, description: "مروحة شفط 50 CFM مع مجرى ومخرج", unitPrice: 850, mandatory: "نعم" },
    { no: 3, unit: "عدد", qty: 8, description: "مفتاح إنارة مفرد 10A", unitPrice: 120, mandatory: "نعم" },
    { no: 4, unit: "عدد", qty: 6, description: "بريزة كهرباء أرضية 16A مزدوجة", unitPrice: 350, mandatory: "نعم" },
    { no: 5, unit: "عدد", qty: 1, description: "نقطة هاتف", unitPrice: 300, mandatory: "نعم" },
    { no: 6, unit: "عدد", qty: 3, description: "إنارة فلورسنت LED 2x18W مقاس 600×600", unitPrice: 650, mandatory: "نعم" },
    { no: 7, unit: "عدد", qty: 3, description: "إنارة فلورسنت LED 1x18W مقاس 600×200", unitPrice: 500, mandatory: "نعم" },
    { no: 8, unit: "عدد", qty: 2, description: "إنارة فلورسنت LED 2x18W مقاس 600×300 مقاومة للرطوبة IP54", unitPrice: 800, mandatory: "نعم" },
    { no: 9, unit: "عدد", qty: 1, description: "إنارة LED خارجية 60W بجسم ألومنيوم مقاوم للماء IP65", unitPrice: 1200, mandatory: "نعم" },
    { no: 10, unit: "عدد", qty: 1, description: "نظام أرضي (Earthing) للمبنى", unitPrice: 10000, mandatory: "نعم" },
    { no: 11, unit: "عدد", qty: 6, description: "أعمدة إنارة LED بارتفاع 4 متر حديد مجلفن ذراع واحد IP65", unitPrice: 3800, mandatory: "نعم" },
    { no: 12, unit: "عدد", qty: 2, description: "وحدة إنارة سقف مظلات 1x100W SA IP65", unitPrice: 1500, mandatory: "نعم" },
    { no: 13, unit: "عدد", qty: 1, description: "محطة تحويل مدمجة 200 KVA مع RMU 17.5kV + لوحة MDPB بقاطع 300A", unitPrice: 150000, mandatory: "نعم" },
    { no: 14, unit: "عدد", qty: 1, description: "لوحة توزيع إنارة SLP (380/220V) بقاطع MCCB 100A تركيب خارجي", unitPrice: 18000, mandatory: "نعم" },
    { no: 15, unit: "متر", qty: 360, description: "كابل ضغط متوسط 3Cx300mm² CU/XLPE/SWA/PVC 15KV تحت الأرض مع حفر وردم", unitPrice: 600, mandatory: "نعم" },
    { no: 16, unit: "متر", qty: 17, description: "كابل 4Cx10mm² + 1x6mm² E 0.6/1KV تحت الأرض", unitPrice: 80, mandatory: "نعم" },
    { no: 17, unit: "متر", qty: 40, description: "كابل 4Cx25mm² + 1Cx16mm² E 0.6/1KV تحت الأرض", unitPrice: 120, mandatory: "نعم" },
    { no: 18, unit: "عدد", qty: 1, description: "غرفة تفتيش كهرباء 800×800مم خرسانة مسلحة مع غطاء حديد زهر", unitPrice: 4500, mandatory: "نعم" },
    { no: 19, unit: "عدد", qty: 1, description: "غرفة تفتيش كهرباء 400×400مم", unitPrice: 2500, mandatory: "لا" },
    { no: 20, unit: "عدد", qty: 2, description: "غرفة تفتيش اتصالات 400×400مم", unitPrice: 2500, mandatory: "نعم" },
    { no: 21, unit: "متر", qty: 60, description: "حفر لمجارى كابلات بيانات مع ماسورة PVC 110مم + كابل تلفون + فايبر", unitPrice: 250, mandatory: "نعم" },
  ]
};

const section4 = {
  name: "الأثاث",
  items: [
    { no: 1, unit: "عدد", qty: 37, description: "خزانة أسلحة متنوعة مع كامل المحتويات والاكسسوارات طبقا لمواصفات وزارة الدفاع CODE-12643-6", unitPrice: 6500, mandatory: "لا" },
  ]
};

// Calculate totals
const allSections = [section1, section2, section3, section4];
allSections.forEach(s => {
  s.items.forEach(item => {
    item.totalPrice = item.unitPrice * item.qty;
  });
  s.total = s.items.reduce((sum, item) => sum + item.totalPrice, 0);
});

const grandTotal = allSections.reduce((sum, s) => sum + s.total, 0);
const vat = Math.round(grandTotal * 0.15);

// ===== BUILD WORKBOOK =====
const wb = XLSX.utils.book_new();

// === SHEET 1: Summary ===
const summaryData = [
  ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي"],
  ["الرقم المرجعي: 260439007329"],
  ["مدة التنفيذ: 360 يوم | مكان التنفيذ: الرياض"],
  ["تاريخ التسعير: " + new Date().toLocaleDateString('ar-SA') + " (مراجعة ثانية - أسعار سوق محققة)"],
  [],
  ["ملخص التسعير"],
  ["م", "القسم", "عدد البنود", "الإجمالي (ريال)"],
];

allSections.forEach((s, i) => {
  summaryData.push([i + 1, s.name, s.items.length, s.total]);
});

summaryData.push([]);
summaryData.push(["", "الإجمالي قبل الضريبة", "", grandTotal]);
summaryData.push(["", "ضريبة القيمة المضافة (15%)", "", vat]);
summaryData.push(["", "الإجمالي بعد الضريبة", "", grandTotal + vat]);
summaryData.push([]);
summaryData.push(["", "تكلفة المتر المربع للمبنى (شامل كل شيء)", "", Math.round(grandTotal / 85.5)]);

const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
summarySheet['!cols'] = [{ wch: 5 }, { wch: 45 }, { wch: 15 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, summarySheet, "ملخص التسعير");

// === SHEETS for each section ===
allSections.forEach(section => {
  const sheetData = [
    ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي - 360 يوم"],
    [],
    [section.name],
    ["الرقم التسلسلي", "البند", "وحدة القياس", "الكمية", "وصف البند", "منتج من القائمة الإلزامية", "السعر الافرادي", "السعر الإجمالي"],
  ];
  section.items.forEach(item => {
    sheetData.push([item.no, item.no, item.unit, item.qty, item.description, item.mandatory, item.unitPrice, item.totalPrice]);
  });
  sheetData.push([]);
  sheetData.push(["", "", "", "", "إجمالي " + section.name, "", "", section.total]);
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws['!cols'] = [{ wch: 8 }, { wch: 6 }, { wch: 12 }, { wch: 8 }, { wch: 80 }, { wch: 18 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, section.name.substring(0, 31));
});

// === Combined BOQ sheet ===
const combinedData = [
  ["انشاء وتجهيز وتأثيث مستودع بالرياض - قوات الدفاع الجوي - 360 يوم"],
  ["الرقم المرجعي 260439007329"],
  ["تسعير مراجع ومعدل - أسعار سوق الرياض 2026"],
  [],
];
allSections.forEach(section => {
  combinedData.push([section.name]);
  combinedData.push(["الرقم التسلسلي", "الفئة", "البند", "وحدة القياس", "الكمية", "وصف البند", "المواصفات", "منتج من القائمة الإلزامية", "السعر الافرادي", "السعر الإجمالي"]);
  section.items.forEach(item => {
    combinedData.push([item.no, "", item.no, item.unit, item.qty, item.description, "", item.mandatory, item.unitPrice, item.totalPrice]);
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
combinedSheet['!cols'] = [{ wch: 8 }, { wch: 6 }, { wch: 6 }, { wch: 12 }, { wch: 8 }, { wch: 80 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 18 }];
XLSX.utils.book_append_sheet(wb, combinedSheet, "جدول الكميات المسعر");

// Write file
const outputPath = path.join('C:\\Users\\ksuib\\Desktop\\ملفات جديدة\\تسعير مستودع بالرياض', 'مسودة مشروع مستودع الرياض - مسعر (مراجع).xlsx');
XLSX.writeFile(wb, outputPath);

console.log('=== REVISED PRICING REPORT ===');
console.log('File: ' + outputPath);
console.log('');
console.log('Grand Total (excl. VAT): ' + grandTotal.toLocaleString('en') + ' SAR');
console.log('VAT (15%): ' + vat.toLocaleString('en') + ' SAR');
console.log('Grand Total (incl. VAT): ' + (grandTotal + vat).toLocaleString('en') + ' SAR');
console.log('Cost per sqm (building): ' + Math.round(grandTotal / 85.5).toLocaleString('en') + ' SAR/m²');
console.log('');
console.log('Section Breakdown:');
allSections.forEach(s => {
  console.log('  ' + s.name + ': ' + s.total.toLocaleString('en') + ' SAR (' + s.items.length + ' items)');
});

// Print comparison
console.log('\n=== COMPARISON: OLD vs NEW ===');
const oldTotals = [295350, 185535, 826650, 462500];
const oldGrand = 1770035;
allSections.forEach((s, i) => {
  const diff = s.total - oldTotals[i];
  const pct = Math.round((diff / oldTotals[i]) * 100);
  console.log('  ' + s.name + ': ' + oldTotals[i].toLocaleString('en') + ' -> ' + s.total.toLocaleString('en') + ' (' + pct + '%)');
});
console.log('  TOTAL: ' + oldGrand.toLocaleString('en') + ' -> ' + grandTotal.toLocaleString('en') + ' (' + Math.round(((grandTotal - oldGrand) / oldGrand) * 100) + '%)');
