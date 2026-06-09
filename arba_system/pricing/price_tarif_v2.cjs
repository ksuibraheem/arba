/**
 * 🧠 ARBA Brain V2 — تسعير مشروع قيادة قوى طريف (محسّن)
 */
const XLSX = require('xlsx');
const fs = require('fs');

const benchmark = JSON.parse(fs.readFileSync('data/market_benchmark.json','utf8'));
const locations = JSON.parse(fs.readFileSync('data/location_multipliers.json','utf8'));
const rates = benchmark.rates;
const LOC = 1.15; // طريف
const PROFIT = 0.15;

const BOQ_PATH = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\الملحلة الثالثة\\مشروع انشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية\\جدول الكميات - قبل التسعير.xlsx';

const brainLog = [];
function log(p, m, d) { brainLog.push({phase:p, msg:m, ...d}); }

// === خريطة تسعير مفصّلة لكل بند حسب رقمه ===
// هذا تسعير يدوي محسّن للبنود التي لم يطابقها المحرك التلقائي
const manualPrices = {
  // أعمال ترابية وتأسيسية
  1: { rate: 25, cat: 'أعمال ترابية', key: 'excavation', conf: 'high', note: 'حفريات' },
  2: { rate: 38, cat: 'أعمال ترابية', key: 'backfill', conf: 'high', note: 'ردم وتسوية' },
  3: { rate: 300, cat: 'أعمال خرسانية', key: 'blinding', conf: 'high', note: 'خرسانة نظافة' },
  4: { rate: 880, cat: 'أعمال خرسانية', key: 'rc_footing', conf: 'high', note: 'قواعد خرسانية مسلحة' },
  5: { rate: 1200, cat: 'أعمال خرسانية', key: 'rc_tiebeam', conf: 'high', note: 'ميدة/شداد' },
  6: { rate: 1420, cat: 'أعمال خرسانية', key: 'rc_neck', conf: 'high', note: 'رقاب أعمدة' },
  7: { rate: 80, cat: 'أعمال بناء', key: 'block_20_ext', conf: 'high', note: 'بلوك أسمنتي معزول خارجي' },
  8: { rate: 65, cat: 'أعمال بناء', key: 'block_15_int', conf: 'high', note: 'بلوك أسمنتي داخلي' },
  9: { rate: 40, cat: 'لياسة', key: 'plaster_int', conf: 'high', note: 'لياسة أسمنتية داخلية وخارجية' },
  10: { rate: 35, cat: 'دهانات', key: 'paint_int', conf: 'high', note: 'دهانات داخلية' },
  11: { rate: 120, cat: 'أرضيات وتكسيات', key: 'porcelain_60', conf: 'high', note: 'بلاط أرضيات بورسلين' },
  12: { rate: 55, cat: 'عزل مائي', key: 'waterproofing', conf: 'high', note: 'عزل مائي للأساسات' },
  13: { rate: 730, cat: 'أعمال خرسانية', key: 'rc_sog', conf: 'high', note: 'خرسانة صبة نظافة تحت البلاط' },
  14: { rate: 90, cat: 'أعمال خارجية', key: 'landscape_paving', conf: 'high', note: 'إنترلوك خارجي' },
  15: { rate: 85, cat: 'أعمال خارجية', key: 'landscape_asphalt', conf: 'high', note: 'أسفلت' },
  16: { rate: 100, cat: 'أرضيات وتكسيات', key: 'ceramic_wall', conf: 'high', note: 'بلاط كيشاني جدران' },
  17: { rate: 300, cat: 'أرضيات وتكسيات', key: 'marble_stair', conf: 'high', note: 'رخام أرضيات ودرج' },
  18: { rate: 85, cat: 'أعمال خارجية', key: 'curb', conf: 'high', note: 'بردورات رصيف' },
  19: { rate: 90, cat: 'أعمال خارجية', key: 'paving_cement', conf: 'high', note: 'بلاط أسمنتي خارجي' },
  20: { rate: 3500, cat: 'أبواب', key: 'door_alum', conf: 'high', note: 'أبواب ألمنيوم D1' },
  21: { rate: 4500, cat: 'أبواب', key: 'door_wood_double', conf: 'high', note: 'أبواب خشب ضلفتين سنديان' },
  22: { rate: 2200, cat: 'أبواب', key: 'door_wood', conf: 'high', note: 'أبواب خشب ضلفة واحدة' },
  23: { rate: 1800, cat: 'أبواب', key: 'door_alum_small', conf: 'high', note: 'أبواب ألمنيوم صغيرة D4' },
  24: { rate: 2500, cat: 'أبواب', key: 'door_steel', conf: 'high', note: 'أبواب حديد مجلفن' },
  25: { rate: 3400, cat: 'نوافذ وألمنيوم', key: 'window_alum_W1', conf: 'high', note: 'شبابيك ألمنيوم W1 2.4×2م' },
  26: { rate: 6700, cat: 'نوافذ وألمنيوم', key: 'window_alum_W2', conf: 'high', note: 'شبابيك ألمنيوم W2 4.8×2م' },
  27: { rate: 5100, cat: 'نوافذ وألمنيوم', key: 'window_alum_W3', conf: 'high', note: 'شبابيك ألمنيوم W3 3.6×2م' },
  28: { rate: 850, cat: 'نوافذ وألمنيوم', key: 'window_alum_W4', conf: 'high', note: 'شبابيك ألمنيوم W4 1×1.2م' },
  29: { rate: 450, cat: 'نوافذ وألمنيوم', key: 'window_alum_W5', conf: 'high', note: 'شبابيك ألمنيوم W5 0.6×1م' },
  30: { rate: 1400, cat: 'نوافذ وألمنيوم', key: 'window_alum_W6', conf: 'high', note: 'شبابيك ألمنيوم W6 1×2م' },
  31: { rate: 95, cat: 'أسقف مستعارة', key: 'gypsum_board', conf: 'high', note: 'أسقف جبس بورد' },
  32: { rate: 75, cat: 'أسقف مستعارة', key: 'armstrong_alum', conf: 'high', note: 'أسقف أرمسترونج 60×60' },
  33: { rate: 85, cat: 'أسقف مستعارة', key: 'armstrong_30', conf: 'high', note: 'أسقف أرمسترونج 30×30' },
  34: { rate: 120, cat: 'عزل مائي وحراري', key: 'roof_waterproofing', conf: 'high', note: 'عزل أسطح مائي وحراري' },
  35: { rate: 4500, cat: 'تكييف', key: 'ac_vrf_outdoor', conf: 'high', note: 'وحدات VRF خارجية' },
  36: { rate: 85, cat: 'أعمال كهربائية', key: 'elec_switch', conf: 'high', note: 'مفتاح إنارة' },
  37: { rate: 85, cat: 'أعمال كهربائية', key: 'elec_switch', conf: 'high', note: 'مفتاح إنارة ثنائي' },
  38: { rate: 95, cat: 'أعمال كهربائية', key: 'elec_switch_triple', conf: 'high', note: 'مفتاح إنارة ثلاثي' },
  39: { rate: 85, cat: 'أعمال كهربائية', key: 'elec_outlet', conf: 'high', note: 'مقبس كهربائي' },
  40: { rate: 95, cat: 'أعمال كهربائية', key: 'elec_outlet_double', conf: 'high', note: 'مقبس كهربائي مزدوج' },
  41: { rate: 85, cat: 'أعمال كهربائية', key: 'elec_outlet_3phase', conf: 'high', note: 'مقبس كهربائي ثلاثي' },
  42: { rate: 120, cat: 'أعمال كهربائية', key: 'elec_outlet_floor', conf: 'high', note: 'مقبس أرضي' },
  43: { rate: 350, cat: 'تيار خفيف', key: 'elec_data_point', conf: 'high', note: 'نقطة بيانات' },
  44: { rate: 1200, cat: 'أعمال سباكة', key: 'plumb_wc', conf: 'high', note: 'مرحاض غربي' },
  45: { rate: 800, cat: 'أعمال سباكة', key: 'plumb_basin', conf: 'high', note: 'مغسلة' },
  46: { rate: 650, cat: 'أعمال سباكة', key: 'plumb_mixer', conf: 'high', note: 'خلاط مياه' },
  47: { rate: 120, cat: 'أعمال سباكة', key: 'plumb_floor_drain', conf: 'high', note: 'كرسي صرف أرضي' },
  48: { rate: 28, cat: 'أعمال سباكة', key: 'plumb_ppr_25', conf: 'high', note: 'مواسير PPR تغذية ساخن' },
  49: { rate: 38, cat: 'أعمال سباكة', key: 'plumb_ppr_32', conf: 'high', note: 'مواسير PPR تغذية بارد' },
  50: { rate: 55, cat: 'أعمال سباكة', key: 'plumb_cpvc', conf: 'high', note: 'شبكة مواسير CPVC داخلية' },
  51: { rate: 2500, cat: 'أعمال سباكة', key: 'plumb_pressure_valve', conf: 'medium', note: 'محبس تخفيض ضغط' },
  52: { rate: 8500, cat: 'أعمال سباكة', key: 'plumb_heater_300', conf: 'high', note: 'سخان مياه 300 لتر' },
  53: { rate: 6500, cat: 'أعمال سباكة', key: 'plumb_tank_5000', conf: 'high', note: 'خزان مياه علوي 5000 لتر' },
  54: { rate: 18000, cat: 'أعمال سباكة', key: 'plumb_pump_system', conf: 'high', note: 'مضخة تعزيز 3 حصان + خزان ضغط' },
  55: { rate: 85, cat: 'أعمال سباكة', key: 'plumb_upvc_drain', conf: 'high', note: 'مواسير صرف UPVC داخلية' },
  56: { rate: 110, cat: 'أعمال سباكة', key: 'plumb_upvc_ext', conf: 'high', note: 'مواسير صرف UPVC خارجية' },
  57: { rate: 150, cat: 'أعمال سباكة', key: 'plumb_upvc_main', conf: 'high', note: 'مواسير صرف رئيسية' },
  58: { rate: 4500, cat: 'أعمال سباكة', key: 'plumb_manhole', conf: 'high', note: 'غرف تفتيش صرف' },
  59: { rate: 4500, cat: 'أعمال سباكة', key: 'plumb_manhole_ext', conf: 'high', note: 'غرف تفتيش خارجية' },
  60: { rate: 35000, cat: 'أعمال سباكة', key: 'plumb_septic', conf: 'high', note: 'خزان تحليل' },
  61: { rate: 4500, cat: 'أعمال سباكة', key: 'plumb_grease_trap', conf: 'high', note: 'حاجز دهون' },
  62: { rate: 15000, cat: 'أعمال سباكة', key: 'plumb_tank_ground', conf: 'high', note: 'خزان أرضي' },
  // إنارة
  63: { rate: 280, cat: 'أعمال كهربائية', key: 'elec_light_led', conf: 'high', note: 'إنارة LED مكاتب' },
  64: { rate: 320, cat: 'أعمال كهربائية', key: 'elec_light_corridor', conf: 'high', note: 'إنارة ممرات' },
  65: { rate: 450, cat: 'أعمال كهربائية', key: 'elec_light_emrg', conf: 'high', note: 'إنارة طوارئ' },
  66: { rate: 350, cat: 'أعمال كهربائية', key: 'elec_light_ext', conf: 'high', note: 'إنارة خارجية' },
  67: { rate: 250, cat: 'أعمال كهربائية', key: 'elec_light_wc', conf: 'high', note: 'إنارة دورات مياه' },
  68: { rate: 380, cat: 'أعمال كهربائية', key: 'elec_light_stair', conf: 'high', note: 'إنارة درج' },
  69: { rate: 550, cat: 'أعمال كهربائية', key: 'elec_projector', conf: 'high', note: 'كشاف إنارة خارجي' },
  70: { rate: 280, cat: 'أعمال كهربائية', key: 'elec_light_kitchen', conf: 'high', note: 'إنارة مطبخ' },
  71: { rate: 2500, cat: 'أعمال كهربائية', key: 'elec_pole_light', conf: 'high', note: 'عمود إنارة خارجي' },
  72: { rate: 85, cat: 'أعمال كهربائية', key: 'elec_outlet_all', conf: 'high', note: 'مقابس كهربائية متنوعة' },
  73: { rate: 350, cat: 'تيار خفيف', key: 'elec_tel_point', conf: 'high', note: 'نقطة هاتف' },
  74: { rate: 350, cat: 'تيار خفيف', key: 'elec_data_point2', conf: 'high', note: 'نقطة بيانات' },
  75: { rate: 2200, cat: 'تيار خفيف', key: 'elec_intercom', conf: 'high', note: 'نظام اتصال داخلي' },
  76: { rate: 1800, cat: 'تيار خفيف', key: 'elec_cctv', conf: 'high', note: 'كاميرات مراقبة' },
  77: { rate: 350, cat: 'تيار خفيف', key: 'elec_pa_speaker', conf: 'high', note: 'سماعات صوتية' },
  78: { rate: 8500, cat: 'تكييف', key: 'ac_vrf_indoor', conf: 'high', note: 'وحدة تكييف VRF داخلية' },
  79: { rate: 45000, cat: 'أنظمة الحريق', key: 'fire_alarm_panel', conf: 'high', note: 'لوحة إنذار حريق رئيسية' },
  80: { rate: 301, cat: 'أنظمة الحريق', key: 'fire_alarm_device', conf: 'high', note: 'كاشفات/أجهزة إنذار حريق' },
  81: { rate: 2800, cat: 'أنظمة الحريق', key: 'fire_hose_cab', conf: 'high', note: 'صناديق حريق' },
  82: { rate: 350, cat: 'أنظمة الحريق', key: 'fire_ext', conf: 'high', note: 'طفايات حريق' },
  83: { rate: 3200, cat: 'أنظمة الحريق', key: 'fire_sprinkler_zone', conf: 'high', note: 'نظام رشاش حريق' },
  84: { rate: 25000, cat: 'أعمال كهربائية', key: 'elec_ups', conf: 'high', note: 'UPS' },
  85: { rate: 35000, cat: 'أعمال كهربائية', key: 'elec_ats', conf: 'high', note: 'نظام تحويل تلقائي ATS' },
  86: { rate: 180000, cat: 'أعمال كهربائية', key: 'elec_genset', conf: 'high', note: 'مولد كهربائي' },
  87: { rate: 3500, cat: 'تيار خفيف', key: 'elec_access_control', conf: 'high', note: 'نظام تحكم دخول' },
  88: { rate: 850, cat: 'أعمال كهربائية', key: 'elec_conduit_set', conf: 'high', note: 'حوامل ومواسير كهربائية' },
  89: { rate: 180, cat: 'أعمال كهربائية', key: 'cable_4x10', conf: 'high', note: 'كابل 4×10+6' },
  90: { rate: 45, cat: 'أعمال كهربائية', key: 'elec_wire', conf: 'high', note: 'أسلاك كهربائية' },
  91: { rate: 2200, cat: 'أبواب', key: 'door_wood_single_D5', conf: 'high', note: 'باب خشب ضلفة D5' },
  92: { rate: 3800, cat: 'أبواب', key: 'door_wood_double_D3', conf: 'high', note: 'باب خشب ضلفتين D3' },
  93: { rate: 95000, cat: 'أعمال كهربائية', key: 'elec_transformer', conf: 'high', note: 'محول كهربائي' },
  94: { rate: 8500, cat: 'أعمال كهربائية', key: 'elec_mcc', conf: 'high', note: 'لوحة تحكم محركات' },
  95: { rate: 1800, cat: 'تيار خفيف', key: 'elec_cctv_dvr', conf: 'high', note: 'جهاز تسجيل كاميرات' },
  96: { rate: 35000, cat: 'أعمال كهربائية', key: 'elec_panel_main_MDB', conf: 'high', note: 'لوحة توزيع رئيسية MDB' },
  97: { rate: 35000, cat: 'أعمال كهربائية', key: 'elec_panel_EMDB', conf: 'high', note: 'لوحة توزيع طوارئ EMDB' },
  98: { rate: 28000, cat: 'أعمال كهربائية', key: 'elec_panel_ACLP', conf: 'high', note: 'لوحة توزيع تكييف' },
  99: { rate: 15000, cat: 'أعمال كهربائية', key: 'elec_panel_LP', conf: 'high', note: 'لوحة توزيع إنارة LP' },
  100: { rate: 12000, cat: 'أعمال كهربائية', key: 'elec_panel_ELP_main', conf: 'high', note: 'لوحة طوارئ إنارة' },
  101: { rate: 12000, cat: 'أعمال كهربائية', key: 'elec_panel_PP', conf: 'high', note: 'لوحة مقابس PP' },
  102: { rate: 10000, cat: 'أعمال كهربائية', key: 'elec_panel_EPP', conf: 'high', note: 'لوحة مقابس طوارئ' },
  103: { rate: 8000, cat: 'أعمال كهربائية', key: 'elec_panel_sub_ELP1', conf: 'high', note: 'لوحة فرعية ELP1' },
  104: { rate: 8000, cat: 'أعمال كهربائية', key: 'elec_panel_sub_ELP2', conf: 'high', note: 'لوحة فرعية ELP2' },
  105: { rate: 180, cat: 'أعمال كهربائية', key: 'cable_4x10_6', conf: 'high', note: 'كابل 4×10+6 نحاس مدرع' },
  106: { rate: 250, cat: 'أعمال كهربائية', key: 'cable_4x16_10', conf: 'high', note: 'كابل 4×16+10 نحاس مدرع' },
  107: { rate: 850, cat: 'أعمال كهربائية', key: 'cable_4x185_90', conf: 'high', note: 'كابل 4×185+90 نحاس مدرع' },
  108: { rate: 550, cat: 'أعمال كهربائية', key: 'cable_4x120_70', conf: 'high', note: 'كابل 4×120+70 نحاس مدرع' },
  109: { rate: 45000, cat: 'تأريض وصواعق', key: 'lightning_system', conf: 'high', note: 'نظام مضاد صواعق' },
  110: { rate: 25000, cat: 'تأريض وصواعق', key: 'earthing_beam', conf: 'high', note: 'تأريض داخل الخرسانة' },
  111: { rate: 3500, cat: 'تأريض وصواعق', key: 'earthpit', conf: 'high', note: 'حفرة تأريض Earthpit' },
};

// === قراءة BOQ ===
const wb = XLSX.readFile(BOQ_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

const items = [];
for(let i = 4; i < raw.length; i++) {
  const row = raw[i];
  const num = parseInt(row[0]);
  if(isNaN(num)) continue;
  
  const unit = String(row[2] || '').trim();
  const qty = parseFloat(row[3]) || 0;
  const desc = String(row[4] || '').trim();
  if(!desc || qty === 0) continue;

  const mp = manualPrices[num];
  let baseRate, cat, key, conf, note;
  
  if(mp) {
    baseRate = mp.rate; cat = mp.cat; key = mp.key; conf = mp.conf; note = mp.note;
    log('MATCH', `بند ${num}: مطابقة مباشرة من الدماغ`, {key, rate: baseRate});
  } else {
    baseRate = 500; cat = 'أخرى'; key = 'unmatched'; conf = 'low'; note = 'تقدير';
    log('FALLBACK', `بند ${num}: تسعير تقديري`, {desc: desc.substring(0,50)});
  }

  const locRate = Math.round(baseRate * LOC);
  const finalRate = Math.round(locRate * (1 + PROFIT));
  const total = Math.round(finalRate * qty);

  items.push({ no: num, unit, qty, desc: desc.substring(0, 150), cat, key, conf, note, baseRate, locRate, finalRate, total });
}

// === إجماليات ===
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

console.log(JSON.stringify({
  project: 'مشروع إنشاء وتجهيز مبنى قيادة قوى طريف - القوات البرية',
  location: 'طريف - الحدود الشمالية',
  locationFactor: LOC,
  profitMargin: '15%',
  totalItems: items.length,
  grandTotal, vat, withVat,
  categories: Object.entries(byCat).map(([c, d]) => ({
    category: c, count: d.items.length, total: d.total,
    pct: ((d.total / grandTotal) * 100).toFixed(1) + '%'
  })).sort((a,b) => b.total - a.total),
  items,
  brainLog: brainLog.length + ' خطوة'
}, null, 2));
