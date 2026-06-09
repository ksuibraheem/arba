const XLSX = require('xlsx');
const wb = XLSX.readFile('C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx');
const PROFIT = 1.15;

// Corrected rates v3
function classify(desc, unit) {
  const d = desc.toLowerCase().replace(/\r?\n/g,' ');
  
  if(/excavat/i.test(d)) return {cat:'Earthworks',r:18,n:'حفريات'};
  if(/backfill.*compact.*aggregate|basecourse/i.test(d)) return {cat:'Earthworks',r:45,n:'ردم ركام ودمك'};
  if(/backfill.*compact.*crush/i.test(d)) return {cat:'Earthworks',r:55,n:'ردم حصى'};
  if(/backfill.*rock/i.test(d)) return {cat:'Earthworks',r:65,n:'ردم صخري'};
  if(/backfill.*sand|sand.*fill|soil.*fill/i.test(d)) return {cat:'Earthworks',r:25,n:'ردم رملي'};
  if(/backfill.*existing/i.test(d)) return {cat:'Earthworks',r:15,n:'ردم بتربة موجودة'};
  if(/levelling.*compact/i.test(d)) return {cat:'Earthworks',r:8,n:'تسوية ودمك'};
  if(/anti.*termit|termite/i.test(d)) return {cat:'Earthworks',r:10,n:'مكافحة نمل أبيض'};
  
  if(/field.*density/i.test(d)) return {cat:'Testing',r:300,n:'فحص كثافة'};
  if(/sieve.*analysis/i.test(d)) return {cat:'Testing',r:200,n:'تحليل منخلي'};
  if(/modified.*proctor/i.test(d)) return {cat:'Testing',r:300,n:'بروكتور'};
  if(/max.*min.*relative/i.test(d)) return {cat:'Testing',r:300,n:'كثافة نسبية'};
  if(/plate.*load/i.test(d)) return {cat:'Testing',r:1200,n:'فحص تحمل'};

  if(/formwork|shuttering/i.test(d)) return {cat:'Labor',r:70,n:'شدات'};
  if(/labor.*concret|pour.*concret/i.test(d)) return {cat:'Labor',r:80,n:'عمالة صب'};
  if(/labor.*reinforc|fix.*reinforc/i.test(d)) return {cat:'Labor',r:1100,n:'عمالة حديد/طن'};
  if(/labor.*block/i.test(d)) return {cat:'Labor',r:40,n:'عمالة بلوك'};
  if(/shoring.*system/i.test(d)) return {cat:'Special',r:75,n:'سند جوانب'};
  
  if(/steel.*stair/i.test(d)) return {cat:'Metalworks',r:1400,n:'درج حديد'};
  if(/handrail.*glass|glass.*balustrade/i.test(d)) return {cat:'Metalworks',r:750,n:'درابزين زجاج'};
  
  if(/single.*door.*wood|wd01|wd03/i.test(d)) return {cat:'Doors',r:2200,n:'باب خشب ضلفة'};
  if(/doubl.*door.*wood|wd02|wd04/i.test(d)) return {cat:'Doors',r:3500,n:'باب خشب ضلفتين'};
  if(/metal.*door|steel.*door|sd01/i.test(d)) return {cat:'Doors',r:2800,n:'باب معدني'};
  if(/lo-0[1-5]|louver/i.test(d)) return {cat:'Doors',r:2000,n:'لوفر'};
  
  // Curtain wall — differentiate by size
  if(/curtain.*wall/i.test(d)) {
    const qty = parseFloat(d.match(/\d+/)?.[0]) || 10;
    return {cat:'Curtain Wall',r:950,n:'حائط ستائري'};
  }
  if(/gl0[1-3].*\d+mm|frame.*brown.*ral/i.test(d)) return {cat:'Curtain Wall',r:950,n:'نافذة زجاج بإطار'};
  if(/gl0[4-5].*frosted|frosted.*glass/i.test(d)) return {cat:'Curtain Wall',r:700,n:'زجاج مصنفر'};
  
  if(/rough.*plaster/i.test(d)) return {cat:'Plastering',r:30,n:'لياسة خشنة'};
  if(/smooth.*plaster/i.test(d)) return {cat:'Plastering',r:35,n:'لياسة ناعمة'};
  if(/smooth.*finish/i.test(d)) return {cat:'Plastering',r:35,n:'تشطيب ناعم'};
  if(/rough.*finish/i.test(d)) return {cat:'Plastering',r:30,n:'تشطيب خشن'};
  if(/screed/i.test(d)) return {cat:'Plastering',r:35,n:'سكريد'};
  
  if(/polyethylene.*sheet/i.test(d)) return {cat:'Waterproofing',r:7,n:'بولي إثيلين'};
  if(/waterproof.*toilet|wet.*area/i.test(d)) return {cat:'Waterproofing',r:50,n:'عزل رطب'};
  if(/pool.*area/i.test(d)) return {cat:'Waterproofing',r:65,n:'عزل مسبح'};
  if(/fish.*pond.*waterproof/i.test(d)) return {cat:'Waterproofing',r:75,n:'عزل بركة'};
  
  if(/marble|travertine/i.test(d)&&/floor|ff01|tl02/i.test(d)) return {cat:'Flooring',r:200,n:'ترافرتين أرضيات'};
  if(/travertine.*sink/i.test(d)) return {cat:'Sanitary',r:2000,n:'مغسلة ترافرتين'};
  if(/travertine.*skirting/i.test(d)) return {cat:'Finishes',r:85,n:'وزرة ترافرتين'};
  if(/travertine.*counter|counter.*top/i.test(d)) return {cat:'Finishes',r:300,n:'كاونتر ترافرتين'};
  if(/travertine.*clad|tr01/i.test(d)) return {cat:'Cladding',r:220,n:'تكسية ترافرتين'};
  if(/porcel|ff02/i.test(d)) return {cat:'Flooring',r:95,n:'بورسلين'};
  if(/mosaic|ff03/i.test(d)) return {cat:'Flooring',r:140,n:'موزاييك'};
  if(/anti.*slip|ff04/i.test(d)) return {cat:'Flooring',r:80,n:'بلاط مانع انزلاق'};
  if(/carpet|ff06/i.test(d)) return {cat:'Flooring',r:65,n:'موكيت'};
  if(/wpc|wood.*plastic/i.test(d)) {
    if(/stair/i.test(d)) return {cat:'Flooring',r:200,n:'WPC درج'};
    return {cat:'Flooring',r:140,n:'WPC أرضيات'};
  }
  if(/parquet|engineered.*wood/i.test(d)) return {cat:'Flooring',r:180,n:'باركيه'};
  if(/porcelain.*grey|tl03/i.test(d)) return {cat:'Flooring',r:80,n:'بورسلين رمادي'};
  if(/concrete.*finish|epoxy.*finish|ff08/i.test(d)) return {cat:'Flooring',r:70,n:'أرضيات إيبوكسي'};
  if(/rubber.*ball/i.test(d)) return {cat:'Special',r:350,n:'مطاط ميدان رماية'};
  if(/rubber.*path|rb01/i.test(d)) return {cat:'Flooring',r:120,n:'ممرات مطاطية'};
  if(/threshold/i.test(d)) return {cat:'Finishes',r:150,n:'عتبة'};
  if(/skirting.*wood|sk01/i.test(d)) return {cat:'Finishes',r:65,n:'وزرة خشب'};
  
  if(/bassalt|hs01/i.test(d)) return {cat:'Hardscape',r:200,n:'بازلت'};
  if(/metara|hs02/i.test(d)) return {cat:'Hardscape',r:95,n:'بلاط ميتارا'};
  if(/curbstone/i.test(d)) return {cat:'Hardscape',r:55,n:'بردورات'};
  if(/stone.*cladding|natural.*stone.*wall/i.test(d)) return {cat:'Cladding',r:200,n:'تكسية حجر'};
  if(/stone.*corner|st01.*corner/i.test(d)) return {cat:'Cladding',r:150,n:'زوايا حجر'};
  if(/jordanian.*stone|st01/i.test(d)) return {cat:'Cladding',r:220,n:'حجر أردني'};
  if(/stone.*floor|st02|st03/i.test(d)) {
    if(/pcs/i.test(unit)) return {cat:'Hardscape',r:200,n:'حجر قطعة'};
    return {cat:'Hardscape',r:150,n:'حجر أرضيات'};
  }
  if(/river.*bank|st04/i.test(d)) return {cat:'Hardscape',r:160,n:'ضفة نهر'};
  if(/river.*rock/i.test(d)) return {cat:'Hardscape',r:65,n:'حصى نهري'};
  if(/pea.*gravel|gr02/i.test(d)) {
    if(/m3/i.test(unit)) return {cat:'Hardscape',r:150,n:'حصى م³'};
    return {cat:'Hardscape',r:28,n:'حصى م²'};
  }
  if(/metal.*l.*angle/i.test(d)) return {cat:'Hardscape',r:65,n:'زاوية حديد'};
  
  if(/paint|pt01|juton|emulsion/i.test(d)) return {cat:'Painting',r:22,n:'دهانات'};
  if(/anti.*fung/i.test(d)) return {cat:'Painting',r:12,n:'مضاد فطريات'};
  
  if(/gypsum.*ceil|gc01|gc02|gc03/i.test(d)) {
    if(/moisture/i.test(d)) return {cat:'Ceilings',r:80,n:'جبس بورد رطوبة'};
    if(/fire.*moist/i.test(d)) return {cat:'Ceilings',r:95,n:'جبس حريق+رطوبة'};
    return {cat:'Ceilings',r:70,n:'جبس بورد'};
  }
  if(/wood.*board.*ceil|wp01/i.test(d)) return {cat:'Ceilings',r:200,n:'سقف خشب'};
  if(/access.*panel/i.test(d)) return {cat:'Ceilings',r:280,n:'فتحة تفتيش'};
  if(/curtain.*cove/i.test(d)) return {cat:'Ceilings',r:55,n:'كورنيش'};
  if(/cement.*board|cb01/i.test(d)) return {cat:'Cladding',r:140,n:'ألواح أسمنتية'};
  
  if(/skylight.*wood/i.test(d)) return {cat:'Special',r:1200,n:'سكايلايت'};
  if(/wood.*fins/i.test(d)) return {cat:'Special',r:500,n:'زعانف خشب'};
  
  if(/steel.*roof.*structure|roof.*steel/i.test(d)) return {cat:'Steel',r:380,n:'هيكل سقف حديد'};
  if(/bridge.*steel/i.test(d)) return {cat:'Steel',r:950,n:'جسر حديد'};
  if(/steel.*structure.*approved/i.test(d)) return {cat:'Steel',r:450,n:'هيكل حديد'};

  if(/swimming.*pool/i.test(d)) return {cat:'Special',r:280,n:'مسبح (تشطيب)'};
  if(/fish.*pond/i.test(d)) return {cat:'Special',r:200,n:'بركة أسماك'};
  if(/squash|squach/i.test(d)) return {cat:'Special',r:280,n:'سكواش (تشطيب)'};
  if(/cinema.*room/i.test(d)) return {cat:'Special',r:350,n:'سينما (تشطيب)'};
  if(/cinema.*tech/i.test(d)) return {cat:'Special',r:280,n:'غرفة تقنية'};
  if(/shooting/i.test(d)) return {cat:'Special',r:350,n:'ميدان رماية'};

  if(/bench.*concrete|external.*bench/i.test(d)) return {cat:'Furniture',r:2000,n:'كرسي خرساني'};
  if(/trash.*bin/i.test(d)) return {cat:'Furniture',r:1200,n:'سلة نفايات'};
  if(/solid.*wood.*table/i.test(d)) {
    if(/530/i.test(d)) return {cat:'Furniture',r:6500,n:'طاولة خشب 530سم'};
    return {cat:'Furniture',r:4500,n:'طاولة خشب 300سم'};
  }
  if(/outdoor.*chair|rattan/i.test(d)) return {cat:'Furniture',r:950,n:'كرسي خارجي'};
  if(/stainless.*sink/i.test(d)) return {cat:'Kitchen',r:2800,n:'حوض ستانلس'};
  if(/stainless.*storage/i.test(d)) return {cat:'Kitchen',r:3500,n:'خزانة ستانلس'};
  if(/mini.*fridge/i.test(d)) return {cat:'Kitchen',r:2200,n:'ثلاجة صغيرة'};
  if(/outdoor.*oven|electric.*oven/i.test(d)) return {cat:'Kitchen',r:6500,n:'فرن خارجي'};
  if(/outdoor.*grill|rottiseri/i.test(d)) return {cat:'Kitchen',r:9000,n:'شواية خارجية'};
  if(/pizza.*oven/i.test(d)) return {cat:'Kitchen',r:12000,n:'فرن بيتزا'};

  if(/mixer.*sink|faucet/i.test(d)) return {cat:'Sanitary',r:500,n:'خلاط'};
  if(/wc.*seat/i.test(d)) return {cat:'Sanitary',r:950,n:'مرحاض'};
  if(/shower.*tray/i.test(d)) return {cat:'Sanitary',r:2800,n:'طقم دش'};
  if(/jac[ck]uzi/i.test(d)) return {cat:'Sanitary',r:18000,n:'جاكوزي'};
  if(/free.*stand.*bath/i.test(d)) return {cat:'Sanitary',r:6500,n:'بانيو قائم'};
  if(/mirror/i.test(d)) return {cat:'Sanitary',r:650,n:'مرآة'};

  if(/grass|paspalum/i.test(d)) return {cat:'Softscape',r:28,n:'عشب'};
  if(/coconut.*palm/i.test(d)) return {cat:'Softscape',r:1200,n:'نخيل'};
  if(/olive/i.test(d)) return {cat:'Softscape',r:600,n:'زيتون'};
  if(/mango/i.test(d)) return {cat:'Softscape',r:280,n:'مانجو'};
  if(/apple/i.test(d)) return {cat:'Softscape',r:200,n:'تفاح'};
  if(/jasmine/i.test(d)) return {cat:'Softscape',r:140,n:'ياسمين'};
  if(/yoka|yucca/i.test(d)) return {cat:'Softscape',r:200,n:'يوكا'};
  if(/sikas|cycas/i.test(d)) return {cat:'Softscape',r:280,n:'سيكاس'};
  if(/sabani|canary/i.test(d)) return {cat:'Softscape',r:2000,n:'نخيل كناري'};
  if(/acacia/i.test(d)) return {cat:'Softscape',r:350,n:'أكاسيا'};
  if(/aromatic.*flower/i.test(d)) return {cat:'Softscape',r:45,n:'شجيرات زهور'};
  if(/green.*shrub/i.test(d)) return {cat:'Softscape',r:35,n:'شجيرات'};
  if(/carissa/i.test(d)) return {cat:'Softscape',r:20,n:'كاريسا'};
  if(/bensatim/i.test(d)) return {cat:'Softscape',r:28,n:'بنساتيم'};
  if(/boulder/i.test(d)) return {cat:'Softscape',r:1400,n:'صخور'};
  if(/green.*area/i.test(d)) return {cat:'Softscape',r:35,n:'مسطحات'};

  return {cat:'أخرى',r:50,n:'تقدير'};
}

// DEDUP: Track seen items per sheet
const items = [];
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
      const cl = classify(desc, unit);
      const sell = Math.round(cl.r * PROFIT);
      const total = Math.round(sell * qty);
      items.push({sheet:sName, desc:desc.substring(0,90), unit, qty:Math.round(qty*100)/100,
        cat:cl.cat, fairRate:cl.r, sellRate:sell, total, note:cl.n});
    }
  });
});

const total = items.reduce((s,i)=>s+i.total, 0);
const dupes = items.filter(i=>i.cat==='⚠️ تكرار محذوف');
console.log('=== النتيجة النهائية V3 ===');
console.log('بنود:', items.length);
console.log('تكرارات محذوفة:', dupes.length);
console.log('إجمالي:', total.toLocaleString('en'), 'ر.س');
console.log('\n=== حسب التصنيف ===');
const byCat = {};
items.forEach(i => { if(!byCat[i.cat]) byCat[i.cat]={c:0,t:0}; byCat[i.cat].c++; byCat[i.cat].t+=i.total; });
Object.entries(byCat).sort((a,b)=>b[1].t-a[1].t).forEach(([c,d])=>
  console.log(c.padEnd(20)+' | '+String(d.c).padStart(3)+' | '+d.t.toLocaleString('en').padStart(12)));

// Export
const wbOut = XLSX.utils.book_new();
const rows = [['مراجعة شاملة v3 — مشروع المزرعة'],['ربح 15% | بعد حذف التكرارات وتصحيح الأسعار'],[],
  ['المبنى','وصف البند','الوحدة','الكمية','التصنيف','تكلفة','سعر بيع','الإجمالي','ملاحظة']];
items.forEach(i => rows.push([i.sheet,i.desc,i.unit,i.qty,i.cat,i.fairRate,i.sellRate,i.total,i.note]));
rows.push([]);
rows.push(['','','','','','','إجمالي',total,'']);
const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:10},{wch:55},{wch:5},{wch:8},{wch:16},{wch:7},{wch:7},{wch:11},{wch:22}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'المراجعة الشاملة');
const out = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\تحليل_المزرعة_v3_ARBA.xlsx';
XLSX.writeFile(wbOut, out);
console.log('\n✅', out);
