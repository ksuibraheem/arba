const xlsx = require('xlsx');
const path = require('path');

const FILE = path.join(
    'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program',
    'التأسيس', 'الملحلة الثالثة', 'مزرعة خاصة',
    'R.E Farm-Consolidated MEP BOQ -Priced (1).xlsx'
);

const wb = xlsx.readFile(FILE);

console.log('=== FULL FILE ANALYSIS ===');
console.log('Total Sheets:', wb.SheetNames.length);
console.log('Sheet Names:', wb.SheetNames.join(' | '));
console.log('');

let grandTotal = 0;
let missed = [];

wb.SheetNames.forEach(name => {
    const rows = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1 });
    let dataRows = 0;

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (!r) continue;

        const col0 = String(r[0] || '').trim();
        const col1 = String(r[1] || '').trim();
        const desc = col1 || col0;
        const qty = Number(r[3]) || 0;
        const rate = Number(r[4]) || 0;
        const amt = Number(r[5]) || 0;

        // Skip junk
        if (desc.length < 2) continue;
        if (desc.includes('ITEM') && desc.includes('DESCRIPTION')) continue;
        if (desc.includes('ITEM') && desc.includes('SCOPE')) continue;
        if (desc.includes('KINGDOM')) continue;
        if (desc.includes('BILL OF QUANTITIES')) continue;
        if (desc.includes('RE FARM')) continue;
        if (desc.includes('MAIN BUILDING')) continue;
        if (desc.includes('Total') || desc.includes('Carried')) continue;
        if (desc.startsWith('SUB')) continue;
        if (desc.startsWith('DIV')) continue;
        if (desc.startsWith('DIVISION')) continue;
        if (desc.startsWith('*')) continue;

        if (qty > 0 || rate > 0 || amt > 0) {
            dataRows++;
        } else {
            // Section headers (like "Sanitary Fixtures") - skip
        }
    }

    grandTotal += dataRows;
    console.log(`Sheet "${name}": ${dataRows} data items (${rows.length} total rows)`);
});

console.log('\n' + '='.repeat(40));
console.log('GRAND TOTAL: ' + grandTotal + ' data items');

// Now check what we're filtering out
console.log('\n=== ITEMS OUR ORCHESTRATOR MIGHT SKIP ===');
const s1 = wb.Sheets['Plumbing & HVAC'];
const r1 = xlsx.utils.sheet_to_json(s1, { header: 1 });
let skipped = 0;
for (let i = 0; i < r1.length; i++) {
    const r = r1[i];
    if (!r) continue;
    const d = String(r[1] || '').trim();
    const qty = Number(r[3]) || 0;
    const rate = Number(r[4]) || 0;
    const amt = Number(r[5]) || 0;

    if (d.length >= 3 && !d.includes('Total') && !d.includes('KINGDOM') &&
        !d.includes('BILL') && !d.includes('RE FARM') && !d.includes('MAIN') &&
        !d.startsWith('ITEM') && !d.startsWith('*')) {
        if (qty <= 0 && amt <= 0 && rate <= 0) {
            // Section header - OK to skip
        } else if (qty <= 0 && (rate > 0 || amt > 0)) {
            skipped++;
            console.log('SKIPPED (qty=0): Row ' + (i+1) + ': ' + d.substring(0, 60) + ' | rate=' + rate + ' | amt=' + amt);
        }
    }
}
console.log('Skipped items with qty=0 but rate>0: ' + skipped);
