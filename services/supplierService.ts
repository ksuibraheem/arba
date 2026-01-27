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
    // حقول المصداقية
    certificates?: SupplierCertificate[];        // الشهادات
    rating?: number;                             // التقييم (1-5)
    verificationStatus?: VerificationStatus;     // حالة التحقق
    technicalSpecs?: string;                     // المواصفات الفنية العامة
}

// حالة التحقق من المورد
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// شهادة المورد
export interface SupplierCertificate {
    id: string;
    name: { ar: string; en: string };
    type: 'iso' | 'quality' | 'safety' | 'environmental' | 'commercial' | 'other';
    fileUrl?: string;
    expiryDate?: string;
    isVerified: boolean;
}

// نوع المنتج (بيع أو تأجير)
export type ProductType = 'sale' | 'rental';

// فترة التأجير
export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

// نوع الوحدة
export type UnitType = 'piece' | 'kg' | 'ton' | 'meter' | 'sqm' | 'cbm' | 'liter' | 'bag' | 'roll' | 'box' | 'set';

// حالة موافقة الإدارة
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_required';

// منتج المورد
export interface SupplierProduct {
    id: string;
    supplierId: string;
    name: { ar: string; en: string };
    category: string;
    productType: ProductType;           // بيع أو تأجير
    price: number;                      // سعر البيع (للبيع) أو سعر الفترة (للتأجير)
    unitType: UnitType;                 // نوع الوحدة
    unit: string;                       // وصف الوحدة (للعرض)
    stock: number;                      // المخزون (للبيع) أو الكمية المتاحة (للتأجير)
    status: 'active' | 'inactive';
    // حالة الموافقة
    approvalStatus: ApprovalStatus;     // حالة موافقة الإدارة
    approvalNotes?: string;             // ملاحظات الموافقة
    approvedBy?: string;                // معرف الموافِق
    approvedAt?: string;                // تاريخ الموافقة
    // حقول التأجير
    rentalPeriod?: RentalPeriod;        // فترة التأجير
    minRentalDuration?: number;         // أقل مدة تأجير (بالفترات)
    maxRentalDuration?: number;         // أقصى مدة تأجير
    depositAmount?: number;             // مبلغ التأمين
    // الوصف والمواصفات
    description?: { ar: string; en: string }; // وصف المنتج
    specifications?: string;            // المواصفات الفنية
    images?: string[];                  // صور المنتج
    documents?: string[];               // مستندات (كتالوجات، شهادات)
    // حقول إضافية لمهندس الكميات
    source?: 'system' | 'supplier';     // مصدر البيانات
    qsDescription?: string;             // شرح مفصل من مهندس الكميات
    qsDescriptionUpdatedAt?: string;    // تاريخ تحديث الشرح
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

// ترجمات نوع المنتج
export const PRODUCT_TYPE_TRANSLATIONS: Record<ProductType, { ar: string; en: string }> = {
    sale: { ar: 'بيع', en: 'Sale' },
    rental: { ar: 'تأجير', en: 'Rental' }
};

// ترجمات فترة التأجير
export const RENTAL_PERIOD_TRANSLATIONS: Record<RentalPeriod, { ar: string; en: string }> = {
    hourly: { ar: 'بالساعة', en: 'Per Hour' },
    daily: { ar: 'باليوم', en: 'Per Day' },
    weekly: { ar: 'بالأسبوع', en: 'Per Week' },
    monthly: { ar: 'بالشهر', en: 'Per Month' }
};

// ترجمات نوع الوحدة
export const UNIT_TYPE_TRANSLATIONS: Record<UnitType, { ar: string; en: string; symbol: string }> = {
    piece: { ar: 'قطعة', en: 'Piece', symbol: 'pc' },
    kg: { ar: 'كيلوجرام', en: 'Kilogram', symbol: 'kg' },
    ton: { ar: 'طن', en: 'Ton', symbol: 'ton' },
    meter: { ar: 'متر طولي', en: 'Linear Meter', symbol: 'm' },
    sqm: { ar: 'متر مربع', en: 'Square Meter', symbol: 'm²' },
    cbm: { ar: 'متر مكعب', en: 'Cubic Meter', symbol: 'm³' },
    liter: { ar: 'لتر', en: 'Liter', symbol: 'L' },
    bag: { ar: 'كيس', en: 'Bag', symbol: 'bag' },
    roll: { ar: 'رول', en: 'Roll', symbol: 'roll' },
    box: { ar: 'صندوق', en: 'Box', symbol: 'box' },
    set: { ar: 'طقم', en: 'Set', symbol: 'set' }
};

// ترجمات حالة الموافقة
export const APPROVAL_STATUS_TRANSLATIONS: Record<ApprovalStatus, { ar: string; en: string }> = {
    pending: { ar: 'قيد المراجعة', en: 'Pending Review' },
    approved: { ar: 'معتمد', en: 'Approved' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    revision_required: { ar: 'يحتاج تعديل', en: 'Revision Required' }
};

// ترجمات حالة التحقق من المورد
export const VERIFICATION_STATUS_TRANSLATIONS: Record<VerificationStatus, { ar: string; en: string }> = {
    pending: { ar: 'قيد التحقق', en: 'Pending Verification' },
    verified: { ar: 'موثق', en: 'Verified' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

// ترجمات أنواع الشهادات
export const CERTIFICATE_TYPE_TRANSLATIONS: Record<SupplierCertificate['type'], { ar: string; en: string }> = {
    iso: { ar: 'شهادة ISO', en: 'ISO Certificate' },
    quality: { ar: 'شهادة جودة', en: 'Quality Certificate' },
    safety: { ar: 'شهادة سلامة', en: 'Safety Certificate' },
    environmental: { ar: 'شهادة بيئية', en: 'Environmental Certificate' },
    commercial: { ar: 'سجل تجاري', en: 'Commercial Registration' },
    other: { ar: 'أخرى', en: 'Other' }
};

export const PRODUCT_CATEGORIES: Record<string, { ar: string; en: string; type: ProductType | 'both' }> = {
    // تصنيفات البيع
    building_materials: { ar: 'مواد البناء', en: 'Building Materials', type: 'sale' },
    electrical: { ar: 'كهربائيات', en: 'Electrical', type: 'sale' },
    plumbing: { ar: 'سباكة', en: 'Plumbing', type: 'sale' },
    paints: { ar: 'دهانات', en: 'Paints', type: 'sale' },
    tiles: { ar: 'بلاط وسيراميك', en: 'Tiles & Ceramics', type: 'sale' },
    insulation: { ar: 'عوازل', en: 'Insulation', type: 'sale' },
    steel: { ar: 'حديد وصلب', en: 'Steel', type: 'sale' },
    cement: { ar: 'إسمنت وخرسانة', en: 'Cement & Concrete', type: 'sale' },
    wood: { ar: 'أخشاب', en: 'Wood', type: 'sale' },
    tools: { ar: 'أدوات وعدد', en: 'Tools', type: 'both' },
    safety_equipment: { ar: 'معدات السلامة', en: 'Safety Equipment', type: 'sale' },
    // تصنيفات التأجير
    scaffolding: { ar: 'سقالات', en: 'Scaffolding', type: 'rental' },
    cranes: { ar: 'رافعات', en: 'Cranes', type: 'rental' },
    forklifts: { ar: 'رافعات شوكية', en: 'Forklifts', type: 'rental' },
    excavators: { ar: 'حفارات', en: 'Excavators', type: 'rental' },
    loaders: { ar: 'لودرات', en: 'Loaders', type: 'rental' },
    concrete_mixers: { ar: 'خلاطات خرسانة', en: 'Concrete Mixers', type: 'rental' },
    concrete_pumps: { ar: 'مضخات خرسانة', en: 'Concrete Pumps', type: 'rental' },
    generators: { ar: 'مولدات كهربائية', en: 'Generators', type: 'rental' },
    compressors: { ar: 'ضواغط هواء', en: 'Compressors', type: 'rental' },
    welding_machines: { ar: 'ماكينات لحام', en: 'Welding Machines', type: 'rental' },
    cutting_machines: { ar: 'ماكينات قطع', en: 'Cutting Machines', type: 'rental' },
    water_pumps: { ar: 'مضخات مياه', en: 'Water Pumps', type: 'rental' },
    containers: { ar: 'حاويات ومستودعات', en: 'Containers & Storage', type: 'rental' },
    site_offices: { ar: 'مكاتب موقع', en: 'Site Offices', type: 'rental' },
    portable_toilets: { ar: 'حمامات متنقلة', en: 'Portable Toilets', type: 'rental' },
    other: { ar: 'أخرى', en: 'Other', type: 'both' }
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
            source: product.source || 'supplier', // الافتراضي مورد
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
                // منتجات بيع
                {
                    supplierId: 'sample-2',
                    name: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' },
                    category: 'steel',
                    productType: 'sale',
                    price: 3200,
                    unitType: 'ton',
                    unit: 'طن',
                    stock: 150,
                    status: 'active',
                    approvalStatus: 'approved',
                    source: 'system'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'اسمنت بورتلاندي', en: 'Portland Cement' },
                    category: 'cement',
                    productType: 'sale',
                    price: 18,
                    unitType: 'bag',
                    unit: 'كيس',
                    stock: 5000,
                    status: 'active',
                    approvalStatus: 'approved',
                    source: 'system'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tiles 60x60' },
                    category: 'tiles',
                    productType: 'sale',
                    price: 45,
                    unitType: 'sqm',
                    unit: 'م²',
                    stock: 800,
                    status: 'active',
                    approvalStatus: 'pending',
                    source: 'system'
                },
                // منتجات تأجير
                {
                    supplierId: 'sample-2',
                    name: { ar: 'سقالات معدنية', en: 'Metal Scaffolding' },
                    category: 'scaffolding',
                    productType: 'rental',
                    price: 50,
                    unitType: 'meter',
                    unit: 'متر طولي',
                    stock: 500,
                    status: 'active',
                    approvalStatus: 'approved',
                    rentalPeriod: 'daily',
                    minRentalDuration: 7,
                    depositAmount: 1000,
                    source: 'system'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'رافعة برجية 40 متر', en: 'Tower Crane 40m' },
                    category: 'cranes',
                    productType: 'rental',
                    price: 5000,
                    unitType: 'piece',
                    unit: 'وحدة',
                    stock: 3,
                    status: 'active',
                    approvalStatus: 'approved',
                    rentalPeriod: 'monthly',
                    minRentalDuration: 3,
                    depositAmount: 50000,
                    source: 'system'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'مولد كهربائي 100 كيلو واط', en: 'Generator 100KW' },
                    category: 'generators',
                    productType: 'rental',
                    price: 500,
                    unitType: 'piece',
                    unit: 'وحدة',
                    stock: 10,
                    status: 'active',
                    approvalStatus: 'pending',
                    rentalPeriod: 'daily',
                    minRentalDuration: 1,
                    depositAmount: 5000,
                    source: 'system'
                },
                {
                    supplierId: 'sample-2',
                    name: { ar: 'خلاطة خرسانة', en: 'Concrete Mixer' },
                    category: 'concrete_mixers',
                    productType: 'rental',
                    price: 300,
                    unitType: 'piece',
                    unit: 'وحدة',
                    stock: 8,
                    status: 'active',
                    approvalStatus: 'approved',
                    rentalPeriod: 'daily',
                    minRentalDuration: 1,
                    source: 'system'
                }
            ];

            for (const product of sampleProducts) {
                this.addProduct(product);
            }
        }
    }
}

export const supplierService = new SupplierService();
