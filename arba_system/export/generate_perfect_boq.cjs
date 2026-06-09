const x = require('xlsx');
const P = 1.15; // 15% profit margin

// 1. Read the original BOQ (we'll start fresh from the original source of truth if possible, or just read V5 and ensure it's perfect)
// We will read V5 which has the surgical fixes, and just do a final sanity check and formatting.
const fileIn = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_Final_V5.xlsx';
const fileOut = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_FINAL_PERFECT.xlsx';

const wb = x.readFile(fileIn);
const d = x.utils.sheet_to_json(wb.Sheets['BOQ Final']);
const K = Object.keys(d[0]);

let totalCost = 0;
let totalSell = 0;
const cats = {};

// Clean data and rebuild
const cleanData = [];

d.forEach(r => {
    // Skip any artifact rows
    if (r[K[0]] === 'الإجمالي الكلي' || !r[K[1]]) return;

    // Ensure numeric values
    const seq = r[K[0]];
    const cat = String(r[K[1]]).trim();
    const item = r[K[2]];
    const unit = r[K[3]];
    const qty = Number(r[K[4]]) || 0;
    const desc = r[K[5]];
    const spec = r[K[6]];
    
    // Make sure we have the rate and re-calculate precisely
    const rate = Number(r[K[7]]) || 0;
    const cost = Math.round(qty * rate);
    const sellRate = Math.round(rate * P);
    const sell = Math.round(qty * rate * P);
    const profit = sell - cost;
    
    const row = {
        '#': seq,
        'الفئة': cat,
        'البند': item,
        'الوحدة': unit,
        'الكمية': qty,
        'وصف البند': desc,
        'المواصفات': spec,
        'سعر التكلفة': rate,
        'إجمالي التكلفة': cost,
        'سعر البيع 15%': sellRate,
        'إجمالي البيع': sell,
        'الربح': profit
    };
    
    cleanData.push(row);
    
    // Accumulate categories
    if(!cats[cat]) cats[cat] = { 'القسم': cat, 'عدد البنود': 0, 'التكلفة': 0, 'البيع': 0 };
    cats[cat]['عدد البنود']++;
    cats[cat]['التكلفة'] += cost;
    cats[cat]['البيع'] += sell;
    
    // Accumulate grand totals
    totalCost += cost;
    totalSell += sell;
});

// Create new workbook
const newWb = x.utils.book_new();

// --- 1. BOQ Final Sheet ---
const wsBOQ = x.utils.json_to_sheet(cleanData);
const lastRow = cleanData.length + 1;
const sumRow = lastRow + 1;
// Add sum row
x.utils.sheet_add_aoa(wsBOQ, [['الإجمالي الكلي']], {origin: 'B' + sumRow});
wsBOQ['I' + sumRow] = { t: 'n', f: 'SUM(I2:I' + lastRow + ')' }; // Cost Sum
wsBOQ['K' + sumRow] = { t: 'n', f: 'SUM(K2:K' + lastRow + ')' }; // Sell Sum
wsBOQ['L' + sumRow] = { t: 'n', f: 'SUM(L2:L' + lastRow + ')' }; // Profit Sum
x.utils.book_append_sheet(newWb, wsBOQ, 'BOQ Final');

// --- 2. Categories Sheet ---
const catData = Object.values(cats);
const wsCats = x.utils.json_to_sheet(catData);
// Add sum row to categories
const lastCatRow = catData.length + 1;
const catSumRow = lastCatRow + 1;
x.utils.sheet_add_aoa(wsCats, [['الإجمالي الكلي', cleanData.length]], {origin: 'A' + catSumRow});
wsCats['C' + catSumRow] = { t: 'n', f: 'SUM(C2:C' + lastCatRow + ')' }; // Cost Sum
wsCats['D' + catSumRow] = { t: 'n', f: 'SUM(D2:D' + lastCatRow + ')' }; // Sell Sum
x.utils.book_append_sheet(newWb, wsCats, 'Categories');

// --- 3. Summary Sheet ---
const vat = Math.round(totalSell * 0.15);
const finalTotal = totalSell + vat;
const summaryData = [
    { M: 'إجمالي التكلفة', V: totalCost },
    { M: 'إجمالي البيع (ربح 15%)', V: totalSell },
    { M: 'صافي الربح', V: totalSell - totalCost },
    { M: 'ضريبة القيمة المضافة 15%', V: vat },
    { M: 'الإجمالي النهائي شامل الضريبة', V: finalTotal },
    { M: 'إجمالي عدد البنود', V: cleanData.length },
    { M: 'تاريخ المراجعة النهائية', V: '2026-05-10' }
];
const wsSum = x.utils.json_to_sheet(summaryData);
x.utils.book_append_sheet(newWb, wsSum, 'Summary');

// Write out the perfect file
x.writeFile(newWb, fileOut);
console.log('Successfully generated ADF_Arar_BOQ_FINAL_PERFECT.xlsx');
console.log('Cost: ' + totalCost.toLocaleString());
console.log('Sell: ' + totalSell.toLocaleString());
