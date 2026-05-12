const xlsx = require('xlsx');
const OUTPUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\pro-pricing-platform\\تسعير_مدرسة_TBC\\Arba_Jeddah_152Villas_v2_12pct.xlsx';
const PROFIT = 1.12; // ✅ ربح 12% بدل 25%

// ══════ أسعار السوق المرجعية — جدة 2026-Q2 ══════
const MKT = {
  readymix_C15: 195, readymix_C25: 240, readymix_C30: 270,
  rebar_ton: 2800, rebar_kg: 2.8,
  formwork_m2: 65, pump_m3: 35, pump_boom: 45,
  block_20: 3.5, block_15: 3.0, block_10: 2.5,
  cement_bag: 22, sand_m3: 60, gravel_m3: 70,
  ceramic_60: 55, porcelain_60: 65, ceramic_wall: 55,
  marble_m2: 120, interlock: 40,
  paint_int_18L: 350, paint_ext_18L: 420,
  membrane_4mm: 38, eps_50mm: 25, xps_50mm: 40,
  plywood_18mm: 95, door_hdf: 350, door_main: 1200,
  window_alum_therm: 450, ac_split_2t: 2800,
};

// ══════ أسعار البنود المراجعة (ر.س/وحدة) — سوق جدة 2026 ══════
// كل سعر = مواد + عمالة + مستهلكات (بدون ربح)
const RATES = {
  // أعمال موقع
  excavation: 22, backfill: 35, antiTermite: 18, drainage: 8500,
  // خرسانة عادية
  blinding_C15: 280, plain_sidewalk: 300,
  // خرسانة مسلحة (شامل حديد+شدة+صب+عمالة)
  rc_footing: 850, rc_neck: 1395, rc_tiebeam: 1180,
  rc_col_gf: 1375, rc_col_ff: 1400,
  rc_beam_gf: 1180, rc_beam_ff: 1200,
  rc_slab_gf: 942, rc_slab_ff: 960,
  rc_stair: 1195, rc_annex: 980, rc_tank_wall: 1080, rc_sog: 708,
  // عزل
  wp_foundation: 35, wp_bathrooms: 55, insul_roof: 45, insul_wall: 38,
  // بناء
  block_20_ext: 75, block_15_int: 60, block_10_wc: 50,
  // لياسة
  plaster_ext: 42, plaster_int_gyp: 35,
  // بلاط
  porcelain_floor: 120, ceramic_wall: 95, marble_stair: 280, interlock_ext: 85,
  // دهان
  paint_int: 28, paint_ext: 38,
  // جبس
  gypsum_ceiling: 75, gypsum_cornice: 45,
  // خشب
  door_int_hdf: 1200, door_main: 4500, kitchen_cab: 1800,
  // ألمنيوم
  alum_window: 650, alum_door: 3200,
  // كهرباء
  elec_rate_m2: 120, led_rate_m2: 45, ext_light: 5500, fire_alarm: 8000,
  // سباكة
  plumb_rate_m2: 85, wc_set: 2800, tank_roof: 3500, heater: 4200, pump: 2800,
  // تكييف
  ac_rough_point: 1200, ac_unit: 3800,
  // خارجي
  fence_m: 450, gate_main: 12000, gate_ped: 3500,
};

// ══════ بيانات الفلل (من PDF المستخرج) ══════
const VILLAS = [
  { type:'01-A', area:245.12, ground:108.73, first:104.95, annex:31.44, rooms:5, count:8 },
  { type:'01-B', area:227.64, ground:108.73, first:104.95, annex:13.96, rooms:5, count:12 },
  { type:'01-C', area:198.08, ground:108.73, first:89.35, annex:0, rooms:5, count:14 },
  { type:'02-A', area:265.02, ground:117.93, first:111.83, annex:35.26, rooms:5, count:14 },
  { type:'02-B', area:244.08, ground:117.93, first:111.83, annex:14.32, rooms:5, count:33 },
  { type:'02-C', area:221.92, ground:117.93, first:89.67, annex:14.32, rooms:4, count:29 },
  { type:'03-A', area:269.68, ground:119.81, first:115.82, annex:34.05, rooms:5, count:15 },
  { type:'03-B', area:239.98, ground:119.81, first:102.25, annex:17.92, rooms:5, count:19 },
  { type:'04',   area:289.92, ground:128.67, first:124.61, annex:36.64, rooms:5, count:8 },
];

const totalVillas = VILLAS.reduce((s,v) => s + v.count, 0);
console.log(`\n🏗️ مشروع فلل جدة — ${totalVillas} فيلا | ربح ${(PROFIT-1)*100}%`);
console.log('═'.repeat(60));

// ══════ مولد BOQ لكل فيلا ══════
function generateBOQ(v) {
  const items = [];
  let n = 0;
  const add = (cat, desc, unit, qty, rate, notes) => {
    n++;
    const cost = Math.round(qty * rate);
    const sell = Math.round(cost * PROFIT);
    items.push({
      '#': n, القسم: cat, البند: desc, الوحدة: unit,
      الكمية: qty, 'سعر_الوحدة_تكلفة': rate,
      'إجمالي_تكلفة': cost,
      'سعر_الوحدة_بيع': Math.round(rate * PROFIT),
      'إجمالي_بيع': sell,
      'ربح_البند': sell - cost,
      ملاحظات: notes || ''
    });
  };
  const siteArea = v.ground * 1.3;

  // 1. أعمال الموقع (4 بنود)
  add('01-موقع', 'حفر وتسوية الموقع', 'م3', Math.round(siteArea*0.8), RATES.excavation, 'تربة عادية — سعر جدة');
  add('01-موقع', 'ردم وتدك بمواد مختارة', 'م3', Math.round(siteArea*0.5), RATES.backfill, 'ردم على طبقات 20سم');
  add('01-موقع', 'معالجة تربة ضد النمل الأبيض', 'م2', Math.round(v.ground), RATES.antiTermite, 'SBC متطلب');
  add('01-موقع', 'شبكة تصريف مياه أمطار', 'مقطوعية', 1, RATES.drainage, 'مواسير PVC + مناهل');

  // 2. خرسانة عادية (2 بند)
  add('02-خرسانة عادية', 'خرسانة نظافة C15 سماكة 10سم', 'م3', Math.round(v.ground*0.1), RATES.blinding_C15, 'C15 — 195 ر.س/م³ جدة');
  add('02-خرسانة عادية', 'خرسانة أرصفة وممرات', 'م3', Math.round(v.ground*0.05), RATES.plain_sidewalk, 'C20 — حول المبنى');

  // 3. خرسانة مسلحة (13 بند) — أكبر قسم
  add('03-خرسانة مسلحة', 'قواعد خرسانية مسلحة C30', 'م3', Math.round(v.ground*0.12), RATES.rc_footing, 'C30+حديد 100كجم/م³+شدة');
  add('03-خرسانة مسلحة', 'رقاب أعمدة', 'م3', Math.round(v.ground*0.03), RATES.rc_neck, 'C25+حديد 230كجم/م³');
  add('03-خرسانة مسلحة', 'ميدات أرضية (سملات ربط)', 'م3', Math.round(v.ground*0.08), RATES.rc_tiebeam, 'C25+حديد 180كجم/م³');
  add('03-خرسانة مسلحة', 'أعمدة الدور الأرضي', 'م3', Math.round(v.ground*0.04), RATES.rc_col_gf, 'C30+حديد 230كجم/م³');
  add('03-خرسانة مسلحة', 'أعمدة الدور الأول', 'م3', Math.round(v.first*0.04), RATES.rc_col_ff, 'C30+حديد 230كجم/م³');
  add('03-خرسانة مسلحة', 'كمرات الدور الأرضي', 'م3', Math.round(v.ground*0.06), RATES.rc_beam_gf, 'C30+حديد 180كجم/م³');
  add('03-خرسانة مسلحة', 'كمرات الدور الأول', 'م3', Math.round(v.first*0.06), RATES.rc_beam_ff, 'C30+حديد 180كجم/م³');
  add('03-خرسانة مسلحة', 'بلاطة سقف الأرضي 20سم', 'م3', Math.round(v.ground*0.2), RATES.rc_slab_gf, 'C25+حديد 120كجم/م³');
  add('03-خرسانة مسلحة', 'بلاطة سقف الأول 20سم', 'م3', Math.round(v.first*0.2), RATES.rc_slab_ff, 'C25+حديد 120كجم/م³');
  add('03-خرسانة مسلحة', 'درج خرساني مسلح', 'م3', 3, RATES.rc_stair, 'C25+حديد 200كجم/م³');
  if(v.annex>0) add('03-خرسانة مسلحة', 'خرسانة ملحق علوي', 'م3', Math.round(v.annex*0.15), RATES.rc_annex, 'C25');
  add('03-خرسانة مسلحة', 'جدران خزان مياه خرسانية', 'م3', 4, RATES.rc_tank_wall, 'C30 مقاوم كبريتات+عزل');
  add('03-خرسانة مسلحة', 'بلاطة أرضية SOG', 'م3', Math.round(v.ground*0.15), RATES.rc_sog, 'C25+شبك حديد');

  // 4. عزل (4 بنود)
  add('04-عزل', 'عزل مائي أساسات (بيتومين)', 'م2', Math.round(v.ground*1.5), RATES.wp_foundation, 'SBS 3مم+برايمر');
  add('04-عزل', 'عزل مائي حمامات ومطابخ', 'م2', Math.round(v.area*0.12), RATES.wp_bathrooms, 'سيكا 2 طبقة');
  add('04-عزل', 'عزل حراري أسقف (فوم 5سم)', 'م2', Math.round(v.ground), RATES.insul_roof, 'XPS 50مم SBC');
  add('04-عزل', 'عزل حراري جدران خارجية', 'م2', Math.round(v.area*0.6), RATES.insul_wall, 'EPS 50مم');

  // 5. بناء (3 بنود)
  add('05-بناء', 'بلوك 20سم جدران خارجية', 'م2', Math.round(v.area*0.8), RATES.block_20_ext, '12.5 بلكة/م²+مونة');
  add('05-بناء', 'بلوك 15سم جدران داخلية', 'م2', Math.round(v.area*0.5), RATES.block_15_int, '12.5 بلكة/م²+مونة');
  add('05-بناء', 'بلوك 10سم حمامات', 'م2', Math.round(v.area*0.15), RATES.block_10_wc, 'فواصل + تقسيمات');

  // 6. لياسة (2 بند)
  add('06-لياسة', 'لياسة خارجية إسمنتية', 'م2', Math.round(v.area*0.8), RATES.plaster_ext, '2سم+طرطشة');
  add('06-لياسة', 'لياسة داخلية جبسية', 'م2', Math.round(v.area*1.2), RATES.plaster_int_gyp, '1.5سم جبس');

  // 7. بلاط (4 بنود)
  add('07-بلاط', 'بورسلان أرضيات 60×60', 'م2', Math.round(v.area*0.7), RATES.porcelain_floor, 'متوسط+غراء+فوجة');
  add('07-بلاط', 'سيراميك جدران حمامات', 'م2', Math.round(v.area*0.2), RATES.ceramic_wall, '30×60+غراء');
  add('07-بلاط', 'رخام درج وبسطات', 'م2', 18, RATES.marble_stair, 'رخام طبيعي');
  add('07-بلاط', 'إنترلوك خارجي', 'م2', Math.round(siteArea*0.3), RATES.interlock_ext, '8سم+رمل+تدك');

  // 8. دهان (2 بند)
  add('08-دهان', 'دهان داخلي 3 أوجه (جوتن)', 'م2', Math.round(v.area*2.2), RATES.paint_int, 'برايمر+2 وجه');
  add('08-دهان', 'دهان خارجي مقاوم', 'م2', Math.round(v.area*0.6), RATES.paint_ext, '3 أوجه مقاوم أشعة');

  // 9. جبس (2 بند)
  add('09-جبس', 'أسقف جبس بورد مستعار', 'م2', Math.round(v.area*0.6), RATES.gypsum_ceiling, '12.5مم+هيكل');
  add('09-جبس', 'كرانيش وديكورات جبسية', 'م.ط', Math.round(v.area*0.3), RATES.gypsum_cornice, 'مقاسات متنوعة');

  // 10. أبواب (3 بنود)
  add('10-خشب', 'أبواب داخلية HDF', 'عدد', v.rooms*3, RATES.door_int_hdf, 'HDF+حلق+مفصلات');
  add('10-خشب', 'باب رئيسي خشب فاخر', 'عدد', 1, RATES.door_main, 'خشب زان/سنديان');
  add('10-خشب', 'دولاب مطبخ ألمنيوم', 'م.ط', 6, RATES.kitchen_cab, 'شامل رخام سطح');

  // 11. ألمنيوم (2 بند)
  add('11-ألمنيوم', 'نوافذ ألمنيوم زجاج مزدوج', 'م2', Math.round(v.area*0.08), RATES.alum_window, 'عازل حراري 6/12/6');
  add('11-ألمنيوم', 'باب ألمنيوم خارجي', 'عدد', 2, RATES.alum_door, 'شامل زجاج');

  // 12. كهرباء (4 بنود)
  add('12-كهرباء', 'تأسيس كهربائي شامل', 'مقطوعية', 1, Math.round(v.area*RATES.elec_rate_m2), 'نقاط+أسلاك+لوحات');
  add('12-كهرباء', 'إنارة داخلية LED', 'مقطوعية', 1, Math.round(v.area*RATES.led_rate_m2), 'LED Panel+Spot');
  add('12-كهرباء', 'إنارة خارجية', 'مقطوعية', 1, RATES.ext_light, 'جدارية+أرضية');
  add('12-كهرباء', 'نظام إنذار حريق', 'مقطوعية', 1, RATES.fire_alarm, 'لوحة+حساسات');

  // 13. سباكة (5 بنود)
  add('13-سباكة', 'تأسيس سباكة شامل', 'مقطوعية', 1, Math.round(v.area*RATES.plumb_rate_m2), 'PPR تغذية+PVC صرف');
  add('13-سباكة', 'أطقم حمامات', 'طقم', v.rooms, RATES.wc_set, 'مغسلة+مرحاض+خلاط');
  add('13-سباكة', 'خزان مياه علوي 2000L', 'عدد', 1, RATES.tank_roof, 'فايبر+عوامة');
  add('13-سباكة', 'سخان مياه مركزي', 'عدد', 1, RATES.heater, '100 لتر كهربائي');
  add('13-سباكة', 'مضخة مياه', 'عدد', 1, RATES.pump, 'ستانلس 1HP');

  // 14. تكييف (2 بند)
  add('14-تكييف', 'تأسيس تكييف سبليت', 'نقطة', v.rooms+2, RATES.ac_rough_point, 'مواسير+تصريف+كهرباء');
  add('14-تكييف', 'وحدات تكييف سبليت', 'عدد', v.rooms+1, RATES.ac_unit, '2 طن انفيرتر');

  // 15. أعمال خارجية (3 بنود)
  add('15-خارجي', 'سور خارجي بلوك+لياسة+دهان', 'م.ط', Math.round(Math.sqrt(siteArea)*4), RATES.fence_m, 'ارتفاع 2.5م');
  add('15-خارجي', 'بوابة حديد رئيسية (سيارات)', 'عدد', 1, RATES.gate_main, 'حديد مشكل+موتور');
  add('15-خارجي', 'بوابة مشاة', 'عدد', 1, RATES.gate_ped, 'حديد+قفل أمان');

  return items;
}

// ══════ إنشاء الإكسل ══════
const wb = xlsx.utils.book_new();

// ──── ورقة الملخص ────
const summary = VILLAS.map(v => {
  const boq = generateBOQ(v);
  const totalCost = boq.reduce((s,i) => s + i['إجمالي_تكلفة'], 0);
  const totalSell = boq.reduce((s,i) => s + i['إجمالي_بيع'], 0);
  const totalProfit = totalSell - totalCost;
  return {
    'نوع الفيلا': 'Type ' + v.type,
    'المساحة م²': v.area, 'أرضي م²': v.ground, 'أول م²': v.first,
    'ملحق م²': v.annex || 0, 'غرف': v.rooms, 'عدد الفلل': v.count,
    'تكلفة الفيلا': totalCost,
    'سعر البيع (12%)': totalSell,
    'ربح الفيلا': totalProfit,
    'نسبة الربح': Math.round(totalProfit/totalCost*100) + '%',
    'سعر م² (تكلفة)': Math.round(totalCost / v.area),
    'سعر م² (بيع)': Math.round(totalSell / v.area),
    'إجمالي النوع (تكلفة)': totalCost * v.count,
    'إجمالي النوع (بيع)': totalSell * v.count,
    'عدد البنود': boq.length,
  };
});

const summSheet = xlsx.utils.json_to_sheet(summary);
summSheet['!cols'] = Array(16).fill({ wch: 18 });
xlsx.utils.book_append_sheet(wb, summSheet, 'ملخص المشروع');

// ──── ورقة الإجمالي ────
const grandCost = summary.reduce((s,r) => s + r['إجمالي النوع (تكلفة)'], 0);
const grandSell = summary.reduce((s,r) => s + r['إجمالي النوع (بيع)'], 0);
const grandProfit = grandSell - grandCost;
const grandData = [
  { البند: `إجمالي ${totalVillas} فيلا (بدون ضريبة)`, التكلفة: grandCost, 'البيع 12%': grandSell },
  { البند: 'ضريبة القيمة المضافة 15%', التكلفة: Math.round(grandCost*0.15), 'البيع 12%': Math.round(grandSell*0.15) },
  { البند: 'الإجمالي شامل الضريبة', التكلفة: Math.round(grandCost*1.15), 'البيع 12%': Math.round(grandSell*1.15) },
  { البند: 'الربح الإجمالي', التكلفة: '', 'البيع 12%': grandProfit },
  { البند: 'نسبة الربح', التكلفة: '', 'البيع 12%': '12%' },
  { البند: '', التكلفة: '', 'البيع 12%': '' },
  { البند: '📊 مؤشرات', التكلفة: 'القيمة', 'البيع 12%': '' },
  { البند: 'متوسط تكلفة الفيلا', التكلفة: Math.round(grandCost/totalVillas), 'البيع 12%': '' },
  { البند: 'متوسط سعر بيع الفيلا', التكلفة: Math.round(grandSell/totalVillas), 'البيع 12%': '' },
  { البند: 'متوسط سعر م²', التكلفة: Math.round(grandCost / VILLAS.reduce((s,v)=>s+v.area*v.count,0)), 'البيع 12%': '' },
];
const grandSheet = xlsx.utils.json_to_sheet(grandData);
grandSheet['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 20 }];
xlsx.utils.book_append_sheet(wb, grandSheet, 'الإجمالي العام');

// ──── ورقة مقارنة الأسعار ────
const priceAudit = [];
Object.entries(RATES).forEach(([key, val]) => {
  priceAudit.push({ البند: key, 'سعر أربا': val, المرجع: 'reprice_v3 + marketPrices2026' });
});
const auditSheet = xlsx.utils.json_to_sheet(priceAudit);
xlsx.utils.book_append_sheet(wb, auditSheet, 'مراجعة الأسعار');

// ──── أوراق BOQ لكل نوع فيلا ────
VILLAS.forEach(v => {
  const boq = generateBOQ(v);
  const sheet = xlsx.utils.json_to_sheet(boq);
  sheet['!cols'] = [
    {wch:4},{wch:12},{wch:45},{wch:10},{wch:8},
    {wch:14},{wch:14},{wch:14},{wch:14},{wch:12},{wch:40}
  ];
  xlsx.utils.book_append_sheet(wb, sheet, 'Type_' + v.type);
});

xlsx.writeFile(wb, OUTPUT);

// ══════ طباعة النتائج ══════
console.log('\n✅ تم إنشاء الملف بنجاح!');
console.log('📁 المسار:', OUTPUT);
console.log('\n' + '═'.repeat(70));
console.log('📋 ملخص التسعير المراجع — ربح 12%');
console.log('═'.repeat(70));
summary.forEach(s => {
  console.log(`  ${s['نوع الفيلا'].padEnd(12)} | ${String(s['عدد الفلل']).padStart(2)} فيلا | ${String(s['المساحة م²']).padStart(6)} م² | تكلفة: ${s['تكلفة الفيلا'].toLocaleString().padStart(10)} | بيع: ${s['سعر البيع (12%)'].toLocaleString().padStart(10)} | ربح: ${s['نسبة الربح']}`);
});
console.log('═'.repeat(70));
console.log(`💰 إجمالي التكلفة (${totalVillas} فيلا): ${grandCost.toLocaleString()} ر.س`);
console.log(`💰 إجمالي البيع (12%):      ${grandSell.toLocaleString()} ر.س`);
console.log(`📈 إجمالي الربح:            ${grandProfit.toLocaleString()} ر.س`);
console.log(`📊 شامل الضريبة (15%):      ${Math.round(grandSell*1.15).toLocaleString()} ر.س`);
console.log(`📐 عدد البنود لكل فيلا:     ${summary[0]['عدد البنود']} بند (مراجع ومدقق)`);
console.log('═'.repeat(70));
