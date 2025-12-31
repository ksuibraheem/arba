/**
 * خدمة الفاتورة الضريبية الإلكترونية
 * Tax Invoice Service - ZATCA Compliant
 * 
 * تستخدم CDN لتحميل المكتبات بدون الحاجة لـ npm install
 */

import { Invoice, Client } from './accountingService';

// ====================== بيانات الشركة ======================

export const COMPANY_INFO = {
    nameAr: 'شركة الرواد لأنظمة البناء الحديث المحدودة',
    nameEn: 'ARROWAD Modern Building Systems Co. Ltd.',
    vatNumber: '300012345678901',
    crNumber: '1010123456',
    address: 'الرياض، المملكة العربية السعودية',
    addressEn: 'Riyadh, Kingdom of Saudi Arabia',
    phone: '+966 11 123 4567',
    email: 'info@arrowad.sa',
    website: 'www.arrowad.sa'
};

// ====================== أنواع البيانات ======================

export interface TaxInvoiceData {
    invoice: Invoice;
    client?: Client;
    customerVatNumber?: string;
    invoiceType: 'standard' | 'simplified';
}

export interface ZATCAQRData {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    totalAmount: number;
    vatAmount: number;
}

// ====================== استيراد المكتبات ======================

// @ts-ignore
import { jsPDF } from 'jspdf';
// @ts-ignore
import QRCode from 'qrcode';

// دوال تحميل المكتبات (للتوافق مع الكود الحالي)
async function loadJsPDF() {
    return jsPDF;
}

async function loadQRCode() {
    return QRCode;
}

// ====================== دوال مساعدة ======================

/**
 * تحويل النص إلى Hex
 */
function stringToHex(str: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء TLV للـ ZATCA QR Code
 * Tag-Length-Value format
 */
function createTLV(tag: number, value: string): string {
    const encoder = new TextEncoder();
    const valueBytes = encoder.encode(value);
    const length = valueBytes.length;

    const tagHex = tag.toString(16).padStart(2, '0');
    const lengthHex = length.toString(16).padStart(2, '0');
    const valueHex = stringToHex(value);

    return tagHex + lengthHex + valueHex;
}

/**
 * تحويل Hex إلى Base64
 */
function hexToBase64(hex: string): string {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

// ====================== خدمة الفاتورة الضريبية ======================

class TaxInvoiceService {

    /**
     * توليد رمز QR بصيغة ZATCA
     * @param data بيانات الفاتورة
     * @returns Base64 QR Code image
     */
    async generateZATCAQRCode(data: ZATCAQRData): Promise<string> {
        // إنشاء TLV string
        const tlv =
            createTLV(1, data.sellerName) +      // اسم المورد
            createTLV(2, data.vatNumber) +       // الرقم الضريبي
            createTLV(3, data.timestamp) +       // الطابع الزمني
            createTLV(4, data.totalAmount.toFixed(2)) +  // إجمالي الفاتورة
            createTLV(5, data.vatAmount.toFixed(2));     // إجمالي الضريبة

        // تحويل إلى Base64
        const base64Data = hexToBase64(tlv);

        // توليد QR Code
        try {
            const QRCode = await loadQRCode();
            const qrCodeDataUrl = await QRCode.toDataURL(base64Data, {
                width: 150,
                margin: 1,
                errorCorrectionLevel: 'M'
            });
            return qrCodeDataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            return '';
        }
    }

    /**
     * توليد فاتورة ضريبية PDF
     * @param data بيانات الفاتورة
     * @returns jsPDF document
     */
    async generateTaxInvoicePDF(data: TaxInvoiceData): Promise<any> {
        const { invoice, customerVatNumber, invoiceType } = data;

        // تحميل jsPDF من CDN
        const jsPDF = await loadJsPDF();

        // إنشاء PDF بحجم A4
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let yPos = margin;

        // ---------------------- الترويسة ----------------------

        // خلفية الترويسة
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 45, 'F');

        // اسم الشركة (English - يسار)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(COMPANY_INFO.nameEn, margin, yPos + 10);

        // الرقم الضريبي
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`VAT: ${COMPANY_INFO.vatNumber}`, margin, yPos + 18);
        doc.text(`C.R: ${COMPANY_INFO.crNumber}`, margin, yPos + 24);

        // عنوان الفاتورة
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        const invoiceTitle = invoiceType === 'simplified' ? 'SIMPLIFIED TAX INVOICE' : 'TAX INVOICE';
        doc.text(invoiceTitle, pageWidth / 2, yPos + 35, { align: 'center' });

        yPos = 55;

        // ---------------------- معلومات الفاتورة ----------------------

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10);

        // عمود يسار - بيانات الفاتورة
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Number:', margin, yPos);
        doc.text('Issue Date:', margin, yPos + 6);
        doc.text('Due Date:', margin, yPos + 12);

        doc.setFont('helvetica', 'normal');
        doc.text(invoice.invoiceNumber, margin + 35, yPos);
        doc.text(invoice.issueDate, margin + 35, yPos + 6);
        doc.text(invoice.dueDate, margin + 35, yPos + 12);

        // عمود يمين - بيانات العميل
        const rightCol = pageWidth - margin - 80;
        doc.setFont('helvetica', 'bold');
        doc.text('Customer:', rightCol, yPos);
        if (customerVatNumber) {
            doc.text('Customer VAT:', rightCol, yPos + 6);
        }

        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customerName, rightCol + 30, yPos);
        if (customerVatNumber) {
            doc.text(customerVatNumber, rightCol + 30, yPos + 6);
        }
        if (invoice.customerPhone) {
            doc.text(invoice.customerPhone, rightCol + 30, yPos + 12);
        }

        yPos += 25;

        // ---------------------- جدول البنود ----------------------

        // رأس الجدول
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('#', margin + 3, yPos + 7);
        doc.text('Description', margin + 12, yPos + 7);
        doc.text('Qty', margin + 90, yPos + 7);
        doc.text('Unit Price', margin + 105, yPos + 7);
        doc.text('VAT (15%)', margin + 130, yPos + 7);
        doc.text('Total', margin + 155, yPos + 7);

        yPos += 12;

        // بنود الفاتورة
        doc.setFont('helvetica', 'normal');
        invoice.items.forEach((item, index) => {
            const itemVat = item.total * 0.15;
            const itemTotalWithVat = item.total + itemVat;

            doc.text((index + 1).toString(), margin + 3, yPos);

            // قص الوصف إذا كان طويلاً
            const desc = item.description.length > 40 ? item.description.substring(0, 37) + '...' : item.description;
            doc.text(desc, margin + 12, yPos);

            doc.text(item.quantity.toString(), margin + 90, yPos);
            doc.text(item.unitPrice.toLocaleString('en-SA', { minimumFractionDigits: 2 }), margin + 105, yPos);
            doc.text(itemVat.toLocaleString('en-SA', { minimumFractionDigits: 2 }), margin + 130, yPos);
            doc.text(itemTotalWithVat.toLocaleString('en-SA', { minimumFractionDigits: 2 }), margin + 155, yPos);

            yPos += 7;

            // خط فاصل
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
        });

        yPos += 10;

        // ---------------------- الإجماليات ----------------------

        const totalsX = pageWidth - margin - 70;

        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', totalsX, yPos);
        doc.text(invoice.subtotal.toLocaleString('en-SA', { minimumFractionDigits: 2 }) + ' SAR', pageWidth - margin, yPos, { align: 'right' });

        yPos += 6;
        doc.text('VAT (15%):', totalsX, yPos);
        doc.text(invoice.tax.toLocaleString('en-SA', { minimumFractionDigits: 2 }) + ' SAR', pageWidth - margin, yPos, { align: 'right' });

        if (invoice.discount > 0) {
            yPos += 6;
            doc.text('Discount:', totalsX, yPos);
            doc.text('-' + invoice.discount.toLocaleString('en-SA', { minimumFractionDigits: 2 }) + ' SAR', pageWidth - margin, yPos, { align: 'right' });
        }

        yPos += 8;
        doc.setDrawColor(15, 23, 42);
        doc.line(totalsX, yPos - 3, pageWidth - margin, yPos - 3);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TOTAL:', totalsX, yPos + 3);
        doc.text(invoice.total.toLocaleString('en-SA', { minimumFractionDigits: 2 }) + ' SAR', pageWidth - margin, yPos + 3, { align: 'right' });

        // ---------------------- رمز QR ----------------------

        const qrData: ZATCAQRData = {
            sellerName: COMPANY_INFO.nameAr,
            vatNumber: COMPANY_INFO.vatNumber,
            timestamp: new Date(invoice.issueDate).toISOString(),
            totalAmount: invoice.total,
            vatAmount: invoice.tax
        };

        const qrCodeImage = await this.generateZATCAQRCode(qrData);

        if (qrCodeImage) {
            const qrSize = 35;
            const qrX = margin;
            const qrY = yPos - 10;
            doc.addImage(qrCodeImage, 'PNG', qrX, qrY, qrSize, qrSize);
        }

        // ---------------------- التذييل ----------------------

        yPos = pageHeight - 30;

        doc.setFillColor(241, 245, 249);
        doc.rect(0, yPos - 5, pageWidth, 35, 'F');

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        doc.text(COMPANY_INFO.addressEn, pageWidth / 2, yPos, { align: 'center' });
        doc.text(`Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}`, pageWidth / 2, yPos + 5, { align: 'center' });
        doc.text(COMPANY_INFO.website, pageWidth / 2, yPos + 10, { align: 'center' });

        doc.setFontSize(7);
        doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, yPos + 18, { align: 'center' });

        return doc;
    }

    /**
     * تحميل الفاتورة كملف PDF
     * @param data بيانات الفاتورة
     */
    async downloadInvoicePDF(data: TaxInvoiceData): Promise<void> {
        try {
            const doc = await this.generateTaxInvoicePDF(data);
            doc.save(`Invoice-${data.invoice.invoiceNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('حدث خطأ أثناء توليد الفاتورة. يرجى المحاولة مرة أخرى.');
        }
    }

    /**
     * فتح الفاتورة في نافذة جديدة
     * @param data بيانات الفاتورة
     */
    async openInvoicePDF(data: TaxInvoiceData): Promise<void> {
        try {
            const doc = await this.generateTaxInvoicePDF(data);
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error opening PDF:', error);
            alert('حدث خطأ أثناء فتح الفاتورة. يرجى المحاولة مرة أخرى.');
        }
    }

    /**
     * الحصول على PDF كـ Blob
     * @param data بيانات الفاتورة
     */
    async getInvoicePDFBlob(data: TaxInvoiceData): Promise<Blob> {
        const doc = await this.generateTaxInvoicePDF(data);
        return doc.output('blob');
    }
}

// تصدير نسخة واحدة من الخدمة
export const taxInvoiceService = new TaxInvoiceService();
export default taxInvoiceService;
