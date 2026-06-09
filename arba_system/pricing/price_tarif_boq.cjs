/**
 * 🧠 ARBA Brain — تسعير مشروع قيادة قوى طريف
 * مع تسجيل حركة الدماغ الداخلي
 */
const XLSX = require('xlsx');
const fs = require('fs');

// === تحميل بيانات الدماغ ===
const benchmark = JSON.parse(fs.readFileSync('data/market_benchmark.json','utf8'));
const locations = JSON.parse(fs.readFileSync('data/location_multipliers.json','utf8'));
const rates = benchmark.rates;
const LOC_FACTOR = locations.regions.northern_borders.factor; // 1.15 طريف

const PROFIT = 0.15; // 15% مكسب
const BOQ_PATH = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\جدول الكميات - قبل التسعير.xlsx';

// === سجل حركة الدماغ ===
const brainLog = [];
function log(phase, msg, data) {
  brainLog.push({ time: new Date().toISOString(), phase, msg, data });
}

log('INIT', 'تحميل بيانات الدماغ', { ratesCount: Object.keys(rates).length, location: 'طريف - الحدود الشمالية', factor: LOC_FACTOR, profit: '15%' });

// === قراءة BOQ ===
const wb = XLSX.readFile(BOQ_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

log('READ', 'قراءة جدول الكميات', { sheets: wb.SheetNames, totalRows: raw.length });

// === تصنيف البنود ===
function classifyItem(desc) {
  const d = desc.toLowerCase();
  // أعمال ترابية
  if(/حفر|ردم|تسوية|أرض|excavat|backfill/.test(d)) return { cat: 'أعمال ترابية', catEn: 'earthworks' };
  // خرسانة
  if(/خرسان|قواعد|أعمدة|كمر|بلاطة|سقف|ميدة|أساس|رقاب|concrete|footing|column|slab|beam/.test(d)) return { cat: 'أعمال خرسانية', catEn: 'concrete' };
  // بلوك/بناء
  if(/بلوك|بلك|مبان|طوب|block|masonry/.test(d)) return { cat: 'أعمال بناء', catEn: 'masonry' };
  // لياسة
  if(/لياسة|بياض|plaster/.test(d)) return { cat: 'لياسة', catEn: 'plaster' };
  // دهان
  if(/دهان|طلاء|بويه|paint/.test(d)) return { cat: 'دهانات', catEn: 'paint' };
  // بلاط/سيراميك
  if(/بلاط|سيراميك|بورسل|رخام|جرانيت|أرضيات|tile|ceramic|porcelain|marble|granite/.test(d)) return { cat: 'أرضيات وتكسيات', catEn: 'finishes' };
  // أبواب
  if(/باب|أبواب|door/.test(d)) return { cat: 'أبواب', catEn: 'doors' };
  // شبابيك/ألمنيوم
  if(/شباك|نافذة|ألمنيوم|زجاج|window|alumin|glass|curtain/.test(d)) return { cat: 'نوافذ وألمنيوم', catEn: 'windows' };
  // عزل مائي
  if(/عزل.*مائ|عزل.*رطوب|waterproof|membrane|bitumen/.test(d)) return { cat: 'عزل مائي', catEn: 'waterproofing' };
  // عزل حراري
  if(/عزل.*حرار|thermal|insul/.test(d)) return { cat: 'عزل حراري', catEn: 'insulation' };
  // جبس
  if(/جبس|أسقف مستعار|gypsum|false ceil/.test(d)) return { cat: 'أسقف مستعارة', catEn: 'ceiling' };
  // كهرباء
  if(/كهرب|كيبل|كابل|لوحة.*توزيع|قاطع|مفتاح|بريزة|إنارة|إضاء|مقبس|مأخذ|elec|cable|panel|switch|outlet|light|mcb|mccb/.test(d)) return { cat: 'أعمال كهربائية', catEn: 'electrical' };
  // سباكة/صرف
  if(/سباك|صرف|مواسير.*مياه|صنبور|حنفية|خلاط|مغسلة|مرحاض|بانيو|سخان|خزان.*مياه|مضخ|plumb|pipe.*water|wc|basin|heater|tank|pump|drain|cpvc|upvc|ppr/.test(d)) return { cat: 'أعمال سباكة', catEn: 'plumbing' };
  // تكييف
  if(/تكييف|مكيف|تبريد|تهوية|دكت|hvac|ac|split|duct|diffus/.test(d)) return { cat: 'تكييف', catEn: 'hvac' };
  // حريق
  if(/حريق|إطفاء|رشاش|إنذار|fire|alarm|sprinkl|smoke/.test(d)) return { cat: 'أنظمة الحريق', catEn: 'fire' };
  // تأريض/صواعق
  if(/تأريض|صواعق|earth|lightning|arrest/.test(d)) return { cat: 'تأريض وصواعق', catEn: 'earthing' };
  // مصعد
  if(/مصعد|elevator|lift/.test(d)) return { cat: 'مصاعد', catEn: 'elevator' };
  // أعمال خارجية
  if(/أسفلت|رصف|إنترلوك|سور|بوابة|مظلة|حديقة|تشجير|asphalt|pav|fence|gate|shade|landscape/.test(d)) return { cat: 'أعمال خارجية', catEn: 'external' };
  // تيار خفيف
  if(/كامير|cctv|شبكة|بيانات|data|access|intercom|صوت|pa|سماعة/.test(d)) return { cat: 'تيار خفيف', catEn: 'low_current' };
  // حديد/معدني
  if(/حديد.*مشغول|درابزين|سلالم.*معدن|handrail|railing|steel/.test(d)) return { cat: 'أعمال معدنية', catEn: 'metalwork' };
  return { cat: 'أخرى', catEn: 'other' };
}

// === تسعير بند واحد ===
function priceItem(desc, unit, qty) {
  const d = desc.toLowerCase();
  const cls = classifyItem(desc);
  let baseRate = 0;
  let matchKey = '';
  let confidence = 'medium';
  let method = '';

  // محاولة المطابقة من قاعدة البيانات
  if(cls.catEn === 'masonry') {
    if(/معزول|خارج/.test(d)) { baseRate = rates.block_20_ext?.rate || 80; matchKey = 'block_20_ext'; }
    else { baseRate = rates.block_15_int?.rate || 65; matchKey = 'block_15_int'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'plaster') {
    baseRate = rates.plaster_int?.rate || 38; matchKey = 'plaster_int';
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'paint') {
    if(/إيبوكس|epoxy/.test(d)) { baseRate = rates.paint_epoxy?.rate || 65; matchKey = 'paint_epoxy'; }
    else if(/خارج/.test(d)) { baseRate = rates.paint_ext?.rate || 42; matchKey = 'paint_ext'; }
    else { baseRate = rates.paint_int?.rate || 32; matchKey = 'paint_int'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'finishes') {
    if(/بورسل|porcelain/.test(d)) { baseRate = rates.porcelain_60?.rate || 130; matchKey = 'porcelain_60'; }
    else if(/سيراميك|ceramic/.test(d)) { baseRate = rates.ceramic_wall?.rate || 100; matchKey = 'ceramic_wall'; }
    else if(/رخام.*أرض|marble.*floor/.test(d)) { baseRate = rates.marble_floor?.rate || 250; matchKey = 'marble_floor'; }
    else if(/رخام.*درج|marble.*stair/.test(d)) { baseRate = rates.marble_stair?.rate || 300; matchKey = 'marble_stair'; }
    else if(/جرانيت|granite/.test(d)) { baseRate = rates.granite_counter?.rate || 350; matchKey = 'granite_counter'; }
    else if(/حجر|stone/.test(d)) { baseRate = rates.stone_riyadh?.rate || 280; matchKey = 'stone_riyadh'; }
    else { baseRate = 120; matchKey = 'finishes_generic'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'doors') {
    if(/حديد|steel|معدن/.test(d)) { baseRate = rates.door_steel?.rate || 2500; matchKey = 'door_steel'; }
    else if(/مقاوم.*حريق|fire/.test(d)) { baseRate = rates.door_fire?.rate || 3500; matchKey = 'door_fire'; }
    else if(/ألمنيوم|alum/.test(d)) { baseRate = rates.door_alum?.rate || 3500; matchKey = 'door_alum'; }
    else if(/زجاج|glass/.test(d)) { baseRate = rates.door_glass?.rate || 4500; matchKey = 'door_glass'; }
    else if(/رولنق|شتر|roll/.test(d)) { baseRate = rates.rolling_shutter?.rate || 3500; matchKey = 'rolling_shutter'; }
    else { baseRate = rates.door_wood?.rate || 1800; matchKey = 'door_wood'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'windows') {
    if(/ستائر.*زجاج|curtain/.test(d)) { baseRate = rates.curtain_wall?.rate || 900; matchKey = 'curtain_wall'; }
    else { baseRate = rates.window_alum?.rate || 700; matchKey = 'window_alum'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'ceiling') {
    if(/جبس.*بورد|gypsum.*board/.test(d)) { baseRate = rates.gypsum_board?.rate || 80; matchKey = 'gypsum_board'; }
    else { baseRate = rates.gypsum_tile?.rate || 60; matchKey = 'gypsum_tile'; }
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'waterproofing') {
    baseRate = rates.waterproofing?.rate || 55; matchKey = 'waterproofing';
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'insulation') {
    baseRate = rates.thermal_insul?.rate || 45; matchKey = 'thermal_insul';
    confidence = 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'electrical') {
    if(/لوحة.*توزيع.*رئيس|main.*panel|mdb/i.test(d)) { baseRate = 35000; matchKey = 'elec_panel_main'; confidence = 'high'; }
    else if(/لوحة.*توزيع.*فرع|sub.*panel|elp/i.test(d)) { baseRate = rates.elec_panel?.rate || 8000; matchKey = 'elec_panel'; confidence = 'high'; }
    else if(/لوحة.*توزيع/i.test(d)) { baseRate = rates.elec_panel?.rate || 8000; matchKey = 'elec_panel'; confidence = 'high'; }
    else if(/محول|transform/i.test(d)) { baseRate = rates.elec_transformer?.rate || 95000; matchKey = 'elec_transformer'; confidence = 'high'; }
    else if(/مولد|generat|generator/i.test(d)) { baseRate = rates.elec_genset?.rate || 180000; matchKey = 'elec_genset'; confidence = 'high'; }
    else if(/ups/i.test(d)) { baseRate = rates.elec_ups?.rate || 25000; matchKey = 'elec_ups'; confidence = 'high'; }
    else if(/ats|تحويل.*تلقائ/i.test(d)) { baseRate = rates.elec_ats?.rate || 35000; matchKey = 'elec_ats'; confidence = 'high'; }
    else if(/إنارة|إضاء|light|led/i.test(d)) { baseRate = rates.elec_light?.rate || 256; matchKey = 'elec_light'; confidence = 'high'; }
    else if(/بريزة|مأخذ|outlet|مقبس/i.test(d)) { baseRate = rates.elec_outlet?.rate || 85; matchKey = 'elec_outlet'; confidence = 'high'; }
    else if(/مفتاح|switch/i.test(d)) { baseRate = rates.elec_switch?.rate || 65; matchKey = 'elec_switch'; confidence = 'high'; }
    else if(/كيبل|كابل|cable/i.test(d)) {
      if(/185|120/i.test(d)) { baseRate = 450; matchKey = 'cable_heavy'; }
      else if(/16|10/i.test(d)) { baseRate = 180; matchKey = 'cable_medium'; }
      else { baseRate = 85; matchKey = 'cable_light'; }
      confidence = 'medium';
    }
    else if(/حوامل.*كابل|cable.*tray/i.test(d)) { baseRate = rates.elec_cable_tray?.rate || 180; matchKey = 'elec_cable_tray'; confidence = 'high'; }
    else if(/مواسير.*كهرب|conduit/i.test(d)) { baseRate = rates.elec_conduit?.rate || 35; matchKey = 'elec_conduit'; confidence = 'high'; }
    else { baseRate = 250; matchKey = 'elec_generic'; confidence = 'low'; }
    method = 'brain_direct';
  }
  else if(cls.catEn === 'plumbing') {
    if(/مرحاض|wc|closet/i.test(d)) { baseRate = rates.plumb_wc?.rate || 1200; matchKey = 'plumb_wc'; }
    else if(/مغسلة|حوض|basin|wash/i.test(d)) { baseRate = rates.plumb_basin?.rate || 800; matchKey = 'plumb_basin'; }
    else if(/سخان|heater|boiler/i.test(d)) { baseRate = 8500; matchKey = 'plumb_heater_300'; }
    else if(/خزان.*مياه.*علو|tank.*water/i.test(d)) { baseRate = 6500; matchKey = 'plumb_tank_roof'; }
    else if(/مضخ|pump/i.test(d)) { baseRate = rates.plumb_pump?.rate || 18000; matchKey = 'plumb_pump'; }
    else if(/مواسير.*cpvc|cpvc/i.test(d)) { baseRate = 55; matchKey = 'plumb_cpvc'; }
    else if(/مواسير.*upvc|upvc|صرف/i.test(d)) { baseRate = 85; matchKey = 'plumb_upvc'; }
    else if(/محبس|صمام|valve/i.test(d)) { baseRate = rates.plumb_valve?.rate || 85; matchKey = 'plumb_valve'; }
    else if(/خلاط|mixer|faucet/i.test(d)) { baseRate = 650; matchKey = 'plumb_mixer'; }
    else { baseRate = 350; matchKey = 'plumb_generic'; confidence = 'low'; }
    confidence = confidence || 'high'; method = 'brain_direct';
  }
  else if(cls.catEn === 'hvac') {
    if(/سبلت|split/i.test(d)) { baseRate = rates.ac_split?.rate || 4500; matchKey = 'ac_split'; }
    else if(/مكيف.*مركز|central|package/i.test(d)) { baseRate = rates.ac_package?.rate || 28000; matchKey = 'ac_package'; }
    else if(/دكت|duct/i.test(d)) { baseRate = rates.ac_duct?.rate || 85; matchKey = 'ac_duct'; }
    else if(/شفط|exhaust/i.test(d)) { baseRate = rates.ac_exhaust?.rate || 2800; matchKey = 'ac_exhaust'; }
    else { baseRate = 3500; matchKey = 'hvac_generic'; confidence = 'low'; }
    method = 'brain_direct';
  }
  else if(cls.catEn === 'fire') {
    if(/إنذار|alarm|كاشف|detect/i.test(d)) { baseRate = rates.fire_alarm?.rate || 301; matchKey = 'fire_alarm'; }
    else if(/طفاي|extinguish/i.test(d)) { baseRate = rates.fire_ext_6?.rate || 350; matchKey = 'fire_ext_6'; }
    else if(/خرطوم|hose|cabinet/i.test(d)) { baseRate = rates.fire_hose_cab?.rate || 2800; matchKey = 'fire_hose_cab'; }
    else if(/رشاش|sprinkl/i.test(d)) { baseRate = rates.fire_auto?.rate || 85; matchKey = 'fire_auto'; }
    else { baseRate = 2500; matchKey = 'fire_generic'; confidence = 'low'; }
    method = 'brain_direct';
  }
  else if(cls.catEn === 'earthing') {
    if(/صواعق|lightning|arrest/i.test(d)) { baseRate = 45000; matchKey = 'lightning_system'; }
    else if(/تأريض.*خرسان|earth.*beam/i.test(d)) { baseRate = 25000; matchKey = 'earthing_beam'; }
    else if(/earthpit|حفرة.*تأريض/i.test(d)) { baseRate = 3500; matchKey = 'earthpit'; }
    else { baseRate = rates.elec_earthing?.rate || 2500; matchKey = 'elec_earthing'; }
    confidence = 'medium'; method = 'brain_estimate';
  }
  else if(cls.catEn === 'elevator') {
    baseRate = rates.elevator?.rate || 280000; matchKey = 'elevator';
    confidence = 'high'; method = 'brain_direct';
  }
  else {
    // تسعير تقديري
    baseRate = 500; matchKey = 'unmatched'; confidence = 'low'; method = 'brain_fallback';
  }

  // تطبيق معامل الموقع
  const locRate = Math.round(baseRate * LOC_FACTOR);
  // تطبيق هامش الربح
  const finalRate = Math.round(locRate * (1 + PROFIT));
  const total = Math.round(finalRate * qty);

  log('PRICE', `بند: ${desc.substring(0,60)}...`, {
    category: cls.cat, matchKey, baseRate, locFactor: LOC_FACTOR, 
    locRate, profitRate: finalRate, qty, total, confidence, method
  });

  return { ...cls, baseRate, locRate, finalRate, total, matchKey, confidence, method };
}

// === معالجة كل البنود ===
const items = [];
for(let i = 4; i < raw.length; i++) {
  const row = raw[i];
  const num = row[0];
  if(!num || num === '' || num === 'الإجمالي' || num === 'الضريبة') continue;
  
  const unit = String(row[2] || '').trim();
  const qty = parseFloat(row[3]) || 0;
  const desc = String(row[4] || '').trim();
  if(!desc || qty === 0) continue;

  const pricing = priceItem(desc, unit, qty);
  items.push({
    no: num, unit, qty, desc: desc.substring(0, 120),
    ...pricing
  });
}

log('SUMMARY', 'اكتمل التسعير', { totalItems: items.length });

// === حساب الإجماليات ===
const grandTotal = items.reduce((s,i) => s + i.total, 0);
const vat = Math.round(grandTotal * 0.15);
const withVat = grandTotal + vat;

// === تجميع حسب التصنيف ===
const byCat = {};
items.forEach(it => {
  if(!byCat[it.cat]) byCat[it.cat] = { items: [], total: 0 };
  byCat[it.cat].items.push(it);
  byCat[it.cat].total += it.total;
});

// === طباعة النتائج ===
console.log(JSON.stringify({
  project: 'مشروع إنشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية',
  location: 'طريف - الحدود الشمالية',
  locationFactor: LOC_FACTOR,
  profitMargin: '15%',
  totalItems: items.length,
  grandTotal, vat, withVat,
  categories: Object.entries(byCat).map(([cat, data]) => ({
    category: cat,
    itemCount: data.items.length,
    total: data.total,
    percentage: ((data.total / grandTotal) * 100).toFixed(1) + '%'
  })).sort((a,b) => b.total - a.total),
  items: items.map(it => ({
    no: it.no, desc: it.desc, unit: it.unit, qty: it.qty,
    cat: it.cat, matchKey: it.matchKey, confidence: it.confidence,
    baseRate: it.baseRate, finalRate: it.finalRate, total: it.total
  })),
  brainLog: brainLog.slice(0, 5).concat([{msg: `... و ${brainLog.length - 5} خطوة أخرى`}])
}, null, 2));
