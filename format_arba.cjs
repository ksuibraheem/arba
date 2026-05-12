const ExcelJS = require('exceljs');
const x = require('xlsx'); // To read the clean raw data

async function formatArba() {
    // 1. Read the clean data using xlsx
    const fileIn = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_BOQ_100_CLEAN.xlsx';
    const wbRaw = x.readFile(fileIn);
    
    // Read raw data (we slice out the last sum row from BOQ and Cats to handle them gracefully)
    const boqData = x.utils.sheet_to_json(wbRaw.Sheets['BOQ Final']);
    const catData = x.utils.sheet_to_json(wbRaw.Sheets['Categories']);
    const sumData = x.utils.sheet_to_json(wbRaw.Sheets['Summary']);

    // 2. Initialize ExcelJS workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = 'ARBA AI Pricing Engine';
    wb.lastModifiedBy = 'ARBA AI';
    wb.created = new Date();

    // Formatting Constants
    const ARBA_GREEN = 'FF004B23'; // Deep ARBA green
    const ARBA_GOLD = 'FFD4AF37';  // ARBA Gold
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

    const currencyFormat = '#,##0'; // Standard Saudi format without decimals for simplicity

    // ==========================================
    // SHEET 1: BOQ Final
    // ==========================================
    const wsBOQ = wb.addWorksheet('BOQ Final', { views: [{ rightToLeft: true }] });
    
    const boqHeaders = Object.keys(boqData[0]).filter(k => k !== 'undefined');
    wsBOQ.columns = [
        { header: '#', key: '#', width: 6 },
        { header: 'الفئة', key: 'الفئة', width: 20 },
        { header: 'البند', key: 'البند', width: 10 },
        { header: 'الوحدة', key: 'الوحدة', width: 12 },
        { header: 'الكمية', key: 'الكمية', width: 12 },
        { header: 'وصف البند', key: 'وصف البند', width: 50 },
        { header: 'المواصفات', key: 'المواصفات', width: 70 },
        { header: 'سعر التكلفة', key: 'سعر التكلفة', width: 15 },
        { header: 'إجمالي التكلفة', key: 'إجمالي التكلفة', width: 18 },
        { header: 'سعر البيع 15%', key: 'سعر البيع 15%', width: 15 },
        { header: 'إجمالي البيع', key: 'إجمالي البيع', width: 18 },
        { header: 'الربح', key: 'الربح', width: 15 }
    ];

    // Style Header
    wsBOQ.getRow(1).eachCell(cell => {
        cell.font = fontHeader;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ARBA_GREEN } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderAll;
    });

    // Add Data
    boqData.forEach(row => {
        if(typeof row['#'] !== 'number') return; // skip old sum rows
        const newRow = wsBOQ.addRow(row);
        newRow.eachCell(cell => {
            cell.font = fontData;
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = borderAll;
        });
        // Numbers formatting
        newRow.getCell(5).numFmt = '#,##0.00'; // Qty
        newRow.getCell(8).numFmt = currencyFormat;
        newRow.getCell(9).numFmt = currencyFormat;
        newRow.getCell(10).numFmt = currencyFormat;
        newRow.getCell(11).numFmt = currencyFormat;
        newRow.getCell(12).numFmt = currencyFormat;
        
        // Left align descriptions for readability
        newRow.getCell(6).alignment = { vertical: 'top', horizontal: 'right', wrapText: true };
        newRow.getCell(7).alignment = { vertical: 'top', horizontal: 'right', wrapText: true };

        // Auto-adjust row height based on text length to prevent visual truncation
        const descLen = String(row['وصف البند'] || '').length;
        const specLen = String(row['المواصفات'] || '').length;
        
        // Width of description is 50, spec is 70. 
        const descLines = Math.ceil(descLen / 50);
        const specLines = Math.ceil(specLen / 70);
        const maxLines = Math.max(descLines, specLines, 1);
        
        // Base height is 15. Add 12 for every additional line
        newRow.height = 15 + (maxLines * 12);
    });

    // Add Sum Row at the bottom
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

    // Freeze header
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
    // SHEET 3: Summary (Dashboard)
    // ==========================================
    const wsSum = wb.addWorksheet('الملخص المالي', { views: [{ rightToLeft: true, showGridLines: false }] });
    wsSum.columns = [ { width: 5 }, { width: 40 }, { width: 25 }, { width: 5 } ]; // Spacer columns
    
    wsSum.getCell('B2').value = 'ملخص تسعير مشروع عرعر (ARBA Engine)';
    wsSum.getCell('B2').font = { name: 'Arial', size: 16, bold: true, color: { argb: ARBA_GREEN } };
    wsSum.mergeCells('B2:C2');
    wsSum.getCell('B2').alignment = { horizontal: 'center' };

    let rIdx = 4;
    sumData.forEach(row => {
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
    const outPath = 'C:\\\\Users\\\\ksuib\\\\Desktop\\\\ADF_Arar_ARBA_BRANDED_V2.xlsx';
    await wb.xlsx.writeFile(outPath);
    console.log('Successfully generated beautifully formatted ARBA file!');
}

formatArba().catch(err => console.error(err));
