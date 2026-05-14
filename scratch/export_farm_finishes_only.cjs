const XLSX = require('xlsx');
const PROFIT = 1.15;

const inPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\مشروع المزرعة\\\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx';
const wb = XLSX.readFile(inPath);

function classify(desc, unit, qty) {
  const d = desc.toLowerCase().replace(/\r?\n/g,' ');
  
  // Unpriced items logic (Finishes, MEP, Landscape, etc)
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
  
  if(/marble|travertine/i.test(d)&&/floor|ff01|tl02/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:150};
  if(/travertine.*sink/i.test(d)) return {div:'DIV 22 - Plumbing', cat:'Sanitary',r:1500};
  if(/travertine.*skirting/i.test(d)) return {div:'DIV 09 - Finishes', cat:'Finishes',r:50};
  if(/travertine.*counter|counter.*top/i.test(d)) return {div:'DIV 12 - Furnishings', cat:'Finishes',r:200};
  if(/travertine.*clad|tr01|stone.*cladding|natural.*stone.*wall|stone.*corner|jordanian.*stone/i.test(d)) return {div:'DIV 09 - Wall Finishes', cat:'Cladding',r:150};
  
  if(/porcel|ff02/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:70};
  if(/mosaic|ff03/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:100};
  if(/anti.*slip|ff04/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:60};
  if(/carpet|ff06/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:50};
  if(/wpc|wood.*plastic/i.test(d)) {
    if(/stair/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:150};
    return {div:'DIV 09 - Flooring', cat:'Flooring',r:100};
  }
  if(/parquet|engineered.*wood/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:120};
  if(/porcelain.*grey|tl03/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:60};
  if(/concrete.*finish|epoxy.*finish|ff08/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:50};
  
  if(/rubber.*ball/i.test(d)) return {div:'DIV 13 - Special Construction', cat:'Special',r:180};
  if(/rubber.*path|rb01/i.test(d)) return {div:'DIV 09 - Flooring', cat:'Flooring',r:80};
  if(/threshold/i.test(d)) return {div:'DIV 09 - Finishes', cat:'Finishes',r:100};
  if(/skirting.*wood|sk01/i.test(d)) return {div:'DIV 09 - Finishes', cat:'Finishes',r:40};
  
  if(/bassalt|metara|curbstone|stone.*floor|st02|st03|river.*bank|river.*rock|pea.*gravel|metal.*l.*angle/i.test(d)) return {div:'DIV 32 - Exterior Improvements', cat:'Hardscape',r:70};
  
  if(/paint|pt01|juton|emulsion|anti.*fung/i.test(d)) return {div:'DIV 09 - Painting', cat:'Painting',r:18};
  if(/gypsum.*ceil|gc01|gc02|gc03|wood.*board.*ceil|wp01|access.*panel|curtain.*cove|cement.*board|cb01/i.test(d)) return {div:'DIV 09 - Ceilings', cat:'Ceilings',r:60};
  
  if(/skylight.*wood|wood.*fins/i.test(d)) return {div:'DIV 10 - Specialties', cat:'Special',r:350};
  
  if(/steel.*roof.*structure|roof.*steel|bridge.*steel|steel.*structure.*approved/i.test(d)) return {div:'DIV 05 - Metals', cat:'Steel',r:280};

  if(/swimming.*pool|fish.*pond|squash|squach|cinema.*room|cinema.*tech|shooting/i.test(d)) return {div:'DIV 13 - Special Construction', cat:'Special',r:180};

  if(/bench.*concrete|external.*bench|trash.*bin|solid.*wood.*table|outdoor.*chair|rattan/i.test(d)) return {div:'DIV 12 - Furnishings', cat:'Furniture',r:1000};
  if(/stainless.*sink|stainless.*storage|mini.*fridge|outdoor.*oven|outdoor.*grill|pizza.*oven/i.test(d)) return {div:'DIV 11 - Equipment', cat:'Kitchen',r:2500};

  if(/mixer.*sink|faucet|wc.*seat|shower.*tray|jac[ck]uzi|free.*stand.*bath|mirror/i.test(d)) return {div:'DIV 22 - Plumbing', cat:'Sanitary',r:500};

  if(/grass|paspalum|coconut.*palm|olive|mango|apple|jasmine|yoka|yucca|sikas|cycas|sabani|canary|acacia|aromatic.*flower|green.*shrub|carissa|bensatim|boulder|green.*area/i.test(d)) return {div:'DIV 32 - Exterior Improvements', cat:'Softscape',r:100};

  // Remaining Earthworks/Testing if they were unpriced
  if(/excavat|backfill.*compact.*aggregate|basecourse|backfill.*compact.*crush|backfill.*rock|backfill.*sand|sand.*fill|soil.*fill|backfill.*existing|levelling.*compact|anti.*termit|termite/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Earthworks',r:15};
  if(/field.*density|sieve.*analysis|modified.*proctor|max.*min.*relative|plate.*load/i.test(d)) return {div:'DIV 01 - General', cat:'Testing',r:200};
  if(/shoring.*system/i.test(d)) return {div:'DIV 02 - Earthworks', cat:'Special',r:55};
  if(/steel.*stair/i.test(d)) return {div:'DIV 05 - Metals', cat:'Metalworks',r:1000};
  if(/handrail.*glass|glass.*balustrade/i.test(d)) return {div:'DIV 05 - Metals', cat:'Metalworks',r:450};
  
  return {div:'DIV 00 - General', cat:'أخرى',r:35};
}

const items = [];
const seenGlobal = {};
let totalCost = 0;
let finishCost = 0;

wb.SheetNames.forEach(sName => {
  if(sName==='Codes'||sName==='Tot-Sum'||sName==='MEP Works') return;
  const ws = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  let currentDivStr = 'DIV 00 - General';
  
  data.forEach((r,i) => {
    if(typeof r[0]==='string' && /DIV|DIVISION/i.test(r[0])) currentDivStr = r[0].substring(0,40);

    const desc = String(r[1]||r[0]||'').trim();
    const unit = String(r[2]||'').trim();
    const qty = parseFloat(r[3]) || 0;
    const oldRate = parseFloat(r[4]) || 0;
    
    // WE ONLY PROCESS UNPRICED ITEMS NOW (oldRate === 0)
    if(qty > 0 && oldRate === 0 && desc.length > 3 && !/^DIV|DIVISION|BUA|TOTAL|SUB/i.test(desc)) {
      const key = sName + '|' + desc.substring(0,30) + '|' + Math.round(qty);
      if(seenGlobal[key]) return; // exact duplicate skip
      seenGlobal[key] = true;
      
      const cl = classify(desc, unit, qty);
      const finalCost = cl.r;
      const finalDiv = cl.div;
      finishCost += finalCost * qty;

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

const grandTotalSell = items.reduce((s,i)=>s+i.total, 0);

const wbOut = XLSX.utils.book_new();

const sumRows = [
  ['تسعير أعمال التشطيبات والمرافق (غير المسعرة سابقاً) - مشروع المزرعة'],
  ['التاريخ', new Date().toISOString().split('T')[0]],
  ['نسبة الربح', '15%'],
  [],
  ['البيان', 'سعر البيع (SAR)', 'ملاحظات'],
  ['أعمال التشطيبات، الواجهات، واللاندسكيب', grandTotalSell.toLocaleString(), 'لا يشمل الأعمال الإنشائية المسعرة مسبقاً (عظم)']
];
const wsSum = XLSX.utils.aoa_to_sheet(sumRows);
wsSum['!cols'] = [{wch:40}, {wch:25}, {wch:60}];
XLSX.utils.book_append_sheet(wbOut, wsSum, 'الخلاصة');

const boqRows = [
  ['المبنى (Zone)', 'القسم (Division)', 'الوصف الفني (Description)', 'الوحدة', 'الكمية', 'التكلفة', 'سعر البيع', 'الإجمالي']
];
items.sort((a,b) => a.div.localeCompare(b.div)).forEach(i => {
  boqRows.push([i.zone, i.div, i.desc.substring(0,80), i.unit, Math.round(i.qty*100)/100, i.cost, i.sell, i.total]);
});
const wsBoq = XLSX.utils.aoa_to_sheet(boqRows);
wsBoq['!cols'] = [{wch:15}, {wch:30}, {wch:65}, {wch:6}, {wch:10}, {wch:10}, {wch:10}, {wch:12}];
XLSX.utils.book_append_sheet(wbOut, wsBoq, 'جدول الكميات');

const outPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\مشروع المزرعة\\\\RE_Farm_Finishes_Only_BOQ.xlsx';
XLSX.writeFile(wbOut, outPath);

console.log('=== تم إنشاء الملف بنجاح ===');
console.log('سعر البيع للتشطيبات فقط:', grandTotalSell.toLocaleString());
