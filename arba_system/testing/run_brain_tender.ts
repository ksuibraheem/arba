import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';
import * as fs from 'fs';

// Mock localStorage for Node environment
const store: any = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

import { firestoreDataService } from '../services/firestoreDataService';

// Mock firestore to prevent hanging
firestoreDataService.batchWrite = async () => ({ success: true, data: 0 });
firestoreDataService.getCollection = async () => [];

import { marketDataProvider } from '../services/marketDataProvider';

async function runTenderPricing() {
  console.log('🔄 1. جارٍ تحديث بيانات السوق من API الموردين الخارجيين...');
  const updatedCount = await marketDataProvider.syncWithExternalAPI();
  console.log(`✅ تم تحديث ${updatedCount} سعر حيوي من API.`);
  
  const snapshot = marketDataProvider.getSnapshot();
  console.log(`📊 إجمالي المنتجات في المحرك (ثابت + API): ${Object.keys(snapshot.prices).length} بند.\n`);

  const filePath = path.join(process.cwd(), '..', 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx');
  console.log(`📂 2. قراءة ملف العطاء: ${path.basename(filePath)}`);
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

  let grandTotal = 0;
  const results: any[] = [];
  const errors: any[] = [];

  // ==========================================
  // محرك ذكي للمطابقة مع مراعاة "المواصفات"
  // ==========================================
  function matchWithBrain(desc: string, unit: string) {
    const d = desc.toLowerCase().replace(/\r\n/g, ' ');
    const unitLower = unit.toLowerCase().trim();
    
    // ══════════════════════════════════════════════════════════════
    // الإصلاح #1: مطابقة بالعبارات الطويلة أولاً (Context-Aware)
    // العبارة الأطول تفوز — يمنع "تدعيم" وحدها من التغلب على السياق
    // ══════════════════════════════════════════════════════════════
    const phraseMatches: [string, number][] = [
      // === إنشائي (العبارات الأطول أولاً!) ===
      ['تدعيم الاعمدة', 2800],  // قمصان خرسانية — فقط إذا ذكر "الاعمدة"
      ['قمصان خرسانية', 2800],
      ['معالجة وتدعيم الوصلات', 150],  // ← الإصلاح: معالجة وصلات مظلات وليس قمصان!
      ['تدعيم الوصلات', 150],
      ['مراجعة التثبيت', 150],
      ['مراجعة اللحامات', 150],
      ['تدعيم بلاطات', 3200],  // بالطن — قطاعات معدنية
      ['خرسانة مسلحة', 1200],
      ['خرسانة عادية', 350],
      ['خرسانة عاديه', 350],
      ['خرسانة جاهزة', 260],
      ['حديد تسليح', 3200],
      ['دكة خرسانيه', 200],
      ['دكة خرسانية', 200],
      
      // === حفر وردم ===
      ['حفر', 25], ['ردم', 38],
      
      // === مباني ===
      ['بلوك 20', 80], ['بلوك 15', 65],
      ['طوب المصمت', 90], ['طوب مصمت', 90],
      ['طوب المفرغ', 75], ['طوب مفرغ', 75],
      ['مباني من الطوب', 85],
      ['لياسة', 40],
      
      // === عزل ===
      ['عزل مائي', 55], ['عزل حراري', 45],
      ['عازلة للرطوبة', 45], ['عازله للرطوبه', 45],
      ['ايبوكسي', 85], ['فواصل التمدد', 80],
      ['معالجة رشح', 120],  // معالجة أسطح — سعر معقول
      ['لفائف', 55],
      
      // === تشطيبات ===
      ['بلاط بورسلان', 120], ['بورسلان', 120],
      ['سيراميك', 95], ['قيشاني', 90],
      ['رخام', 250], ['جرانيت', 300],
      ['انترلوك', 80], ['طوب رصف', 80],
      ['بلاطات اسمنتية', 55], ['ترابيع بلاطات', 55],
      ['بلاط', 90],
      
      // === دهانات (تفريق الدهان عن المعالجة) ===
      ['دهانات بلاستيكيه', 30], ['دهانات بلاستيكية', 30],
      ['دهانات', 35], ['دهان', 35],
      ['إعادة دهان', 30],
      
      // === واجهات ===
      ['بروفايل سمك 3', 28], ['بروفايل', 28],
      
      // === أبواب ونوافذ ===
      ['شبابيك الومنيوم', 700], ['شبابيك', 700],
      ['باب خشب', 1800], ['باب حديد', 2200],
      
      // === صحي ===
      ['كرسي افرنجي', 1400], ['مرحاض افرنجى', 1200], ['مرحاض افرنجي', 1200],
      ['مرحاض شرقى', 800], ['مرحاض شرقي', 800], ['مرحاض خزف', 800],
      ['مغسلة', 800], ['حوض أوانى', 2500], ['حوض اوانى', 2500],
      ['مواسير ppr', 45], ['مواسير', 40],
      ['خلاط', 350], ['محبس برونز', 150],
      ['جرجورى', 250], ['جرجوري', 250],
      ['خزانات المياه', 3500], ['خزانات مياه', 3500], ['فايبرجلاس', 3500],
      ['تنظيف وتعقيم خزان', 3000], ['تعقيم خزان', 3000],
      ['مضخات', 8500], ['مضخة', 8500],
      ['تسليك شبكة', 5000],
      ['براد مياه', 2500],
      
      // === كهرباء (تفريق اللوحات حسب النوع) ===
      ['لوحة توزيع عمومية', 25000], ['لوحة توزيع فرعية', 5500],
      ['لوحة توزيع', 8000],
      ['صيانة اللوحة الرئيسية', 15000], ['صيانة اللوحة', 12000],
      ['وحدة إنارة led', 150], ['وحدة انارة', 150], ['إنارة led', 150],
      ['مخرج قوى', 85], ['مخرج', 85],
      ['كيبل نحاس', 45], ['كيبل', 35], ['كابلات', 35],
      ['قاطع', 400], ['قواطع', 400],
      ['فحص واختبار جميع الكابلات', 5000],
      
      // === حريق ===
      ['صندوق اطفاء', 1200], ['صندوق إطفاء', 1200],
      ['طفايه حريق بودره', 220], ['طفايه حريق', 220], ['طفاية حريق', 220], ['طفاية', 220],
      ['ثانى أكسيد', 280], ['ثاني اكسيد', 280],
      ['إنذار يدوي', 180], ['انذار يدوي', 180], ['كاسر زجاجي', 180],
      ['انذار', 180],
      
      // === تهوية ===
      ['مروحة طرد', 280], ['مروحة سحب', 350],
      ['مروحة صناعى', 350], ['مراوح التهوية', 300],
      
      // === تكييف ===
      ['تكييف', 3500], ['مكيف', 3500], ['سبليت', 3000],
      
      // === تقنية وصوتيات ===
      ['مكبر صوت', 1200], ['لاقط صوت', 850],
      ['wifi', 1500], ['access point', 1500], ['نقطة وصول', 1500],
      ['جرس حصص', 1800], ['جرس', 1800],
      ['patch panel 48', 650], ['patch panel 24', 450], ['مجمع توصيل', 500],
      ['موزع معلومات', 2500],
      ['عدة هاتف', 350], ['هاتف قياسية', 350],
      ['كبينة توزيع', 2000],
      ['ميكرفون', 500], ['استقبال لاسلكي', 800],
      ['سبورة بورسلان', 350], ['سبورة', 350],
      ['حاقن صابون', 45], ['مساند', 250],
      ['حمالة ملابس', 80],
      
      // === مظلات وأسوار ===
      ['مظلات خارجية', 350], ['مظلات معدنية', 350], ['مظله', 350], ['مظلة', 350],
      ['شنكو', 25], ['سواتر', 25],
      
      // === فك وإزالة ===
      ['فك وازالة', 25], ['فك وإزالة', 25], ['إزالة', 20], ['ازالة', 20],
      
      // === موقع عام ===
      ['عشب صناعي', 85], ['صاري علم', 1800],
      ['لوحة تعريف', 2500], ['لوحات ارشادية', 500],
      ['لوحات فلين', 120], ['فلين', 120],
      ['هدفي كرة', 3500], ['هدف كرة', 3500],
      ['طرفيات خرسانية', 80], ['بردور', 80],
      ['جاليتراب', 200],
      ['تقليم', 150], ['نخل', 150],
      ['غرف تفتيش', 2500], ['غرفة تفتيش', 2500], ['غطاء غرفة', 350], ['غطاء لغرفة', 350],
      ['صرف مياه الامطار', 3500],
      ['صواعق', 8000], ['حماية من الصواعق', 8000],
      ['ربر', 30], ['اسفلت', 70],
      ['ارضية صناعية', 120], ['أرضية صناعية', 120], ['فينيل', 120],
      ['قواطع حمامات', 280], ['فينوليك', 280],
      ['دواليب', 350], ['دولاليب', 350],
      
      // === معالجة (آخر شيء — أقل أولوية) ===
      ['معالجة', 120],
      
      // === الدفاع المدني ===
      ['الدفاع المدني', 15000],
    ];
    
    // الطبقة 1: API matching (كما هو)
    const keywords = d.split(' ').filter(w => w.length > 3);
    let bestMatch = null;
    let highestScore = 0;
    const allCommodities = marketDataProvider.getAvailableCommodities();
    
    for (const id of allCommodities) {
      const priceItem = marketDataProvider.getPrice(id) as any;
      if (!priceItem) continue;
      let score = 0;
      const itemName = priceItem.nameAr.toLowerCase();
      const itemSpecs = (priceItem.specifications || '').toLowerCase();
      if (d.includes(itemName)) score += 50;
      const specWords = itemSpecs.split(' ').filter((w: string) => w.length > 2);
      for (const sw of specWords) { if (d.includes(sw)) score += 20; }
      for (const kw of keywords) { if (itemName.includes(kw)) score += 5; if (itemSpecs.includes(kw)) score += 10; }
      if (score > highestScore && score >= 20) { highestScore = score; bestMatch = priceItem; }
    }

    let rate = 0;
    let matchedKeyword = '';
    let isApi = false;

    if (bestMatch) {
      rate = bestMatch.price;
      matchedKeyword = `${bestMatch.nameAr} [${bestMatch.specifications || ''}]`;
      isApi = bestMatch.source === 'api_live';
    } else {
      // الطبقة 2: مطابقة العبارات (الأطول أولاً يفوز)
      for (const [phrase, price] of phraseMatches) {
        if (d.includes(phrase)) {
          rate = price;
          matchedKeyword = phrase;
          break;  // أول تطابق (الأطول) يفوز
        }
      }
    }
    
    if (rate === 0) {
      // الطبقة 3: تقدير حسب الوحدة
      const unitFallbacks: Record<string, number> = {
        'م2': 60, 'م٢': 60, 'م 2': 60,
        'م3': 250, 'م٣': 250, 'م 3': 250,
        'م.ط': 50, 'م .ط': 50, 'م ط': 50,
        'عدد': 200, 'حبة': 10,
        'طن': 3000, 'كجم': 8,
        'مقطوعية': 3000,
      };
      for (const [u, est] of Object.entries(unitFallbacks)) {
        if (unitLower.includes(u) || unitLower === u) {
          rate = est;
          matchedKeyword = `تقدير حسب الوحدة (${unit})`;
          break;
        }
      }
      if (rate === 0) { rate = 200; matchedKeyword = 'تقدير عام'; }
    }

    // ══════════════════════════════════════════════════════════════
    // الإصلاح #2: سقف السعر حسب الوحدة (Sanity Cap)
    // يمنع أي سعر غير منطقي من التسلل
    // ══════════════════════════════════════════════════════════════
    const unitCaps: Record<string, number> = {
      'م2': 500,   // لا يوجد بند م2 في صيانة مدارس يتجاوز 500 ر.س/م2
      'م.ط': 300,
      'م .ط': 300,
      'م ط': 300,
    };
    for (const [u, cap] of Object.entries(unitCaps)) {
      if (unitLower.includes(u)) {
        if (rate > cap) {
          rate = cap;
          matchedKeyword += ' ⚡سُقِّف';
        }
        break;
      }
    }

    return { rate, matchedKeyword, isApi };
  }

  // ==========================================
  // معالجة المدارس
  // ==========================================
  for (let si = 1; si <= 8; si++) {
    const sheetName = wb.SheetNames[si];
    if (!sheetName) continue;
    
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[];
    
    const schoolName = schoolNames[si - 1] || `مدرسة ${si}`;
    let schoolTotal = 0;
    let matched = 0;
    let apiMatched = 0;
    let unmatched = 0;
    const schoolItems = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const filtered = row.filter(c => c !== '');
      if (filtered.length === 0) continue;

      if (typeof row[0] === 'number' && typeof row[1] === 'string' && row[1].length > 10) {
        const no = row[0];
        const desc = row[1].trim();
        const unit = (row[2] || '').toString().trim();
        const qty = parseFloat(row[3]) || 0;

        const match = matchWithBrain(desc, unit);
        
        if (match) {
          const unitPrice = match.rate;
          const total = Math.round(unitPrice * qty);
          schoolTotal += total;
          matched++;
          if (match.isApi) apiMatched++;
          
          schoolItems.push({
            no, desc: desc.substring(0, 100), unit, qty,
            unitPrice, total,
            matchedKeyword: match.matchedKeyword,
            isApi: match.isApi,
            status: '✅'
          });
        } else {
          unmatched++;
          let estPrice = 500; // default fallback
          const total = Math.round(estPrice * qty);
          schoolTotal += total;
          
          schoolItems.push({
            no, desc: desc.substring(0, 100), unit, qty,
            unitPrice: estPrice, total,
            matchedKeyword: '⚠️ تقدير آلي',
            isApi: false,
            status: '⚠️'
          });
          
          errors.push({ school: schoolName, no, desc: desc.substring(0, 80) });
        }
      }
    }

    grandTotal += schoolTotal;
    
    results.push({
      school: schoolName,
      totalItems: matched + unmatched,
      matched, apiMatched, unmatched,
      matchRate: Math.round((matched / (matched + unmatched)) * 100),
      schoolTotal,
      allItems: schoolItems,
      sampleItems: schoolItems.filter(i => i.isApi).slice(0, 5)
    });
  }

  // ==========================================
  // التقرير النهائي
  // ==========================================
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  🧠 ARBA Brain V10.0 — تقرير التسعير الحيوي (Live API)         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let totalMatched = 0, totalApiMatched = 0, totalUnmatched = 0;
  results.forEach(s => {
    totalMatched += s.matched;
    totalApiMatched += s.apiMatched;
    totalUnmatched += s.unmatched;
    console.log(`📍 ${s.school}`);
    console.log(`   النسبة: ${s.matchRate}% | مطابق: ${s.matched} | API: ${s.apiMatched} 🌐 | غير معروف: ${s.unmatched} ⚠️`);
    console.log(`   إجمالي: ${s.schoolTotal.toLocaleString()} ر.س`);
    if (s.sampleItems.length > 0) {
      console.log('   🔗 عينة API:');
      s.sampleItems.slice(0, 3).forEach((i: any) => {
        console.log(`      - [${i.no}] ${i.matchedKeyword} ⟵ (${i.unitPrice} ر.س)`);
      });
    }
    console.log('');
  });

  const overallRate = Math.round((totalMatched / (totalMatched + totalUnmatched)) * 100);
  console.log('═'.repeat(60));
  console.log(`💰 الإجمالي الكلي: ${grandTotal.toLocaleString()} ر.س`);
  console.log(`📊 نسبة المطابقة الكلية: ${overallRate}%`);
  console.log(`🌐 بنود من الـ API: ${totalApiMatched} | 📘 بنود من القاموس: ${totalMatched - totalApiMatched} | ⚠️ تقدير: ${totalUnmatched}`);
  console.log('═'.repeat(60));

  // ==========================================
  // 3. توليد ملف Excel المسعّر النهائي
  // ==========================================
  console.log('\n📝 3. جارٍ توليد ملف Excel المسعّر...');
  
  const newWb = XLSX.utils.book_new();
  
  // ملخص عام
  const summaryData = [
    ['🧠 ARBA Brain V10.0 — تقرير التسعير الحيوي'],
    [''],
    ['المدرسة', 'إجمالي البنود', 'مطابق', 'من API', 'غير معروف', 'نسبة المطابقة', 'إجمالي (ر.س)'],
    ...results.map(s => [s.school, s.totalItems, s.matched, s.apiMatched, s.unmatched, s.matchRate + '%', s.schoolTotal]),
    [''],
    ['الإجمالي الكلي', '', totalMatched, totalApiMatched, totalUnmatched, overallRate + '%', grandTotal]
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 45 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(newWb, summaryWs, 'ملخص');

  // شيتات المدارس
  results.forEach((s, idx) => {
    const schoolData = [
      ['م', 'وصف البند', 'الوحدة', 'الكمية', 'سعر الوحدة', 'الإجمالي', 'المصدر', 'المطابقة', 'الحالة'],
      ...s.allItems.map((i: any) => [
        i.no, i.desc, i.unit, i.qty, i.unitPrice, i.total,
        i.isApi ? 'API مورد' : 'قاموس الدماغ',
        i.matchedKeyword,
        i.status
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(schoolData);
    ws['!cols'] = [
      { wch: 5 }, { wch: 60 }, { wch: 10 }, { wch: 8 },
      { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 6 }
    ];
    const sheetName = s.school.substring(0, 31); // Excel max 31 chars
    XLSX.utils.book_append_sheet(newWb, ws, sheetName);
  });

  const outputPath = path.join(process.cwd(), 'scratch', 'tender_priced_output.xlsx');
  XLSX.writeFile(newWb, outputPath);
  console.log(`✅ تم حفظ ملف Excel المسعّر: ${path.basename(outputPath)}`);

  // ==========================================
  // 4. توليد بيانات التدريب لتغذية الدماغ
  // ==========================================
  console.log('\n🧠 4. جارٍ تصدير بيانات التدريب للدماغ...');
  
  const trainingFeed = {
    source: 'TBC-FM-1226',
    date: new Date().toISOString(),
    stats: {
      totalItems: totalMatched + totalUnmatched,
      matchedItems: totalMatched,
      apiMatchedItems: totalApiMatched,
      unmatchedItems: totalUnmatched,
      matchRate: overallRate,
      grandTotal
    },
    learnedPrices: [] as any[],
    errorPatterns: [] as any[]
  };

  // جمع البنود التي تم تسعيرها بنجاح كبيانات تعلّم
  const seenPrices: Record<string, boolean> = {};
  results.forEach(s => {
    s.allItems.forEach((i: any) => {
      if (i.status === '✅' && !seenPrices[i.matchedKeyword]) {
        seenPrices[i.matchedKeyword] = true;
        trainingFeed.learnedPrices.push({
          description: i.desc,
          unit: i.unit,
          unitPrice: i.unitPrice,
          matchedBy: i.matchedKeyword,
          source: i.isApi ? 'api' : 'dictionary',
          confidence: i.isApi ? 0.95 : 0.75
        });
      }
    });
  });

  // حفظ البنود غير المعروفة كأنماط أخطاء للتعلم منها
  errors.forEach(e => {
    trainingFeed.errorPatterns.push({
      type: 'unmatched_item',
      school: e.school,
      description: e.desc,
      action: 'needs_manual_pricing_or_new_api_source'
    });
  });

  const feedPath = path.join(process.cwd(), 'scratch', 'brain_training_feed.json');
  fs.writeFileSync(feedPath, JSON.stringify(trainingFeed, null, 2), 'utf8');
  console.log(`✅ تم حفظ بيانات التدريب: ${path.basename(feedPath)} (${trainingFeed.learnedPrices.length} سعر مُتعلَّم)`);

  console.log('\n🏁 اكتمل التشغيل بنجاح!');
  process.exit(0);
}

runTenderPricing().catch(e => { console.error(e); process.exit(1); });
