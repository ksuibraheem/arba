const x = require('xlsx');
const wb = x.readFile('C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_Formulas.xlsx');
const d = x.utils.sheet_to_json(wb.Sheets['BOQ Final']);
const K = Object.keys(d[0]);
const P = 1.15;

function fix(r, nr) {
    const q = r[K[4]] || 0;
    r[K[7]] = nr;
    r[K[8]] = Math.round(q * nr);
    r[K[9]] = Math.round(nr * P);
    r[K[10]] = Math.round(q * nr * P);
    r[K[11]] = r[K[10]] - r[K[8]];
}

d.forEach(r => {
    const seq = r[K[0]];
    if (seq === 46) fix(r, 500); // Cat ladder galv
    if (seq === 47) fix(r, 900); // Cat ladder SS
    if (seq === 102) fix(r, 450); // Heater 50L
    if (seq === 103) fix(r, 750); // Heater 100L
});

// Write to worksheet
const ws = x.utils.json_to_sheet(d);

// Re-inject formulas
const lastRow = d.length + 1;
const sumRow = lastRow + 1;
x.utils.sheet_add_aoa(ws, [['الإجمالي الكلي']], {origin: 'B' + sumRow});
ws['I' + sumRow] = { t: 'n', f: 'SUM(I2:I' + lastRow + ')' };
ws['K' + sumRow] = { t: 'n', f: 'SUM(K2:K' + lastRow + ')' };
ws['L' + sumRow] = { t: 'n', f: 'SUM(L2:L' + lastRow + ')' };

const wsSum = wb.Sheets['Summary'];
wsSum['B2'] = { t: 'n', f: "'BOQ Final'!I" + sumRow };
wsSum['B3'] = { t: 'n', f: "'BOQ Final'!K" + sumRow };
wsSum['B4'] = { t: 'n', f: "'BOQ Final'!L" + sumRow };
wsSum['B5'] = { t: 'n', f: "B3*1.15" };

wb.Sheets['BOQ Final'] = ws;
wb.Sheets['Summary'] = wsSum;

x.writeFile(wb, 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_Final_V2.xlsx');

// Calculate output for logging
let tc=0, ts=0;
d.forEach(r=>{tc+=r[K[8]]||0; ts+=r[K[10]]||0;});
console.log('Final Corrected Cost:', tc.toLocaleString());
console.log('Final Corrected Sell:', ts.toLocaleString());
