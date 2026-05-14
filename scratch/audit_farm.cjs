const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\RE Farm Phase 02 -Preliminary BOQ - Priced concrete 13-5-2026 .xlsx');
const benchmark = JSON.parse(fs.readFileSync('data/market_benchmark.json','utf8'));

const PROFIT = 1.15;
const allItems = [];

// Fair market rates (cost basis for Northern Borders)
const fairRates = {
  // Concrete
  'blinding': { fair: 200, note: 'خرسانة نظافة 20MPa' },
  'raft': { fair: 700, note: 'أساسات رافت 35MPa' },
  'rc_40': { fair: 750, note: 'خرسانة مسلحة 40MPa' },
  'rc_35': { fair: 700, note: 'خرسانة مسلحة 35MPa' },
  'ice': { fair: 30, note: 'ثلج للخرسانة' },
  'early_str': { fair: 280, note: 'خرسانة مبكرة القوة' },
  'cylinder': { fair: 150, note: 'فحص أسطوانات' },
  'temp_test': { fair: 15, note: 'فحص حرارة' },
  'slump_test': { fair: 20, note: 'فحص هبوط' },
  // Steel
  'rebar_8': { fair: 2450, note: 'حديد 8مم' },
  'rebar_10': { fair: 2450, note: 'حديد 10مم' },
  'rebar_12': { fair: 2450, note: 'حديد 12مم' },
  'rebar_14': { fair: 2450, note: 'حديد 14مم' },
  'rebar_16': { fair: 2450, note: 'حديد 16مم' },
  'rebar_18': { fair: 2450, note: 'حديد 18مم' },
  'rebar_20': { fair: 2450, note: 'حديد 20مم' },
  'rebar_25': { fair: 2450, note: 'حديد 25مم' },
  'rebar_32': { fair: 2500, note: 'حديد 32مم' },
  // Labor
  'formwork': { fair: 80, note: 'شدات خشبية' },
  'labor_concrete': { fair: 85, note: 'عمالة صب خرسانة' },
  'labor_rebar': { fair: 1200, note: 'عمالة حديد/طن' },
  'labor_block': { fair: 45, note: 'عمالة بناء بلوك' },
  // Post tension
  'pt_strand': { fair: 12, note: 'كيبل شد لاحق' },
  'pt_anchor': { fair: 250, note: 'مرساة شد لاحق' },
  // Mobilization
  'caravan': { fair: 12000, note: 'كرفان موقع' },
  'shifting': { fair: 5000, note: 'نقل وكرين' },
  'store': { fair: 10000, note: 'كرفان مخزن' },
  'toilet': { fair: 3500, note: 'دورة مياه موقع' },
  'generator': { fair: 35000, note: 'مولد كهرباء' },
  'tower_crane': { fair: 85000, note: 'رافعة برجية/شهر' },
  'pump': { fair: 1200, note: 'مضخة خرسانة' },
  // Landscape
  'excavation': { fair: 18, note: 'حفريات' },
  'backfill': { fair: 25, note: 'ردم' },
  'compaction': { fair: 15, note: 'دمك' },
};

function classify(desc) {
  const d = desc.toLowerCase();
  if(/blinding|plain.*cement/i.test(d)) return 'blinding';
  if(/raft.*found/i.test(d)) return 'raft';
  if(/reinforced.*concrete.*40/i.test(d)) return 'rc_40';
  if(/reinforced.*concrete.*35/i.test(d)) return 'rc_35';
  if(/ice.*charge/i.test(d)) return 'ice';
  if(/early.*str/i.test(d)) return 'early_str';
  if(/cylinder.*sampl/i.test(d)) return 'cylinder';
  if(/temperature.*test/i.test(d)) return 'temp_test';
  if(/slump.*test/i.test(d)) return 'slump_test';
  if(/bar.*size.*8\s*mm/i.test(d)) return 'rebar_8';
  if(/bar.*size.*10\s*mm/i.test(d)) return 'rebar_10';
  if(/bar.*size.*12\s*mm/i.test(d)) return 'rebar_12';
  if(/bar.*size.*14\s*mm/i.test(d)) return 'rebar_14';
  if(/bar.*size.*16\s*mm/i.test(d)) return 'rebar_16';
  if(/bar.*size.*18\s*mm/i.test(d)) return 'rebar_18';
  if(/bar.*size.*20\s*mm/i.test(d)) return 'rebar_20';
  if(/bar.*size.*25\s*mm/i.test(d)) return 'rebar_25';
  if(/bar.*size.*32\s*mm/i.test(d)) return 'rebar_32';
  if(/formwork|shuttering/i.test(d)) return 'formwork';
  if(/labor.*concret|pour.*concret/i.test(d)) return 'labor_concrete';
  if(/labor.*reinforc|fix.*reinforc/i.test(d)) return 'labor_rebar';
  if(/labor.*block|block.*work/i.test(d)) return 'labor_block';
  if(/strand|tendon/i.test(d)) return 'pt_strand';
  if(/anchor.*head|anchorage/i.test(d)) return 'pt_anchor';
  if(/caravan.*office|site.*office/i.test(d)) return 'caravan';
  if(/shifting|crane.*charge/i.test(d)) return 'shifting';
  if(/store|storage/i.test(d)) return 'store';
  if(/toilet|ablution/i.test(d)) return 'toilet';
  if(/generator/i.test(d)) return 'generator';
  if(/tower.*crane/i.test(d)) return 'tower_crane';
  if(/pump.*concrete|concrete.*pump/i.test(d)) return 'pump';
  if(/excavat/i.test(d)) return 'excavation';
  if(/backfill|fill/i.test(d)) return 'backfill';
  if(/compact/i.test(d)) return 'compaction';
  return null;
}

wb.SheetNames.forEach(sName => {
  if(sName==='Codes'||sName==='Tot-Sum'||sName==='MEP Works') return;
  const ws = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
  
  data.forEach((r, i) => {
    const desc = String(r[1]||r[0]||'').trim();
    const unit = String(r[2]||'').trim();
    const qty = parseFloat(r[3]) || 0;
    const givenRate = parseFloat(r[4]) || 0;
    const givenAmt = parseFloat(r[5]) || (givenRate * qty);
    
    if(qty > 0 && givenRate > 0 && desc.length > 3 && !/^DIV|DIVISION|BUA|TOTAL|SUB/i.test(desc)) {
      const key = classify(desc);
      const fr = key && fairRates[key] ? fairRates[key] : null;
      const fairRate = fr ? Math.round(fr.fair * PROFIT) : null;
      const fairAmt = fairRate ? Math.round(fairRate * qty) : null;
      const diff = (fairAmt && givenAmt) ? Math.round(givenAmt - fairAmt) : null;
      const pct = (diff && givenAmt) ? Math.round((diff/givenAmt)*100) : null;
      
      let status = '✅ مطابق';
      if(pct !== null) {
        if(pct > 30) status = '🔴 مرتفع جداً';
        else if(pct > 15) status = '🟠 مرتفع';
        else if(pct > 5) status = '🟡 أعلى قليلاً';
        else if(pct < -30) status = '🔵 منخفض جداً';
        else if(pct < -15) status = '⚠️ منخفض';
        else status = '✅ عادل';
      } else {
        status = '❓ غير مصنّف';
      }
      
      allItems.push({
        sheet: sName, desc: desc.substring(0,80), unit, qty: Math.round(qty*100)/100,
        givenRate, givenAmt: Math.round(givenAmt),
        fairRate, fairAmt,
        diff, pct, status,
        note: fr ? fr.note : 'يحتاج مراجعة يدوية'
      });
    }
  });
});

// Summary
const totalGiven = allItems.reduce((s,i) => s + i.givenAmt, 0);
const totalFair = allItems.filter(i=>i.fairAmt).reduce((s,i) => s + i.fairAmt, 0);
const totalGivenMatched = allItems.filter(i=>i.fairAmt).reduce((s,i) => s + i.givenAmt, 0);

console.log('=== مراجعة مشروع المزرعة ===');
console.log('إجمالي البنود:', allItems.length);
console.log('بنود مطابقة:', allItems.filter(i=>i.fairRate).length);
console.log('إجمالي المسعّر:', totalGiven.toLocaleString('en'));
console.log('إجمالي العادل (للمطابق):', totalFair.toLocaleString('en'));
console.log('إجمالي المسجّل (للمطابق):', totalGivenMatched.toLocaleString('en'));
console.log('الفرق:', (totalGivenMatched - totalFair).toLocaleString('en'));

// Issues
const issues = allItems.filter(i => i.pct !== null && (i.pct > 15 || i.pct < -15));
console.log('\nبنود فيها مشاكل:', issues.length);
issues.sort((a,b) => (b.diff||0) - (a.diff||0));
issues.slice(0,15).forEach(i => 
  console.log(i.status + ' ' + i.sheet + ' | ' + i.desc.substring(0,50) + ' | given:' + i.givenRate + ' fair:' + i.fairRate + ' | diff:' + (i.diff||0).toLocaleString('en'))
);

// Export Excel
const wbOut = XLSX.utils.book_new();
const rows = [
  ['مراجعة أسعار مشروع المزرعة — RE Farm Phase 02'],
  ['تحليل دماغ آربا | السعر العادل مع ربح 15%'],
  [],
  ['المبنى','وصف البند','الوحدة','الكمية','السعر المسجّل','الإجمالي المسجّل','السعر العادل','الإجمالي العادل','الفرق','فرق%','الحالة','ملاحظة']
];

allItems.forEach(i => {
  rows.push([i.sheet, i.desc, i.unit, i.qty, i.givenRate, i.givenAmt, i.fairRate||'—', i.fairAmt||'—', i.diff||'—', i.pct!==null?i.pct+'%':'—', i.status, i.note]);
});

rows.push([]);
rows.push(['','','','','إجمالي مسجّل', totalGiven, 'إجمالي عادل', totalFair, 'الفرق', totalGivenMatched-totalFair, '', '']);

const wsOut = XLSX.utils.aoa_to_sheet(rows);
wsOut['!cols'] = [{wch:10},{wch:55},{wch:6},{wch:8},{wch:10},{wch:12},{wch:10},{wch:12},{wch:10},{wch:6},{wch:14},{wch:25}];
XLSX.utils.book_append_sheet(wbOut, wsOut, 'مراجعة الأسعار');

const outPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\مشروع المزرعة\\تحليل_مراجعة_المزرعة_ARBA.xlsx';
XLSX.writeFile(wbOut, outPath);
console.log('\n✅', outPath);
