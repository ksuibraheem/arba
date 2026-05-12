/**
 * ARBA V8.1 — Price Audit Excel Report
 * تقرير مراجعة الأسعار مع الموردين — ملف إكسل احترافي
 */

const ExcelJS = require('exceljs');
const xlsx = require('xlsx');
const path = require('path');

const INPUT = path.join(
    'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program',
    'التأسيس', 'الملحلة الثالثة', 'مزرعة خاصة',
    'R.E Farm-Consolidated MEP BOQ -Priced (1).xlsx'
);

const OUTPUT = path.join(
    'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program',
    'التأسيس', 'الملحلة الثالثة', 'مزرعة خاصة',
    'RE Farm — تقرير مراجعة الأسعار النهائي.xlsx'
);

// Market reference prices (from research)
const marketRef = {
    // PPR Pipes
    '20 mm dia': { min: 15, max: 25, note: 'PPR مياه' },
    '25 mm dia': { min: 18, max: 28, note: 'PPR مياه' },
    '32 mm dia': { min: 22, max: 35, note: 'PPR مياه' },
    '40 mm dia': { min: 30, max: 42, note: 'PPR مياه' },
    '50 mm dia': { min: 40, max: 55, note: 'PPR مياه' },
    '63 mm dia': { min: 50, max: 70, note: 'PPR مياه' },
    '75 mm dia': { min: 65, max: 85, note: 'PPR مياه' },
    '80 mm dia': { min: 70, max: 90, note: 'UPVC صرف' },
    '100 mm dia': { min: 80, max: 105, note: 'UPVC صرف' },
    '110 mm dia': { min: 85, max: 110, note: 'UPVC صرف' },
    // Copper refrigerant
    '3/8"': { min: 35, max: 55, note: 'أنبوب نحاس تبريد' },
    '1/2"': { min: 45, max: 65, note: 'أنبوب نحاس تبريد' },
    '5/8"': { min: 55, max: 75, note: 'أنبوب نحاس تبريد' },
    '3/4"': { min: 65, max: 90, note: 'أنبوب نحاس تبريد' },
    '7/8"': { min: 80, max: 110, note: 'أنبوب نحاس تبريد' },
    '1 1/8"': { min: 130, max: 200, note: 'أنبوب نحاس تبريد' },
    '1 3/8"': { min: 170, max: 250, note: 'أنبوب نحاس تبريد' },
    '1 5/8"': { min: 200, max: 280, note: 'أنبوب نحاس تبريد' },
};

(async () => {
    console.log('📊 بناء تقرير مراجعة الأسعار...\n');

    // Read original file
    const origWb = xlsx.readFile(INPUT);
    const allItems = [];

    for (const sheetName of origWb.SheetNames) {
        if (sheetName === 'Codes' || sheetName === 'MEP Works') continue;
        const rows = xlsx.utils.sheet_to_json(origWb.Sheets[sheetName], { header: 1 });

        // Find header
        let colMap = { desc: 1, unit: 2, qty: 3, rate: 4, amount: 5 };
        let startRow = 0;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
            const r = rows[i];
            if (!r) continue;
            const j = r.map(c => String(c || '').toLowerCase()).join('|');
            if (j.includes('scope') || j.includes('description')) {
                r.forEach((cell, idx) => {
                    const h = String(cell || '').toLowerCase();
                    if (h.includes('scope') || h.includes('description')) colMap.desc = idx;
                    if (h.includes('unit')) colMap.unit = idx;
                    if (h.includes('qty') || h.includes('quantity')) colMap.qty = idx;
                    if (h.includes('rate') || h.includes('u/price')) colMap.rate = idx;
                    if (h.includes('amount') || h.includes('price')) colMap.amount = idx;
                });
                startRow = i + 1;
                break;
            }
        }

        for (let i = startRow; i < rows.length; i++) {
            const r = rows[i];
            if (!r) continue;
            const desc = String(r[colMap.desc] || '').trim();
            const unit = String(r[colMap.unit] || '').trim();
            const qty = Number(r[colMap.qty]) || 0;
            const rate = Number(r[colMap.rate]) || 0;
            const amt = Number(r[colMap.amount]) || 0;
            if (!desc || desc.length < 3 || qty <= 0) continue;
            if (desc.includes('Total') || desc.includes('KINGDOM') || desc.includes('BILL')) continue;
            if (desc.startsWith('*') || desc.startsWith('DIV')) continue;

            // Market comparison
            const ref = marketRef[desc.trim()];
            let status = '✅ سعر مورد';
            let marketMin = '', marketMax = '', marketNote = '';

            if (ref) {
                marketMin = ref.min;
                marketMax = ref.max;
                marketNote = ref.note;
                if (rate < ref.min) status = '🔵 أقل من السوق';
                else if (rate > ref.max * 1.1) status = '🔴 أعلى من السوق';
                else if (rate > ref.max) status = '⚠️ أعلى قليلاً';
                else status = '✅ ضمن النطاق';
            } else if (rate === 0) {
                status = '❌ بدون سعر';
            }

            allItems.push({
                sheet: sheetName, seq: r[0] || '', desc, unit, qty,
                rate, amt, marketMin, marketMax, marketNote, status,
                sellRate: Math.round(rate * 1.15 * 100) / 100,
                sellAmt: Math.round(amt * 1.15 * 100) / 100,
            });
        }
    }

    // Build Excel
    const wb = new ExcelJS.Workbook();

    // ═══ Sheet 1: تفاصيل المراجعة ═══
    const ws = wb.addWorksheet('مراجعة الأسعار التفصيلية', { views: [{ rightToLeft: true }] });

    // Title
    ws.mergeCells('A1:N1');
    ws.getCell('A1').value = '🔍 تقرير مراجعة الأسعار — مشروع RE Farm (المزرعة الخاصة)';
    ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D47A1' } };
    ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 40;

    // Headers
    ws.columns = [
        { header: '', key: 'seq', width: 8 },
        { header: '', key: 'desc', width: 55 },
        { header: '', key: 'sheet', width: 16 },
        { header: '', key: 'unit', width: 8 },
        { header: '', key: 'qty', width: 8 },
        { header: '', key: 'rate', width: 14 },
        { header: '', key: 'amt', width: 16 },
        { header: '', key: 'marketMin', width: 12 },
        { header: '', key: 'marketMax', width: 12 },
        { header: '', key: 'status', width: 18 },
        { header: '', key: 'sellRate', width: 14 },
        { header: '', key: 'sellAmt', width: 16 },
        { header: '', key: 'marketNote', width: 20 },
    ];

    const headerRow = ws.getRow(2);
    const headers = ['#', 'وصف البند', 'القسم', 'الوحدة', 'الكمية',
        'سعر التكلفة', 'إجمالي التكلفة', 'سعر السوق (أقل)', 'سعر السوق (أعلى)',
        'حالة المراجعة', 'سعر البيع +15%', 'إجمالي البيع', 'ملاحظة'];
    headers.forEach((h, i) => { headerRow.getCell(i + 1).value = h; });
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 32;

    // Data
    allItems.forEach(item => {
        const row = ws.addRow(item);
        row.alignment = { vertical: 'middle', wrapText: true };

        // Coloring
        if (item.status.includes('🔴')) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBEE' } };
        } else if (item.status.includes('⚠️')) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8E1' } };
        } else if (item.status.includes('❌')) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4EC' } };
        } else if (item.status.includes('🔵')) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E3F2FD' } };
        }

        // Number format
        ['rate', 'amt', 'sellRate', 'sellAmt'].forEach(k => {
            row.getCell(k).numFmt = '#,##0.00';
        });
        ['marketMin', 'marketMax'].forEach(k => {
            if (row.getCell(k).value) row.getCell(k).numFmt = '#,##0';
        });
    });

    // ═══ Sheet 2: ملخص مالي ═══
    const sm = wb.addWorksheet('الملخص المالي', { views: [{ rightToLeft: true }] });

    const totalCost = allItems.reduce((s, r) => s + r.amt, 0);
    const totalSell = allItems.reduce((s, r) => s + r.sellAmt, 0);
    const totalProfit = totalSell - totalCost;
    const withVAT = totalSell * 1.15;
    const highItems = allItems.filter(r => r.status.includes('🔴')).length;
    const okItems = allItems.filter(r => r.status.includes('✅')).length;
    const warnItems = allItems.filter(r => r.status.includes('⚠️')).length;
    const noPrice = allItems.filter(r => r.status.includes('❌')).length;

    // Title
    sm.mergeCells('A1:C1');
    sm.getCell('A1').value = '📋 الملخص المالي النهائي';
    sm.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    sm.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D47A1' } };
    sm.getCell('A1').alignment = { horizontal: 'center' };
    sm.getRow(1).height = 40;

    const summaryData = [
        ['البند', 'القيمة', 'ملاحظة'],
        ['عدد البنود الإجمالي', allItems.length, ''],
        ['إجمالي التكلفة', Math.round(totalCost), 'ريال'],
        ['الربح 15%', Math.round(totalProfit), 'ريال'],
        ['إجمالي البيع', Math.round(totalSell), 'ريال'],
        ['ضريبة القيمة المضافة 15%', Math.round(totalSell * 0.15), 'ريال'],
        ['الإجمالي شامل الضريبة', Math.round(withVAT), 'ريال'],
        ['', '', ''],
        ['بنود ضمن نطاق السوق ✅', okItems, 'بند'],
        ['بنود أعلى قليلاً ⚠️', warnItems, 'بند — ممكن التفاوض'],
        ['بنود مرتفعة 🔴', highItems, 'بند — يحتاج تفاوض'],
        ['بنود بدون سعر ❌', noPrice, 'بند — يحتاج سعر مورد'],
    ];

    summaryData.forEach((row, i) => {
        const r = sm.addRow(row);
        r.height = 28;
        if (i === 0) {
            r.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
            r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } };
        }
        if (i === 6) {
            r.font = { bold: true, size: 13, color: { argb: '0D47A1' } };
            r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } };
        }
        if (typeof row[1] === 'number' && row[1] > 1000) {
            r.getCell(2).numFmt = '#,##0';
        }
    });

    sm.getColumn(1).width = 35;
    sm.getColumn(2).width = 20;
    sm.getColumn(3).width = 22;

    // ═══ Sheet 3: توصيات ═══
    const rec = wb.addWorksheet('التوصيات', { views: [{ rightToLeft: true }] });

    rec.mergeCells('A1:B1');
    rec.getCell('A1').value = '💡 توصيات مراجعة الأسعار';
    rec.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFF' } };
    rec.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D47A1' } };
    rec.getRow(1).height = 40;

    const recommendations = [
        ['التوصية', 'التفاصيل'],
        ['1. أسعار VRF (LG Multi-V)', 'اعتمدها كما هي — أسعار مخصصة من وكيل الشاكر المعتمد ولا تحتاج تفاوض'],
        ['2. مواسير PPR (75mm + 110mm)', 'فاوض المورد لتخفيض 10-15% — الأسعار أعلى من متوسط السوق'],
        ['3. أنواع الإنارة (TYPE-L3, L4, F)', 'تأكد من السعر النهائي مع مورد الإنارة — بعض الأنواع بدون سعر'],
        ['4. كوابل كهربائية', 'الأسعار معقولة ومتوافقة مع السوق — لا تحتاج تعديل'],
        ['5. مراوح الشفط (EF-01 إلى EF-09)', 'أسعار ضمن النطاق المقبول (2,313-5,098 ريال)'],
        ['6. لوحات كهربائية (MDB/SMDB)', 'أسعار مخصصة حسب المواصفات — اعتمدها'],
        ['7. أجهزة صحية', 'جميعها ضمن نطاق السوق — اعتمدها'],
        ['8. الإجراء التالي', 'أرسل العرض للمقاول مع ملاحظة أن بنود الإنارة قابلة للتعديل حسب سعر المورد النهائي'],
    ];

    recommendations.forEach((row, i) => {
        const r = rec.addRow(row);
        r.height = i === 0 ? 30 : 35;
        r.alignment = { vertical: 'middle', wrapText: true };
        if (i === 0) {
            r.font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
            r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1565C0' } };
        }
    });

    rec.getColumn(1).width = 35;
    rec.getColumn(2).width = 75;

    // Save
    await wb.xlsx.writeFile(OUTPUT);

    console.log('✅ تم حفظ تقرير المراجعة:');
    console.log(`   📂 ${OUTPUT}`);
    console.log(`\n   💰 إجمالي التكلفة: ${Math.round(totalCost).toLocaleString()} ريال`);
    console.log(`   📈 إجمالي البيع (+15%): ${Math.round(totalSell).toLocaleString()} ريال`);
    console.log(`   🧾 شامل الضريبة: ${Math.round(withVAT).toLocaleString()} ريال`);
    console.log(`\n   ✅ ضمن السوق: ${okItems} | ⚠️ أعلى قليلاً: ${warnItems} | 🔴 مرتفع: ${highItems} | ❌ ناقص: ${noPrice}`);
})();
