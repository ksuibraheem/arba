const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const hbPricedPath = path.join(__dirname, '..', 'pricing_files', 'hafr_albatin_raw_ARBA_PRICED.xlsx');
const ryPricedPath = path.join(__dirname, '..', 'pricing_files', 'riyadh_raw_ARBA_PRICED.xlsx');

const wb = xlsx.readFile(hbPricedPath);
const sheet = wb.Sheets['جدول الكميات المسعر'];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log('--- Inspecting "مواسير قطر 110 مم" inside Hafr Al-Batin Priced ---');
rows.filter(r => String(r['وصف البند']).includes('مواسير قطر 110 مم')).forEach((r, idx) => {
    console.log(`Index: ${idx} | Sheet: ${r['sheet'] || 'N/A'} | Row: ${r['row'] || r['#']} | Qty: ${r['الكمية']} | Cost: ${r['سعر التكلفة']} | Sell: ${r['سعر البيع']} | Source: ${r['مصدر السعر']} | Status: ${r['الحالة']}`);
});

console.log('\n--- Inspecting "توريـــد وتركيـب بـــردورات خرســـانيـة" inside Hafr Al-Batin Priced ---');
rows.filter(r => String(r['وصف البند']).includes('بردورات خرســـانيـة')).forEach((r, idx) => {
    console.log(`Index: ${idx} | Sheet: ${r['sheet'] || 'N/A'} | Row: ${r['row'] || r['#']} | Qty: ${r['الكمية']} | Cost: ${r['سعر التكلفة']} | Sell: ${r['سعر البيع']} | Source: ${r['مصدر السعر']} | Status: ${r['الحالة']}`);
});
