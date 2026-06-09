const ExcelJS = require('exceljs');
const x = require('xlsx');

async function mergeFullDescriptions() {
    // 1. Read the ORIGINAL draft file with the FULL texts
    const SRC = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\Ibrahim AL-duaydi\\\\My own program\\\\جداول لتسعير (نماذج)\\\\مشروع الصندوق الزراعي عرعر\\\\مشروع الصندوق الزراعي عرعر\\\\مسودة للتسعير.xlsx';
    let wbRaw;
    try {
        wbRaw = x.readFile(SRC);
    } catch (e) {
        console.error('Could not read original draft file', e);
        return;
    }
    
    const dRaw = x.utils.sheet_to_json(wbRaw.Sheets[wbRaw.SheetNames[0]]);
    const K_raw = Object.keys(dRaw[0]);
    
    // Build a map of full descriptions from the original file
    const fullTexts = {};
    dRaw.forEach(r => {
        // K_raw[0] contains the sequence number (though the key is a long string)
        const seq = r[K_raw[0]];
        if (typeof seq === 'number') {
            fullTexts[seq] = {
                desc: r['__EMPTY_4'] || '',
                spec: r['__EMPTY_5'] || ''
            };
        }
    });

    // 2. Read our latest clean data (with the correct 4.6M calculations)
    const cleanFile = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_100_CLEAN.xlsx';
    const wbClean = x.readFile(cleanFile);
    const boqData = x.utils.sheet_to_json(wbClean.Sheets['BOQ Final']);
    const catData = x.utils.sheet_to_json(wbClean.Sheets['Categories']);
    const sumData = x.utils.sheet_to_json(wbClean.Sheets['Summary']);

    // 3. Initialize ExcelJS workbook for the gorgeous ARBA format
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ARBA AI Pricing Engine';

    const ARBA_GREEN = 'FF004B23';
    const ARBA_GOLD = 'FFD4AF37';
    const LIGHT_GRAY = 'FFF2F2F2';
    
    const fontHeader = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    const fontData = { name: 'Arial', size: 11, color: { argb: 'FF000000' } };
    const fontTotal = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
    
    const borderAll = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
    };

    const currencyFormat = '#,##0';

    // ==========================================
    // SHEET 1: BOQ Final
    // ==========================================
    const wsBOQ = wb.addWorksheet('BOQ Final', { views: [{ rightToLeft: true }] });
    
    wsBOQ.columns = [
        { header: '#', key: '#', width: 6 },
        { header: 'الفئة', key: 'الفئة', width: 20 },
        { header: 'البند', key: 'البند', width: 10 },
        { header: 'الوحدة', key: 'الوحدة', width: 12 },
        { header: 'الكمية', key: 'الكمية', width: 12 },
        { header: 'وصف البند', key: 'وصف البند', width: 55 },
        { header: 'المواصفات', key: 'المواصفات', width: 55 },
        { header: 'سعر التكلفة', key: 'سعر التكلفة', width: 15 },
        { header: 'إجمالي التكلفة', key: 'إجمالي التكلفة', width: 18 },
        { header: 'سعر البيع 15%', key: 'سعر البيع 15%', width: 15 },
        { header: 'إجمالي البيع', key: 'إجمالي البيع', width: 18 },
        { header: 'الربح', key: 'الربح', width: 15 }
    ];

    wsBOQ.getRow(1).eachCell(cell => {
        cell.font = fontHeader;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARBA_GREEN } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderAll;
    });

    boqData.forEach(row => {
        if(typeof row['#'] !== 'number') return;
        
        // --- INJECT FULL TEXT HERE ---
        const seq = row['#'];
        if (fullTexts[seq]) {
            row['وصف البند'] = fullTexts[seq].desc;
            row['المواصفات'] = fullTexts[seq].spec;
        }
        
        const newRow = wsBOQ.addRow(row);
        newRow.eachCell(cell => {
            cell.font = fontData;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = borderAll;
        });
        
        newRow.getCell(5).numFmt = '#,##0.00';
        newRow.getCell(8).numFmt = currencyFormat;
        newRow.getCell(9).numFmt = currencyFormat;
        newRow.getCell(10).numFmt = currencyFormat;
        newRow.getCell(11).numFmt = currencyFormat;
        newRow.getCell(12).numFmt = currencyFormat;
        
        newRow.getCell(6).alignment = { vertical: 'top', horizontal: 'right', wrapText: true };
        newRow.getCell(7).alignment = { vertical: 'top', horizontal: 'right', wrapText: true };

        // Auto-adjust row height based on the newly injected FULL TEXT
        const descLen = String(row['وصف البند'] || '').length;
        const specLen = String(row['المواصفات'] || '').length;
        
        // 55 chars width per column roughly
        const descLines = Math.ceil(descLen / 55);
        const specLines = Math.ceil(specLen / 55);
        // Also account for newlines explicitly written in the text
        const explicitDescLines = String(row['وصف البند'] || '').split('\\n').length;
        const explicitSpecLines = String(row['المواصفات'] || '').split('\\n').length;
        
        const maxLines = Math.max(descLines, specLines, explicitDescLines, explicitSpecLines, 1);
        
        // Give 16 points per line for comfortable reading
        newRow.height = 18 + (maxLines * 16);
    });

    const sumRowBoq = wsBOQ.addRow({
        'الفئة': 'الإجمالي الكلي للمشروع',
        'إجمالي التكلفة': { formula: `SUM(I2:I${wsBOQ.rowCount - 1})` },
        'إجمالي البيع': { formula: `SUM(K2:K${wsBOQ.rowCount - 1})` },
        'الربح': { formula: `SUM(L2:L${wsBOQ.rowCount - 1})` }
    });
    
    sumRowBoq.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = fontTotal;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARBA_GOLD } };
        cell.border = borderAll;
        if (colNumber >= 8) cell.numFmt = currencyFormat;
    });
    wsBOQ.mergeCells(`A${wsBOQ.rowCount}:H${wsBOQ.rowCount}`);
    wsBOQ.getCell(`A${wsBOQ.rowCount}`).alignment = { vertical: 'middle', horizontal: 'center' };

    wsBOQ.views = [ { state: 'frozen', xSplit: 0, ySplit: 1, rightToLeft: true } ];


    // ==========================================
    // SHEET 2: Categories
    // ==========================================
    const wsCat = wb.addWorksheet('الأقسام الهندسية', { views: [{ rightToLeft: true }] });
    wsCat.columns = [
        { header: 'القسم الهندسي', key: 'القسم', width: 35 },
        { header: 'عدد البنود', key: 'عدد البنود', width: 15 },
        { header: 'التكلفة الإجمالية', key: 'التكلفة', width: 20 },
        { header: 'البيع الإجمالي', key: 'البيع', width: 20 }
    ];

    wsCat.getRow(1).eachCell(cell => {
        cell.font = fontHeader;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARBA_GREEN } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    catData.forEach(row => {
        if(!row['القسم'] || row['القسم'] === 'الإجمالي الكلي') return;
        const newRow = wsCat.addRow(row);
        newRow.eachCell(cell => { cell.font = fontData; cell.alignment = { horizontal: 'center' }; cell.border = borderAll; });
        newRow.getCell(3).numFmt = currencyFormat;
        newRow.getCell(4).numFmt = currencyFormat;
    });

    const sumRowCat = wsCat.addRow({
        'القسم': 'الإجمالي الكلي',
        'عدد البنود': { formula: `SUM(B2:B${wsCat.rowCount - 1})` },
        'التكلفة': { formula: `SUM(C2:C${wsCat.rowCount - 1})` },
        'البيع': { formula: `SUM(D2:D${wsCat.rowCount - 1})` }
    });
    sumRowCat.eachCell((cell, colNum) => {
        cell.font = fontTotal;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARBA_GOLD } };
        cell.border = borderAll;
        if(colNum > 2) cell.numFmt = currencyFormat;
    });

    // ==========================================
    // SHEET 3: Summary
    // ==========================================
    const wsSum = wb.addWorksheet('الملخص المالي', { views: [{ rightToLeft: true, showGridLines: false }] });
    wsSum.columns = [ { width: 5 }, { width: 40 }, { width: 25 }, { width: 5 } ]; 
    
    wsSum.getCell('B2').value = 'ملخص تسعير مشروع عرعر (ARBA Engine)';
    wsSum.getCell('B2').font = { name: 'Arial', size: 16, bold: true, color: { argb: ARBA_GREEN } };
    wsSum.mergeCells('B2:C2');
    wsSum.getCell('B2').alignment = { horizontal: 'center' };

    let rIdx = 4;
    sumData.forEach(row => {
        if(!row['M']) return;
        const titleCell = wsSum.getCell(`B${rIdx}`);
        const valCell = wsSum.getCell(`C${rIdx}`);
        
        titleCell.value = row['M'];
        valCell.value = row['V'];
        
        titleCell.font = { name: 'Arial', size: 12, bold: true };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_GRAY } };
        titleCell.border = borderAll;
        
        valCell.font = fontTotal;
        valCell.border = borderAll;
        valCell.alignment = { horizontal: 'center' };
        
        if (typeof row['V'] === 'number' && row['V'] > 1000) {
            valCell.numFmt = currencyFormat + ' "ر.س"';
        }
        rIdx += 2;
    });

    // Save File
    const outPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_FULL_DESC_BRANDED.xlsx';
    await wb.xlsx.writeFile(outPath);
    console.log('Successfully merged full descriptions and generated ARBA file!');
}

mergeFullDescriptions().catch(err => console.error(err));
