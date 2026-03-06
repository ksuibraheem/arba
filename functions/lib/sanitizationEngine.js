"use strict";
/**
 * Arba Sanitization Engine — "The Purge"
 * محرك التطهير — خاص بالسيرفر فقط
 *
 * Scans imported data for Competitor Fingerprints:
 * - Company names (Arabic + English)
 * - Logos/watermark text references
 * - Proprietary headers/footers
 * - Document metadata (author, company)
 *
 * All logic is server-only. The client never sees the raw data
 * or the sanitization rules.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanForFingerprints = scanForFingerprints;
exports.executePurge = executePurge;
exports.applyWhiteLabel = applyWhiteLabel;
// =================== Competitor Fingerprint Database ===================
/**
 * 55+ RegEx patterns for detecting competitor company names
 * Covers major Saudi/Gulf/International construction and engineering companies
 * Part of Arba Security Shield 🛡️
 */
const COMPETITOR_PATTERNS = [
    // ===== Major Saudi Construction Companies (1-20) =====
    { pattern: /سعودي اوجيه|saudi\s*oger/gi, name: 'Saudi Oger', category: 'construction', severity: 'critical' },
    { pattern: /بن لادن|bin\s*laden|binladin/gi, name: 'Saudi Binladin Group', category: 'construction', severity: 'critical' },
    { pattern: /المقاولون العرب|arab\s*contractors/gi, name: 'Arab Contractors', category: 'construction', severity: 'critical' },
    { pattern: /المباني|al[\s-]*mabani/gi, name: 'Al Mabani', category: 'construction', severity: 'critical' },
    { pattern: /الراجحي للإنشاءات|rajhi\s*construct/gi, name: 'Al Rajhi Construction', category: 'construction', severity: 'critical' },
    { pattern: /شركة الحبيب|al[\s-]*habib\s*contract/gi, name: 'Al Habib Contracting', category: 'construction', severity: 'critical' },
    { pattern: /نسما|nesma/gi, name: 'Nesma', category: 'construction', severity: 'critical' },
    { pattern: /المعجل|al[\s-]*muajil|almojil|al[\s-]*mojil/gi, name: 'Al Mojil Group (MMG)', category: 'construction', severity: 'critical' },
    { pattern: /الفوزان|al[\s-]*fawzan/gi, name: 'Al Fawzan', category: 'construction', severity: 'critical' },
    { pattern: /الخرافي|kharafi/gi, name: 'Kharafi', category: 'construction', severity: 'critical' },
    { pattern: /السيف للهندسة|el[\s-]*seif|al[\s-]*seif\s*eng/gi, name: 'El Seif Engineering', category: 'construction', severity: 'critical' },
    { pattern: /التميمي|al[\s-]*tamimi\s*(contract|group)?/gi, name: 'Al Tamimi Group', category: 'construction', severity: 'critical' },
    { pattern: /دار الرياض|dar\s*al[\s-]*riyadh/gi, name: 'Dar Al Riyadh', category: 'construction', severity: 'critical' },
    { pattern: /الجبيل للإنشاءات|jubail\s*construct/gi, name: 'Jubail Construction', category: 'construction', severity: 'warning' },
    { pattern: /الكردي|al[\s-]*kurdi/gi, name: 'Al Kurdi', category: 'construction', severity: 'warning' },
    { pattern: /الفهد للمقاولات|al[\s-]*fahd\s*contract/gi, name: 'Al Fahd Contracting', category: 'construction', severity: 'warning' },
    { pattern: /شركة بناء|binaa\s*company/gi, name: 'Binaa Company', category: 'construction', severity: 'warning' },
    { pattern: /المتحدة للمقاولات|united\s*contract/gi, name: 'United Contracting', category: 'construction', severity: 'warning' },
    { pattern: /الفهد للتعمير|fahd\s*development/gi, name: 'Al Fahd Development', category: 'construction', severity: 'warning' },
    { pattern: /الرشيد للتجارة|rashid\s*trading/gi, name: 'Al Rashid Trading & Contracting', category: 'construction', severity: 'warning' },
    // ===== More Saudi Construction & Infrastructure (21-30) =====
    { pattern: /الحصان|al[\s-]*hussan/gi, name: 'Al Hussan Group', category: 'construction', severity: 'warning' },
    { pattern: /الجفالي|al[\s-]*juffali|juffali/gi, name: 'Al Juffali', category: 'construction', severity: 'critical' },
    { pattern: /العليان|al[\s-]*olayan|olayan/gi, name: 'Olayan Group', category: 'construction', severity: 'critical' },
    { pattern: /الزامل|zamil\s*(steel|construct|group|industrial)/gi, name: 'Zamil Group', category: 'construction', severity: 'critical' },
    { pattern: /سابتكو|saptco/gi, name: 'SAPTCO', category: 'construction', severity: 'warning' },
    { pattern: /الدرة|al[\s-]*durrah/gi, name: 'Al Durrah', category: 'construction', severity: 'warning' },
    { pattern: /الأهلي للمقاولات|ahli\s*contract/gi, name: 'Al Ahli Contracting', category: 'construction', severity: 'warning' },
    { pattern: /الباحر|al[\s-]*baher/gi, name: 'Al Baher', category: 'construction', severity: 'warning' },
    { pattern: /الشعلة|al[\s-]*shoula/gi, name: 'Al Shoula Group', category: 'construction', severity: 'warning' },
    { pattern: /الطاير|al[\s-]*tayer/gi, name: 'Al Tayer Group', category: 'construction', severity: 'warning' },
    // ===== Engineering & Consulting (31-38) =====
    { pattern: /دار الهندسة|dar\s*al[\s-]*handasah/gi, name: 'Dar Al Handasah', category: 'engineering', severity: 'critical' },
    { pattern: /زهير فايز|zuhair\s*fayez/gi, name: 'Zuhair Fayez Partnership', category: 'engineering', severity: 'critical' },
    { pattern: /المكتب العربي|arab\s*bureau/gi, name: 'Arab Bureau', category: 'engineering', severity: 'warning' },
    { pattern: /بيئة|beeah\s*consult/gi, name: 'Beeah', category: 'engineering', severity: 'warning' },
    { pattern: /مكتب الاستشارات|consulting\s*office/gi, name: 'Generic Consulting Office', category: 'engineering', severity: 'info' },
    { pattern: /هيل انترناشونال|hill\s*international/gi, name: 'Hill International', category: 'engineering', severity: 'critical' },
    { pattern: /اتكينز|atkins/gi, name: 'Atkins (SNC-Lavalin)', category: 'engineering', severity: 'critical' },
    { pattern: /مكتب الهندسة|jacobs\s*eng/gi, name: 'Jacobs Engineering', category: 'engineering', severity: 'warning' },
    // ===== Gulf & Regional Companies (39-46) =====
    { pattern: /عربتك|arabtec/gi, name: 'Arabtec', category: 'gulf', severity: 'critical' },
    { pattern: /دريك آند سكل|drake\s*(&|and)?\s*scull/gi, name: 'Drake & Scull', category: 'gulf', severity: 'critical' },
    { pattern: /المقاولات المتحدة|consolidated\s*contractors|CCC/gi, name: 'Consolidated Contractors (CCC)', category: 'gulf', severity: 'critical' },
    { pattern: /إعمار|emaar/gi, name: 'Emaar', category: 'gulf', severity: 'warning' },
    { pattern: /الدار|aldar\s*(properties|construct)?/gi, name: 'Aldar Properties', category: 'gulf', severity: 'warning' },
    { pattern: /أدنوك|adnoc\s*(construct|infra)?/gi, name: 'ADNOC Construction', category: 'gulf', severity: 'warning' },
    { pattern: /تروجان|trojan\s*(contract|general)/gi, name: 'Trojan General Contracting', category: 'gulf', severity: 'warning' },
    { pattern: /الغرير|al[\s-]*ghurair/gi, name: 'Al Ghurair', category: 'gulf', severity: 'warning' },
    // ===== International Companies (47-55) =====
    { pattern: /اركو|AECOM/gi, name: 'AECOM', category: 'international', severity: 'critical' },
    { pattern: /بكتل|bechtel/gi, name: 'Bechtel', category: 'international', severity: 'critical' },
    { pattern: /فلور|fluor\s*corp/gi, name: 'Fluor', category: 'international', severity: 'critical' },
    { pattern: /سيمنز|siemens/gi, name: 'Siemens', category: 'international', severity: 'warning' },
    { pattern: /تشاينا ستيت|china\s*state\s*construct/gi, name: 'China State Construction', category: 'international', severity: 'critical' },
    { pattern: /سامسونج سي آند تي|samsung\s*c\s*(&|and)?\s*t/gi, name: 'Samsung C&T', category: 'international', severity: 'critical' },
    { pattern: /هيونداي|hyundai\s*(e&c|engineering|construct)/gi, name: 'Hyundai E&C', category: 'international', severity: 'critical' },
    { pattern: /سايبم|saipem/gi, name: 'Saipem', category: 'international', severity: 'critical' },
    { pattern: /بتروفاك|petrofac/gi, name: 'Petrofac', category: 'international', severity: 'critical' },
    // ===== Generic Company Indicators (56-62) =====
    { pattern: /شركة\s+[\u0600-\u06FF]+\s+(للمقاولات|للإنشاءات|للبناء|للتشييد)/g, name: 'Generic Arabic Contractor', category: 'generic', severity: 'warning' },
    { pattern: /مؤسسة\s+[\u0600-\u06FF]+\s+(للمقاولات|للإنشاءات|التجارية)/g, name: 'Generic Arabic Institution', category: 'generic', severity: 'warning' },
    { pattern: /مجموعة\s+[\u0600-\u06FF]+/g, name: 'Generic Arabic Group', category: 'generic', severity: 'info' },
    { pattern: /\b[A-Z][\w]*\s+(Construction|Contracting|Engineering|Building)\s+(Co|Corp|LLC|Ltd|Inc|Company)/gi, name: 'Generic English Contractor', category: 'generic', severity: 'warning' },
    { pattern: /\b[A-Z][\w]*\s+Group\s+(for|of)\s+(Construction|Contracting|Engineering)/gi, name: 'Generic English Group', category: 'generic', severity: 'warning' },
    { pattern: /\b\w+\s+(MEP|HVAC|civil|structural)\s+(contractor|engineer)/gi, name: 'Generic MEP/Civil Contractor', category: 'generic', severity: 'info' },
    { pattern: /مقاول\s*عام|general\s*contractor/gi, name: 'Generic General Contractor', category: 'generic', severity: 'info' },
];
/**
 * Patterns for detecting proprietary headers/footers
 */
const HEADER_FOOTER_PATTERNS = [
    // Letterhead indicators
    /تلفون|تليفون|هاتف|phone|tel|fax|فاكس/gi,
    /ص\.?\s*ب|p\.?\s*o\.?\s*box/gi,
    /الرمز البريدي|zip\s*code|postal/gi,
    /سجل تجاري|commercial\s*reg|c\.?\s*r\.?\s*#?/gi,
    /رقم ضريبي|vat\s*#?|tax\s*id/gi,
    /www\.|http|\.com|\.sa|\.net/gi,
    /info@|sales@|contact@|admin@/gi,
    // Watermark/branding
    /confidential|سري|proprietary|خاص/gi,
    /prepared\s+by|إعداد/gi,
    /©|copyright|حقوق/gi,
    /all\s+rights\s+reserved|جميع الحقوق محفوظة/gi,
    /trademark|™|®|علامة تجارية/gi,
    // Logo text references
    /logo|شعار|logotype/gi,
    // Document identifiers
    /doc\s*#|document\s*number|رقم الوثيقة/gi,
    /revision|مراجعة|rev\.\s*\d/gi,
    /project\s*#|مشروع\s*رقم/gi,
    /internal\s*use|للاستخدام\s*الداخلي/gi,
    /draft|مسودة/gi,
];
/**
 * Metadata fields that may contain competitor info
 */
const SENSITIVE_METADATA_KEYS = ['author', 'company', 'title', 'subject', 'comments'];
// =================== Scanning Functions ===================
/**
 * Scan all imported data for Competitor Fingerprints
 * Returns a Pre-Flight Security Alert report
 */
function scanForFingerprints(sheets, metadata) {
    const matches = [];
    const metadataFlags = [];
    const headerFlags = [];
    // 1. Scan metadata
    for (const key of SENSITIVE_METADATA_KEYS) {
        const value = metadata[key];
        if (!value)
            continue;
        for (const cp of COMPETITOR_PATTERNS) {
            const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
            if (regex.test(value)) {
                metadataFlags.push(`Metadata "${key}": ${value} → detected "${cp.name}"`);
                matches.push({
                    pattern: cp.name,
                    matchedText: value,
                    location: { row: -1, col: -1, field: 'metadata' },
                    severity: cp.severity,
                    companyCategory: cp.category,
                });
            }
        }
    }
    // 2. Scan each sheet
    for (const sheet of sheets) {
        // Scan headers
        sheet.headers.forEach((header, colIdx) => {
            for (const cp of COMPETITOR_PATTERNS) {
                const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
                if (regex.test(header)) {
                    headerFlags.push(`Header "${header}" in sheet "${sheet.name}" → "${cp.name}"`);
                    matches.push({
                        pattern: cp.name,
                        matchedText: header,
                        location: { sheet: sheet.name, row: 0, col: colIdx, field: 'header' },
                        severity: cp.severity,
                        companyCategory: cp.category,
                    });
                }
            }
            // Check header/footer patterns
            for (const hfp of HEADER_FOOTER_PATTERNS) {
                const regex = new RegExp(hfp.source, hfp.flags);
                if (regex.test(header)) {
                    headerFlags.push(`Proprietary header detected: "${header}" in sheet "${sheet.name}"`);
                }
            }
        });
        // Scan rows
        sheet.rows.forEach((row, rowIdx) => {
            (row || []).forEach((cell, colIdx) => {
                if (cell == null)
                    return;
                const cellStr = String(cell);
                if (cellStr.trim().length === 0)
                    return;
                for (const cp of COMPETITOR_PATTERNS) {
                    const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
                    if (regex.test(cellStr)) {
                        matches.push({
                            pattern: cp.name,
                            matchedText: cellStr.substring(0, 100), // Truncate for safety
                            location: { sheet: sheet.name, row: rowIdx + 1, col: colIdx, field: 'cell' },
                            severity: cp.severity,
                            companyCategory: cp.category,
                        });
                    }
                }
            });
        });
    }
    const criticalCount = matches.filter(m => m.severity === 'critical').length;
    const warningCount = matches.filter(m => m.severity === 'warning').length;
    const infoCount = matches.filter(m => m.severity === 'info').length;
    // Determine security alert level
    const securityAlertLevel = criticalCount > 0 ? 'BLOCKED' :
        warningCount > 0 ? 'WARNING' : 'CLEAN';
    return {
        totalMatches: matches.length,
        criticalCount,
        warningCount,
        infoCount,
        matches,
        metadataFlags,
        headerFlags,
        isClean: matches.length === 0,
        securityAlertLevel,
    };
}
// =================== The Purge ===================
/**
 * Execute "The Purge" — strip all external branding and apply Arba identity
 */
function executePurge(sheets, metadata, _confirmedMatches) {
    const removedItems = [];
    // 1. Sanitize metadata — strip all sensitive fields
    const sanitizedMetadata = {
        author: 'Arba Pricing System',
        company: 'Arba Pricing',
        title: 'Imported Data — Arba Pricing',
        subject: undefined,
        created: undefined,
        modified: new Date().toISOString(),
        comments: undefined,
    };
    // Track what was removed from metadata
    for (const key of SENSITIVE_METADATA_KEYS) {
        if (metadata[key]) {
            removedItems.push(`Metadata [${key}]: "${metadata[key]}" → stripped`);
        }
    }
    // 2. Sanitize sheets
    const sanitizedSheets = sheets.map(sheet => {
        // Sanitize headers
        const cleanHeaders = sheet.headers.map(header => {
            let cleaned = header;
            for (const cp of COMPETITOR_PATTERNS) {
                const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
                if (regex.test(cleaned)) {
                    removedItems.push(`Header "${header}" → cleaned`);
                    cleaned = cleaned.replace(new RegExp(cp.pattern.source, cp.pattern.flags), '').trim();
                }
            }
            return cleaned || header;
        });
        // Filter out header/footer rows (rows that look like letterhead)
        const cleanRows = sheet.rows.filter((row, rowIdx) => {
            const rowText = (row || []).map(c => String(c || '')).join(' ');
            // Check if this row is a header/footer row
            let headerPatternCount = 0;
            for (const hfp of HEADER_FOOTER_PATTERNS) {
                const regex = new RegExp(hfp.source, hfp.flags);
                if (regex.test(rowText)) {
                    headerPatternCount++;
                }
            }
            // If 2+ header patterns match, this is likely a letterhead row
            if (headerPatternCount >= 2) {
                removedItems.push(`Row ${rowIdx + 1}: Proprietary header/footer removed`);
                return false;
            }
            return true;
        });
        // Sanitize cell content
        const sanitizedRows = cleanRows.map(row => {
            return (row || []).map(cell => {
                if (cell == null)
                    return cell;
                let cellStr = String(cell);
                for (const cp of COMPETITOR_PATTERNS) {
                    const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
                    if (regex.test(cellStr)) {
                        removedItems.push(`Cell: "${cellStr.substring(0, 50)}" → competitor name stripped`);
                        cellStr = cellStr.replace(new RegExp(cp.pattern.source, cp.pattern.flags), '').trim();
                    }
                }
                return isNaN(Number(cell)) ? cellStr : cell;
            });
        });
        return {
            name: sheet.name,
            headers: cleanHeaders,
            rows: sanitizedRows,
            rowCount: sanitizedRows.length,
        };
    });
    return {
        sanitizedSheets,
        sanitizedMetadata,
        removedItems,
        arbaStamped: true,
        customPropertiesStripped: removedItems.filter(r => r.includes('Metadata')).length,
        imagesStripped: 0, // OCR-detected images stripped count set by caller
    };
}
/**
 * Apply "Arba Pricing" white-label branding to output data
 * Part of Arba Security Shield 🛡️
 *
 * Strips ALL traces of original source:
 * - Renames all sheet names to Arba-branded names
 * - Ensures no original file naming remains
 */
function applyWhiteLabel(sheets) {
    return sheets.map((sheet, index) => ({
        ...sheet,
        name: index === 0
            ? 'Arba Pricing Data'
            : `Arba Import ${index + 1}`,
    }));
}
//# sourceMappingURL=sanitizationEngine.js.map