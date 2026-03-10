/**
 * Arba Professional PDF Export Service — v2.0 (Arabic RTL Fixed)
 * خدمة التصدير الاحترافي — مع دعم كامل للعربية و RTL
 * 
 * Uses jsPDF + jspdf-autotable + Amiri Arabic Font
 * Full Arabic text shaping, RTL layout, Hindi numerals
 * Formula: Total = [(Materials × Wastage) + Labor + Equipment] × Overheads
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { applyWatermark, WatermarkConfig } from './pdfWatermark';
import { processForRTL, formatArabicNumber } from './arabicTextShaper';
import { COMPANY_INFO } from '../companyData';

// =================== TYPES ===================

export interface PDFExportItem {
    id: string;
    displayName: string;
    category: string;
    unit: string;
    qty: number;
    finalUnitPrice: number;
    totalLinePrice: number;
    sbc?: string;
}

export interface PDFExportTotals {
    totalDirect: number;
    totalOverhead: number;
    totalProfit: number;
    finalPrice: number;
}

export interface PDFExportConfig {
    items: PDFExportItem[];
    totals: PDFExportTotals;
    projectType: string;
    plotArea: number;
    buildArea: number;
    floorsCount: number;
    location?: string;
    projectName?: string;
    clientName?: string;
    tenderNumber?: string;
    language: 'ar' | 'en';
    quoteNumber: string;
    showProfitDetails?: boolean;
    showSuppliers?: boolean;
    userId: string;
    employeeName: string;
    employeeId: string;
    brandingMode: 'arba' | 'company';
    companyInfo?: {
        name: string;
        phone: string;
        email: string;
        cr?: string;
        vat?: string;
        address?: string;
    };
}

// =================== COLORS ===================

const C = {
    primary: [5, 150, 105] as [number, number, number],
    dark: [15, 23, 42] as [number, number, number],
    text: [30, 41, 59] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    light: [241, 245, 249] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gold: [120, 53, 15] as [number, number, number],
    goldBg: [254, 243, 199] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
};

// =================== LABELS ===================

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
    site: { ar: 'أعمال الموقع', en: 'Site Work' },
    sitework: { ar: 'أعمال الموقع', en: 'Site Work' },
    structure: { ar: 'الهيكل الإنشائي', en: 'Structure' },
    finishing: { ar: 'التشطيبات', en: 'Finishing' },
    architecture: { ar: 'التشطيبات', en: 'Architecture' },
    mep: { ar: 'الأعمال الكهروميكانيكية', en: 'MEP' },
    mep_elec: { ar: 'الكهرباء', en: 'Electrical' },
    mep_plumb: { ar: 'السباكة', en: 'Plumbing' },
    external: { ar: 'الأعمال الخارجية', en: 'External' },
    general: { ar: 'عام', en: 'General' },
    custom: { ar: 'بنود مخصصة', en: 'Custom' },
};

const PROJECT_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
    villa: { ar: 'فيلا سكنية', en: 'Residential Villa' },
    building: { ar: 'عمارة سكنية', en: 'Residential Building' },
    commercial: { ar: 'مبنى تجاري', en: 'Commercial' },
    warehouse: { ar: 'مستودع', en: 'Warehouse' },
};

// =================== TAFQEET ===================

function numberToArabicWordsPDF(amount: number): string {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشر', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

    if (amount === 0) return 'صفر';
    const intPart = Math.floor(amount);
    const decPart = Math.round((amount - intPart) * 100);

    function convertGroup(n: number): string {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n >= 10 && n < 20) return teens[n - 10];
        if (n < 100) {
            const o = n % 10, t = Math.floor(n / 10);
            return o > 0 ? `${ones[o]} و${tens[t]}` : tens[t];
        }
        if (n < 1000) {
            const h = Math.floor(n / 100), rem = n % 100;
            return rem > 0 ? `${hundreds[h]} و${convertGroup(rem)}` : hundreds[h];
        }
        if (n < 1000000) {
            const th = Math.floor(n / 1000), rem = n % 1000;
            const thWord = th === 1 ? 'ألف' : th === 2 ? 'ألفان' : th <= 10 ? `${ones[th]} آلاف` : `${convertGroup(th)} ألف`;
            return rem > 0 ? `${thWord} و${convertGroup(rem)}` : thWord;
        }
        if (n < 1000000000) {
            const mil = Math.floor(n / 1000000), rem = n % 1000000;
            const milWord = mil === 1 ? 'مليون' : mil === 2 ? 'مليونان' : `${convertGroup(mil)} مليون`;
            return rem > 0 ? `${milWord} و${convertGroup(rem)}` : milWord;
        }
        return intPart.toLocaleString('ar-SA');
    }

    let result = convertGroup(intPart) + ' ريال سعودي';
    if (decPart > 0) result += ` و${convertGroup(decPart)} هللة`;
    result += ' فقط لا غير';
    return result;
}

// =================== FONT REGISTRATION ===================

async function registerAmiriFont(doc: jsPDF): Promise<void> {
    // Dynamically import the font only when PDF is being generated
    const { AMIRI_REGULAR_BASE64 } = await import('./fonts/amiriBase64');

    // Add Amiri font to jsPDF VFS
    doc.addFileToVFS('Amiri-Regular.ttf', AMIRI_REGULAR_BASE64);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
}

// =================== HELPER: Arabic text for PDF ===================

function ar(text: string, isArabic: boolean = true): string {
    if (!isArabic) return text;
    return processForRTL(text);
}

function fmtNum(n: number, decimals: number = 2, useHindi: boolean = true): string {
    const formatted = n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return useHindi ? formatArabicNumber(n, decimals) : formatted;
}

// =================== MAIN EXPORT FUNCTION ===================

export async function generatePricingPDF(config: PDFExportConfig): Promise<Blob> {
    const {
        items, totals, language, quoteNumber,
        showProfitDetails = true,
        userId, employeeName, employeeId,
        brandingMode, companyInfo,
    } = config;

    const isAr = language === 'ar';
    const t = (arText: string, enText: string) => isAr ? arText : enText;
    const tPdf = (arText: string, enText: string) => isAr ? ar(arText) : enText;
    const currency = t('ر.س', 'SAR');
    const useHindi = isAr;

    // ── Create PDF ──
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    // ── Register Arabic Font ──
    await registerAmiriFont(doc);

    const pageW = doc.internal.pageSize.getWidth();   // 210mm
    const pageH = doc.internal.pageSize.getHeight();   // 297mm
    const M = 15; // margin
    const CW = pageW - (M * 2); // content width

    let Y = M;

    // ── Helper: Set Amiri font ──
    const setAmiri = (size: number, style: 'normal' | 'bold' = 'normal') => {
        if (isAr) {
            doc.setFont('Amiri', 'normal');
        } else {
            doc.setFont('helvetica', style);
        }
        doc.setFontSize(size);
    };

    // ── Helper: Draw text with RTL support ──
    const drawText = (text: string, x: number, y: number, options?: any) => {
        const processed = isAr ? ar(text) : text;
        doc.text(processed, x, y, options);
    };

    // ── Company Data ──
    const companyName = brandingMode === 'arba'
        ? COMPANY_INFO.systemName[language]
        : (companyInfo?.name || 'Company');
    const companyTagline = brandingMode === 'arba'
        ? COMPANY_INFO.tagline[language]
        : (companyInfo?.address || '');
    const companyPhone = brandingMode === 'arba' ? COMPANY_INFO.phone : (companyInfo?.phone || '');
    const companyEmail = brandingMode === 'arba' ? COMPANY_INFO.email : (companyInfo?.email || '');
    const companyLocation = brandingMode === 'arba'
        ? COMPANY_INFO.location[language]
        : (companyInfo?.address || '');

    // ══════════════════════════════════════
    // SECTION 1: HEADER
    // ══════════════════════════════════════

    // Arba logo (green rounded square with "A")
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.roundedRect(M, Y, 14, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('A', M + 7, Y + 10.5, { align: 'center' });

    // Company name
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    setAmiri(16, 'bold');
    drawText(companyName, M + 18, Y + 6);

    // Tagline
    setAmiri(8);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    drawText(companyTagline, M + 18, Y + 11);

    // Contact line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${companyPhone}  |  ${companyEmail}  |  ${companyLocation}`, M + 18, Y + 15);

    // Quote title — right side
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.text(t('PRICE QUOTATION', 'PRICE QUOTATION'), pageW - M, Y + 4, { align: 'right' });

    setAmiri(18, 'bold');
    doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
    if (isAr) drawText('عرض سعر', pageW - M, Y + 11);

    // Quote info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    const today = new Date();
    const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dateStr = today.toLocaleDateString('en-GB');
    const validStr = validUntil.toLocaleDateString('en-GB');
    doc.text(`Quote: ${quoteNumber}`, pageW - M, Y + 16, { align: 'right' });
    doc.text(`Date: ${dateStr}  |  Valid: ${validStr}`, pageW - M, Y + 20, { align: 'right' });

    Y += 24;
    // Thick green line
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(1);
    doc.line(M, Y, pageW - M, Y);
    Y += 6;

    // ══════════════════════════════════════
    // SECTION 2: PROJECT INFO
    // ══════════════════════════════════════

    // Section title with green bar
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(pageW - M - 2, Y, 2, 5, 'F'); // Right side for RTL
    setAmiri(11, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(t('معلومات المشروع', 'Project Information'), pageW - M - 6, Y + 4);
    Y += 8;

    // Info box
    doc.setFillColor(C.light[0], C.light[1], C.light[2]);
    doc.roundedRect(M, Y, CW, 16, 2, 2, 'F');

    const projType = PROJECT_TYPE_LABELS[config.projectType]?.[language] || config.projectType;
    const infoFields = [
        { label: t('نوع المشروع', 'Project Type'), value: projType },
        { label: t('مساحة الأرض', 'Plot Area'), value: `${fmtNum(config.plotArea, 0, useHindi)} ${t('م²', 'm²')}` },
        { label: t('مساحة البناء', 'Build Area'), value: `${fmtNum(config.buildArea, 0, useHindi)} ${t('م²', 'm²')}` },
        { label: t('عدد الطوابق', 'Floors'), value: fmtNum(config.floorsCount, 0, useHindi) },
    ];

    const colW = CW / 4;
    infoFields.forEach((field, i) => {
        // RTL: right-to-left column order
        const x = isAr ? pageW - M - 4 - (i * colW) : M + 4 + (i * colW);
        const align = isAr ? 'right' : 'left';

        setAmiri(7);
        doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
        drawText(field.label, x, Y + 5);

        setAmiri(10, 'bold');
        doc.setTextColor(C.text[0], C.text[1], C.text[2]);
        drawText(field.value, x, Y + 11);
    });

    Y += 20;

    // ══════════════════════════════════════
    // SECTION 3: PRICING TABLE
    // ══════════════════════════════════════

    // Section title
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(pageW - M - 2, Y, 2, 5, 'F');
    setAmiri(11, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    const itemCount = isAr ? ar(`${items.length}`) : `${items.length}`;
    drawText(t('تفصيل التسعير', 'Pricing Breakdown'), pageW - M - 6, Y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.text(`(${items.length} ${t('بند', 'items')})`, pageW - M - 45, Y + 4);
    Y += 8;

    // Group items by category
    const grouped: Record<string, PDFExportItem[]> = {};
    items.forEach(item => {
        const cat = item.category || 'custom';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    // Table headers — RTL order for Arabic
    const tableHead = isAr ? [[
        ar('الإجمالي'),
        ar('سعر الوحدة'),
        ar('الكمية'),
        ar('الوحدة'),
        ar('وصف البند'),
        ar('م'),
    ]] : [[
        '#', 'Item Description', 'Unit', 'Qty', 'Unit Rate', 'Total',
    ]];

    // Table body
    const tableBody: any[][] = [];
    let idx = 0;

    Object.entries(grouped).forEach(([category, catItems]) => {
        const catLabel = CATEGORY_LABELS[category]?.[language] || category;
        // Category header row
        tableBody.push([{
            content: isAr ? ar(catLabel) : catLabel,
            colSpan: 6,
            styles: {
                fillColor: C.light,
                fontStyle: 'bold',
                textColor: C.text,
                fontSize: 9,
                halign: isAr ? 'right' : 'left',
                font: isAr ? 'Amiri' : 'helvetica',
            },
        }]);

        catItems.forEach(item => {
            idx++;
            const numIdx = useHindi ? formatArabicNumber(idx, 0) : String(idx);
            const desc = isAr ? ar(item.displayName) : item.displayName;
            const unit = isAr ? ar(item.unit) : item.unit;
            const qty = fmtNum(item.qty, 2, useHindi);
            const rate = fmtNum(item.finalUnitPrice, 2, useHindi);
            const total = fmtNum(item.totalLinePrice, 2, useHindi);

            if (isAr) {
                // RTL column order: Total | Rate | Qty | Unit | Desc | #
                tableBody.push([
                    { content: total, styles: { halign: 'center', fontStyle: 'bold', fontSize: 8 } },
                    { content: rate, styles: { halign: 'center', fontSize: 8 } },
                    { content: qty, styles: { halign: 'center', fontSize: 8 } },
                    { content: unit, styles: { halign: 'center', fontSize: 8, font: 'Amiri' } },
                    { content: desc, styles: { halign: 'right', fontSize: 8, font: 'Amiri' } },
                    { content: numIdx, styles: { halign: 'center', fontSize: 8 } },
                ]);
            } else {
                tableBody.push([
                    { content: numIdx, styles: { halign: 'center', fontSize: 8 } },
                    { content: desc, styles: { halign: 'left', fontSize: 8 } },
                    { content: unit, styles: { halign: 'center', fontSize: 8 } },
                    { content: qty, styles: { halign: 'center', fontSize: 8 } },
                    { content: rate, styles: { halign: 'right', fontSize: 8 } },
                    { content: total, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } },
                ]);
            }
        });
    });

    // RTL column widths
    const colStyles = isAr ? {
        0: { cellWidth: 32, halign: 'center' as const },  // Total
        1: { cellWidth: 28, halign: 'center' as const },  // Rate
        2: { cellWidth: 22, halign: 'center' as const },  // Qty
        3: { cellWidth: 18, halign: 'center' as const },  // Unit
        4: { cellWidth: 'auto' as const, halign: 'right' as const }, // Desc
        5: { cellWidth: 12, halign: 'center' as const },  // #
    } : {
        0: { cellWidth: 12, halign: 'center' as const },
        1: { cellWidth: 'auto' as const, halign: 'left' as const },
        2: { cellWidth: 18, halign: 'center' as const },
        3: { cellWidth: 22, halign: 'center' as const },
        4: { cellWidth: 28, halign: 'right' as const },
        5: { cellWidth: 32, halign: 'right' as const },
    };

    autoTable(doc, {
        startY: Y,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        margin: { left: M, right: M },
        styles: {
            font: isAr ? 'Amiri' : 'helvetica',
            fontSize: 8,
            cellPadding: 2.5,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
            textColor: C.text,
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: C.dark,
            textColor: C.white,
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center',
            font: isAr ? 'Amiri' : 'helvetica',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: colStyles,
        didDrawPage: (data: any) => {
            drawPageFooter(doc, data.pageNumber, language);
        },
    });

    Y = (doc as any).lastAutoTable.finalY + 5;

    // ══════════════════════════════════════
    // SECTION 4: TOTALS
    // ══════════════════════════════════════

    if (Y > pageH - 100) { doc.addPage(); Y = M; }

    const totX = isAr ? M : pageW - M - 80;
    const totW = 80;
    const totAlign = isAr ? 'left' as const : 'right' as const;
    const totLabelX = isAr ? M + totW : totX;
    const totValX = isAr ? M : totX + totW;

    // Direct cost
    setAmiri(9);
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(t('التكلفة المباشرة', 'Direct Cost'), totLabelX, Y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${fmtNum(totals.totalDirect, 2, useHindi)} ${currency}`, totValX, Y + 4, { align: totAlign });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(totX, Y + 6, totX + totW, Y + 6);
    Y += 9;

    if (showProfitDetails) {
        // Overhead
        setAmiri(9);
        doc.setTextColor(C.text[0], C.text[1], C.text[2]);
        drawText(t('المصاريف الإدارية', 'Overhead'), totLabelX, Y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${fmtNum(totals.totalOverhead, 2, useHindi)} ${currency}`, totValX, Y + 4, { align: totAlign });
        doc.line(totX, Y + 6, totX + totW, Y + 6);
        Y += 9;

        // Profit
        setAmiri(9);
        drawText(t('الربح', 'Profit'), totLabelX, Y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`${fmtNum(totals.totalProfit, 2, useHindi)} ${currency}`, totValX, Y + 4, { align: totAlign });
        doc.line(totX, Y + 6, totX + totW, Y + 6);
        Y += 9;
    }

    // Final total — green box
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.roundedRect(totX - 3, Y, totW + 6, 12, 2, 2, 'F');
    setAmiri(11, 'bold');
    doc.setTextColor(255, 255, 255);
    drawText(t('الإجمالي النهائي', 'FINAL TOTAL'), totLabelX, Y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${fmtNum(totals.finalPrice, 2, useHindi)} ${currency}`, totValX, Y + 8, { align: totAlign });
    Y += 18;

    // ══════════════════════════════════════
    // SECTION 5: AMOUNT IN WORDS
    // ══════════════════════════════════════

    doc.setFillColor(C.goldBg[0], C.goldBg[1], C.goldBg[2]);
    doc.setDrawColor(C.warning[0], C.warning[1], C.warning[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(M, Y, CW, 14, 2, 2, 'FD');

    setAmiri(7);
    doc.setTextColor(C.gold[0], C.gold[1], C.gold[2]);
    drawText(t('المبلغ بالحروف:', 'Amount in Words:'), isAr ? pageW - M - 4 : M + 4, Y + 4);

    setAmiri(9, 'bold');
    const amountWords = isAr
        ? numberToArabicWordsPDF(totals.finalPrice)
        : `Saudi Riyals ${fmtNum(totals.finalPrice, 2, false)} Only`;
    const processedWords = isAr ? ar(amountWords) : amountWords;
    const wordLines = doc.splitTextToSize(processedWords, CW - 10);
    doc.text(wordLines, isAr ? pageW - M - 4 : M + 4, Y + 10, { align: isAr ? 'right' : 'left' });
    Y += 18;

    // ══════════════════════════════════════
    // SECTION 6: TERMS & DISCLAIMER
    // ══════════════════════════════════════

    if (Y > pageH - 75) { doc.addPage(); Y = M; }

    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(pageW - M - 2, Y, 2, 5, 'F');
    setAmiri(10, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(t('الشروط والأحكام', 'Terms & Conditions'), pageW - M - 6, Y + 4);
    Y += 8;

    const terms = isAr ? [
        'الأسعار شاملة ضريبة القيمة المضافة (15%)',
        'العرض ساري لمدة 30 يوم من تاريخه',
        'يتم تحصيل 50% مقدم عند التعاقد والباقي حسب مراحل الإنجاز',
        'مدة التنفيذ المتوقعة حسب حجم ونوعية المشروع',
        'الضمان: سنة واحدة على الأعمال المنفذة',
        'الأسعار مبنية على أسعار السوق السعودي الحالية وقابلة للتغيير',
    ] : [
        'Prices include Value Added Tax (VAT 15%)',
        'Quotation valid for 30 days from date of issue',
        '50% advance payment upon contract, balance per milestones',
        'Estimated completion based on project scope and type',
        'Warranty: 1 year on completed works',
        'Prices based on current Saudi market rates, subject to change',
    ];

    setAmiri(7.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    terms.forEach((term, i) => {
        const numberedTerm = `${isAr ? formatArabicNumber(i + 1, 0) : i + 1}. ${term}`;
        drawText(numberedTerm, isAr ? pageW - M - 5 : M + 5, Y + 1);
        Y += 4;
    });
    Y += 2;

    // Saudi tender disclaimer
    doc.setFillColor(C.light[0], C.light[1], C.light[2]);
    doc.roundedRect(M, Y, CW, 14, 2, 2, 'F');
    setAmiri(6.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);

    const disclaimer = isAr
        ? 'إخلاء مسؤولية: هذا العرض لأغراض التسعير فقط ولا يعتبر عقداً ملزماً. جميع المواصفات الفنية مبنية على معايير كود البناء السعودي (SBC). الأسعار استرشادية وقابلة للمراجعة عند التعاقد النهائي.'
        : 'Disclaimer: This quotation is for pricing purposes only and does not constitute a binding contract. All technical specifications are based on the Saudi Building Code (SBC). Prices are indicative and subject to review upon final contract.';

    const discProcessed = isAr ? ar(disclaimer) : disclaimer;
    const discLines = doc.splitTextToSize(discProcessed, CW - 8);
    doc.text(discLines, isAr ? pageW - M - 4 : M + 4, Y + 4, { align: isAr ? 'right' : 'left' });
    Y += 18;

    // ══════════════════════════════════════
    // SECTION 7: SIGNATURES
    // ══════════════════════════════════════

    if (Y > pageH - 35) { doc.addPage(); Y = M; }

    Y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(M, Y, pageW - M, Y);
    Y += 12;

    const sigW = (CW - 30) / 2;

    // Prepared by — right side for RTL
    setAmiri(8);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    const sig1X = isAr ? pageW - M - sigW / 2 : M + sigW / 2;
    const sig2X = isAr ? M + sigW / 2 + 15 : pageW - M - sigW / 2;

    drawText(t('أعد بواسطة', 'Prepared By'), sig1X, Y);
    Y += 15;
    doc.setDrawColor(C.muted[0], C.muted[1], C.muted[2]);
    doc.line(sig1X - sigW / 2 + 10, Y, sig1X + sigW / 2 - 10, Y);
    setAmiri(8, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(companyName, sig1X, Y + 5);

    // Client signature
    Y -= 15;
    setAmiri(8);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    drawText(t('توقيع العميل', 'Client Signature'), sig2X, Y);
    Y += 15;
    doc.line(sig2X - sigW / 2 + 10, Y, sig2X + sigW / 2 - 10, Y);
    doc.text('________________', sig2X, Y + 5, { align: 'center' });

    // ══════════════════════════════════════
    // SECTION 8: METADATA (Arba-specific)
    // ══════════════════════════════════════

    doc.setProperties({
        title: 'Arba Professional Price Quotation',
        subject: `Price Quote ${quoteNumber}`,
        author: 'ARBA Pricing System',
        creator: 'ARBA Pricing - arba-sys.com',
        keywords: 'arba, pricing, quotation, construction, saudi',
    });

    // ══════════════════════════════════════
    // SECTION 9: WATERMARK
    // ══════════════════════════════════════

    const watermarkConfig: WatermarkConfig = {
        userId: userId || employeeId,
        employeeName,
        quoteNumber,
        opacity: 0.05,
        fontSize: 9,
        angle: -30,
        color: [150, 150, 150],
    };

    applyWatermark(doc, watermarkConfig);

    // ══════════════════════════════════════
    // RETURN BLOB
    // ══════════════════════════════════════

    return doc.output('blob');
}

// =================== PAGE FOOTER ===================

function drawPageFooter(doc: jsPDF, pageNumber: number, language: 'ar' | 'en') {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const fY = pageH - 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);

    doc.text(
        language === 'ar'
            ? 'Generated by ARBA Pricing System — arba-sys.com'
            : 'Generated by ARBA Pricing System — arba-sys.com',
        15, fY
    );

    doc.text(`Page ${pageNumber}`, pageW - 15, fY, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(15, fY - 3, pageW - 15, fY - 3);
}

// =================== DOWNLOAD HELPER ===================

export function downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
