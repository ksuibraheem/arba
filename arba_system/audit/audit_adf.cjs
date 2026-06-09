const x=require('xlsx');
const SRC='C:\\Users\\ksuib\\Desktop\\ADF_Arar_Priced_15pct.xlsx';
const OUT='C:\\Users\\ksuib\\Desktop\\ADF_Arar_AUDITED_15pct.xlsx';
const wb=x.readFile(SRC);
const d=x.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
const K=Object.keys(d[0]);
// K[0]=#, K[1]=cat, K[4]=qty, K[5]=desc, K[6]=spec, K[7]=costRate, K[8]=totalCost, K[9]=sellRate, K[10]=totalSell, K[11]=profit, K[12]=risk

const P=1.15;
const log=[];
const initialTotal=d.reduce((s,r)=>s+(r[K[8]]||0),0);
let fixes=0;

// Market rates for Arar 2026
const MR={
  block_20:80,block_15:65,block_parapet:85,
  plaster_ext:45,plaster_int:38,plaster_ceil:40,
  paint_int:32,paint_ext:42,paint_epoxy:65,paint_ceil:30,
  porcelain_60:130,porcelain_20:90,porcelain_wall:120,ceramic:100,
  marble_floor:250,marble_stair:300,stone:280,granite:350,
  gypsum_board:80,gypsum_tile:60,gypsum_cornice:50,
  door_wood:1800,door_hidden:2200,door_steel:2500,door_fire:3500,
  door_glass:4500,door_auto:25000,gate_slide:35000,
  window:700,skylight:1200,curtain:900,
  handrail_ss:600,handrail_glass:900,
  alum_tube:350,logo:8000,
  gravel:45,asphalt:85,curb:65,paving:90,
  shade_pvc:250,bumper:350,barrier:2500,strip:35,
  tree:800,palm:1500,grass:35,
  // Electrical
  panel:8000,cable_tray:120,conduit:45,wire:12,
  outlet:85,switch_:65,
  light_led:280,light_down:180,light_spot:150,light_ext:350,
  light_emrg:250,light_exit:300,light_fluor:120,
  genset:180000,ups:35000,transformer:95000,ats:25000,
  earthing:15000,lightning:12000,bms:45000,
  cctv_cam:1500,cctv_dvr:8000,access:3500,intercom:2500,
  pa:15000,clock:8000,queue:12000,display:5000,
  data_pt:350,server:8000,fiber:25,phone:250,tv:1200,projector:8000,
  fire_alarm:8000,
  // HVAC
  split:4500,package_:18000,vrf:3500,fcu:5500,ahu:35000,
  duct:250,diffuser:250,damper:450,exhaust:1800,fresh:2200,curtain_air:3500,
  thermostat:350,ac_pipe:120,ac_insul:55,
  // Plumbing
  pipe_110:65,pipe_75:50,pipe_50:40,pipe_25:25,
  ppr_63:55,ppr_50:45,ppr_32:30,ppr_25:22,
  wc:1200,basin:800,kitchen_sink:1500,floor_drain:180,
  cleanout:250,roof_drain:350,
  heater_200:5500,heater_50:2500,pump:3800,valve:450,
  tank_gnd:25000,tank_roof:8000,sewage:15000,grease:12000,
  manhole:4500,septic:35000,
  // Fire
  ext_6:350,ext_co2:650,hose_cab:2800,
  fire_pipe_4:180,fire_pipe_3:150,fire_pipe_2:120,
  pump_sys:85000,blanket:250,auto_ext:1800,
  // Structural  
  excavation:25,backfill:38,termite:20,blinding:300,
  rc_footing:880,rc_tiebeam:1200,rc_sog:730,rc_neck:1420,
  rc_tank:1180,rc_column:1400,rc_slab:960,rc_stair:1220,
  rc_canopy:1000,rc_hordi:950,rc_fence:900,
  elevator:280000,
};

// Contaminated RC rates
const RC_RATES=[880,900,950,960,1000,1180,1200,1220,1400,1420];

function classify(desc,spec,cat){
  const dd=desc.toLowerCase(), ss=spec.toLowerCase(), d=dd+' '+ss;
  // Block
  if(dd.includes('بلوك')||dd.includes('بلك')){
    if(d.includes('سترة')||d.includes('دروة'))return MR.block_parapet;
    if(d.includes('20'))return MR.block_20;
    if(d.includes('15'))return MR.block_15;
    return d.includes('خارج')?MR.block_20:MR.block_15;
  }
  // Plaster
  if(dd.includes('لياسة'))return d.includes('خارج')?MR.plaster_ext:d.includes('سقف')?MR.plaster_ceil:MR.plaster_int;
  // Paint
  if(dd.includes('دهان')||dd.includes('طلاء')){
    if(d.includes('ايبوكسي')||d.includes('epoxy'))return MR.paint_epoxy;
    return d.includes('سقف')||d.includes('اسقف')?MR.paint_ceil:d.includes('خارج')||d.includes('اكريليك')?MR.paint_ext:MR.paint_int;
  }
  // Porcelain/Ceramic
  if(dd.includes('بورسلان')||dd.includes('porcelain'))return d.includes('20')?MR.porcelain_20:d.includes('جدار')||d.includes('حائط')?MR.porcelain_wall:MR.porcelain_60;
  if(dd.includes('سيراميك'))return MR.ceramic;
  // Marble/Stone
  if(dd.includes('رخام'))return d.includes('درج')?MR.marble_stair:MR.marble_floor;
  if(dd.includes('حجر'))return MR.stone;
  if(dd.includes('جرانيت'))return MR.granite;
  // Gypsum
  if(d.includes('جبس بورد'))return MR.gypsum_board;
  if(d.includes('كرانيش'))return MR.gypsum_cornice;
  if(dd.includes('جبس'))return MR.gypsum_tile;
  // Doors
  if(dd.includes('باب')){
    if(d.includes('حريق'))return MR.door_fire;
    if(d.includes('اتوماتيك')&&d.includes('زجاج'))return MR.door_auto;
    if(d.includes('زجاج'))return MR.door_glass;
    if(d.includes('مخفي'))return MR.door_hidden;
    if(d.includes('سحاب')||d.includes('انزلاقي'))return MR.gate_slide;
    if(d.includes('حديد'))return MR.door_steel;
    if(d.includes('المن'))return MR.door_steel;
    return MR.door_wood;
  }
  // Windows
  if(dd.includes('شباك')||dd.includes('شبابيك'))return MR.window;
  // Handrail
  if(dd.includes('درابزين'))return d.includes('زجاج')?MR.handrail_glass:MR.handrail_ss;
  // Elevator
  if(dd.includes('مصعد'))return MR.elevator;
  // Shade
  if(dd.includes('مظلات')||dd.includes('مظلة'))return MR.shade_pvc;
  // Aluminum exterior
  if(dd.includes('تيوبات'))return MR.alum_tube;
  if(dd.includes('شعار'))return MR.logo;
  // Structural
  if(dd.includes('حفر'))return MR.excavation;
  if(dd.includes('ردم'))return MR.backfill;
  if(dd.includes('نمل'))return MR.termite;
  if(dd.includes('خرسانة عادية'))return MR.blinding;
  if(ss.includes('قواعد'))return MR.rc_footing;
  if(ss.includes('ميد'))return MR.rc_tiebeam;
  if(ss.includes('بلاطات أرضية'))return MR.rc_sog;
  if(ss.includes('رقاب'))return MR.rc_neck;
  if(ss.includes('خزان')||dd.includes('خزان'))return MR.rc_tank;
  if(ss.includes('أعمدة'))return MR.rc_column;
  if(ss.includes('مصمتة'))return MR.rc_slab;
  if(ss.includes('سلالم'))return MR.rc_stair;
  if(d.includes('مظلة المدخل'))return MR.rc_canopy;
  if(ss.includes('هوردي')||ss.includes('جسور'))return MR.rc_hordi;
  if(ss.includes('أسوار'))return MR.rc_fence;
  if(dd.includes('قاعدة')&&d.includes('مولد'))return MR.rc_fence;
  // Electrical
  if(d.includes('ups'))return MR.ups;
  if(dd.includes('المولد'))return MR.genset;
  if(dd.includes('محول'))return MR.transformer;
  if(d.includes('ats'))return MR.ats;
  if(dd.includes('لوحات')||dd.includes('لوحة'))return MR.panel;
  if(d.includes('كابل')&&d.includes('حامل'))return MR.cable_tray;
  if(dd.includes('كابل'))return MR.wire;
  if(dd.includes('بريزة')||dd.includes('مأخذ'))return MR.outlet;
  if(dd.includes('مفاتيح')||dd.includes('مفتاح'))return MR.switch_;
  if(dd.includes('وحدات الاضاءة')||dd.includes('إنارة')||dd.includes('اضاءة')){
    if(d.includes('طوارئ'))return MR.light_emrg;
    if(d.includes('خروج')||d.includes('exit'))return MR.light_exit;
    if(d.includes('سبوت')||d.includes('spot')||d.includes('down'))return MR.light_spot;
    if(d.includes('خارج')||d.includes('عمود'))return MR.light_ext;
    if(d.includes('فلورسنت')||d.includes('fluorescent'))return MR.light_fluor;
    return MR.light_led;
  }
  if(dd.includes('تأريض'))return MR.earthing;
  if(dd.includes('صواعق'))return MR.lightning;
  if(d.includes('bms'))return MR.bms;
  if(dd.includes('كاميرا')||d.includes('cctv'))return MR.cctv_cam;
  if(d.includes('dvr')||d.includes('nvr'))return MR.cctv_dvr;
  if(d.includes('access'))return MR.access;
  if(dd.includes('انتركم'))return MR.intercom;
  if(dd.includes('صوت')||d.includes('pa system'))return MR.pa;
  if(dd.includes('ساعة'))return MR.clock;
  if(dd.includes('طابور'))return MR.queue;
  if(dd.includes('شاشة')||dd.includes('عرض مرئي'))return d.includes('projector')?MR.projector:MR.display;
  if(d.includes('data')||dd.includes('بيانات'))return MR.data_pt;
  if(d.includes('server'))return MR.server;
  if(d.includes('فايبر')||d.includes('fiber'))return MR.fiber;
  if(dd.includes('هاتف'))return MR.phone;
  if(dd.includes('انذار')&&dd.includes('حريق'))return MR.fire_alarm;
  if(dd.includes('اذرع'))return MR.access;
  // HVAC
  if(d.includes('split'))return MR.split;
  if(d.includes('package'))return MR.package_;
  if(d.includes('vrf'))return MR.vrf;
  if(d.includes('fcu'))return MR.fcu;
  if(d.includes('ahu'))return MR.ahu;
  if(dd.includes('دكت')||d.includes('duct'))return MR.duct;
  if(d.includes('diffuser')||dd.includes('ناشر'))return MR.diffuser;
  if(d.includes('damper'))return MR.damper;
  if(dd.includes('ثرموستات'))return MR.thermostat;
  if(dd.includes('مروح')||d.includes('exhaust'))return MR.exhaust;
  if(d.includes('fresh'))return MR.fresh;
  if(dd.includes('ستارة هوائية'))return MR.curtain_air;
  // Plumbing
  if(dd.includes('مرحاض')||d.includes('w.c'))return MR.wc;
  if(dd.includes('حوض غسيل')||dd.includes('مغسلة'))return MR.basin;
  if(dd.includes('بالوع'))return MR.floor_drain;
  if(dd.includes('جرجور'))return MR.roof_drain;
  if(dd.includes('سخان'))return d.includes('200')?MR.heater_200:MR.heater_50;
  if(dd.includes('مضخة'))return d.includes('حريق')?MR.pump_sys:d.includes('صرف')?MR.sewage:MR.pump;
  if(dd.includes('محبس')||dd.includes('صمام'))return MR.valve;
  if(dd.includes('خزان'))return d.includes('أرضي')?MR.tank_gnd:MR.tank_roof;
  if(dd.includes('شحوم'))return MR.grease;
  if(dd.includes('منهل'))return MR.manhole;
  if(dd.includes('بيارة'))return MR.septic;
  if(d.includes('صرف')){
    if(d.includes('110'))return MR.pipe_110;
    if(d.includes('75'))return MR.pipe_75;
    if(d.includes('50'))return MR.pipe_50;
    return MR.pipe_75;
  }
  if(d.includes('تغذية')){
    if(d.includes('63'))return MR.ppr_63;
    if(d.includes('50'))return MR.ppr_50;
    if(d.includes('32'))return MR.ppr_32;
    if(d.includes('25'))return MR.ppr_25;
    return MR.ppr_25;
  }
  if(dd.includes('مواسير')&&d.includes('تكييف'))return MR.ac_pipe;
  if(dd.includes('مواسير'))return MR.pipe_75;
  // Fire
  if(dd.includes('طفاي')){
    if(d.includes('co2'))return MR.ext_co2;
    if(d.includes('أتوماتيك')||d.includes('اتوماتيك'))return MR.auto_ext;
    return MR.ext_6;
  }
  if(d.includes('خرطوم حريق')||d.includes('hose'))return MR.hose_cab;
  if(dd.includes('بطاني'))return MR.blanket;
  if(d.includes('مواسير')&&d.includes('حريق')){
    if(d.includes('1.5')||d.includes('4'))return MR.fire_pipe_4;
    if(d.includes('2.5')||d.includes('3'))return MR.fire_pipe_3;
    return MR.fire_pipe_2;
  }
  // Landscape
  if(dd.includes('إسفلت')||dd.includes('سفلت')||dd.includes('أسفلت'))return MR.asphalt;
  if(dd.includes('بردور'))return MR.curb;
  if(dd.includes('مصدات'))return MR.bumper;
  if(dd.includes('حاجز شوكي'))return MR.barrier;
  if(dd.includes('حصى')||dd.includes('gravel'))return MR.gravel;
  if(dd.includes('شرائح')||dd.includes('فواصل'))return MR.strip;
  if(dd.includes('شجر')&&!dd.includes('نخ'))return MR.tree;
  if(dd.includes('نخل'))return MR.palm;
  if(dd.includes('عشب'))return MR.grass;
  // Fallback: if non-structural cat has RC rate, it's contaminated
  return null;
}

// === AUDIT PASS ===
d.forEach(r=>{
  const seq=r[K[0]], cat=String(r[K[1]]||''), qty=r[K[4]]||0;
  const desc=String(r[K[5]]||''), spec=String(r[K[6]]||'');
  const oldRate=r[K[7]]||0;
  const correctRate=classify(desc,spec,cat);
  let newRate=oldRate;
  let reason='';

  // Rule 1: RC rate in non-structural category
  const isStructural=cat.includes('انشائي');
  if(!isStructural && RC_RATES.includes(oldRate)){
    newRate=correctRate||oldRate;
    reason='RC_CONTAMINATION: structural rate '+oldRate+' in '+cat;
  }
  // Rule 2: Specific outliers
  if(oldRate>=100000 && !desc.includes('مصعد') && !desc.includes('المولد') && !desc.includes('محول') && !desc.includes('مضخ')){
    newRate=correctRate||30;
    reason='EXTREME_OUTLIER: '+oldRate+' SAR impossible for '+desc.substring(0,30);
  }
  // Rule 3: Lighting at 8000+
  if((desc.includes('اضاءة')||desc.includes('إنارة')||desc.includes('وحدات الاضاءة'))&&oldRate>=8000){
    newRate=correctRate||MR.light_led;
    reason='LIGHT_OUTLIER: '+oldRate+' SAR for light fixture';
  }
  // Rule 4: Fire ext at 15000
  if(desc.includes('طفاي')&&oldRate>=10000){
    newRate=correctRate||MR.ext_6;
    reason='FIRE_EXT_OUTLIER: '+oldRate+' for extinguisher';
  }
  // Rule 5: Duct at 15000
  if((desc.includes('دكت')||desc.includes('duct'))&&oldRate>=10000){
    newRate=correctRate||MR.duct;
    reason='DUCT_OUTLIER: '+oldRate+' for ductwork';
  }
  // Rule 6: General — if classify gives a different rate and difference > 50%, flag
  if(!reason && correctRate && correctRate!==oldRate){
    const diff=Math.abs(oldRate-correctRate)/Math.max(oldRate,correctRate);
    if(diff>0.4){
      newRate=correctRate;
      reason='MISMATCH_'+Math.round(diff*100)+'%: '+oldRate+'->'+correctRate;
    }
  }
  // Rule 7: Zero rate
  if(oldRate===0 && correctRate){
    newRate=correctRate;
    reason='ZERO_RATE: was 0, set to '+correctRate;
  }

  if(reason){
    const oldTotal=Math.round(qty*oldRate);
    const newTotal=Math.round(qty*newRate);
    const variance=oldTotal-newTotal;
    log.push({seq,cat:cat.substring(0,20),desc:desc.substring(0,40),qty,unit:r[K[3]],oldRate,newRate,oldTotal,newTotal,variance,reason});
    fixes++;
    r[K[7]]=newRate;
    r[K[8]]=newTotal;
    r[K[9]]=Math.round(newRate*P);
    r[K[10]]=Math.round(newTotal*P);
    r[K[11]]=r[K[10]]-r[K[8]];
    r[K[12]]=newRate===0?'\u26A0\uFE0F manual':'✅ audited';
  }
});

// Recalculate totals
const correctedCost=d.reduce((s,r)=>s+(r[K[8]]||0),0);
const correctedSell=d.reduce((s,r)=>s+(r[K[10]]||0),0);
const zeroItems=d.filter(r=>(r[K[7]]||0)===0);

// Sort by variance
log.sort((a,b)=>b.variance-a.variance);

// === WRITE OUTPUT ===
const owb=x.utils.book_new();
// Sheet 1: Corrected BOQ
const s1=x.utils.json_to_sheet(d);
x.utils.book_append_sheet(owb,s1,'BOQ Audited');
// Sheet 2: Audit Log
const s2=x.utils.json_to_sheet(log);
x.utils.book_append_sheet(owb,s2,'Audit Log');
// Sheet 3: Summary
const summary=[
  {Metric:'Initial Total Cost',Value:initialTotal},
  {Metric:'Corrected Total Cost',Value:correctedCost},
  {Metric:'Cost Variance (Savings)',Value:initialTotal-correctedCost},
  {Metric:'Variance %',Value:Math.round((initialTotal-correctedCost)/initialTotal*100)+'%'},
  {Metric:'Corrected Sell (15%)',Value:correctedSell},
  {Metric:'Corrected Profit',Value:correctedSell-correctedCost},
  {Metric:'With VAT 15%',Value:Math.round(correctedSell*1.15)},
  {Metric:'Items Corrected',Value:fixes},
  {Metric:'Items at Zero',Value:zeroItems.length},
  {Metric:'Total Items',Value:d.length},
  {Metric:'Audit Date',Value:new Date().toISOString().split('T')[0]},
];
const s3=x.utils.json_to_sheet(summary);
x.utils.book_append_sheet(owb,s3,'Audit Summary');
// Sheet 4: Top 10 corrections
const s4=x.utils.json_to_sheet(log.slice(0,10));
x.utils.book_append_sheet(owb,s4,'Top 10 Corrections');
// Sheet 5: Category summary
const cats={};
d.forEach(r=>{const c=r[K[1]];if(!cats[c])cats[c]={Category:c,Items:0,Cost:0,Sell:0};cats[c].Items++;cats[c].Cost+=r[K[8]]||0;cats[c].Sell+=r[K[10]]||0;});
const s5=x.utils.json_to_sheet(Object.values(cats));
x.utils.book_append_sheet(owb,s5,'Category Breakdown');

x.writeFile(owb,OUT);

// === CONSOLE REPORT ===
console.log('\n'+('=').repeat(70));
console.log('  ARBA AUDIT REPORT — ADF Arar Branch — '+new Date().toISOString().split('T')[0]);
console.log(('=').repeat(70));
console.log('\n1. ROOT CAUSE ANALYSIS:');
const rcCount=log.filter(l=>l.reason.includes('RC_CONTAMINATION')).length;
const outlierCount=log.filter(l=>l.reason.includes('OUTLIER')).length;
const mismatchCount=log.filter(l=>l.reason.includes('MISMATCH')).length;
const zeroCount=log.filter(l=>l.reason.includes('ZERO')).length;
console.log('   RC Rate Contamination: '+rcCount+' items');
console.log('   Extreme Outliers:      '+outlierCount+' items');
console.log('   Rate Mismatches:       '+mismatchCount+' items');
console.log('   Zero-Rate Fixed:       '+zeroCount+' items');
console.log('   TOTAL CORRECTIONS:     '+fixes+' / '+d.length+' items');

console.log('\n2. VARIANCE TABLE:');
console.log('   Initial Cost:    '+initialTotal.toLocaleString()+' SAR');
console.log('   Corrected Cost:  '+correctedCost.toLocaleString()+' SAR');
console.log('   Variance:        '+(initialTotal-correctedCost).toLocaleString()+' SAR ('+Math.round((initialTotal-correctedCost)/initialTotal*100)+'%)');
console.log('   Corrected Sell:  '+correctedSell.toLocaleString()+' SAR');
console.log('   Profit (15%):    '+(correctedSell-correctedCost).toLocaleString()+' SAR');
console.log('   With VAT:        '+Math.round(correctedSell*1.15).toLocaleString()+' SAR');

console.log('\n3. TOP 5 CORRECTIONS:');
log.slice(0,5).forEach((l,i)=>console.log('   '+(i+1)+'. #'+l.seq+' '+l.desc+' | '+l.oldRate.toLocaleString()+'->'+l.newRate+' | Saved: '+l.variance.toLocaleString()+' SAR'));

console.log('\n4. CATEGORY BREAKDOWN:');
Object.values(cats).forEach(c=>console.log('   '+c.Category.padEnd(28)+c.Items+' items | '+c.Sell.toLocaleString()+' SAR'));

console.log('\n5. AUDIT STATUS:');
console.log('   Zero-value items: '+zeroItems.length);
if(zeroItems.length>0)zeroItems.forEach(r=>console.log('     -> #'+r[K[0]]+' '+String(r[K[5]]||'').substring(0,40)));
console.log('\n   File: '+OUT);
console.log(('=').repeat(70));
