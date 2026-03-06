/**
 * PDF Watermark Service — علامة مائية رقمية لحماية الملكية الفكرية
 * Dynamic Digital Watermark — IP Protection for Arba Professional Exports
 * 
 * Applies diagonal watermark grid on EVERY page of generated PDF
 * Content: UserID | Employee Name | ISO Timestamp | Quote#
 */

import jsPDF from 'jspdf';

export interface WatermarkConfig {
    userId: string;
    employeeName: string;
    quoteNumber: string;
    opacity?: number;        // 0.0 - 1.0, default 0.06
    fontSize?: number;       // default 10
    angle?: number;          // degrees, default -30
    color?: [number, number, number]; // RGB, default light gray
}

/**
 * Apply watermark to ALL pages of a jsPDF document
 * Must be called AFTER all content pages are generated
 */
export function applyWatermark(doc: jsPDF, config: WatermarkConfig): void {
    const {
        userId,
        employeeName,
        quoteNumber,
        opacity = 0.06,
        fontSize = 9,
        angle = -30,
        color = [128, 128, 128],
    } = config;

    const timestamp = new Date().toISOString();
    const watermarkText = `${userId} | ${employeeName} | ${timestamp.split('T')[0]} | ${quoteNumber}`;

    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Calculate grid spacing
    const textWidth = watermarkText.length * (fontSize * 0.45);
    const spacingX = textWidth + 40;
    const spacingY = 45;

    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);

        // Set watermark style — use very light color to simulate opacity
        // (GState is unreliable across jsPDF builds, so we use color lightness)
        const opacityFactor = opacity;
        const r = Math.round(255 - (255 - color[0]) * opacityFactor);
        const g = Math.round(255 - (255 - color[1]) * opacityFactor);
        const b = Math.round(255 - (255 - color[2]) * opacityFactor);

        doc.setFontSize(fontSize);
        doc.setTextColor(r, g, b);
        doc.setFont('helvetica', 'normal');

        // Calculate grid — cover full page even when rotated
        const diagonal = Math.sqrt(pageWidth * pageWidth + pageHeight * pageHeight);
        const startX = -diagonal / 2;
        const startY = -diagonal / 2;
        const endX = diagonal;
        const endY = diagonal;

        // Rotate around page center
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        for (let y = startY; y < endY; y += spacingY) {
            for (let x = startX; x < endX; x += spacingX) {
                // Transform coordinates
                const rotX = centerX + (x * cos - y * sin);
                const rotY = centerY + (x * sin + y * cos);

                // Only draw if within page bounds (with margin)
                if (rotX > -100 && rotX < pageWidth + 100 && rotY > -100 && rotY < pageHeight + 100) {
                    doc.text(watermarkText, rotX, rotY, {
                        angle: angle,
                    });
                }
            }
        }
    }
}

/**
 * Generate a unique hash suffix for anti-tamper per page
 */
export function generatePageHash(userId: string, pageNum: number, timestamp: string): string {
    const raw = `${userId}-${pageNum}-${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
}
