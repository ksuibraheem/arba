const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx');

const PROFIT = 1.15;
const unpriced = [];

// Classification + Fair Pricing for ALL unpriced items
function classifyAndPrice(desc, unit) {
  const d = desc.toLowerCase().replace(/\r?\n/g,' ');
  
  // === EARTHWORKS ===
  if(/excavat/i.test(d)) return { cat:'Earthworks', rate:18, note:'حفريات' };
  if(/backfill.*compact.*aggregate|basecourse/i.test(d)) return { cat:'Earthworks', rate:45, note:'ردم ركام ودمك' };
  if(/backfill.*compact.*crush.*gravel/i.test(d)) return { cat:'Earthworks', rate:55, note:'ردم حصى ودمك' };
  if(/backfill.*rock.*bed/i.test(d)) return { cat:'Earthworks', rate:65, note:'ردم صخري' };
  if(/backfill.*sand|sand.*fill|soil.*fill/i.test(d)) return { cat:'Earthworks', rate:25, note:'ردم رملي' };
  if(/levelling.*compact/i.test(d)) return { cat:'Earthworks', rate:8, note:'تسوية ودمك' };
  if(/anti.*termit/i.test(d)) return { cat:'Earthworks', rate:12, note:'مكافحة نمل أبيض' };
  
  // === TESTING ===
  if(/field.*density.*nuclear/i.test(d)) return { cat:'Testing', rate:350, note:'فحص كثافة حقلي' };
  if(/sieve.*analysis/i.test(d)) return { cat:'Testing', rate:250, note:'تحليل منخلي' };
  if(/modified.*proctor/i.test(d)) return { cat:'Testing', rate:350, note:'فحص بروكتور' };
  if(/max.*min.*relative.*density/i.test(d)) return { cat:'Testing', rate:350, note:'فحص كثافة نسبية' };
  
  // === FORMWORK & LABOR ===
  if(/formwork|shuttering/i.test(d)) return { cat:'Labor', rate:80, note:'شدات خشبية' };
  if(/labor.*concret|pour.*concret/i.test(d)) return { cat:'Labor', rate:85, note:'عمالة خرسانة' };
  if(/labor.*reinforc|fix.*reinforc/i.test(d)) return { cat:'Labor', rate:1200, note:'عمالة حديد/طن' };
  if(/labor.*block/i.test(d)) return { cat:'Labor', rate:45, note:'عمالة بلوك' };
  if(/steel.*stair/i.test(d)) return { cat:'Metalworks', rate:1800, note:'درج حديد' };
  if(/handrail.*glass|glass.*balustrade/i.test(d)) return { cat:'Metalworks', rate:1200, note:'درابزين زجاج مقسّى' };
  
  // === DOORS ===
  if(/single.*door.*wood|wd01|wd03/i.test(d)) return { cat:'Doors', rate:2800, note:'باب خشب ضلفة' };
  if(/doubl.*door.*wood|wd02|wd04/i.test(d)) return { cat:'Doors', rate:4200, note:'باب خشب ضلفتين' };
  if(/metal.*door|steel.*door|sd01/i.test(d)) return { cat:'Doors', rate:3500, note:'باب معدني' };
  if(/lo-01|lo-02|lo-05|louver/i.test(d)) return { cat:'Doors', rate:2500, note:'شباك لوفر' };
  
  // === CURTAIN WALL ===
  if(/curtain.*wall/i.test(d)) return { cat:'Curtain Wall', rate:1100, note:'حائط ستائري ألمنيوم+زجاج' };
  
  // === PLASTERING ===
  if(/rough.*plaster/i.test(d)) return { cat:'Plastering', rate:35, note:'لياسة خشنة' };
  if(/smooth.*plaster/i.test(d)) return { cat:'Plastering', rate:40, note:'لياسة ناعمة' };
  if(/screed/i.test(d)) return { cat:'Plastering', rate:45, note:'شيرة/سكريد' };
  
  // === WATERPROOFING ===
  if(/polyethylene.*sheet/i.test(d)) return { cat:'Waterproofing', rate:8, note:'شرائح بولي إثيلين' };
  if(/waterproof.*toilet|wet.*area/i.test(d)&&/m2/i.test(unit)) return { cat:'Waterproofing', rate:55, note:'عزل دورات مياه' };
  if(/pool.*area/i.test(d)) return { cat:'Waterproofing', rate:75, note:'عزل مسبح' };
  if(/fish.*pond/i.test(d)&&/waterproof|m2/i.test(d+unit)) return { cat:'Waterproofing', rate:85, note:'عزل بركة أسماك' };
  
  // === FLOORING ===
  if(/marble|travertine/i.test(d)&&/floor|ff01|tl02|sink|counter/i.test(d)) {
    if(/counter/i.test(d)) return { cat:'Finishes', rate:350, note:'كاونتر رخام ترافرتين' };
    if(/sink/i.test(d)) return { cat:'Sanitary', rate:2500, note:'مغسلة رخام ترافرتين' };
    if(/skirting/i.test(d)) return { cat:'Finishes', rate:120, note:'وزرة رخام' };
    return { cat:'Flooring', rate:250, note:'أرضيات رخام ترافرتين' };
  }
  if(/porcel|ff02/i.test(d)&&/floor|wet/i.test(d)) return { cat:'Flooring', rate:120, note:'بورسلين أرضيات' };
  if(/mosaic|ff03/i.test(d)) return { cat:'Flooring', rate:180, note:'موزاييك' };
  if(/anti.*slip.*beige|ff04/i.test(d)) return { cat:'Flooring', rate:95, note:'بلاط مانع انزلاق' };
  if(/carpet|ff06/i.test(d)) return { cat:'Flooring', rate:85, note:'موكيت/سجاد' };
  if(/wpc|wood.*plastic/i.test(d)) {
    if(/stair/i.test(d)) return { cat:'Flooring', rate:250, note:'WPC درج' };
    return { cat:'Flooring', rate:180, note:'أرضيات WPC' };
  }
  if(/concrete.*finish|epoxy.*finish|ff08/i.test(d)) return { cat:'Flooring', rate:85, note:'أرضيات خرسانية إيبوكسي' };
  if(/rubber.*pathway|rubber.*ball|rb01/i.test(d)) {
    if(/ballistic/i.test(d)) return { cat:'Special', rate:450, note:'جدران مطاطية ميدان رماية' };
    return { cat:'Flooring', rate:150, note:'ممرات مطاطية' };
  }
  if(/threshold/i.test(d)) return { cat:'Finishes', rate:180, note:'عتبة باب' };
  if(/skirting.*wood|sk01/i.test(d)) return { cat:'Finishes', rate:85, note:'وزرة خشب' };
  
  // === STONE ===
  if(/bassalt.*stone|hs01/i.test(d)) return { cat:'Hardscape', rate:250, note:'بازلت أرضيات' };
  if(/metara.*pavement|hs02/i.test(d)) return { cat:'Hardscape', rate:120, note:'بلاط ميتارا' };
  if(/curbstone/i.test(d)) return { cat:'Hardscape', rate:65, note:'بردورات' };
  if(/natural.*stone.*wall|stone.*cladding/i.test(d)) return { cat:'Cladding', rate:250, note:'تكسية حجر طبيعي' };
  if(/natural.*stone.*corner|st01.*corner/i.test(d)) return { cat:'Cladding', rate:180, note:'زوايا حجر طبيعي' };
  if(/jordanian.*stone|st01/i.test(d)) {
    if(/corner/i.test(d)) return { cat:'Cladding', rate:180, note:'زوايا حجر أردني' };
    return { cat:'Cladding', rate:280, note:'حجر أردني طبيعي' };
  }
  if(/stone.*floor|st02|st03/i.test(d)) {
    if(/pcs/i.test(unit)) return { cat:'Hardscape', rate:280, note:'حجر أرضيات قطعة' };
    return { cat:'Hardscape', rate:180, note:'حجر أرضيات' };
  }
  if(/cast.*river.*bank|st04/i.test(d)) return { cat:'Hardscape', rate:200, note:'ضفة نهر خرسانية' };
  if(/river.*rock.*gravel/i.test(d)) return { cat:'Hardscape', rate:80, note:'حصى نهري' };
  if(/pea.*gravel|gr02/i.test(d)) {
    if(/m3/i.test(unit)) return { cat:'Hardscape', rate:180, note:'حصى ناعم م³' };
    return { cat:'Hardscape', rate:35, note:'حصى ناعم م²' };
  }
  
  // === PAINTING ===
  if(/paint|pt01|juton|emulsion/i.test(d)) return { cat:'Painting', rate:28, note:'دهانات' };
  if(/anti.*fung/i.test(d)) return { cat:'Painting', rate:15, note:'دهان مضاد فطريات' };
  
  // === CEILINGS ===
  if(/gypsum.*board.*ceil|gc01|gc02|gc03/i.test(d)) {
    if(/moisture/i.test(d)) return { cat:'Ceilings', rate:95, note:'جبس بورد مقاوم رطوبة' };
    if(/fire.*rate/i.test(d)&&/moisture/i.test(d)) return { cat:'Ceilings', rate:110, note:'جبس بورد مقاوم حريق+رطوبة' };
    return { cat:'Ceilings', rate:85, note:'جبس بورد مقاوم حريق' };
  }
  if(/curtain.*cove/i.test(d)) return { cat:'Ceilings', rate:65, note:'كورنيش جبس' };
  if(/skylight.*wood/i.test(d)) return { cat:'Special', rate:1500, note:'سكايلايت مع ألواح خشب' };
  if(/wood.*fins/i.test(d)) return { cat:'Special', rate:650, note:'زعانف خشبية ديكور' };
  
  // === STEEL STRUCTURES ===
  if(/steel.*roof.*structure/i.test(d)) return { cat:'Steel', rate:450, note:'هيكل سقف حديد مجلفن' };
  if(/bridge.*steel/i.test(d)) return { cat:'Steel', rate:1200, note:'جسر حديد' };
  if(/metal.*l.*angle.*landscape/i.test(d)) return { cat:'Hardscape', rate:85, note:'زاوية حديد حواف' };
  
  // === SPECIAL ===
  if(/swimming.*pool/i.test(d)) return { cat:'Special', rate:350, note:'مسبح (تشطيب وعزل)' };
  if(/fish.*pond/i.test(d)) return { cat:'Special', rate:250, note:'بركة أسماك (تشطيب)' };
  if(/squash.*court|squach/i.test(d)) {
    if(/stair/i.test(d)) return { cat:'Special', rate:350, note:'درج ملعب سكواش' };
    return { cat:'Special', rate:350, note:'ملعب سكواش (تشطيب أرضيات)' };
  }
  if(/cinema.*room/i.test(d)) return { cat:'Special', rate:450, note:'غرفة سينما (تشطيب)' };
  if(/cinema.*tech/i.test(d)) return { cat:'Special', rate:350, note:'غرفة تقنية سينما' };
  if(/shooting.*range|ballistic/i.test(d)) return { cat:'Special', rate:450, note:'جدران ميدان رماية' };
  
  // === FURNITURE ===
  if(/bench.*concrete|external.*bench/i.test(d)) return { cat:'Furniture', rate:2500, note:'كرسي خرساني خارجي' };
  if(/trash.*bin|bin.*concrete/i.test(d)) return { cat:'Furniture', rate:1500, note:'سلة نفايات خرسانية' };
  if(/solid.*wood.*table/i.test(d)) {
    if(/530|5\.3/i.test(d)) return { cat:'Furniture', rate:8500, note:'طاولة خشب صلب 530سم' };
    return { cat:'Furniture', rate:5500, note:'طاولة خشب صلب 300سم' };
  }
  if(/outdoor.*chair|rattan/i.test(d)) return { cat:'Furniture', rate:1200, note:'كرسي خارجي راتان' };
  if(/stainless.*steel.*sink/i.test(d)) return { cat:'Kitchen', rate:3500, note:'حوض ستانلس مزدوج' };
  if(/stainless.*storage|steel.*storage/i.test(d)) return { cat:'Kitchen', rate:4500, note:'خزانة ستانلس' };
  if(/mini.*fridge/i.test(d)) return { cat:'Kitchen', rate:2800, note:'ثلاجة صغيرة خارجية' };
  if(/outdoor.*oven|electric.*oven/i.test(d)) return { cat:'Kitchen', rate:8500, note:'فرن كهربائي خارجي' };
  if(/outdoor.*grill|rottiseri/i.test(d)) return { cat:'Kitchen', rate:12000, note:'شواية كهربائية خارجية' };
  if(/pizza.*oven/i.test(d)) return { cat:'Kitchen', rate:15000, note:'فرن بيتزا غاز خارجي' };
  
  // === SANITARY ===
  if(/travertine.*sink/i.test(d)) return { cat:'Sanitary', rate:2500, note:'مغسلة رخام ترافرتين' };
  if(/mixer.*sink|faucet/i.test(d)) return { cat:'Sanitary', rate:650, note:'خلاط مغسلة' };
  if(/wc.*seat/i.test(d)) return { cat:'Sanitary', rate:1200, note:'مرحاض' };
  if(/shower.*tray.*door.*mixer/i.test(d)) return { cat:'Sanitary', rate:3500, note:'طقم دش كامل' };
  if(/jac[ck]uzi/i.test(d)) return { cat:'Sanitary', rate:25000, note:'جاكوزي' };
  if(/free.*stand.*bath/i.test(d)) return { cat:'Sanitary', rate:8500, note:'بانيو قائم' };
  if(/mirror/i.test(d)) return { cat:'Sanitary', rate:850, note:'مرآة حمام' };
  
  // === LANDSCAPE / SOFTSCAPE ===
  if(/grass|paspalum/i.test(d)) return { cat:'Softscape', rate:35, note:'عشب/نجيل' };
  if(/coconut.*palm/i.test(d)) return { cat:'Softscape', rate:1500, note:'نخيل جوز هند' };
  if(/olive.*tree/i.test(d)) return { cat:'Softscape', rate:800, note:'شجرة زيتون' };
  if(/mango.*tree/i.test(d)) return { cat:'Softscape', rate:350, note:'شجرة مانجو' };
  if(/apple.*tree/i.test(d)) return { cat:'Softscape', rate:250, note:'شجرة تفاح' };
  if(/jasmine/i.test(d)) return { cat:'Softscape', rate:180, note:'ياسمين' };
  if(/yoka|yucca/i.test(d)) return { cat:'Softscape', rate:250, note:'شجرة يوكا' };
  if(/sikas|cycas/i.test(d)) return { cat:'Softscape', rate:350, note:'شجرة سيكاس' };
  if(/sabani|canary/i.test(d)) return { cat:'Softscape', rate:2500, note:'نخيل كناري' };
  if(/acacia|glauca/i.test(d)) return { cat:'Softscape', rate:450, note:'شجرة أكاسيا' };
  if(/aromatic.*flower|flower.*bush/i.test(d)) return { cat:'Softscape', rate:65, note:'شجيرات زهور' };
  if(/green.*shrub/i.test(d)) return { cat:'Softscape', rate:45, note:'شجيرات خضراء' };
  if(/carissa/i.test(d)) return { cat:'Softscape', rate:25, note:'نبات كاريسا (غطاء أرضي)' };
  if(/bensatim|pensatim/i.test(d)) return { cat:'Softscape', rate:35, note:'بنساتيم' };
  if(/boulder/i.test(d)) return { cat:'Softscape', rate:1800, note:'صخور طبيعية ديكور' };
  
  // === TRAVERTINE CLADDING ===
  if(/travertine.*clad|tr01/i.test(d)) return { cat:'Cladding', rate:280, note:'تكسية ترافرتين' };
  
  // === MISSING ITEMS FIX ===
  if(/backfill.*existing.*soil|fill.*existing/i.test(d)) return { cat:'Earthworks', rate:20, note:'ردم بتربة موجودة' };
  if(/plate.*load.*test/i.test(d)) return { cat:'Testing', rate:1500, note:'فحص تحمل التربة' };
  if(/travertine.*skirting/i.test(d)) return { cat:'Finishes', rate:120, note:'وزرة ترافرتين' };
  if(/wood.*board.*ceil|wp01/i.test(d)) return { cat:'Ceilings', rate:250, note:'سقف ألواح خشب' };
  if(/access.*panel/i.test(d)) return { cat:'Ceilings', rate:350, note:'فتحة تفتيش سقف' };
  if(/cement.*board|cb01/i.test(d)) return { cat:'Cladding', rate:180, note:'ألواح أسمنتية خارجية' };
  if(/green.*area/i.test(d)) return { cat:'Softscape', rate:45, note:'مسطحات خضراء' };
  if(/shoring.*system|h.*beam.*plank/i.test(d)) return { cat:'Special', rate:85, note:'نظام سند جوانب حفر' };
  if(/porcel.*stair|ff02.*stair|marble.*stair/i.test(d)) return { cat:'Flooring', rate:120, note:'بورسلين/رخام درج' };
  if(/roof.*steel.*tv|steel.*structure.*tv/i.test(d)) return { cat:'Steel', rate:450, note:'هيكل سقف حديد TV' };
  if(/roof.*steel.*passage|steel.*structure.*passage/i.test(d)) return { cat:'Steel', rate:450, note:'هيكل سقف ممر' };
  if(/termite.*control|anit.*termit/i.test(d)) return { cat:'Earthworks', rate:12, note:'مكافحة نمل أبيض' };
  if(/steel.*structure.*approved|steel.*structure.*roof/i.test(d)) return { cat:'Steel', rate:550, note:'هيكل حديد إنشائي' };
  if(/gl0[1-5].*\d+mm.*\d+mm|frame.*brown.*ral/i.test(d)) return { cat:'Curtain Wall', rate:1100, note:'نافذة زجاج كبيرة بإطار' };
  if(/frosted.*glass/i.test(d)) return { cat:'Curtain Wall', rate:850, note:'زجاج مصنفر' };
  if(/smooth.*finish/i.test(d)) return { cat:'Plastering', rate:40, note:'لياسة/تشطيب ناعم' };
  if(/rough.*finish/i.test(d)) return { cat:'Plastering', rate:35, note:'لياسة/تشطيب خشن' };
  if(/parquet|engineered.*wood.*floor/i.test(d)) return { cat:'Flooring', rate:220, note:'باركيه خشب هندسي' };
  if(/porcelain.*grey.*matt|tl03/i.test(d)) return { cat:'Flooring', rate:95, note:'بورسلين رمادي مطفي' };
  if(/levelling.*compation/i.test(d)) return { cat:'Earthworks', rate:8, note:'تسوية ودمك' };
  
  // FALLBACK
  return { cat:'غير مصنّف', rate:0, note:'يحتاج مراجعة يدوية' };
}

wb.SheetNames.forEach(sName => {
  if(sName==='Codes'||sName==='Tot-Sum'||sName==='MEP Works') return;
  const ws = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  data.forEach((r,i) => {
    const desc = String(r[1]||r[0]||'').trim();
    const unit = String(r[2]||'').trim();
    const qty = parseFloat(r[3]) || 0;
    const rate = parseFloat(r[4]) || 0;
    if(qty > 0 && rate === 0 && desc.length > 3 && !/^DIV|DIVISION|BUA|TOTAL|SUB/i.test(desc)) {
      const cl = classifyAndPrice(desc, unit);
      const sellRate = Math.round(cl.rate * PROFIT);
      const total = Math.round(sellRate * qty);
      unpriced.push({
        sheet:sName, desc:desc.replace(/\r?\n/g,' ').substring(0,100),
        unit, qty:Math.round(qty*100)/100,
        cat:cl.cat, fairRate:cl.rate, sellRate, total, note:cl.note
      });
    }
  });
});

// Summary
const totalFair = unpriced.reduce((s,i)=>s+i.total, 0);
const stillUnclassified = unpriced.filter(i=>i.cat==='غير مصنّف');

console.log('=== تسعير البنود غير المسعّرة ===');
console.log('إجمالي:', unpriced.length, 'بند');
console.log('مصنّف:', unpriced.length - stillUnclassified.length);
console.log('غير مصنّف:', stillUnclassified.length);
console.log('إجمالي التسعير المقترح:', totalFair.toLocaleString('en'), 'ر.س');

console.log('\n=== حسب التصنيف ===');
const byCat = {};
unpriced.forEach(i => {
  if(!byCat[i.cat]) byCat[i.cat]={count:0,total:0};
  byCat[i.cat].count++; byCat[i.cat].total+=i.total;
});
Object.entries(byCat).sort((a,b)=>b[1].total-a[1].total).forEach(([c,d])=>
  console.log(c.padEnd(16)+' | '+String(d.count).padStart(3)+' بند | '+d.total.toLocaleString('en').padStart(12))
);

if(stillUnclassified.length>0) {
  console.log('\n=== بنود لم تُصنّف ===');
  stillUnclassified.forEach(i=>console.log(i.sheet+' | '+i.desc));
}

// Export Excel
const wbOut = XLSX.utils.book_new();
const rows = [
  ['تسعير البنود غير المسعّرة — مشروع المزرعة RE Farm Phase 02'],
  ['دماغ آربا — ربح صافي 15%'],
  [],
  ['المبنى','وصف البند','الوحدة','الكمية','التصنيف','تكلفة','سعر البيع','الإجمالي','ملاحظة']
];
unpriced.forEach(i => rows.push([i.sheet,i.desc,i.unit,i.qty,i.cat,i.fairRate,i.sellRate,i.total,i.note]));
rows.push([]);
rows.push(['','','','','','','إجمالي',totalFair,'']);

const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:10},{wch:60},{wch:5},{wch:8},{wch:14},{wch:8},{wch:8},{wch:12},{wch:25}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'تسعير البنود');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\تسعير_البنود_المراجع_v2_ARBA.xlsx';
XLSX.writeFile(wbOut, outPath);
console.log('\n✅', outPath);
