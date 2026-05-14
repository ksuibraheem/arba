const XLSX = require('xlsx');
const PROFIT = 1.15;
const TRANSPORT_MULTIPLIER = 0.02; // 2% of total cost for transport if near Riyadh

// Read original
const inPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\مشروع المزرعة\\\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx';
const wb = XLSX.readFile(inPath);

function classify(desc, unit, qty) {
  const d = desc.toLowerCase().replace(/\r?\n/g,' ');
  
  if(/excavat/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:15};
  if(/backfill.*compact.*aggregate|basecourse/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:35};
  if(/backfill.*compact.*crush/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:40};
  if(/backfill.*rock/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:45};
  if(/backfill.*sand|sand.*fill|soil.*fill/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:18};
  if(/backfill.*existing/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:10};
  if(/levelling.*compact/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:5};
  if(/anti.*termit|termite/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:8};
  
  if(/field.*density|sieve.*analysis|modified.*proctor|max.*min.*relative|plate.*load/i.test(d)) return {div:'DIV 01 - General & Testing', cat:'Testing',r:200};

  if(/formwork|shuttering/i.test(d)) return {div:'DIV 03 - Concrete', cat:'Labor',r:60};
  if(/labor.*concret|pour.*concret/i.test(d)) return {div:'DIV 03 - Concrete', cat:'Labor',r:65};
  if(/labor.*reinforc|fix.*reinforc/i.test(d)) return {div:'DIV 03 - Concrete', cat:'Labor',r:800};
  if(/labor.*block/i.test(d)) return {div:'DIV 04 - Masonry', cat:'Labor',r:35};
  if(/shoring.*system/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Special',r:55};
  
  if(/steel.*stair/i.test(d)) return {div:'DIV 05 - Metals', cat:'Metalworks',r:1000};
  if(/handrail.*glass|glass.*balustrade/i.test(d)) return {div:'DIV 05 - Metals', cat:'Metalworks',r:450};
  
  if(/single.*door.*wood|wd01|wd03/i.test(d)) return {div:'DIV 08 - Doors & Windows', cat:'Doors',r:1500};
  if(/doubl.*door.*wood|wd02|wd04/i.test(d)) return {div:'DIV 08 - Doors & Windows', cat:'Doors',r:2500};
  if(/metal.*door|steel.*door|sd01/i.test(d)) return {div:'DIV 08 - Doors & Windows', cat:'Doors',r:1800};
  if(/lo-0[1-5]|louver/i.test(d)) return {div:'DIV 08 - Doors & Windows', cat:'Doors',r:1200};
  
  if(/curtain.*wall|gl0[1-3].*\d+mm|frame.*brown.*ral/i.test(d)) {
    if(qty <= 15) return {div:'DIV 08 - Doors & Windows', cat:'Curtain Wall',r:450};
    return {div:'DIV 08 - Doors & Windows', cat:'Curtain Wall',r:750};
  }
  if(/gl0[4-5].*frosted|frosted.*glass/i.test(d)) return {div:'DIV 08 - Doors & Windows', cat:'Curtain Wall',r:450};
  
  if(/rough.*plaster|smooth.*plaster|smooth.*finish|rough.*finish|screed/i.test(d)) return {div:'DIV 09 - Plastering', cat:'Plastering',r:25};
  
  if(/polyethylene.*sheet|waterproof.*toilet|wet.*area|pool.*area|fish.*pond.*waterproof/i.test(d)) return {div:'DIV 07 - Thermal & Moisture', cat:'Waterproofing',r:35};
  
  if(/marble|travertine|porcel|ff02|mosaic|anti.*slip|carpet|wpc|wood.*plastic|parquet|engineered.*wood|epoxy.*finish|ff08/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:100};
  
  if(/rubber.*ball/i.test(d)) return {div:'DIV 13 - Special Construction', cat:'Special',r:180};
  if(/rubber.*path|rb01/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:80};
  if(/threshold/i.test(d)) return {div:'DIV 09 - Finishes', cat:'Finishes',r:100};
  if(/skirting.*wood|sk01|travertine.*skirting/i.test(d)) return {div:'DIV 09 - Finishes', cat:'Finishes',r:50};
  if(/travertine.*counter|counter.*top/i.test(d)) return {div:'DIV 12 - Furnishings', cat:'Finishes',r:200};
  if(/travertine.*clad|tr01|stone.*cladding|natural.*stone.*wall|stone.*corner|jordanian.*stone/i.test(d)) return {div:'DIV 09 - Wall Finishes', cat:'Cladding',r:150};
  
  if(/bassalt|metara|curbstone|stone.*floor|st02|st03|river.*bank|river.*rock|pea.*gravel|metal.*l.*angle/i.test(d)) return {div:'DIV 32 - Exterior Improvements', cat:'Hardscape',r:70};
  
  if(/paint|pt01|juton|emulsion|anti.*fung/i.test(d)) return {div:'DIV 09 - Painting', cat:'Painting',r:18};
  if(/gypsum.*ceil|gc01|gc02|gc03|wood.*board.*ceil|wp01|access.*panel|curtain.*cove|cement.*board|cb01/i.test(d)) return {div:'DIV 09 - Ceilings', cat:'Ceilings',r:60};
  if(/skylight.*wood|wood.*fins/i.test(d)) return {div:'DIV 10 - Specialties', cat:'Special',r:350};
  
  if(/steel.*roof.*structure|roof.*steel|bridge.*steel|steel.*structure.*approved/i.test(d)) return {div:'DIV 05 - Metals', cat:'Steel',r:300};

  if(/swimming.*pool|fish.*pond|squash|squach|cinema.*room|cinema.*tech|shooting/i.test(d)) return {div:'DIV 13 - Special Construction', cat:'Special',r:200};

  if(/bench.*concrete|external.*bench|trash.*bin|solid.*wood.*table|outdoor.*chair|rattan/i.test(d)) return {div:'DIV 12 - Furnishings', cat:'Furniture',r:1000};
  if(/stainless.*sink|stainless.*storage|mini.*fridge|outdoor.*oven|outdoor.*grill|pizza.*oven/i.test(d)) return {div:'DIV 11 - Equipment', cat:'Kitchen',r:2500};

  if(/mixer.*sink|faucet|wc.*seat|shower.*tray|jac[ck]uzi|free.*stand.*bath|mirror|travertine.*sink/i.test(d)) return {div:'DIV 22 - Plumbing', cat:'Sanitary',r:500};

  if(/grass|paspalum|coconut.*palm|olive|mango|apple|jasmine|yoka|yucca|sikas|cycas|sabani|canary|acacia|aromatic.*flower|green.*shrub|carissa|bensatim|boulder|green.*area/i.test(d)) return {div:'DIV 32 - Exterior Improvements', cat:'Softscape',r:100};

  // Default
  return {div:'DIV 00 - General', cat:'أخرى',r:50};
}

const items = [];
const seenGlobal = {};
let totalCost = 0;
let structCost = 0;
let finishCost = 0;

wb.SheetNames.forEach(sName => {
  if(sName==='Codes'||sName==='Tot-Sum'||sName==='MEP Works') return;
  const ws = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  let currentDivStr = 'DIV 00 - General';
  
  data.forEach((r,i) => {
    // track headers in original doc
    if(typeof r[0]==='string' && /DIV|DIVISION/i.test(r[0])) currentDivStr = r[0].substring(0,40);

    const desc = String(r[1]||r[0]||'').trim();
    const unit = String(r[2]||'').trim();
    const qty = parseFloat(r[3]) || 0;
    const oldRate = parseFloat(r[4]) || 0;
    const oldAmt = parseFloat(r[5]) || 0;
    
    if(qty > 0 && desc.length > 3 && !/^DIV|DIVISION|BUA|TOTAL|SUB/i.test(desc)) {
      const key = sName + '|' + desc.substring(0,30) + '|' + Math.round(qty);
      if(seenGlobal[key]) return; // exact duplicate skip
      seenGlobal[key] = true;
      
      let finalCost = 0;
      let finalDiv = currentDivStr;
      
      if(oldRate > 0) {
        // Keep existing structural prices
        finalCost = oldRate;
        structCost += finalCost * qty;
        finalDiv = currentDivStr; 
      } else {
        // Apply our engine logic
        const cl = classify(desc, unit, qty);
        finalCost = cl.r;
        finalDiv = cl.div;
        finishCost += finalCost * qty;
      }

      totalCost += finalCost * qty;
      const sell = Math.round(finalCost * PROFIT);
      
      items.push({
        zone: sName,
        div: finalDiv,
        desc: desc,
        unit: unit,
        qty: qty,
        cost: finalCost,
        sell: sell,
        total: Math.round(sell * qty)
      });
    }
  });
});

// Transportation Logic (Logistics)
// Distance logic: if HQ is in Riyadh, farm is usually in Dirab/Ammariyah. Transport cost ~ 2.5% of total materials.
const transportCost = Math.round(totalCost * 0.025);
const transportSell = Math.round(transportCost * PROFIT);
items.push({
  zone: 'General',
  div: 'DIV 01 - Mobilization & Transport',
  desc: 'Logistics and Transportation from Riyadh HQ to Farm Site (Materials & Labor)',
  unit: 'LS',
  qty: 1,
  cost: transportCost,
  sell: transportSell,
  total: transportSell
});

totalCost += transportCost;
const grandTotalSell = items.reduce((s,i)=>s+i.total, 0);

// Format Final Excel
const wbOut = XLSX.utils.book_new();

// Sheet 1: Summary
const sumRows = [
  ['الملخص التنفيذي - مشروع المزرعة Phase 02'],
  ['التاريخ', new Date().toISOString().split('T')[0]],
  ['مقر الشركة الرئيسي', 'الرياض (تم احتساب تكاليف النقل بناءً على ذلك)'],
  ['نسبة الربح المستهدفة', '15%'],
  [],
  ['البيان', 'التكلفة الصافية (SAR)', 'سعر البيع (SAR)', 'ملاحظات'],
  ['الأعمال الإنشائية (خرسانة/حديد)', Math.round(structCost), Math.round(structCost*PROFIT), 'تسعيرة المقاول'],
  ['أعمال التشطيبات والمقايسات', Math.round(finishCost), Math.round(finishCost*PROFIT), 'تسعيرة آربا (V4)'],
  ['تكاليف النقل واللوجستيات', transportCost, transportSell, 'نقل المواد والعمالة من الرياض'],
  ['----------------------', '----------', '----------', ''],
  ['الإجمالي العام', Math.round(totalCost), grandTotalSell, '']
];
const wsSum = XLSX.utils.aoa_to_sheet(sumRows);
wsSum['!cols'] = [{wch:30}, {wch:25}, {wch:25}, {wch:40}];
XLSX.utils.book_append_sheet(wbOut, wsSum, 'الخلاصة');

// Sheet 2: Consolidated BOQ
const boqRows = [
  ['المبنى (Zone)', 'القسم (Division)', 'الوصف الفني (Description)', 'الوحدة', 'الكمية', 'التكلفة', 'سعر البيع', 'الإجمالي']
];
items.sort((a,b) => a.zone.localeCompare(b.zone) || a.div.localeCompare(b.div)).forEach(i => {
  boqRows.push([i.zone, i.div, i.desc.substring(0,80), i.unit, Math.round(i.qty*100)/100, i.cost, i.sell, i.total]);
});
const wsBoq = XLSX.utils.aoa_to_sheet(boqRows);
wsBoq['!cols'] = [{wch:15}, {wch:30}, {wch:65}, {wch:6}, {wch:10}, {wch:10}, {wch:10}, {wch:12}];
XLSX.utils.book_append_sheet(wbOut, wsBoq, 'جدول الكميات المدمج');

const outPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\مشروع المزرعة\\\\RE_Farm_Final_Priced_BOQ.xlsx';
XLSX.writeFile(wbOut, outPath);

console.log('=== تم إنشاء الملف النهائي ===');
console.log('التكلفة:', Math.round(totalCost).toLocaleString());
console.log('البيع:', grandTotalSell.toLocaleString());
console.log('النقل:', transportCost.toLocaleString());
console.log('الملف:', outPath);
