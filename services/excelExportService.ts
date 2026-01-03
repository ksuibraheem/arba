/**
 * خدمة تصدير البيانات إلى Excel
 * Excel Export Service
 * 
 * Uses SheetJS (xlsx) library for Excel file generation
 */

import { Invoice } from './accountingService';
import { Account, JournalEntry } from './chartOfAccountsService';

// ====================== أنواع البيانات ======================

export interface ExportColumn {
    key: string;
    header: string;
    width?: number;
}

// ====================== خدمة التصدير ======================

class ExcelExportService {

    /**
     * تحميل مكتبة SheetJS ديناميكياً
     */
    private async loadSheetJS(): Promise<any> {
        // التحقق من وجود المكتبة في النافذة
        if ((window as any).XLSX) {
            return (window as any).XLSX;
        }

        // تحميل المكتبة من CDN
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = () => resolve((window as any).XLSX);
            script.onerror = () => reject(new Error('فشل تحميل مكتبة Excel'));
            document.head.appendChild(script);
        });
    }

    /**
     * تصدير الفواتير إلى Excel
     */
    async exportInvoices(invoices: Invoice[], filename: string = 'invoices'): Promise<void> {
        const XLSX = await this.loadSheetJS();

        // تحويل البيانات إلى صفوف
        const data = invoices.map(invoice => ({
            'رقم الفاتورة': invoice.invoiceNumber,
            'العميل': invoice.customerName,
            'البريد الإلكتروني': invoice.customerEmail || '',
            'الهاتف': invoice.customerPhone || '',
            'المبلغ قبل الضريبة': invoice.subtotal,
            'الضريبة (15%)': invoice.tax,
            'الخصم': invoice.discount,
            'الإجمالي': invoice.total,
            'الحالة': this.getStatusArabic(invoice.status),
            'تاريخ الإصدار': invoice.issueDate,
            'تاريخ الاستحقاق': invoice.dueDate,
            'تاريخ الدفع': invoice.paidDate || '',
            'ملاحظات': invoice.notes || ''
        }));

        // إنشاء ورقة العمل
        const worksheet = XLSX.utils.json_to_sheet(data, {
            header: [
                'رقم الفاتورة', 'العميل', 'البريد الإلكتروني', 'الهاتف',
                'المبلغ قبل الضريبة', 'الضريبة (15%)', 'الخصم', 'الإجمالي',
                'الحالة', 'تاريخ الإصدار', 'تاريخ الاستحقاق', 'تاريخ الدفع', 'ملاحظات'
            ]
        });

        // تعيين عرض الأعمدة
        worksheet['!cols'] = [
            { width: 15 }, { width: 25 }, { width: 25 }, { width: 15 },
            { width: 18 }, { width: 15 }, { width: 10 }, { width: 15 },
            { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 30 }
        ];

        // إنشاء ملف العمل
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'الفواتير');

        // تحميل الملف
        const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    /**
     * تصدير شجرة الحسابات إلى Excel
     */
    async exportChartOfAccounts(accounts: Account[], filename: string = 'chart_of_accounts'): Promise<void> {
        const XLSX = await this.loadSheetJS();

        // تحويل البيانات
        const data = accounts.map(account => ({
            'كود الحساب': account.code,
            'اسم الحساب (عربي)': account.name,
            'اسم الحساب (إنجليزي)': account.nameEn,
            'نوع الحساب': this.getAccountTypeArabic(account.type),
            'الحساب الرئيسي': account.parentCode || '-',
            'الرصيد': account.balance,
            'حساب فرعي': account.isSubLedger ? 'نعم' : 'لا',
            'الحالة': account.isActive ? 'نشط' : 'غير نشط'
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        worksheet['!cols'] = [
            { width: 15 }, { width: 30 }, { width: 30 }, { width: 15 },
            { width: 15 }, { width: 15 }, { width: 12 }, { width: 12 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'شجرة الحسابات');

        const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    /**
     * تصدير القيود المحاسبية إلى Excel
     */
    async exportJournalEntries(entries: JournalEntry[], filename: string = 'journal_entries'): Promise<void> {
        const XLSX = await this.loadSheetJS();

        // تحويل البيانات (سطر لكل قيد)
        const data = entries.map(entry => ({
            'رقم القيد': entry.entryNumber,
            'التاريخ': entry.date,
            'الوصف': entry.description,
            'إجمالي المدين': entry.totalDebit,
            'إجمالي الدائن': entry.totalCredit,
            'متوازن': entry.isBalanced ? '✓' : '✗',
            'المرجع': entry.reference || '',
            'النوع': this.getJournalTypeArabic(entry.sourceType),
            'مرحل': entry.isPosted ? 'نعم' : 'لا',
            'بواسطة': entry.createdBy
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        worksheet['!cols'] = [
            { width: 18 }, { width: 12 }, { width: 40 }, { width: 15 },
            { width: 15 }, { width: 10 }, { width: 15 }, { width: 12 },
            { width: 10 }, { width: 20 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'القيود المحاسبية');

        const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    /**
     * تصدير تفاصيل القيود (سطر لكل حركة)
     */
    async exportJournalDetails(entries: JournalEntry[], filename: string = 'journal_details'): Promise<void> {
        const XLSX = await this.loadSheetJS();

        // تحويل إلى سطور تفصيلية
        const data: any[] = [];
        for (const entry of entries) {
            for (const line of entry.lines) {
                data.push({
                    'رقم القيد': entry.entryNumber,
                    'التاريخ': entry.date,
                    'الوصف': entry.description,
                    'كود الحساب': line.accountCode,
                    'اسم الحساب': line.accountName || '',
                    'مدين': line.debit || '',
                    'دائن': line.credit || '',
                    'الطرف': line.entityName || ''
                });
            }
        }

        const worksheet = XLSX.utils.json_to_sheet(data);

        worksheet['!cols'] = [
            { width: 18 }, { width: 12 }, { width: 30 }, { width: 15 },
            { width: 25 }, { width: 15 }, { width: 15 }, { width: 25 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'تفاصيل القيود');

        const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }

    // =================== وظائف مساعدة ===================

    private getStatusArabic(status: string): string {
        const translations: Record<string, string> = {
            draft: 'مسودة',
            pending: 'معلق',
            sent: 'مرسلة',
            paid: 'مدفوعة',
            overdue: 'متأخرة',
            cancelled: 'ملغية'
        };
        return translations[status] || status;
    }

    private getAccountTypeArabic(type: string): string {
        const translations: Record<string, string> = {
            asset: 'أصول',
            liability: 'التزامات',
            revenue: 'إيرادات',
            expense: 'مصروفات',
            equity: 'حقوق ملكية'
        };
        return translations[type] || type;
    }

    private getJournalTypeArabic(type: string): string {
        const translations: Record<string, string> = {
            subscription: 'اشتراك',
            sale: 'مبيعات',
            purchase: 'مشتريات',
            payroll: 'رواتب',
            collection: 'تحصيل',
            payment: 'صرف',
            manual: 'يدوي'
        };
        return translations[type] || type;
    }
}

export const excelExportService = new ExcelExportService();
