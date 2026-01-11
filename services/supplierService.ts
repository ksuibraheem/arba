/**
 * خدمة الموردين
 * Supplier Service - Connects Suppliers with Accounting System
 */

import { registrationService, RegistrationRequest } from './registrationService';
import { chartOfAccountsService, ACCOUNT_CODES, JournalEntry, VAT_RATE } from './chartOfAccountsService';

// ====================== أنواع البيانات ======================

// بيانات المورد
export interface Supplier {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone: string;
    commercialRegister: string;
    businessType: string;
    isActive: boolean;
    createdAt: string;
}

// منتج المورد
export interface SupplierProduct {
    id: string;
    supplierId: string;
    name: { ar: string; en: string };
    category: string;
    price: number;
    unit: string;
    stock: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

// حالة فاتورة المشتريات
export type PurchaseInvoiceStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled';

// بند الفاتورة
export interface PurchaseInvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// فاتورة المشتريات
export interface PurchaseInvoice {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseInvoiceItem[];
    subtotal: number;
    taxAmount: number;
    total: number;
    status: PurchaseInvoiceStatus;
    dueDate: string;
    paidAmount: number;
    remainingAmount: number;
    journalEntryId?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// دفعة للمورد
export interface SupplierPayment {
    id: string;
    supplierId: string;
    supplierName: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
    reference?: string;
    journalEntryId?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

// رصيد المورد
export interface SupplierBalance {
    supplierId: string;
    supplierName: string;
    totalPurchases: number;
    totalPayments: number;
    balance: number; // المستحق للمورد
    invoiceCount: number;
    lastInvoiceDate?: string;
    lastPaymentDate?: string;
}

// ====================== الترجمات ======================

export const PURCHASE_INVOICE_STATUS_TRANSLATIONS: Record<PurchaseInvoiceStatus, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' },
    pending: { ar: 'معلقة', en: 'Pending' },
    approved: { ar: 'معتمدة', en: 'Approved' },
    paid: { ar: 'مدفوعة', en: 'Paid' },
    cancelled: { ar: 'ملغية', en: 'Cancelled' }
};

export const PAYMENT_METHOD_TRANSLATIONS: Record<SupplierPayment['paymentMethod'], { ar: string; en: string }> = {
    cash: { ar: 'نقداً', en: 'Cash' },
    bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
    cheque: { ar: 'شيك', en: 'Cheque' }
};

// ====================== خدمة الموردين ======================

class SupplierService {
    private productsKey = 'arba_supplier_products';
    private invoicesKey = 'arba_purchase_invoices';
    private paymentsKey = 'arba_supplier_payments';

    // =================== الموردين ===================

    /**
     * جلب كل الموردين المسجلين والمعتمدين
     */
    getSuppliers(): Supplier[] {
        const requests = registrationService.getRequests();

        return requests
            .filter(r => r.userType === 'supplier' && r.status === 'approved')
            .map(r => ({
                id: r.id,
                name: r.name,
                companyName: r.companyName || r.name,
                email: r.email,
                phone: r.phone,
                commercialRegister: r.commercialRegister || '',
                businessType: r.businessType || '',
                isActive: !r.isSuspended,
                createdAt: r.createdAt
            }));
    }

    /**
     * جلب مورد بالمعرف
     */
    getSupplierById(id: string): Supplier | null {
        return this.getSuppliers().find(s => s.id === id) || null;
    }

    // =================== منتجات الموردين ===================

    getProducts(): SupplierProduct[] {
        const data = localStorage.getItem(this.productsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveProducts(products: SupplierProduct[]): void {
        localStorage.setItem(this.productsKey, JSON.stringify(products));
    }

    getProductsBySupplierId(supplierId: string): SupplierProduct[] {
        return this.getProducts().filter(p => p.supplierId === supplierId);
    }

    addProduct(product: Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>): SupplierProduct {
        const products = this.getProducts();
        const newProduct: SupplierProduct = {
            ...product,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        products.push(newProduct);
        this.saveProducts(products);
        return newProduct;
    }

    updateProduct(id: string, updates: Partial<SupplierProduct>): SupplierProduct | null {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveProducts(products);
        return products[index];
    }

    // =================== فواتير المشتريات ===================

    getInvoices(): PurchaseInvoice[] {
        const data = localStorage.getItem(this.invoicesKey);
        return data ? JSON.parse(data) : [];
    }

    private saveInvoices(invoices: PurchaseInvoice[]): void {
        localStorage.setItem(this.invoicesKey, JSON.stringify(invoices));
    }

    generateInvoiceNumber(): string {
        const year = new Date().getFullYear();
        const invoices = this.getInvoices();
        const count = invoices.filter(inv => inv.invoiceNumber.startsWith(`PI-${year}`)).length + 1;
        return `PI-${year}-${count.toString().padStart(5, '0')}`;
    }

    getInvoicesBySupplierId(supplierId: string): PurchaseInvoice[] {
        return this.getInvoices().filter(inv => inv.supplierId === supplierId);
    }

    /**
     * إنشاء فاتورة مشتريات جديدة
     */
    createPurchaseInvoice(data: {
        supplierId: string;
        items: PurchaseInvoiceItem[];
        dueDate: string;
        notes?: string;
        createdBy: string;
    }): PurchaseInvoice {
        const supplier = this.getSupplierById(data.supplierId);
        if (!supplier) {
            throw new Error('المورد غير موجود');
        }

        const invoices = this.getInvoices();

        const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * VAT_RATE;
        const total = subtotal + taxAmount;

        const invoice: PurchaseInvoice = {
            id: crypto.randomUUID(),
            invoiceNumber: this.generateInvoiceNumber(),
            supplierId: data.supplierId,
            supplierName: supplier.companyName,
            items: data.items,
            subtotal,
            taxAmount,
            total,
            status: 'pending',
            dueDate: data.dueDate,
            paidAmount: 0,
            remainingAmount: total,
            notes: data.notes,
            createdBy: data.createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // إنشاء قيد محاسبي
        const journalEntry = chartOfAccountsService.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `فاتورة مشتريات - ${supplier.companyName} - ${invoice.invoiceNumber}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.COST_OF_GOODS_SOLD,
                    debit: subtotal,
                    credit: 0,
                },
                {
                    accountCode: ACCOUNT_CODES.INPUT_VAT,
                    debit: taxAmount,
                    credit: 0,
                },
                {
                    accountCode: ACCOUNT_CODES.SUPPLIERS_PAYABLE,
                    debit: 0,
                    credit: total,
                    entityId: supplier.id,
                    entityName: supplier.companyName
                }
            ],
            reference: invoice.invoiceNumber,
            sourceType: 'purchase',
            sourceId: invoice.id,
            createdBy: data.createdBy
        });

        // ترحيل القيد
        chartOfAccountsService.postJournalEntry(journalEntry.id);
        invoice.journalEntryId = journalEntry.id;

        invoices.push(invoice);
        this.saveInvoices(invoices);
        return invoice;
    }

    /**
     * اعتماد فاتورة مشتريات
     */
    approveInvoice(invoiceId: string): PurchaseInvoice | null {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) return null;

        invoices[index] = {
            ...invoices[index],
            status: 'approved',
            updatedAt: new Date().toISOString()
        };
        this.saveInvoices(invoices);
        return invoices[index];
    }

    // =================== المدفوعات ===================

    getPayments(): SupplierPayment[] {
        const data = localStorage.getItem(this.paymentsKey);
        return data ? JSON.parse(data) : [];
    }

    private savePayments(payments: SupplierPayment[]): void {
        localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
    }

    getPaymentsBySupplierId(supplierId: string): SupplierPayment[] {
        return this.getPayments().filter(p => p.supplierId === supplierId);
    }

    /**
     * تسجيل دفعة للمورد
     */
    recordPayment(data: {
        supplierId: string;
        invoiceId?: string;
        amount: number;
        paymentMethod: SupplierPayment['paymentMethod'];
        reference?: string;
        notes?: string;
        createdBy: string;
    }): SupplierPayment {
        const supplier = this.getSupplierById(data.supplierId);
        if (!supplier) {
            throw new Error('المورد غير موجود');
        }

        const payments = this.getPayments();

        let invoiceNumber: string | undefined;
        if (data.invoiceId) {
            const invoice = this.getInvoices().find(inv => inv.id === data.invoiceId);
            if (invoice) {
                invoiceNumber = invoice.invoiceNumber;
                // تحديث الفاتورة
                this.updateInvoicePayment(data.invoiceId, data.amount);
            }
        }

        // إنشاء قيد الدفع
        const journalEntry = chartOfAccountsService.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `دفعة للمورد - ${supplier.companyName}${invoiceNumber ? ` - ${invoiceNumber}` : ''}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.SUPPLIERS_PAYABLE,
                    debit: data.amount,
                    credit: 0,
                    entityId: supplier.id,
                    entityName: supplier.companyName
                },
                {
                    accountCode: ACCOUNT_CODES.BANK,
                    debit: 0,
                    credit: data.amount,
                }
            ],
            reference: data.reference,
            sourceType: 'payment',
            createdBy: data.createdBy
        });

        chartOfAccountsService.postJournalEntry(journalEntry.id);

        const payment: SupplierPayment = {
            id: crypto.randomUUID(),
            supplierId: data.supplierId,
            supplierName: supplier.companyName,
            invoiceId: data.invoiceId,
            invoiceNumber,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            reference: data.reference,
            journalEntryId: journalEntry.id,
            notes: data.notes,
            createdBy: data.createdBy,
            createdAt: new Date().toISOString()
        };

        payments.push(payment);
        this.savePayments(payments);
        return payment;
    }

    private updateInvoicePayment(invoiceId: string, amount: number): void {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(inv => inv.id === invoiceId);
        if (index === -1) return;

        const invoice = invoices[index];
        invoice.paidAmount += amount;
        invoice.remainingAmount = invoice.total - invoice.paidAmount;

        if (invoice.remainingAmount <= 0) {
            invoice.status = 'paid';
        }

        invoice.updatedAt = new Date().toISOString();
        this.saveInvoices(invoices);
    }

    // =================== الأرصدة ===================

    /**
     * حساب رصيد المورد
     */
    getSupplierBalance(supplierId: string): SupplierBalance | null {
        const supplier = this.getSupplierById(supplierId);
        if (!supplier) return null;

        const invoices = this.getInvoicesBySupplierId(supplierId);
        const payments = this.getPaymentsBySupplierId(supplierId);

        const totalPurchases = invoices
            .filter(inv => inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + inv.total, 0);

        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

        const lastInvoice = invoices.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        const lastPayment = payments.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        return {
            supplierId,
            supplierName: supplier.companyName,
            totalPurchases,
            totalPayments,
            balance: totalPurchases - totalPayments, // المستحق للمورد
            invoiceCount: invoices.filter(inv => inv.status !== 'cancelled').length,
            lastInvoiceDate: lastInvoice?.createdAt,
            lastPaymentDate: lastPayment?.createdAt
        };
    }

    /**
     * جلب أرصدة كل الموردين
     */
    getAllSupplierBalances(): SupplierBalance[] {
        return this.getSuppliers()
            .map(s => this.getSupplierBalance(s.id))
            .filter((b): b is SupplierBalance => b !== null);
    }

    // =================== بيانات تجريبية ===================

    initializeSampleData(): void {
        // إضافة منتجات تجريبية للمورد sample-2
        if (this.getProducts().length === 0) {
            const sampleProducts: Omit<SupplierProduct, 'id' | 'createdAt' | 'updatedAt'>[] = [
                {
                    supplierId: 'sample-2',
                    name: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' },
                    category: 'steel',
                    price: 3200,
                    unit: 'طن',
                    stock: 150,
                    status: 'active'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'اسمنت بورتلاندي', en: 'Portland Cement' },
                    category: 'concrete',
                    price: 18,
                    unit: 'كيس',
                    stock: 5000,
                    status: 'active'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tiles 60x60' },
                    category: 'tiles',
                    price: 45,
                    unit: 'م²',
                    stock: 800,
                    status: 'active'
                }
            ];

            for (const product of sampleProducts) {
                this.addProduct(product);
            }
        }
    }
}

export const supplierService = new SupplierService();
