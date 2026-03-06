/**
 * Arba OCR Engine — Visual De-branding Module
 * محرك التعرف البصري — كشف الشعارات والعلامات المائية
 * 
 * Part of Arba Security Shield 🛡️
 * 
 * Extracts embedded images from Excel/PDF files, runs OCR,
 * and detects competitor logos, watermarks, and branding.
 * 
 * ALL logic is server-only. The client never sees images or OCR data.
 */

import Tesseract from 'tesseract.js';

// =================== Types ===================

export interface OcrDetection {
    imageIndex: number;
    detectedText: string;
    matchedCompany: string;
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
    type: 'logo' | 'watermark' | 'text_branding';
}

export interface OcrScanReport {
    totalImages: number;
    scannedImages: number;
    detections: OcrDetection[];
    hasVisualBranding: boolean;
    processingTimeMs: number;
}

// =================== Competitor Logo Patterns ===================

/**
 * Text patterns that indicate competitor branding in images
 * These are matched against OCR-extracted text
 */
const VISUAL_BRANDING_PATTERNS: { pattern: RegExp; company: string; severity: 'critical' | 'warning' | 'info' }[] = [
    // Major Saudi firms
    { pattern: /saudi\s*oger|سعودي\s*اوجيه/gi, company: 'Saudi Oger', severity: 'critical' },
    { pattern: /bin\s*laden|بن\s*لادن|binladin/gi, company: 'Saudi Binladin Group', severity: 'critical' },
    { pattern: /arab\s*contractors|المقاولون\s*العرب/gi, company: 'Arab Contractors', severity: 'critical' },
    { pattern: /nesma|نسما/gi, company: 'Nesma', severity: 'critical' },
    { pattern: /al[\s-]*mabani|المباني/gi, company: 'Al Mabani', severity: 'critical' },
    { pattern: /el[\s-]*seif|السيف/gi, company: 'El Seif Engineering', severity: 'critical' },
    { pattern: /dar\s*al[\s-]*handasah|دار\s*الهندسة/gi, company: 'Dar Al Handasah', severity: 'critical' },
    { pattern: /al[\s-]*rajhi|الراجحي/gi, company: 'Al Rajhi Construction', severity: 'critical' },
    { pattern: /al[\s-]*fawzan|الفوزان/gi, company: 'Al Fawzan', severity: 'critical' },
    { pattern: /kharafi|الخرافي/gi, company: 'Kharafi', severity: 'critical' },

    // International
    { pattern: /AECOM|اركو/gi, company: 'AECOM', severity: 'critical' },
    { pattern: /bechtel|بكتل/gi, company: 'Bechtel', severity: 'critical' },
    { pattern: /fluor|فلور/gi, company: 'Fluor', severity: 'critical' },
    { pattern: /siemens|سيمنز/gi, company: 'Siemens', severity: 'warning' },
    { pattern: /petrofac|بتروفاك/gi, company: 'Petrofac', severity: 'critical' },
    { pattern: /saipem|سايبم/gi, company: 'Saipem', severity: 'critical' },

    // Gulf
    { pattern: /arabtec|عربتك/gi, company: 'Arabtec', severity: 'critical' },
    { pattern: /drake.*scull|دريك/gi, company: 'Drake & Scull', severity: 'critical' },
    { pattern: /emaar|إعمار/gi, company: 'Emaar', severity: 'warning' },

    // Generic branding indicators
    { pattern: /confidential|سري للغاية/gi, company: 'Confidential Watermark', severity: 'warning' },
    { pattern: /proprietary|ملكية\s*خاصة/gi, company: 'Proprietary Watermark', severity: 'warning' },
    { pattern: /all\s*rights\s*reserved|جميع\s*الحقوق/gi, company: 'Copyright Notice', severity: 'info' },
    { pattern: /©|®|™/g, company: 'Trademark Symbol', severity: 'info' },
];

// =================== Image Extraction ===================

/**
 * Extract embedded images from an Excel workbook buffer
 * Uses the XLSX library's internal media storage
 */
export function extractImagesFromExcel(workbook: any): Buffer[] {
    const images: Buffer[] = [];

    try {
        // XLSX stores media in the workbook's _media or _rels
        if (workbook.Sheets) {
            for (const sheetName of Object.keys(workbook.Sheets)) {
                const sheet = workbook.Sheets[sheetName];
                // Check for embedded objects/images in the sheet
                if (sheet['!images']) {
                    for (const img of sheet['!images']) {
                        if (img.data && Buffer.isBuffer(img.data)) {
                            images.push(img.data);
                        }
                    }
                }
            }
        }

        // Also check workbook-level media
        if ((workbook as any)._media) {
            for (const media of (workbook as any)._media) {
                if (media.data && Buffer.isBuffer(media.data)) {
                    images.push(media.data);
                }
            }
        }
    } catch (error) {
        console.warn('OCR: Could not extract images from workbook:', error);
    }

    return images;
}

// =================== OCR Scanning ===================

/**
 * Scan a single image buffer for competitor branding using OCR
 */
async function scanSingleImage(
    imageBuffer: Buffer,
    imageIndex: number
): Promise<OcrDetection[]> {
    const detections: OcrDetection[] = [];

    try {
        // Run OCR with Tesseract - support both Arabic and English
        const result = await Tesseract.recognize(imageBuffer, 'eng+ara', {
            logger: () => { }, // Suppress verbose logging
        });

        const extractedText = result.data.text;
        if (!extractedText || extractedText.trim().length < 3) {
            return detections;
        }

        // Match extracted text against branding patterns
        for (const bp of VISUAL_BRANDING_PATTERNS) {
            const regex = new RegExp(bp.pattern.source, bp.pattern.flags);
            const match = regex.exec(extractedText);
            if (match) {
                detections.push({
                    imageIndex,
                    detectedText: match[0].substring(0, 50),
                    matchedCompany: bp.company,
                    confidence: result.data.confidence / 100,
                    severity: bp.severity,
                    type: bp.company.includes('Watermark') || bp.company.includes('Copyright')
                        ? 'watermark'
                        : bp.company.includes('Symbol')
                            ? 'text_branding'
                            : 'logo',
                });
            }
        }
    } catch (error) {
        console.warn(`OCR: Failed to scan image ${imageIndex}:`, error);
    }

    return detections;
}

// =================== Main OCR Engine ===================

/**
 * Scan all extracted images for visual branding
 * Returns an OcrScanReport with detected logos and watermarks
 * 
 * Max 10 images scanned to avoid excessive processing time
 */
export async function scanImagesForBranding(
    images: Buffer[]
): Promise<OcrScanReport> {
    const startTime = Date.now();
    const detections: OcrDetection[] = [];

    // Limit to 10 images to keep processing time reasonable
    const imagesToScan = images.slice(0, 10);

    for (let i = 0; i < imagesToScan.length; i++) {
        const imageDetections = await scanSingleImage(imagesToScan[i], i);
        detections.push(...imageDetections);
    }

    return {
        totalImages: images.length,
        scannedImages: imagesToScan.length,
        detections,
        hasVisualBranding: detections.length > 0,
        processingTimeMs: Date.now() - startTime,
    };
}

/**
 * Quick check if an image likely contains text (by size heuristic)
 * Images smaller than 1KB are unlikely to contain meaningful text
 * Images larger than 5MB are skipped for performance
 */
export function isImageScannable(buffer: Buffer): boolean {
    return buffer.length > 1024 && buffer.length < 5 * 1024 * 1024;
}
