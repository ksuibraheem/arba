/**
 * Arba Universal File Parser — Backend Only
 * محلل الملفات الموحد — خاص بالسيرفر فقط
 * 
 * Parses Excel (.xlsx/.xls), CSV, and PDF files server-side.
 * Never sends raw file data or parsing logic to the client.
 */

import * as XLSX from 'xlsx';
import pdfParse from 'pdf-parse';

// =================== Types ===================

export interface ParsedSheet {
    name: string;
    headers: string[];
    rows: any[][];
    rowCount: number;
}

export interface ParsedFileResult {
    fileName: string;
    fileType: 'excel' | 'csv' | 'pdf';
    sheets: ParsedSheet[];
    metadata: FileMetadata;
    columnTypes: Record<string, ColumnType>;
    embeddedImages: Buffer[];
}

export interface FileMetadata {
    author?: string;
    company?: string;
    title?: string;
    subject?: string;
    created?: string;
    modified?: string;
    comments?: string;
    [key: string]: string | undefined;
}

export type ColumnType = 'numeric' | 'text' | 'unit' | 'category' | 'date' | 'mixed';

export interface ColumnTypeInfo {
    type: ColumnType;
    confidence: number; // 0-1
    sampleValues: string[];
}

// =================== Excel/CSV Parser ===================

/**
 * Parse Excel (.xlsx/.xls) buffer
 */
export function parseExcel(buffer: Buffer, fileName: string): ParsedFileResult {
    const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
        cellStyles: false, // Don't need styles on server
    });

    const sheets: ParsedSheet[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        if (jsonData.length < 1) {
            return { name: sheetName, headers: [], rows: [], rowCount: 0 };
        }

        // Find the actual header row (first non-empty row with multiple values)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i] as any[];
            const nonEmptyCells = (row || []).filter(cell => cell != null && String(cell).trim() !== '').length;
            if (nonEmptyCells >= 3) {
                headerRowIdx = i;
                break;
            }
        }

        const headers = ((jsonData[headerRowIdx] as any[]) || []).map(h => String(h || '').trim());
        const rows = jsonData.slice(headerRowIdx + 1).filter((row: any[]) =>
            (row || []).some(cell => cell != null && String(cell).trim() !== '')
        );

        return {
            name: sheetName,
            headers,
            rows: rows as any[][],
            rowCount: rows.length,
        };
    });

    // Extract metadata
    const metadata = extractExcelMetadata(workbook);

    // Detect column types from first sheet
    const columnTypes = sheets[0] ? detectColumnTypes(sheets[0].headers, sheets[0].rows) : {};

    // Extract embedded images for OCR scanning
    const embeddedImages: Buffer[] = [];
    try {
        // Check for workbook-level media
        if ((workbook as any).Media) {
            for (const media of (workbook as any).Media) {
                if (media.data && Buffer.isBuffer(media.data)) {
                    embeddedImages.push(media.data);
                }
            }
        }
    } catch (_e) { /* No images found */ }

    return {
        fileName,
        fileType: fileName.toLowerCase().endsWith('.csv') ? 'csv' : 'excel',
        sheets,
        metadata,
        columnTypes,
        embeddedImages,
    };
}

/**
 * Parse CSV buffer (using xlsx engine)
 */
export function parseCsv(buffer: Buffer, fileName: string): ParsedFileResult {
    return parseExcel(buffer, fileName); // xlsx handles CSV identically
}

/**
 * Extract metadata from Excel workbook
 */
function extractExcelMetadata(workbook: XLSX.WorkBook): FileMetadata {
    const props = workbook.Props || {};
    const custprops = workbook.Custprops || {};

    const metadata: FileMetadata = {
        author: props.Author || undefined,
        company: props.Company || undefined,
        title: props.Title || undefined,
        subject: props.Subject || undefined,
        created: props.CreatedDate ? String(props.CreatedDate) : undefined,
        modified: props.ModifiedDate ? String(props.ModifiedDate) : undefined,
        comments: props.Comments || undefined,
    };

    // Capture ALL custom properties (hidden tracking tags, etc.)
    for (const [key, value] of Object.entries(custprops)) {
        if (value != null) {
            metadata[`custom_${key}`] = String(value);
        }
    }

    // Also check for Manager, Category, and other extended properties
    if ((props as any).Manager) metadata['manager'] = String((props as any).Manager);
    if ((props as any).Category) metadata['category'] = String((props as any).Category);
    if ((props as any).Keywords) metadata['keywords'] = String((props as any).Keywords);
    if ((props as any).LastAuthor) metadata['lastAuthor'] = String((props as any).LastAuthor);

    return metadata;
}

// =================== PDF Parser ===================

/**
 * Parse PDF buffer — extracts text and attempts table detection
 */
export async function parsePdf(buffer: Buffer, fileName: string): Promise<ParsedFileResult> {
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // Split into lines and attempt table detection
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Heuristic: detect table-like rows (lines with consistent separators)
    const tableRows = extractTablesFromText(lines);

    let headers: string[] = [];
    let rows: any[][] = [];

    if (tableRows.length > 1) {
        headers = tableRows[0];
        rows = tableRows.slice(1);
    } else {
        // Fallback: treat each line as a single-column row
        headers = ['المحتوى / Content'];
        rows = lines.map(line => [line]);
    }

    // Extract PDF metadata — including all info fields
    const metadata: FileMetadata = {
        author: pdfData.info?.Author || undefined,
        title: pdfData.info?.Title || undefined,
        subject: pdfData.info?.Subject || undefined,
        company: pdfData.info?.Creator || undefined,
        created: pdfData.info?.CreationDate ? String(pdfData.info.CreationDate) : undefined,
        modified: pdfData.info?.ModDate ? String(pdfData.info.ModDate) : undefined,
    };

    // Capture additional PDF metadata
    if (pdfData.info?.Producer) metadata['producer'] = String(pdfData.info.Producer);
    if (pdfData.info?.Keywords) metadata['keywords'] = String(pdfData.info.Keywords);

    const columnTypes = detectColumnTypes(headers, rows);

    return {
        fileName,
        fileType: 'pdf',
        sheets: [{
            name: 'PDF Content',
            headers,
            rows,
            rowCount: rows.length,
        }],
        metadata,
        columnTypes,
        embeddedImages: [], // PDF images extracted separately if needed
    };
}

/**
 * Extract table-like structures from PDF text lines
 */
function extractTablesFromText(lines: string[]): string[][] {
    const result: string[][] = [];

    for (const line of lines) {
        // Try multiple delimiters: tab, multiple spaces, pipe
        let cells: string[];

        if (line.includes('\t')) {
            cells = line.split('\t').map(c => c.trim()).filter(c => c.length > 0);
        } else if (line.includes('|')) {
            cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
        } else {
            // Split by 2+ spaces (common in PDF tables)
            cells = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
        }

        if (cells.length >= 2) {
            result.push(cells);
        }
    }

    // Validate: a real table should have consistent column counts
    if (result.length < 2) return result;

    const columnCounts = result.map(row => row.length);
    const modeCount = findMode(columnCounts);

    // Keep only rows that match the most common column count (±1)
    return result.filter(row => Math.abs(row.length - modeCount) <= 1);
}

/**
 * Find the most common value in an array
 */
function findMode(arr: number[]): number {
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    let mode = arr[0];

    for (const val of arr) {
        freq[val] = (freq[val] || 0) + 1;
        if (freq[val] > maxFreq) {
            maxFreq = freq[val];
            mode = val;
        }
    }
    return mode;
}

// =================== Column Type Detection ===================

/**
 * Detect column types from headers and sample data
 */
export function detectColumnTypes(
    headers: string[],
    sampleRows: any[][],
    maxSamples: number = 20
): Record<string, ColumnType> {
    const result: Record<string, ColumnType> = {};
    const samples = sampleRows.slice(0, maxSamples);

    headers.forEach((header, colIdx) => {
        const values = samples
            .map(row => row[colIdx])
            .filter(v => v != null && String(v).trim() !== '');

        if (values.length === 0) {
            result[header] = 'text';
            return;
        }

        const numericCount = values.filter(v => !isNaN(parseFloat(String(v)))).length;
        const numericRatio = numericCount / values.length;

        // Check header keywords for type hints
        const headerLower = header.toLowerCase();
        const headerAr = header;

        // Unit detection
        const unitKeywords = ['unit', 'وحدة', 'وحده', 'uom'];
        if (unitKeywords.some(k => headerLower.includes(k) || headerAr.includes(k))) {
            result[header] = 'unit';
            return;
        }

        // Category detection
        const catKeywords = ['category', 'تصنيف', 'فئة', 'type', 'نوع', 'قسم', 'section'];
        if (catKeywords.some(k => headerLower.includes(k) || headerAr.includes(k))) {
            result[header] = 'category';
            return;
        }

        // Date detection
        const dateKeywords = ['date', 'تاريخ', 'time', 'وقت'];
        if (dateKeywords.some(k => headerLower.includes(k) || headerAr.includes(k))) {
            result[header] = 'date';
            return;
        }

        // Numeric vs text
        if (numericRatio > 0.8) {
            result[header] = 'numeric';
        } else if (numericRatio > 0.3) {
            result[header] = 'mixed';
        } else {
            result[header] = 'text';
        }
    });

    return result;
}

// =================== Auto Column Mapping ===================

export interface TargetField {
    key: string;
    labels: { ar: string; en: string };
    type: ColumnType;
    required: boolean;
}

export const ARBA_SCHEMA_FIELDS: TargetField[] = [
    { key: 'name_ar', labels: { ar: 'الاسم (عربي)', en: 'Name (Arabic)' }, type: 'text', required: true },
    { key: 'name_en', labels: { ar: 'الاسم (إنجليزي)', en: 'Name (English)' }, type: 'text', required: false },
    { key: 'description', labels: { ar: 'الوصف', en: 'Description' }, type: 'text', required: false },
    { key: 'unit', labels: { ar: 'الوحدة', en: 'Unit' }, type: 'unit', required: true },
    { key: 'qty', labels: { ar: 'الكمية', en: 'Quantity' }, type: 'numeric', required: true },
    { key: 'materials', labels: { ar: 'سعر المواد', en: 'Materials Cost' }, type: 'numeric', required: true },
    { key: 'labor', labels: { ar: 'سعر العمالة', en: 'Labor Cost' }, type: 'numeric', required: false },
    { key: 'equipment', labels: { ar: 'المعدات', en: 'Equipment Cost' }, type: 'numeric', required: false },
    { key: 'waste', labels: { ar: 'نسبة الهالك %', en: 'Wastage %' }, type: 'numeric', required: false },
    { key: 'category', labels: { ar: 'التصنيف', en: 'Category' }, type: 'category', required: false },
    { key: 'sbc', labels: { ar: 'كود SBC', en: 'SBC Code' }, type: 'text', required: false },
    { key: 'rate', labels: { ar: 'سعر الوحدة', en: 'Unit Rate' }, type: 'numeric', required: false },
];

/**
 * Auto-map source columns to Arba schema fields using fuzzy matching
 */
export function autoMapColumns(
    sourceHeaders: string[],
    columnTypes: Record<string, ColumnType>
): Record<string, string> {
    const mappings: Record<string, string> = {};

    // Keyword matching database (Arabic + English)
    const keywordMap: Record<string, string[]> = {
        'name_ar': ['اسم', 'بند', 'وصف', 'description', 'name', 'item', 'بنود', 'الأعمال'],
        'name_en': ['english name', 'en name', 'eng', 'english'],
        'description': ['تفاصيل', 'ملاحظات', 'details', 'notes', 'remarks', 'specification'],
        'unit': ['وحدة', 'وحده', 'unit', 'uom', 'الوحدة'],
        'qty': ['كمية', 'كميه', 'عدد', 'qty', 'quantity', 'count', 'الكمية'],
        'materials': ['مواد', 'material', 'سعر المواد', 'تكلفة المواد', 'mat'],
        'labor': ['عمالة', 'عماله', 'labor', 'labour', 'مصنعية', 'أجور', 'wages'],
        'equipment': ['معدات', 'equipment', 'آلات', 'machinery', 'أدوات'],
        'waste': ['هالك', 'waste', 'wastage', 'فاقد', 'نسبة الهالك'],
        'category': ['تصنيف', 'فئة', 'category', 'قسم', 'section', 'division'],
        'sbc': ['sbc', 'code', 'كود', 'رمز'],
        'rate': ['سعر', 'rate', 'price', 'إجمالي الوحدة', 'unit price', 'unit rate'],
    };

    const usedTargets = new Set<string>();

    sourceHeaders.forEach(header => {
        const headerLower = header.toLowerCase().trim();
        let bestMatch = '';
        let bestScore = 0;

        for (const [targetKey, keywords] of Object.entries(keywordMap)) {
            if (usedTargets.has(targetKey)) continue;

            for (const keyword of keywords) {
                let score = 0;

                // Exact match
                if (headerLower === keyword.toLowerCase()) {
                    score = 100;
                }
                // Contains match
                else if (headerLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(headerLower)) {
                    score = 70;
                }
                // Arabic partial match
                else if (header.includes(keyword)) {
                    score = 60;
                }

                // Boost score if column type matches target type
                const targetField = ARBA_SCHEMA_FIELDS.find(f => f.key === targetKey);
                if (targetField && columnTypes[header] === targetField.type) {
                    score += 10;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = targetKey;
                }
            }
        }

        if (bestScore >= 50 && bestMatch) {
            mappings[header] = bestMatch;
            usedTargets.add(bestMatch);
        }
    });

    return mappings;
}

// =================== Main Entry Point ===================

/**
 * Universal file parser — detects type and parses accordingly
 */
export async function parseFile(buffer: Buffer, fileName: string): Promise<ParsedFileResult> {
    const extension = fileName.toLowerCase().split('.').pop() || '';

    switch (extension) {
        case 'xlsx':
        case 'xls':
            return parseExcel(buffer, fileName);
        case 'csv':
            return parseCsv(buffer, fileName);
        case 'pdf':
            return await parsePdf(buffer, fileName);
        default:
            throw new Error(`Unsupported file type: .${extension}. Supported: .xlsx, .xls, .csv, .pdf`);
    }
}
