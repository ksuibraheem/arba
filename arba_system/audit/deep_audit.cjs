const x = require('xlsx');
const wb = x.readFile('C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_Formulas.xlsx');
const d = x.utils.sheet_to_json(wb.Sheets['BOQ Final']);
const K = Object.keys(d[0]);

console.log('=== DEEP AUDIT REPORT ===');

let flags = [];

d.forEach(r => {
    const seq = r[K[0]];
    const cat = String(r[K[1]] || '');
    const unit = String(r[K[3]] || '').trim();
    const qty = r[K[4]] || 0;
    const desc = String(r[K[5]] || '').toLowerCase();
    const spec = String(r[K[6]] || '').toLowerCase();
    const rate = r[K[7]] || 0;
    const total = r[K[8]] || 0;

    const fullDesc = desc + ' ' + spec;

    let flag = null;

    // 1. Zero Rate
    if (rate === 0) flag = 'ZERO RATE';

    // 2. High Rates for area/length
    if ((unit.includes('متر مربع') || unit.includes('م2')) && rate > 500) {
        if (!fullDesc.includes('واجه') && !fullDesc.includes('curtain') && !fullDesc.includes('skylight') && !fullDesc.includes('شباك')) {
            flag = 'VERY HIGH RATE FOR m2 (>500)';
        }
    }
    if ((unit.includes('م ط') || unit.includes('م.ط') || unit.includes('متر طولي')) && rate > 300) {
        if (!fullDesc.includes('كرتن') && !fullDesc.includes('واجه') && !fullDesc.includes('انارة')) {
            flag = 'VERY HIGH RATE FOR linear meter (>300)';
        }
    }

    // 3. Structural checks
    if (cat.includes('انشائي')) {
        if (unit.includes('مكعب') && rate < 200) flag = 'LOW CONCRETE RATE (<200)';
        if (unit.includes('مكعب') && rate > 1600) flag = 'HIGH CONCRETE RATE (>1600)';
        if (fullDesc.includes('حديد') && unit.includes('طن') && (rate < 2500 || rate > 4500)) flag = 'STEEL OUT OF BOUNDS';
    }

    // 4. Finishing Checks
    if (cat.includes('تشطيب') || cat.includes('معماري')) {
        if (fullDesc.includes('دهان') && rate > 100) flag = 'PAINT TOO EXPENSIVE (>100/m2)';
        if (fullDesc.includes('لياسة') && rate > 100) flag = 'PLASTER TOO EXPENSIVE (>100/m2)';
        if (fullDesc.includes('بلوك') && rate > 150) flag = 'BLOCK TOO EXPENSIVE (>150/m2)';
        if (fullDesc.includes('بورسلان') && rate > 250) flag = 'PORCELAIN TOO EXPENSIVE (>250/m2)';
    }

    // 5. MEP Checks
    if (cat.includes('كهرباء')) {
        if (unit.includes('م ط') && rate > 500) flag = 'HIGH ELECTRIC LINEAR RATE';
        if (fullDesc.includes('مفتاح') && rate > 200) flag = 'EXPENSIVE SWITCH (>200)';
        if (fullDesc.includes('لوحة') && rate < 500) flag = 'CHEAP PANEL (<500)';
    }
    if (cat.includes('ميكانيك')) {
        if (fullDesc.includes('مرحاض') && rate < 300) flag = 'CHEAP WC (<300)';
        if (fullDesc.includes('سخان') && rate < 200) flag = 'CHEAP HEATER (<200)';
        if (fullDesc.includes('مواسير') && rate > 300) flag = 'EXPENSIVE PIPES (>300/m)';
    }

    if (flag) {
        flags.push({ seq, cat, unit, rate, total, flag, shortDesc: desc.substring(0, 30) });
    }
});

console.log(`Audited ${d.length} items. Found ${flags.length} potential anomalies.`);
if (flags.length > 0) {
    console.table(flags);
} else {
    console.log('CLEAN! No logical bounds broken.');
}

// Check highest total values to ensure they make sense
console.log('\\n--- TOP 10 MOST EXPENSIVE ITEMS ---');
const sorted = [...d].sort((a,b) => (b[K[8]]||0) - (a[K[8]]||0));
sorted.slice(0,10).forEach(r => {
    console.log(`#${r[K[0]]} | Rate: ${r[K[7]]} | Total: ${r[K[8]].toLocaleString()} SAR | ${String(r[K[5]]).substring(0,40)}`);
});
