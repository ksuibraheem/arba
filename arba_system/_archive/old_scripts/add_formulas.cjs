const x = require('xlsx');
const wb = x.readFile('C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_CORRECT.xlsx');

const d = x.utils.sheet_to_json(wb.Sheets['BOQ Final']);
const K = Object.keys(d[0]);

const ws = x.utils.json_to_sheet(d);
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

x.writeFile(wb, 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_Formulas.xlsx');
console.log('Saved with formulas!');
