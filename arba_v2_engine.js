const fs = require('fs');

console.log("🚀 جاري بدء محرك أربا v2...");

// 1. قراءة البيانات الأصلية (نفس البيانات اللي استخرجناها من الإكسيل)
const parsedData = JSON.parse(fs.readFileSync('parsed_data.json', 'utf8'));

// 2. نظام التصنيف الذكي وقاعدة الأسعار (15 فئة أساسية)
const classificationRules = [
    { cat: 'أعمال تكييف وتهوية', keywords: ['تكييف', 'سبلت', 'مكيف', 'طرد', 'مروحة', 'dx'], price: 3500, unit: 'عدد', waste: 0, profit: 0.15 },
    { cat: 'أعمال حريق وإنذار', keywords: ['حريق', 'دخان', 'إنذار', 'مضخة حريق', 'طفاية', 'fm200', 'كاسر زجاج'], price: 1500, unit: 'عدد', waste: 0, profit: 0.15 },
    { cat: 'أعمال كهربائية', keywords: ['لوحة', 'توزيع', 'كابل', 'انارة', 'مفتاح', 'كهرباء', 'قاطع', 'كشاف', 'حساس', 'كاميرا', 'سويتش', 'تاريض'], price: 500, unit: 'عدد', waste: 0.02, profit: 0.15 },
    { cat: 'أعمال صحية وسباكة', keywords: ['مرحاض', 'خزف', 'مواسير', 'سباكة', 'مياه', 'صرف', 'مغسلة', 'حاقن', 'خلاط', 'بيبة', 'سخان'], price: 400, unit: 'عدد', waste: 0.05, profit: 0.15 },
    { cat: 'أعمال ألومنيوم وزجاج', keywords: ['الومنيوم', 'زجاج', 'شباك', 'نافذة', 'ابواب زجاجية', 'مرايا'], price: 350, unit: 'م2', waste: 0.05, profit: 0.15 },
    { cat: 'أعمال أرضيات وبلاط', keywords: ['بلاط', 'بورسلان', 'سيراميك', 'رخام', 'انترلوك', 'وزرات', 'ارضيات', 'ترابيع'], price: 120, unit: 'م2', waste: 0.05, profit: 0.12 },
    { cat: 'أعمال مظلات وسواتر', keywords: ['مظلات', 'سواتر', 'شنكو', 'هناجر'], price: 250, unit: 'م2', waste: 0.02, profit: 0.12 },
    { cat: 'أعمال عزل ومعالجات إنشائية', keywords: ['عزل', 'تسرب', 'بيتومين', 'ايبوكسي', 'حقن', 'رشح', 'شروخ', 'تعشيش', 'معالجة', 'فواصل', 'تمدد', 'لفائف'], price: 180, unit: 'م2', waste: 0.05, profit: 0.18 },
    { cat: 'أعمال خرسانية', keywords: ['خرسانة', 'مسلحة', 'عادية', 'قمصان', 'رقاب', 'صب', 'قواعد', 'ميدة', 'عمود'], price: 1400, unit: 'م3', waste: 0.03, profit: 0.12 },
    { cat: 'أعمال معدنية وتدعيم', keywords: ['حديد', 'معدني', 'تدعيم', 'كمرات', 'قطاعات', 'مصبعات', 'درابزين', 'ابواب حديد', 'شبك', 'صاج'], price: 600, unit: 'م2', waste: 0.03, profit: 0.12 },
    { cat: 'أعمال دهانات وتشطيبات', keywords: ['دهان', 'بلاستيك', 'بروفايل', 'بوية', 'معجون', 'زيتي', 'ايبوكسي دهان', 'جرافيت'], price: 30, unit: 'م2', waste: 0.05, profit: 0.15 },
    { cat: 'أعمال مباني ولياسة', keywords: ['بلوك', 'بناء', 'لياسة', 'اسمنتي', 'طوب'], price: 80, unit: 'م2', waste: 0.05, profit: 0.15 },
    { cat: 'أعمال ترابية', keywords: ['حفر', 'ردم', 'تربة', 'تسوية', 'دك', 'احلال', 'مخلفات'], price: 35, unit: 'م3', waste: 0, profit: 0.15 },
    { cat: 'أعمال إزالة وهدم', keywords: ['إزالة', 'هدم', 'تكسير', 'فك', 'قشط'], price: 40, unit: 'م2', waste: 0, profit: 0.15 },
    { cat: 'أعمال متنوعة', keywords: ['سبورة', 'لوحة', 'اثاث', 'عشب', 'ري', 'تنسيق', 'تنظيف', 'نظافة', 'موقع', 'حماية', 'مكتب'], price: 100, unit: 'مقطوعية', waste: 0, profit: 0.15 }
];

function analyzeItem(description, unit) {
    let desc = description.toLowerCase();
    let match = {
        cat: 'أعمال متنوعة',
        basePrice: 150,
        wastePercent: 0.05,
        profitPercent: 0.15
    };

    for (let rule of classificationRules) {
        if (rule.keywords.some(kw => desc.includes(kw))) {
            match.cat = rule.cat;
            match.basePrice = rule.price;
            match.wastePercent = rule.waste;
            match.profitPercent = rule.profit;
            break;
        }
    }

    if (match.cat === 'أعمال تكييف وتهوية') {
        if (desc.includes('4 طن') || desc.includes('48000')) match.basePrice = 8500;
        else if (desc.includes('2 طن') || desc.includes('24000')) match.basePrice = 4000;
        else if (desc.includes('شباك')) match.basePrice = 1800;
        else if (desc.includes('مروحة')) match.basePrice = 600;
    } else if (match.cat === 'أعمال حريق وإنذار') {
        if (desc.includes('مضخة')) match.basePrice = 45000;
        else if (desc.includes('لوحة')) match.basePrice = 8000;
        else if (desc.includes('دخان')) match.basePrice = 250;
    } else if (match.cat === 'أعمال كهربائية') {
        if (desc.includes('لوحة توزيع عمومية') || desc.includes('mdb')) match.basePrice = 25000;
        else if (desc.includes('لوحة فرعية') || desc.includes('smdb')) match.basePrice = 3500;
        else if (desc.includes('كاميرا')) match.basePrice = 800;
    } else if (match.cat === 'أعمال صحية وسباكة') {
        if (desc.includes('مرحاض')) match.basePrice = 850;
        else if (desc.includes('مغسلة')) match.basePrice = 650;
        else if (desc.includes('براد')) match.basePrice = 3500;
    }

    if (match.cat === 'أعمال خرسانية' && (desc.includes('معالجة') || desc.includes('شروخ'))) {
        match.cat = 'أعمال عزل ومعالجات إنشائية';
        match.basePrice = 120;
    }

    return match;
}

const schools = ['1', '2', '3', '4', '5', '6', '7', '8'];
let markdownOutput = '# 📊 تقرير أربا للتسعير التفصيلي V2 (لكل مدرسة)\n\n';
let grandTotal = 0;
let totalItemsCount = 0;

schools.forEach(schoolId => {
    const rows = parsedData.sheets[schoolId];
    if (!rows || rows.length === 0) return;

    const schoolName = rows[0][0] || `مدرسة ${schoolId}`;
    
    markdownOutput += `## 🏢 ${schoolName}\n\n`;
    markdownOutput += `| م | التصنيف | وصف البند | الوحدة | الكمية | السعر الأساسي | الهدر | الربح | سعر الوحدة الشامل | الإجمالي |\n`;
    markdownOutput += `|---|---|---|---|---|---|---|---|---|---|\n`;

    let schoolTotal = 0;
    let itemCounter = 1;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] || isNaN(parseInt(row[0])) || !row[1] || !row[3]) continue;
        
        const description = row[1];
        const unit = row[2] || 'مقطوعية';
        const quantity = parseFloat(row[3]);
        
        if (quantity === 0 || isNaN(quantity)) continue;

        const analysis = analyzeItem(description, unit);
        
        const wasteAmount = analysis.basePrice * analysis.wastePercent;
        const profitAmount = (analysis.basePrice + wasteAmount) * analysis.profitPercent;
        const finalUnitPrice = analysis.basePrice + wasteAmount + profitAmount;
        const totalPrice = finalUnitPrice * quantity;

        schoolTotal += totalPrice;
        totalItemsCount++;
        
        let cleanDesc = description.replace(/\n/g, ' ').replace(/\|/g, '-');
        if (cleanDesc.length > 70) cleanDesc = cleanDesc.substring(0, 70) + '...';

        markdownOutput += `| ${itemCounter} | ${analysis.cat} | ${cleanDesc} | ${unit} | ${quantity.toFixed(1)} | ${analysis.basePrice.toFixed(2)} | ${(analysis.wastePercent*100).toFixed(0)}% | ${(analysis.profitPercent*100).toFixed(0)}% | **${finalUnitPrice.toFixed(2)}** | **${totalPrice.toLocaleString('en-US', {minimumFractionDigits:2})}** |\n`;
        itemCounter++;
    }

    markdownOutput += `\n**💰 إجمالي هذه المدرسة: ${schoolTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} ر.س**\n\n---\n\n`;
    grandTotal += schoolTotal;
});

markdownOutput += `# 📈 الإجمالي العام للمشروع (8 مدارس)\n`;
markdownOutput += `- إجمالي عدد البنود المسعرة: **${totalItemsCount} بند**\n`;
markdownOutput += `- التكلفة التقديرية الإجمالية: **${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} ر.س**\n`;

fs.writeFileSync('arba_v2_report.md', markdownOutput, 'utf8');
console.log(`✅ انتهى التسعير بنجاح! تم تسعير ${totalItemsCount} بند.`);
console.log(`💵 الإجمالي العام: ${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})} ر.س`);
console.log(`📄 تم حفظ التقرير في ملف arba_v2_report.md`);
