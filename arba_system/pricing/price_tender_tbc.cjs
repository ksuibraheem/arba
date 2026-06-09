/**
 * 🧠 ARBA Brain — TBC-FM-1226 School Tender Pricer
 * يسعر مطلب تأهيل 8 مدارس بالرياض تلقائياً
 * ويكشف الأخطاء والبنود الناقصة
 */
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════
// 1. أسعار السوق المرجعية — الرياض Q1 2026 (شاملة مواد + عمالة + ربح 15%)
// ═══════════════════════════════════════════════════
const MARKET_RATES = {
  // أعمال ترابية
  'حفر': { rate: 25, unit: 'م3', category: 'earthworks' },
  'ردم': { rate: 38, unit: 'م3', category: 'earthworks' },
  'دفان': { rate: 38, unit: 'م3', category: 'earthworks' },
  'تسوية': { rate: 12, unit: 'م2', category: 'earthworks' },
  'نقل مخلفات': { rate: 35, unit: 'م3', category: 'earthworks' },
  
  // خرسانة
  'خرسانة مسلحة': { rate: 1200, unit: 'م3', category: 'concrete' },
  'خرسانة 35': { rate: 1300, unit: 'م3', category: 'concrete' },
  'خرسانة عادية': { rate: 350, unit: 'م3', category: 'concrete' },
  'خرسانة نظافة': { rate: 300, unit: 'م3', category: 'concrete' },
  'صبة ميول': { rate: 280, unit: 'م3', category: 'concrete' },
  'ترميم خرساني': { rate: 450, unit: 'م2', category: 'concrete' },
  'معالجة شروخ': { rate: 180, unit: 'م.ط', category: 'concrete' },
  'حقن ايبوكسي': { rate: 200, unit: 'م.ط', category: 'concrete' },
  'حقن إيبوكسي': { rate: 200, unit: 'م.ط', category: 'concrete' },
  'تقوية كربون': { rate: 550, unit: 'م2', category: 'concrete' },
  'carbon fiber': { rate: 550, unit: 'م2', category: 'concrete' },
  'CFRP': { rate: 550, unit: 'م2', category: 'concrete' },
  'FRP': { rate: 480, unit: 'م2', category: 'concrete' },
  'تقوية اعمدة': { rate: 2800, unit: 'م3', category: 'concrete' },
  'قميص خرساني': { rate: 2800, unit: 'م3', category: 'concrete' },
  'jacketing': { rate: 2800, unit: 'م3', category: 'concrete' },
  
  // حديد
  'حديد تسليح': { rate: 3200, unit: 'طن', category: 'steel' },
  'حديد': { rate: 3200, unit: 'طن', category: 'steel' },
  
  // بلوك ومباني
  'بلوك 20': { rate: 80, unit: 'م2', category: 'masonry' },
  'بلوك 15': { rate: 65, unit: 'م2', category: 'masonry' },
  'بلوك': { rate: 75, unit: 'م2', category: 'masonry' },
  'مباني': { rate: 75, unit: 'م2', category: 'masonry' },
  
  // لياسة
  'لياسة': { rate: 40, unit: 'م2', category: 'plaster' },
  'لياسة خارجية': { rate: 45, unit: 'م2', category: 'plaster' },
  'لياسة داخلية': { rate: 38, unit: 'م2', category: 'plaster' },
  'طرطشة': { rate: 15, unit: 'م2', category: 'plaster' },
  
  // عزل
  'عزل مائي': { rate: 55, unit: 'م2', category: 'waterproofing' },
  'عزل حراري': { rate: 45, unit: 'م2', category: 'insulation' },
  'عزل': { rate: 50, unit: 'م2', category: 'waterproofing' },
  'ميمبرين': { rate: 60, unit: 'م2', category: 'waterproofing' },
  'بيتومين': { rate: 55, unit: 'م2', category: 'waterproofing' },
  'رولات': { rate: 60, unit: 'م2', category: 'waterproofing' },
  
  // بلاط وأرضيات
  'بلاط': { rate: 120, unit: 'م2', category: 'finishes' },
  'سيراميك': { rate: 110, unit: 'م2', category: 'finishes' },
  'بورسلين': { rate: 140, unit: 'م2', category: 'finishes' },
  'رخام': { rate: 280, unit: 'م2', category: 'finishes' },
  'جرانيت': { rate: 300, unit: 'م2', category: 'finishes' },
  'إنترلوك': { rate: 90, unit: 'م2', category: 'finishes' },
  'انترلوك': { rate: 90, unit: 'م2', category: 'finishes' },
  
  // دهانات
  'دهان': { rate: 35, unit: 'م2', category: 'paint' },
  'دهانات': { rate: 35, unit: 'م2', category: 'paint' },
  'طلاء': { rate: 35, unit: 'م2', category: 'paint' },
  'بوية': { rate: 35, unit: 'م2', category: 'paint' },
  'ايبوكسي ارضيات': { rate: 65, unit: 'م2', category: 'paint' },
  
  // جبس
  'جبس بورد': { rate: 85, unit: 'م2', category: 'finishes' },
  'جبس': { rate: 80, unit: 'م2', category: 'finishes' },
  'اسقف مستعارة': { rate: 75, unit: 'م2', category: 'finishes' },
  'سقف مستعار': { rate: 75, unit: 'م2', category: 'finishes' },
  
  // أبواب
  'باب خشب': { rate: 1800, unit: 'عدد', category: 'doors' },
  'باب حديد': { rate: 2500, unit: 'عدد', category: 'doors' },
  'باب ألمنيوم': { rate: 3500, unit: 'عدد', category: 'doors' },
  'باب': { rate: 2000, unit: 'عدد', category: 'doors' },
  'أبواب': { rate: 2000, unit: 'عدد', category: 'doors' },
  
  // شبابيك
  'شباك': { rate: 700, unit: 'م2', category: 'windows' },
  'نافذة': { rate: 700, unit: 'م2', category: 'windows' },
  'ألمنيوم': { rate: 750, unit: 'م2', category: 'windows' },
  
  // كهرباء
  'لوحة توزيع': { rate: 8000, unit: 'عدد', category: 'electrical' },
  'MDB': { rate: 45000, unit: 'عدد', category: 'electrical' },
  'SMDB': { rate: 25000, unit: 'عدد', category: 'electrical' },
  'لوحة كهرباء': { rate: 8000, unit: 'عدد', category: 'electrical' },
  'كيبل': { rate: 45, unit: 'م.ط', category: 'electrical' },
  'كابل': { rate: 45, unit: 'م.ط', category: 'electrical' },
  'إنارة': { rate: 280, unit: 'عدد', category: 'electrical' },
  'اناره': { rate: 280, unit: 'عدد', category: 'electrical' },
  'انارة': { rate: 280, unit: 'عدد', category: 'electrical' },
  'مفتاح': { rate: 65, unit: 'عدد', category: 'electrical' },
  'بريزة': { rate: 85, unit: 'عدد', category: 'electrical' },
  'مأخذ': { rate: 85, unit: 'عدد', category: 'electrical' },
  'تأريض': { rate: 2500, unit: 'عدد', category: 'electrical' },
  'UPS': { rate: 25000, unit: 'عدد', category: 'electrical' },
  'مولد': { rate: 180000, unit: 'عدد', category: 'electrical' },
  'محول': { rate: 95000, unit: 'عدد', category: 'electrical' },
  
  // تكييف
  'مكيف': { rate: 4500, unit: 'عدد', category: 'hvac' },
  'سبلت': { rate: 4500, unit: 'عدد', category: 'hvac' },
  'تكييف': { rate: 4500, unit: 'عدد', category: 'hvac' },
  'شباك تكييف': { rate: 2800, unit: 'عدد', category: 'hvac' },
  'دكت': { rate: 85, unit: 'م.ط', category: 'hvac' },
  'مراوح': { rate: 2800, unit: 'عدد', category: 'hvac' },
  'شفاط': { rate: 1200, unit: 'عدد', category: 'hvac' },
  
  // سباكة
  'مرحاض': { rate: 1200, unit: 'عدد', category: 'plumbing' },
  'كرسي افرنجي': { rate: 1400, unit: 'عدد', category: 'plumbing' },
  'افرنجى': { rate: 1400, unit: 'عدد', category: 'plumbing' },
  'كرسي شرقي': { rate: 800, unit: 'عدد', category: 'plumbing' },
  'شرقى': { rate: 800, unit: 'عدد', category: 'plumbing' },
  'مغسلة': { rate: 650, unit: 'عدد', category: 'plumbing' },
  'حنفية': { rate: 350, unit: 'عدد', category: 'plumbing' },
  'خلاط': { rate: 400, unit: 'عدد', category: 'plumbing' },
  'سيفون': { rate: 120, unit: 'عدد', category: 'plumbing' },
  'مواسير PPR': { rate: 45, unit: 'م.ط', category: 'plumbing' },
  'PPR': { rate: 45, unit: 'م.ط', category: 'plumbing' },
  'مواسير': { rate: 55, unit: 'م.ط', category: 'plumbing' },
  'خزان': { rate: 8000, unit: 'عدد', category: 'plumbing' },
  'فايبر جلاس': { rate: 5500, unit: 'عدد', category: 'plumbing' },
  'مضخة': { rate: 18000, unit: 'عدد', category: 'plumbing' },
  'بيارة': { rate: 35000, unit: 'عدد', category: 'plumbing' },
  'تسليك': { rate: 80, unit: 'عدد', category: 'plumbing' },
  
  // حريق
  'طفاية': { rate: 350, unit: 'عدد', category: 'fire' },
  'طفايه': { rate: 350, unit: 'عدد', category: 'fire' },
  'صندوق اطفاء': { rate: 2800, unit: 'عدد', category: 'fire' },
  'كابينة اطفاء': { rate: 3500, unit: 'عدد', category: 'fire' },
  'مضخات حريق': { rate: 120000, unit: 'عدد', category: 'fire' },
  'مضخات الحريق': { rate: 120000, unit: 'عدد', category: 'fire' },
  'HDPE': { rate: 85, unit: 'م.ط', category: 'fire' },
  'حديد مجلفن': { rate: 95, unit: 'م.ط', category: 'fire' },
  'وصلة سيامية': { rate: 3500, unit: 'عدد', category: 'fire' },
  'الوصلة السيامية': { rate: 3500, unit: 'عدد', category: 'fire' },
  'دفاع مدني': { rate: 15000, unit: 'مقطوعية', category: 'fire' },
  'إنذار': { rate: 280, unit: 'عدد', category: 'fire' },
  'كاشف دخان': { rate: 150, unit: 'عدد', category: 'fire' },
  
  // تنسيق موقع
  'زراعة': { rate: 80, unit: 'م2', category: 'landscaping' },
  'تشجير': { rate: 350, unit: 'عدد', category: 'landscaping' },
  'مظلة': { rate: 150, unit: 'م2', category: 'external' },
  'مظلات': { rate: 150, unit: 'م2', category: 'external' },
  'سور': { rate: 350, unit: 'م.ط', category: 'external' },
  'بوابة': { rate: 8000, unit: 'عدد', category: 'external' },
  'درابزين': { rate: 350, unit: 'م.ط', category: 'external' },
  'حديد مشغول': { rate: 450, unit: 'م.ط', category: 'external' },
  
  // صيانة عامة
  'إزالة': { rate: 20, unit: 'م2', category: 'demolition' },
  'تكسير': { rate: 25, unit: 'م2', category: 'demolition' },
  'هدم': { rate: 30, unit: 'م2', category: 'demolition' },
  'فك': { rate: 15, unit: 'م2', category: 'demolition' },
  'تنظيف': { rate: 8, unit: 'م2', category: 'cleaning' },
  'تعقيم': { rate: 2000, unit: 'عدد', category: 'cleaning' },
  'اختبار': { rate: 500, unit: 'عدد', category: 'testing' },
  'فحص': { rate: 500, unit: 'عدد', category: 'testing' },
  
  // أعمال متنوعة صيانة مدارس
  'مقطوعية': { rate: 5000, unit: 'مقطوعية', category: 'lumpsum' },
  'شدة خشبية': { rate: 45, unit: 'م2', category: 'formwork' },
  'شدات': { rate: 45, unit: 'م2', category: 'formwork' },
};

// ═══════════════════════════════════════════════════
// 2. محرك مطابقة الوصف مع السعر
// ═══════════════════════════════════════════════════
function matchItemToRate(desc, unit) {
  const d = desc.toLowerCase().replace(/\r\n/g, ' ');
  
  // Sort keywords by length (longer = more specific = higher priority)
  const keywords = Object.keys(MARKET_RATES).sort((a, b) => b.length - a.length);
  
  for (const keyword of keywords) {
    if (d.includes(keyword.toLowerCase())) {
      return { ...MARKET_RATES[keyword], matchedKeyword: keyword };
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════
// 3. قراءة ملف Excel وتسعير كل بند
// ═══════════════════════════════════════════════════
const filePath = path.join(__dirname, '..', '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
const wb = XLSX.readFile(filePath);

const schoolNames = [
  'ابتدائية الأبرار ومتوسطة عبدالله بن وهب',
  'الابتدائية السادسة',
  'الابتدائية السادسة والعشرون',
  'الثانوية التاسعة والعشرون',
  'الثانوية الثالثة',
  'الثانوية السابعة',
  'متوسطة ابن خلدون',
  'المبنى المخلى للثانوية الثانية بالدرعية',
];

const results = [];
const errors = [];
let grandTotal = 0;

// Process sheets 1-7 (school BOQs) — skip sheet 0 (summary) and 8 (empty)
for (let si = 1; si <= 7; si++) {
  const sheetName = wb.SheetNames[si];
  if (!sheetName) continue;
  
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  
  const schoolName = schoolNames[si - 1] || `مدرسة ${si}`;
  let schoolTotal = 0;
  let matched = 0;
  let unmatched = 0;
  let currentSection = '';
  const schoolItems = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const filtered = row.filter(c => c !== '');
    if (filtered.length === 0) continue;

    // Section header
    if (filtered.length <= 2 && typeof filtered[0] === 'string' && filtered[0].length > 5 && isNaN(Number(filtered[0]))) {
      currentSection = filtered[0].trim();
      continue;
    }

    // BOQ item
    if (typeof row[0] === 'number' && typeof row[1] === 'string' && row[1].length > 10) {
      const no = row[0];
      const desc = row[1].trim();
      const unit = (row[2] || '').toString().trim();
      const qty = row[3] || 0;

      const match = matchItemToRate(desc, unit);
      
      if (match) {
        const unitPrice = match.rate;
        const total = Math.round(unitPrice * qty);
        schoolTotal += total;
        matched++;
        
        schoolItems.push({
          no, desc: desc.substring(0, 100), unit, qty,
          unitPrice, total, category: match.category,
          matchedKeyword: match.matchedKeyword,
          status: '✅',
          section: currentSection,
        });
      } else {
        unmatched++;
        // Estimate based on unit type
        let estPrice = 0;
        if (unit === 'م2') estPrice = 50;
        else if (unit === 'م3') estPrice = 300;
        else if (unit === 'م.ط') estPrice = 60;
        else if (unit === 'عدد') estPrice = 500;
        else if (unit === 'مقطوعية') estPrice = 5000;
        else if (unit === 'طن') estPrice = 3000;
        else estPrice = 200;
        
        const total = Math.round(estPrice * qty);
        schoolTotal += total;
        
        schoolItems.push({
          no, desc: desc.substring(0, 100), unit, qty,
          unitPrice: estPrice, total, category: 'unmatched',
          matchedKeyword: '⚠️ تقدير',
          status: '⚠️',
          section: currentSection,
        });
        
        errors.push({
          school: schoolName, no, desc: desc.substring(0, 80),
          unit, qty, issue: 'لم يتم التعرف على البند — سعر تقديري',
        });
      }
    }
  }

  grandTotal += schoolTotal;
  
  results.push({
    school: schoolName,
    sheetName,
    totalItems: matched + unmatched,
    matched, unmatched,
    matchRate: Math.round((matched / (matched + unmatched)) * 100),
    schoolTotal,
    items: schoolItems,
  });
}

// ═══════════════════════════════════════════════════
// 4. تحليل الأخطاء والتحذيرات
// ═══════════════════════════════════════════════════
const warnings = [];

results.forEach(school => {
  school.items.forEach(item => {
    // كمية صفر
    if (item.qty === 0) {
      warnings.push({ school: school.school, no: item.no, desc: item.desc, type: '🔴 كمية صفر', detail: 'بند بدون كمية' });
    }
    // سعر مرتفع جداً لبند واحد
    if (item.total > 500000) {
      warnings.push({ school: school.school, no: item.no, desc: item.desc, type: '🟡 مبلغ كبير', detail: `${item.total.toLocaleString()} ر.س` });
    }
    // وحدة غير مطابقة
    if (item.status === '⚠️') {
      warnings.push({ school: school.school, no: item.no, desc: item.desc, type: '🟠 بند غير معروف', detail: item.matchedKeyword });
    }
  });
});

// ═══════════════════════════════════════════════════
// 5. طباعة التقرير
// ═══════════════════════════════════════════════════
console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  🧠 ARBA Brain — تقرير تسعير مطلب TBC-FM-1226              ║');
console.log('║  تأهيل 8 مدارس بمنطقة الرياض                              ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

results.forEach(school => {
  console.log(`\n📍 ${school.school}`);
  console.log(`   بنود: ${school.totalItems} | مطابق: ${school.matched} ✅ | غير معروف: ${school.unmatched} ⚠️ | نسبة المطابقة: ${school.matchRate}%`);
  console.log(`   💰 إجمالي: ${school.schoolTotal.toLocaleString()} ر.س`);
});

console.log('\n' + '═'.repeat(60));
console.log(`💰 الإجمالي الكلي (7 مدارس): ${grandTotal.toLocaleString()} ر.س`);
console.log(`💰 + ضريبة 15%: ${Math.round(grandTotal * 1.15).toLocaleString()} ر.س`);
console.log('═'.repeat(60));

// Errors summary
console.log(`\n🔍 الأخطاء والتحذيرات: ${warnings.length}`);
const byType = {};
warnings.forEach(w => { byType[w.type] = (byType[w.type] || 0) + 1; });
Object.entries(byType).forEach(([type, count]) => console.log(`   ${type}: ${count}`));

// Print first school details as sample
console.log('\n\n📋 عينة تفصيلية — المدرسة الأولى:');
console.log('-'.repeat(120));
console.log('م'.padEnd(4) + 'البند'.padEnd(60) + 'الوحدة'.padEnd(8) + 'الكمية'.padEnd(8) + 'السعر'.padEnd(10) + 'الإجمالي'.padEnd(12) + 'الحالة');
console.log('-'.repeat(120));

if (results[0]) {
  results[0].items.slice(0, 40).forEach(item => {
    console.log(
      String(item.no).padEnd(4) +
      item.desc.substring(0, 55).padEnd(60) +
      item.unit.padEnd(8) +
      String(item.qty).padEnd(8) +
      item.unitPrice.toLocaleString().padEnd(10) +
      item.total.toLocaleString().padEnd(12) +
      item.status
    );
  });
}

// ═══════════════════════════════════════════════════
// 6. حفظ النتائج
// ═══════════════════════════════════════════════════
const report = {
  projectName: 'TBC-FM-1226 — تأهيل 8 مدارس بمنطقة الرياض',
  pricedAt: new Date().toISOString(),
  region: 'riyadh',
  grandTotal,
  grandTotalWithVAT: Math.round(grandTotal * 1.15),
  schools: results.map(s => ({
    school: s.school,
    totalItems: s.totalItems,
    matched: s.matched,
    unmatched: s.unmatched,
    matchRate: s.matchRate,
    total: s.schoolTotal,
    items: s.items,
  })),
  warnings,
  errors,
};

const outPath = path.join(__dirname, 'tender_tbc_priced.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`\n✅ حُفظ التقرير: ${outPath}`);
