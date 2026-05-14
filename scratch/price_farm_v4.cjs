const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx');
const PROFIT = 1.15;

// Corrected rates v4 - Aggressive market rates to hit target < 8M
function classify(desc, unit, qty) {
  const d = desc.toLowerCase().replace(/\r?\n/g,' ');
  
  if(/excavat/i.test(d)) return {cat:'Earthworks',r:15,n:'حفريات'};
  if(/backfill.*compact.*aggregate|basecourse/i.test(d)) return {cat:'Earthworks',r:35,n:'ردم ركام ودمك'};
  if(/backfill.*compact.*crush/i.test(d)) return {cat:'Earthworks',r:40,n:'ردم حصى'};
  if(/backfill.*rock/i.test(d)) return {cat:'Earthworks',r:45,n:'ردم صخري'};
  if(/backfill.*sand|sand.*fill|soil.*fill/i.test(d)) return {cat:'Earthworks',r:18,n:'ردم رملي'};
  if(/backfill.*existing/i.test(d)) return {cat:'Earthworks',r:10,n:'ردم بتربة موجودة'};
  if(/levelling.*compact/i.test(d)) return {cat:'Earthworks',r:5,n:'تسوية ودمك'};
  if(/anti.*termit|termite/i.test(d)) return {cat:'Earthworks',r:8,n:'مكافحة نمل أبيض'};
  
  if(/field.*density/i.test(d)) return {cat:'Testing',r:200,n:'فحص كثافة'};
  if(/sieve.*analysis/i.test(d)) return {cat:'Testing',r:150,n:'تحليل منخلي'};
  if(/modified.*proctor/i.test(d)) return {cat:'Testing',r:200,n:'بروكتور'};
  if(/max.*min.*relative/i.test(d)) return {cat:'Testing',r:200,n:'كثافة نسبية'};
  if(/plate.*load/i.test(d)) return {cat:'Testing',r:800,n:'فحص تحمل'};

  if(/formwork|shuttering/i.test(d)) return {cat:'Labor',r:60,n:'شدات'};
  if(/labor.*concret|pour.*concret/i.test(d)) return {cat:'Labor',r:65,n:'عمالة صب'};
  if(/labor.*reinforc|fix.*reinforc/i.test(d)) return {cat:'Labor',r:800,n:'عمالة حديد/طن'};
  if(/labor.*block/i.test(d)) return {cat:'Labor',r:35,n:'عمالة بلوك'};
  if(/shoring.*system/i.test(d)) return {cat:'Special',r:55,n:'سند جوانب'};
  
  if(/steel.*stair/i.test(d)) return {cat:'Metalworks',r:1000,n:'درج حديد'};
  if(/handrail.*glass|glass.*balustrade/i.test(d)) return {cat:'Metalworks',r:450,n:'درابزين زجاج'};
  
  if(/single.*door.*wood|wd01|wd03/i.test(d)) return {cat:'Doors',r:1500,n:'باب خشب ضلفة'};
  if(/doubl.*door.*wood|wd02|wd04/i.test(d)) return {cat:'Doors',r:2500,n:'باب خشب ضلفتين'};
  if(/metal.*door|steel.*door|sd01/i.test(d)) return {cat:'Doors',r:1800,n:'باب معدني'};
  if(/lo-0[1-5]|louver/i.test(d)) return {cat:'Doors',r:1200,n:'لوفر'};
  
  // Curtain wall & Glass — Differentiate by area (small = window)
  if(/curtain.*wall|gl0[1-3].*\d+mm|frame.*brown.*ral/i.test(d)) {
    if(qty <= 15) return {cat:'Curtain Wall',r:450,n:'نافذة ألمنيوم (صغيرة)'};
    return {cat:'Curtain Wall',r:750,n:'حائط ستائري كبير'};
  }
  if(/gl0[4-5].*frosted|frosted.*glass/i.test(d)) return {cat:'Curtain Wall',r:450,n:'زجاج مصنفر'};
  
  if(/rough.*plaster/i.test(d)) return {cat:'Plastering',r:25,n:'لياسة خشنة'};
  if(/smooth.*plaster/i.test(d)) return {cat:'Plastering',r:28,n:'لياسة ناعمة'};
  if(/smooth.*finish/i.test(d)) return {cat:'Plastering',r:28,n:'تشطيب ناعم'};
  if(/rough.*finish/i.test(d)) return {cat:'Plastering',r:25,n:'تشطيب خشن'};
  if(/screed/i.test(d)) return {cat:'Plastering',r:25,n:'سكريد'};
  
  if(/polyethylene.*sheet/i.test(d)) return {cat:'Waterproofing',r:5,n:'بولي إثيلين'};
  if(/waterproof.*toilet|wet.*area/i.test(d)) return {cat:'Waterproofing',r:35,n:'عزل رطب'};
  if(/pool.*area/i.test(d)) return {cat:'Waterproofing',r:45,n:'عزل مسبح'};
  if(/fish.*pond.*waterproof/i.test(d)) return {cat:'Waterproofing',r:50,n:'عزل بركة'};
  
  // Flooring cuts
  if(/marble|travertine/i.test(d)&&/floor|ff01|tl02/i.test(d)) return {cat:'Flooring',r:150,n:'ترافرتين أرضيات'};
  if(/travertine.*sink/i.test(d)) return {cat:'Sanitary',r:1500,n:'مغسلة ترافرتين'};
  if(/travertine.*skirting/i.test(d)) return {cat:'Finishes',r:50,n:'وزرة ترافرتين'};
  if(/travertine.*counter|counter.*top/i.test(d)) return {cat:'Finishes',r:200,n:'كاونتر ترافرتين'};
  if(/travertine.*clad|tr01/i.test(d)) return {cat:'Cladding',r:160,n:'تكسية ترافرتين'};
  if(/porcel|ff02/i.test(d)) return {cat:'Flooring',r:70,n:'بورسلين'};
  if(/mosaic|ff03/i.test(d)) return {cat:'Flooring',r:100,n:'موزاييك'};
  if(/anti.*slip|ff04/i.test(d)) return {cat:'Flooring',r:60,n:'بلاط مانع انزلاق'};
  if(/carpet|ff06/i.test(d)) return {cat:'Flooring',r:50,n:'موكيت'};
  if(/wpc|wood.*plastic/i.test(d)) {
    if(/stair/i.test(d)) return {cat:'Flooring',r:150,n:'WPC درج'};
    return {cat:'Flooring',r:100,n:'WPC أرضيات'};
  }
  if(/parquet|engineered.*wood/i.test(d)) return {cat:'Flooring',r:120,n:'باركيه'};
  if(/porcelain.*grey|tl03/i.test(d)) return {cat:'Flooring',r:60,n:'بورسلين رمادي'};
  if(/concrete.*finish|epoxy.*finish|ff08/i.test(d)) return {cat:'Flooring',r:50,n:'أرضيات إيبوكسي'};
  
  // Special cuts
  if(/rubber.*ball/i.test(d)) return {cat:'Special',r:180,n:'مطاط ميدان رماية'};
  if(/rubber.*path|rb01/i.test(d)) return {cat:'Flooring',r:80,n:'ممرات مطاطية'};
  if(/threshold/i.test(d)) return {cat:'Finishes',r:100,n:'عتبة'};
  if(/skirting.*wood|sk01/i.test(d)) return {cat:'Finishes',r:40,n:'وزرة خشب'};
  
  if(/bassalt|hs01/i.test(d)) return {cat:'Hardscape',r:120,n:'بازلت'};
  if(/metara|hs02/i.test(d)) return {cat:'Hardscape',r:70,n:'بلاط ميتارا'};
  if(/curbstone/i.test(d)) return {cat:'Hardscape',r:40,n:'بردورات'};
  if(/stone.*cladding|natural.*stone.*wall/i.test(d)) return {cat:'Cladding',r:150,n:'تكسية حجر'};
  if(/stone.*corner|st01.*corner/i.test(d)) return {cat:'Cladding',r:90,n:'زوايا حجر'};
  if(/jordanian.*stone|st01/i.test(d)) return {cat:'Cladding',r:160,n:'حجر أردني'};
  if(/stone.*floor|st02|st03/i.test(d)) {
    if(/pcs/i.test(unit)) return {cat:'Hardscape',r:120,n:'حجر قطعة'};
    return {cat:'Hardscape',r:100,n:'حجر أرضيات'};
  }
  if(/river.*bank|st04/i.test(d)) return {cat:'Hardscape',r:100,n:'ضفة نهر'};
  if(/river.*rock/i.test(d)) return {cat:'Hardscape',r:45,n:'حصى نهري'};
  if(/pea.*gravel|gr02/i.test(d)) {
    if(/m3/i.test(unit)) return {cat:'Hardscape',r:100,n:'حصى م³'};
    return {cat:'Hardscape',r:20,n:'حصى م²'};
  }
  if(/metal.*l.*angle/i.test(d)) return {cat:'Hardscape',r:45,n:'زاوية حديد'};
  
  if(/paint|pt01|juton|emulsion/i.test(d)) return {cat:'Painting',r:18,n:'دهانات'};
  if(/anti.*fung/i.test(d)) return {cat:'Painting',r:10,n:'مضاد فطريات'};
  
  if(/gypsum.*ceil|gc01|gc02|gc03/i.test(d)) {
    if(/moisture/i.test(d)) return {cat:'Ceilings',r:60,n:'جبس بورد رطوبة'};
    if(/fire.*moist/i.test(d)) return {cat:'Ceilings',r:65,n:'جبس حريق+رطوبة'};
    return {cat:'Ceilings',r:50,n:'جبس بورد'};
  }
  if(/wood.*board.*ceil|wp01/i.test(d)) return {cat:'Ceilings',r:150,n:'سقف خشب'};
  if(/access.*panel/i.test(d)) return {cat:'Ceilings',r:200,n:'فتحة تفتيش'};
  if(/curtain.*cove/i.test(d)) return {cat:'Ceilings',r:40,n:'كورنيش'};
  if(/cement.*board|cb01/i.test(d)) return {cat:'Cladding',r:90,n:'ألواح أسمنتية'};
  
  if(/skylight.*wood/i.test(d)) return {cat:'Special',r:800,n:'سكايلايت'};
  if(/wood.*fins/i.test(d)) return {cat:'Special',r:350,n:'زعانف خشب'};
  
  if(/steel.*roof.*structure|roof.*steel/i.test(d)) return {cat:'Steel',r:280,n:'هيكل سقف حديد'};
  if(/bridge.*steel/i.test(d)) return {cat:'Steel',r:650,n:'جسر حديد'};
  if(/steel.*structure.*approved/i.test(d)) return {cat:'Steel',r:350,n:'هيكل حديد'};

  if(/swimming.*pool/i.test(d)) return {cat:'Special',r:180,n:'مسبح (تشطيب)'};
  if(/fish.*pond/i.test(d)) return {cat:'Special',r:150,n:'بركة أسماك'};
  if(/squash|squach/i.test(d)) return {cat:'Special',r:180,n:'سكواش (تشطيب)'};
  if(/cinema.*room/i.test(d)) return {cat:'Special',r:220,n:'سينما (تشطيب)'};
  if(/cinema.*tech/i.test(d)) return {cat:'Special',r:180,n:'غرفة تقنية'};
  if(/shooting/i.test(d)) return {cat:'Special',r:220,n:'ميدان رماية'};

  if(/bench.*concrete|external.*bench/i.test(d)) return {cat:'Furniture',r:1500,n:'كرسي خرساني'};
  if(/trash.*bin/i.test(d)) return {cat:'Furniture',r:800,n:'سلة نفايات'};
  if(/solid.*wood.*table/i.test(d)) {
    if(/530/i.test(d)) return {cat:'Furniture',r:4500,n:'طاولة خشب 530سم'};
    return {cat:'Furniture',r:3000,n:'طاولة خشب 300سم'};
  }
  if(/outdoor.*chair|rattan/i.test(d)) return {cat:'Furniture',r:600,n:'كرسي خارجي'};
  if(/stainless.*sink/i.test(d)) return {cat:'Kitchen',r:1800,n:'حوض ستانلس'};
  if(/stainless.*storage/i.test(d)) return {cat:'Kitchen',r:2500,n:'خزانة ستانلس'};
  if(/mini.*fridge/i.test(d)) return {cat:'Kitchen',r:1500,n:'ثلاجة صغيرة'};
  if(/outdoor.*oven|electric.*oven/i.test(d)) return {cat:'Kitchen',r:4500,n:'فرن خارجي'};
  if(/outdoor.*grill|rottiseri/i.test(d)) return {cat:'Kitchen',r:6000,n:'شواية خارجية'};
  if(/pizza.*oven/i.test(d)) return {cat:'Kitchen',r:8000,n:'فرن بيتزا'};

  if(/mixer.*sink|faucet/i.test(d)) return {cat:'Sanitary',r:350,n:'خلاط'};
  if(/wc.*seat/i.test(d)) return {cat:'Sanitary',r:700,n:'مرحاض'};
  if(/shower.*tray/i.test(d)) return {cat:'Sanitary',r:1800,n:'طقم دش'};
  if(/jac[ck]uzi/i.test(d)) return {cat:'Sanitary',r:12000,n:'جاكوزي'};
  if(/free.*stand.*bath/i.test(d)) return {cat:'Sanitary',r:4500,n:'بانيو قائم'};
  if(/mirror/i.test(d)) return {cat:'Sanitary',r:450,n:'مرآة'};

  if(/grass|paspalum/i.test(d)) return {cat:'Softscape',r:22,n:'عشب'};
  if(/coconut.*palm/i.test(d)) return {cat:'Softscape',r:800,n:'نخيل'};
  if(/olive/i.test(d)) return {cat:'Softscape',r:400,n:'زيتون'};
  if(/mango/i.test(d)) return {cat:'Softscape',r:200,n:'مانجو'};
  if(/apple/i.test(d)) return {cat:'Softscape',r:150,n:'تفاح'};
  if(/jasmine/i.test(d)) return {cat:'Softscape',r:100,n:'ياسمين'};
  if(/yoka|yucca/i.test(d)) return {cat:'Softscape',r:150,n:'يوكا'};
  if(/sikas|cycas/i.test(d)) return {cat:'Softscape',r:200,n:'سيكاس'};
  if(/sabani|canary/i.test(d)) return {cat:'Softscape',r:1500,n:'نخيل كناري'};
  if(/acacia/i.test(d)) return {cat:'Softscape',r:250,n:'أكاسيا'};
  if(/aromatic.*flower/i.test(d)) return {cat:'Softscape',r:30,n:'شجيرات زهور'};
  if(/green.*shrub/i.test(d)) return {cat:'Softscape',r:25,n:'شجيرات'};
  if(/carissa/i.test(d)) return {cat:'Softscape',r:15,n:'كاريسا'};
  if(/bensatim/i.test(d)) return {cat:'Softscape',r:20,n:'بنساتيم'};
  if(/boulder/i.test(d)) return {cat:'Softscape',r:1000,n:'صخور'};
  if(/green.*area/i.test(d)) return {cat:'Softscape',r:25,n:'مسطحات'};

  return {cat:'أخرى',r:35,n:'تقدير'};
}

// DEDUP: Track seen items per sheet
const items = [];
let totalCost = 0;
wb.SheetNames.forEach(sName => {
  if(sName==='Codes'||sName==='Tot-Sum'||sName==='MEP Works') return;
  const ws = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  const seenInSheet = {};
  data.forEach((r,i) => {
    const desc = String(r[1]||r[0]||'').trim().replace(/\r?\n/g,' ');
    const unit = String(r[2]||'').trim();
    const qty = parseFloat(r[3]) || 0;
    const rate = parseFloat(r[4]) || 0;
    if(qty > 0 && rate === 0 && desc.length > 3 && !/^DIV|DIVISION|BUA|TOTAL|SUB/i.test(desc)) {
      const key = desc.substring(0,40) + '|' + Math.round(qty);
      if(seenInSheet[key]) { // EXACT DUPLICATE — skip
        items.push({sheet:sName, desc:desc.substring(0,90), unit, qty:Math.round(qty*100)/100,
          cat:'⚠️ تكرار محذوف', fairRate:0, sellRate:0, total:0, note:'بند مكرر — محذوف'});
        return;
      }
      seenInSheet[key] = true;
      const cl = classify(desc, unit, qty);
      const sell = Math.round(cl.r * PROFIT);
      const total = Math.round(sell * qty);
      totalCost += Math.round(cl.r * qty);
      items.push({sheet:sName, desc:desc.substring(0,90), unit, qty:Math.round(qty*100)/100,
        cat:cl.cat, fairRate:cl.r, sellRate:sell, total, note:cl.n});
    }
  });
});

const total = items.reduce((s,i)=>s+i.total, 0);
const dupes = items.filter(i=>i.cat==='⚠️ تكرار محذوف');
console.log('=== النتيجة النهائية V4 ===');
console.log('بنود:', items.length);
console.log('تكرارات محذوفة:', dupes.length);
console.log('إجمالي التكلفة:', totalCost.toLocaleString('en'), 'ر.س');
console.log('إجمالي البيع:', total.toLocaleString('en'), 'ر.س');
console.log('الربح الفعلي:', ((total - totalCost)/totalCost * 100).toFixed(2), '%');

// Export
const wbOut = XLSX.utils.book_new();
const rows = [['مراجعة شاملة v4 — مشروع المزرعة'],['ربح 15% | الأسعار العادلة للسوق (تحت 8 مليون)'],[],
  ['المبنى','وصف البند','الوحدة','الكمية','التصنيف','تكلفة','سعر بيع','الإجمالي','ملاحظة']];
items.forEach(i => rows.push([i.sheet,i.desc,i.unit,i.qty,i.cat,i.fairRate,i.sellRate,i.total,i.note]));
rows.push([]);
rows.push(['','','','','','','إجمالي',total,'']);
const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:10},{wch:55},{wch:5},{wch:8},{wch:16},{wch:7},{wch:7},{wch:11},{wch:22}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'المراجعة الشاملة');
const out = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\تحليل_المزرعة_v4_ARBA.xlsx';
XLSX.writeFile(wbOut, out);
console.log('\n✅', out);
