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
    architecture: { ar: 'الأعمال المعمارية', en: 'Architecture' },
    mep: { ar: 'الأعمال الكهروميكانيكية', en: 'MEP' },
    mep_elec: { ar: 'الأعمال الكهربائية', en: 'Electrical' },
    mep_plumb: { ar: 'أعمال السباكة', en: 'Plumbing' },
    mep_hvac: { ar: 'أعمال التكييف والتبريد', en: 'HVAC' },
    insulation: { ar: 'أعمال العزل', en: 'Insulation' },
    safety: { ar: 'السلامة والحماية', en: 'Safety & Protection' },
    gov_fees: { ar: 'الرسوم الحكومية', en: 'Government Fees' },
    production: { ar: 'خطوط الإنتاج', en: 'Production Lines' },
    manpower: { ar: 'الأيدي العاملة', en: 'Manpower' },
    landscaping: { ar: 'أعمال التنسيق والحدائق', en: 'Landscaping' },
    furniture: { ar: 'الأثاث والمفروشات', en: 'Furniture & Furnishings' },
    elevator: { ar: 'المصاعد والسلالم المتحركة', en: 'Elevators & Escalators' },
    fire_protection: { ar: 'أنظمة إطفاء الحريق', en: 'Fire Protection Systems' },
    smart_systems: { ar: 'الأنظمة الذكية', en: 'Smart Systems' },
    renewable_energy: { ar: 'الطاقة المتجددة', en: 'Renewable Energy' },
    demolition: { ar: 'أعمال الهدم والإزالة', en: 'Demolition' },
    temporary_works: { ar: 'أعمال مؤقتة', en: 'Temporary Works' },
    testing: { ar: 'الفحوصات والاختبارات', en: 'Testing & QC' },
    external_works: { ar: 'الأعمال الخارجية', en: 'External Works' },
    external: { ar: 'الأعمال الخارجية', en: 'External' },
    general: { ar: 'عام', en: 'General' },
    custom: { ar: 'بنود مخصصة', en: 'Custom Items' },
};

const PROJECT_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
    villa: { ar: 'فيلا سكنية', en: 'Residential Villa' },
    tower: { ar: 'برج / مركز تجاري', en: 'Tower / Commercial Center' },
    rest_house: { ar: 'استراحة / شاليه', en: 'Rest House / Chalet' },
    factory: { ar: 'مصنع', en: 'Factory' },
    school: { ar: 'مدرسة / معهد', en: 'School / Institute' },
    hospital: { ar: 'مستشفى / مركز طبي', en: 'Hospital / Medical Center' },
    mosque: { ar: 'مسجد / جامع', en: 'Mosque' },
    hotel: { ar: 'فندق / نُزُل', en: 'Hotel / Inn' },
    residential_building: { ar: 'عمارة سكنية', en: 'Residential Building' },
    sports_complex: { ar: 'مجمع رياضي / ملعب', en: 'Sports Complex' },
    farm: { ar: 'مزرعة / منشأة زراعية', en: 'Farm / Agricultural' },
    gas_station: { ar: 'محطة وقود', en: 'Gas Station' },
    mall: { ar: 'مركز تسوق / مول', en: 'Shopping Mall' },
    restaurant: { ar: 'مطعم / كافيه', en: 'Restaurant / Café' },
    car_wash: { ar: 'مغسلة سيارات', en: 'Car Wash' },
    warehouse: { ar: 'مستودع', en: 'Warehouse' },
    government: { ar: 'مبنى حكومي', en: 'Government Building' },
    clinic: { ar: 'عيادة / مركز طبي', en: 'Clinic / Medical Center' },
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

    // Register the same font as 'bold' variant too —
    // jspdf-autotable requires a bold lookup when fontStyle:'bold' is used in table cells.
    // Without this, autotable crashes with "Unable to look up font label for font 'Amiri', 'bold'"
    doc.addFileToVFS('Amiri-Bold.ttf', AMIRI_REGULAR_BASE64);
    doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');
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

    const today = new Date();
    const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const dateStr = today.toLocaleDateString('en-GB');
    const validStr = validUntil.toLocaleDateString('en-GB');
    const projType = PROJECT_TYPE_LABELS[config.projectType]?.[language] || config.projectType;

    // ══════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════

    // Background gradient
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Accent bar top
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, 0, pageW, 4, 'F');

    // Logo
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.roundedRect(pageW / 2 - 15, 50, 30, 30, 6, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(44);
    doc.text('A', pageW / 2, 72, { align: 'center' });

    // Company name
    setAmiri(24, 'bold');
    doc.setTextColor(255, 255, 255);
    drawText(companyName, pageW / 2, 100);

    // Tagline
    setAmiri(11);
    doc.setTextColor(148, 163, 184);
    drawText(companyTagline, pageW / 2, 110);

    // Divider line
    doc.setDrawColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.setLineWidth(0.5);
    doc.line(pageW / 2 - 30, 120, pageW / 2 + 30, 120);

    // "PRICE QUOTATION" title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.text('PRICE QUOTATION', pageW / 2, 135, { align: 'center' });

    if (isAr) {
        setAmiri(22, 'bold');
        doc.setTextColor(255, 255, 255);
        drawText('عرض سعر', pageW / 2, 148);
    }

    // Project info box
    const boxY = 165;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(M + 15, boxY, CW - 30, 60, 4, 4, 'F');

    const infoItems = [
        { label: t('نوع المشروع', 'Project Type'), value: projType },
        { label: t('رقم العرض', 'Quote Number'), value: quoteNumber },
        { label: t('التاريخ', 'Date'), value: dateStr },
        { label: t('الصلاحية', 'Valid Until'), value: validStr },
    ];

    infoItems.forEach((info, i) => {
        const iy = boxY + 12 + (i * 12);
        setAmiri(8);
        doc.setTextColor(148, 163, 184);
        drawText(info.label, pageW / 2 + 25, iy);
        setAmiri(10, 'bold');
        doc.setTextColor(226, 232, 240);
        drawText(info.value, pageW / 2 - 25, iy);
    });

    // Client info
    if (config.clientName) {
        setAmiri(9);
        doc.setTextColor(148, 163, 184);
        drawText(t('العميل', 'Client'), pageW / 2, boxY + 62);
        setAmiri(12, 'bold');
        doc.setTextColor(255, 255, 255);
        drawText(config.clientName, pageW / 2, boxY + 72);
    }

    // Footer on cover
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${companyPhone}  |  ${companyEmail}`, pageW / 2, pageH - 15, { align: 'center' });

    // Accent bar bottom
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(0, pageH - 4, pageW, 4, 'F');

    // ══════════════════════════════════════
    // PAGE 2: EXECUTIVE SUMMARY
    // ══════════════════════════════════════
    doc.addPage();
    Y = M;

    // Section title
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(pageW - M - 2, Y, 2, 5, 'F');
    setAmiri(13, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(t('الملخص التنفيذي', 'Executive Summary'), pageW - M - 6, Y + 4);
    Y += 12;

    // Key Metrics Grid (3x2)
    const metricBoxW = (CW - 10) / 3;
    const metricBoxH = 22;
    const metrics = [
        { label: t('التكلفة المباشرة', 'Direct Cost'), value: fmtNum(totals.totalDirect, 0, useHindi), color: C.primary },
        { label: t('المصاريف الثابتة', 'Overhead'), value: fmtNum(totals.totalOverhead, 0, useHindi), color: C.warning },
        { label: t('الربح', 'Profit'), value: fmtNum(totals.totalProfit, 0, useHindi), color: [16, 185, 129] as [number, number, number] },
        { label: t('الإجمالي النهائي', 'Final Total'), value: fmtNum(totals.finalPrice, 0, useHindi), color: C.dark },
        { label: t('سعر م²', 'Price/m²'), value: config.buildArea > 0 ? fmtNum(totals.finalPrice / config.buildArea, 0, useHindi) : '—', color: [124, 58, 237] as [number, number, number] },
        { label: t('عدد البنود', 'Items'), value: String(items.length), color: C.muted },
    ];

    metrics.forEach((metric, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const mx = M + col * (metricBoxW + 5);
        const my = Y + row * (metricBoxH + 4);

        doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
        doc.roundedRect(mx, my, metricBoxW, metricBoxH, 2, 2, 'F');

        setAmiri(7);
        doc.setTextColor(255, 255, 255);
        drawText(metric.label, mx + metricBoxW / 2, my + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`${metric.value} ${currency}`, mx + metricBoxW / 2, my + 17, { align: 'center' });
    });

    Y += (metricBoxH + 4) * 2 + 10;

    // Donut Chart — drawn with jsPDF arcs
    const donutCx = M + 40;
    const donutCy = Y + 40;
    const donutR = 28;
    const donutInner = 16;

    const donutData = [
        { label: t('المواد', 'Materials'), value: totals.totalDirect - (totals.totalDirect * 0.35), color: [6, 182, 212] },
        { label: t('العمالة', 'Labor'), value: totals.totalDirect * 0.35, color: [236, 72, 153] },
        { label: t('المصاريف', 'Overhead'), value: totals.totalOverhead, color: [245, 158, 11] },
        { label: t('الربح', 'Profit'), value: totals.totalProfit, color: [16, 185, 129] },
    ].filter(d => d.value > 0);

    const donutTotal = donutData.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;

    donutData.forEach(seg => {
        const sweep = (seg.value / donutTotal) * 2 * Math.PI;
        const endAngle = startAngle + sweep;

        // Draw arc segment as a filled path
        doc.setFillColor(seg.color[0], seg.color[1], seg.color[2]);
        const steps = 20;
        const points: number[][] = [];

        // Outer arc
        for (let s = 0; s <= steps; s++) {
            const a = startAngle + (sweep * s / steps);
            points.push([donutCx + donutR * Math.cos(a), donutCy + donutR * Math.sin(a)]);
        }
        // Inner arc (reverse)
        for (let s = steps; s >= 0; s--) {
            const a = startAngle + (sweep * s / steps);
            points.push([donutCx + donutInner * Math.cos(a), donutCy + donutInner * Math.sin(a)]);
        }

        // Draw as polygon
        if (points.length > 2) {
            const lines: number[][] = points.slice(1);
            doc.setLineWidth(0);
            (doc as any).triangle(
                points[0][0], points[0][1],
                points[1][0], points[1][1],
                points[2][0], points[2][1], 'F'
            );
            // Draw remaining triangles from first point
            for (let p = 2; p < points.length - 1; p++) {
                (doc as any).triangle(
                    points[0][0], points[0][1],
                    points[p][0], points[p][1],
                    points[p + 1][0], points[p + 1][1], 'F'
                );
            }
        }

        startAngle = endAngle;
    });

    // White center circle
    doc.setFillColor(255, 255, 255);
    doc.circle(donutCx, donutCy, donutInner - 1, 'F');

    // Center text
    setAmiri(7);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);
    drawText(t('التوزيع', 'Breakdown'), donutCx, donutCy - 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    doc.text('100%', donutCx, donutCy + 4, { align: 'center' });

    // Donut legend
    let legendY = Y + 15;
    donutData.forEach(seg => {
        const pct = Math.round((seg.value / donutTotal) * 100);
        doc.setFillColor(seg.color[0], seg.color[1], seg.color[2]);
        doc.roundedRect(M + 80, legendY, 4, 4, 1, 1, 'F');
        setAmiri(8);
        doc.setTextColor(C.text[0], C.text[1], C.text[2]);
        drawText(`${seg.label}: ${pct}%`, M + 87, legendY + 3);
        legendY += 8;
    });

    Y += 85;

    // Section Cost Summary Table
    doc.setFillColor(C.primary[0], C.primary[1], C.primary[2]);
    doc.rect(pageW - M - 2, Y, 2, 5, 'F');
    setAmiri(11, 'bold');
    doc.setTextColor(C.text[0], C.text[1], C.text[2]);
    drawText(t('ملخص الأقسام الهندسية', 'Section Cost Summary'), pageW - M - 6, Y + 4);
    Y += 8;

    // Group items by section for summary
    const sectionSummary: Record<string, { name: string; count: number; total: number }> = {};
    items.forEach(item => {
        const secCode = item.id?.substring(0, 2) || '00';
        const catLabel = CATEGORY_LABELS[item.category]?.[language] || item.category;
        if (!sectionSummary[secCode]) {
            sectionSummary[secCode] = { name: catLabel, count: 0, total: 0 };
        }
        sectionSummary[secCode].count++;
        sectionSummary[secCode].total += item.totalLinePrice;
    });

    const sectionHead = isAr ? [[
        ar('النسبة'), ar('الإجمالي'), ar('البنود'), ar('القسم'),
    ]] : [['Section', 'Items', 'Total', '%']];

    const sectionBody: any[][] = [];
    Object.entries(sectionSummary)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([, sec]) => {
            const pct = totals.finalPrice > 0 ? ((sec.total / totals.finalPrice) * 100).toFixed(1) : '0';
            if (isAr) {
                sectionBody.push([
                    `${pct}%`,
                    fmtNum(sec.total, 0, useHindi),
                    String(sec.count),
                    ar(sec.name),
                ]);
            } else {
                sectionBody.push([
                    sec.name,
                    String(sec.count),
                    fmtNum(sec.total, 0, false),
                    `${pct}%`,
                ]);
            }
        });

    autoTable(doc, {
        startY: Y,
        head: sectionHead,
        body: sectionBody,
        theme: 'striped',
        margin: { left: M, right: M },
        styles: {
            font: isAr ? 'Amiri' : 'helvetica',
            fontSize: 8,
            cellPadding: 2,
            textColor: C.text,
        },
        headStyles: {
            fillColor: C.primary,
            textColor: C.white,
            fontStyle: 'bold',
            halign: 'center',
            font: isAr ? 'Amiri' : 'helvetica',
        },
    });

    // ══════════════════════════════════════
    // PAGE 3+: PRICING DETAILS
    // ══════════════════════════════════════
    doc.addPage();
    Y = M;

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

    const projType2 = PROJECT_TYPE_LABELS[config.projectType]?.[language] || config.projectType;
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

    // Dynamic terms based on project type
    const baseTermsAr = [
        'الأسعار شاملة ضريبة القيمة المضافة (15%)',
        'العرض ساري لمدة 30 يوم من تاريخه',
        'يتم تحصيل 50% مقدم عند التعاقد والباقي حسب مراحل الإنجاز',
        'مدة التنفيذ المتوقعة حسب حجم ونوعية المشروع',
        'الأسعار مبنية على أسعار السوق السعودي الحالية وقابلة للتغيير',
        'جميع المواصفات مطابقة لكود البناء السعودي (SBC)',
        'الاستثناءات: لا يشمل العرض أعمال التأثيث والأجهزة الكهربائية المنزلية',
    ];
    const baseTermsEn = [
        'Prices include Value Added Tax (VAT 15%)',
        'Quotation valid for 30 days from date of issue',
        '50% advance payment upon contract, balance per milestones',
        'Estimated completion based on project scope and type',
        'Prices based on current Saudi market rates, subject to change',
        'All specifications comply with Saudi Building Code (SBC)',
        'Exclusions: Furniture and household appliances are not included',
    ];

    // Project-type-specific terms
    const projectTerms: Record<string, { ar: string; en: string }[]> = {
        villa: [
            { ar: 'ضمان الهيكل الإنشائي: 10 سنوات', en: 'Structural warranty: 10 years' },
            { ar: 'ضمان التشطيبات: 5 سنوات', en: 'Finishing warranty: 5 years' },
        ],
        hospital: [
            { ar: 'الالتزام بمعايير SBC 801 للمنشآت الصحية', en: 'Compliance with SBC 801 healthcare standards' },
            { ar: 'أنظمة إطفاء حريق مطابقة لمعايير NFPA', en: 'Fire suppression systems per NFPA standards' },
            { ar: 'ضمان الهيكل: 15 سنة | التشطيبات: 7 سنوات', en: 'Structure: 15yr | Finishing: 7yr warranty' },
        ],
        mosque: [
            { ar: 'الالتزام بمعايير وزارة الشؤون الإسلامية', en: 'Ministry of Islamic Affairs compliance' },
            { ar: 'ضمان شامل: 10 سنوات', en: 'Comprehensive warranty: 10 years' },
        ],
        school: [
            { ar: 'الالتزام بمعايير وزارة التعليم للمنشآت التعليمية', en: 'MOE educational facility standards' },
            { ar: 'ضمان الهيكل: 10 سنوات', en: 'Structural warranty: 10 years' },
        ],
    };

    const extraTerms = projectTerms[config.projectType] || [
        { ar: 'الضمان: سنة واحدة على الأعمال المنفذة', en: 'Warranty: 1 year on completed works' },
    ];

    const terms = isAr
        ? [...baseTermsAr, ...extraTerms.map(t => t.ar)]
        : [...baseTermsEn, ...extraTerms.map(t => t.en)];

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
    // SECTION 10: PAGE NUMBERING (X of Y)
    // ══════════════════════════════════════

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        drawPageFooter(doc, p, totalPages, language, quoteNumber);
    }

    // ══════════════════════════════════════
    // RETURN BLOB
    // ══════════════════════════════════════

    return doc.output('blob');
}

// =================== PAGE FOOTER ===================

function drawPageFooter(doc: jsPDF, pageNumber: number, totalPages: number, language: 'ar' | 'en', quoteNumber?: string) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const fY = pageH - 8;

    // Skip footer on cover page (page 1)
    if (pageNumber === 1) return;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(15, fY - 3, pageW - 15, fY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(C.muted[0], C.muted[1], C.muted[2]);

    // Left: system credit
    doc.text('Generated by ARBA Pricing System — arba-sys.com', 15, fY);

    // Center: quote number
    if (quoteNumber) {
        doc.text(quoteNumber, pageW / 2, fY, { align: 'center' });
    }

    // Right: Page X of Y
    doc.text(
        language === 'ar'
            ? `${pageNumber} / ${totalPages}`
            : `Page ${pageNumber} of ${totalPages}`,
        pageW - 15, fY, { align: 'right' }
    );
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
