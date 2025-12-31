/**
 * خدمة المحاسبة الشاملة
 * Comprehensive Accounting Service
 */

// ====================== أنواع البيانات ======================

// حالة الفاتورة
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

// نوع القيد
export type LedgerType = 'debit' | 'credit';

// نوع الاشتراك
export type SubscriptionPlan = 'free' | 'professional' | 'enterprise';

// حالة الاشتراك
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'pending_approval' | 'rejected';

// طريقة الدفع
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'mada' | 'stc_pay' | 'apple_pay';

// حالة الدفع
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// نوع المستخدم
export type UserType = 'individual' | 'company' | 'supplier';

// الفاتورة
export interface Invoice {
    id: string;
    invoiceNumber: string;      // رقم الفاتورة
    customerId: string;         // معرف العميل
    customerName: string;       // اسم العميل
    customerEmail?: string;     // بريد العميل
    customerPhone?: string;     // هاتف العميل

    items: InvoiceItem[];       // بنود الفاتورة
    subtotal: number;           // المجموع الفرعي
    tax: number;                // الضريبة (15%)
    discount: number;           // الخصم
    total: number;              // الإجمالي

    status: InvoiceStatus;      // حالة الفاتورة
    dueDate: string;            // تاريخ الاستحقاق
    issueDate: string;          // تاريخ الإصدار
    paidDate?: string;          // تاريخ الدفع

    notes?: string;             // ملاحظات
    createdBy: string;          // منشئ الفاتورة
    createdAt: string;
}

// بند الفاتورة
export interface InvoiceItem {
    id: string;
    description: string;        // الوصف
    quantity: number;           // الكمية
    unitPrice: number;          // سعر الوحدة
    total: number;              // الإجمالي
}

// قيد الحساب (دائن/مدين)
export interface LedgerEntry {
    id: string;
    date: string;               // التاريخ
    description: string;        // الوصف
    type: LedgerType;           // نوع القيد (دائن/مدين)
    amount: number;             // المبلغ
    balance: number;            // الرصيد بعد القيد
    reference?: string;         // المرجع (رقم فاتورة مثلاً)
    category: string;           // التصنيف
    createdBy: string;          // منشئ القيد
    createdAt: string;
}

// الاشتراك
export interface Subscription {
    id: string;
    userId: string;             // معرف المستخدم
    userName: string;           // اسم المستخدم
    userEmail: string;          // بريد المستخدم
    userPhone?: string;         // هاتف المستخدم
    userType: UserType;         // نوع المستخدم (فرد/شركة/مورد)
    companyName?: string;       // اسم الشركة (للشركات والموردين)

    plan: SubscriptionPlan;     // نوع الباقة
    status: SubscriptionStatus; // حالة الاشتراك

    startDate: string;          // تاريخ البدء
    endDate: string;            // تاريخ الانتهاء

    amount: number;             // المبلغ
    autoRenew: boolean;         // تجديد تلقائي

    // حقول الموافقة
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;        // تمت الموافقة بواسطة
    approvedAt?: string;        // تاريخ الموافقة
    rejectionReason?: string;   // سبب الرفض

    paymentHistory: string[];   // معرفات المدفوعات
    createdAt: string;
}

// الدفعة
export interface Payment {
    id: string;
    invoiceId?: string;         // معرف الفاتورة
    subscriptionId?: string;    // معرف الاشتراك

    amount: number;             // المبلغ
    method: PaymentMethod;      // طريقة الدفع
    status: PaymentStatus;      // حالة الدفع

    transactionRef?: string;    // رقم المرجع/العملية
    date: string;               // تاريخ الدفع

    customerName: string;       // اسم العميل
    notes?: string;             // ملاحظات

    verifiedBy?: string;        // تم التحقق بواسطة
    verifiedAt?: string;        // تاريخ التحقق

    createdBy: string;
    createdAt: string;
}

// العميل (Client)
export interface Client {
    id: string;
    name: string;               // اسم العميل
    email: string;              // البريد الإلكتروني
    phone: string;              // رقم الهاتف
    type: UserType;             // نوع العميل
    companyName?: string;       // اسم الشركة (للشركات والموردين)

    // الحساب المالي
    totalPaid: number;          // إجمالي المدفوع
    totalDue: number;           // إجمالي المستحق
    balance: number;            // الرصيد (موجب = دائن، سالب = مدين)

    // الاشتراكات والفواتير والمدفوعات المرتبطة
    subscriptionIds: string[];
    invoiceIds: string[];
    paymentIds: string[];

    createdAt: string;
    updatedAt: string;
}

// ملخص مالي للعميل
export interface ClientFinancialSummary {
    totalPaid: number;          // إجمالي ما دفعه
    totalDue: number;           // إجمالي المطلوب منه
    balance: number;            // الرصيد
    debit: number;              // المدين (ما عليه)
    credit: number;             // الدائن (ما له)
    subscriptions: Subscription[];
    invoices: Invoice[];
    payments: Payment[];
}

// ====================== الترجمات ======================

export const INVOICE_STATUS_TRANSLATIONS: Record<InvoiceStatus, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' },
    pending: { ar: 'معلقة', en: 'Pending' },
    paid: { ar: 'مدفوعة', en: 'Paid' },
    overdue: { ar: 'متأخرة', en: 'Overdue' },
    cancelled: { ar: 'ملغاة', en: 'Cancelled' }
};

export const LEDGER_TYPE_TRANSLATIONS: Record<LedgerType, { ar: string; en: string }> = {
    debit: { ar: 'مدين', en: 'Debit' },
    credit: { ar: 'دائن', en: 'Credit' }
};

export const SUBSCRIPTION_PLAN_TRANSLATIONS: Record<SubscriptionPlan, { ar: string; en: string; price: number }> = {
    free: { ar: 'مجانية', en: 'Free', price: 0 },
    professional: { ar: 'احترافية', en: 'Professional', price: 299 },
    enterprise: { ar: 'مؤسسية', en: 'Enterprise', price: 999 }
};

export const SUBSCRIPTION_STATUS_TRANSLATIONS: Record<SubscriptionStatus, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    expired: { ar: 'منتهي', en: 'Expired' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    pending: { ar: 'معلق', en: 'Pending' },
    pending_approval: { ar: 'بانتظار الموافقة', en: 'Pending Approval' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }
};

export const USER_TYPE_TRANSLATIONS: Record<UserType, { ar: string; en: string }> = {
    individual: { ar: 'فرد', en: 'Individual' },
    company: { ar: 'شركة', en: 'Company' },
    supplier: { ar: 'مورد', en: 'Supplier' }
};

export const PAYMENT_METHOD_TRANSLATIONS: Record<PaymentMethod, { ar: string; en: string }> = {
    cash: { ar: 'نقدي', en: 'Cash' },
    bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
    credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
    mada: { ar: 'مدى', en: 'Mada' },
    stc_pay: { ar: 'STC Pay', en: 'STC Pay' },
    apple_pay: { ar: 'Apple Pay', en: 'Apple Pay' }
};

export const PAYMENT_STATUS_TRANSLATIONS: Record<PaymentStatus, { ar: string; en: string }> = {
    pending: { ar: 'معلق', en: 'Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    failed: { ar: 'فشل', en: 'Failed' },
    refunded: { ar: 'مسترد', en: 'Refunded' }
};

// ====================== خدمة المحاسبة ======================

class AccountingService {
    private invoicesKey = 'arba_invoices';
    private ledgerKey = 'arba_ledger';
    private subscriptionsKey = 'arba_subscriptions';
    private paymentsKey = 'arba_payments';

    // =================== الفواتير ===================

    getInvoices(): Invoice[] {
        const data = localStorage.getItem(this.invoicesKey);
        return data ? JSON.parse(data) : [];
    }

    private saveInvoices(invoices: Invoice[]): void {
        localStorage.setItem(this.invoicesKey, JSON.stringify(invoices));
    }

    getInvoiceById(id: string): Invoice | null {
        return this.getInvoices().find(i => i.id === id) || null;
    }

    generateInvoiceNumber(): string {
        const year = new Date().getFullYear();
        const invoices = this.getInvoices();
        const count = invoices.filter(i => i.invoiceNumber.startsWith(`INV-${year}`)).length + 1;
        return `INV-${year}-${count.toString().padStart(5, '0')}`;
    }

    createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>): Invoice {
        const invoices = this.getInvoices();

        const newInvoice: Invoice = {
            ...invoice,
            id: crypto.randomUUID(),
            invoiceNumber: this.generateInvoiceNumber(),
            createdAt: new Date().toISOString()
        };

        invoices.push(newInvoice);
        this.saveInvoices(invoices);

        // إضافة قيد دائن
        this.addLedgerEntry({
            description: `فاتورة ${newInvoice.invoiceNumber} - ${newInvoice.customerName}`,
            type: 'credit',
            amount: newInvoice.total,
            reference: newInvoice.invoiceNumber,
            category: 'مبيعات',
            createdBy: newInvoice.createdBy
        });

        return newInvoice;
    }

    updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(i => i.id === id);
        if (index === -1) return null;

        invoices[index] = { ...invoices[index], ...updates };
        this.saveInvoices(invoices);
        return invoices[index];
    }

    markInvoiceAsPaid(id: string): Invoice | null {
        return this.updateInvoice(id, {
            status: 'paid',
            paidDate: new Date().toISOString()
        });
    }

    deleteInvoice(id: string): boolean {
        const invoices = this.getInvoices();
        const filtered = invoices.filter(i => i.id !== id);
        if (filtered.length === invoices.length) return false;
        this.saveInvoices(filtered);
        return true;
    }

    // =================== سجل القيود ===================

    getLedgerEntries(): LedgerEntry[] {
        const data = localStorage.getItem(this.ledgerKey);
        return data ? JSON.parse(data) : [];
    }

    private saveLedgerEntries(entries: LedgerEntry[]): void {
        localStorage.setItem(this.ledgerKey, JSON.stringify(entries));
    }

    getCurrentBalance(): number {
        const entries = this.getLedgerEntries();
        if (entries.length === 0) return 0;
        return entries[entries.length - 1].balance;
    }

    addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'date' | 'balance' | 'createdAt'>): LedgerEntry {
        const entries = this.getLedgerEntries();
        const currentBalance = this.getCurrentBalance();

        const newBalance = entry.type === 'credit'
            ? currentBalance + entry.amount
            : currentBalance - entry.amount;

        const newEntry: LedgerEntry = {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString().split('T')[0],
            balance: newBalance,
            createdAt: new Date().toISOString()
        };

        entries.push(newEntry);
        this.saveLedgerEntries(entries);
        return newEntry;
    }

    getLedgerByDateRange(startDate: string, endDate: string): LedgerEntry[] {
        return this.getLedgerEntries().filter(e =>
            e.date >= startDate && e.date <= endDate
        );
    }

    // =================== الاشتراكات ===================

    getSubscriptions(): Subscription[] {
        const data = localStorage.getItem(this.subscriptionsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveSubscriptions(subs: Subscription[]): void {
        localStorage.setItem(this.subscriptionsKey, JSON.stringify(subs));
    }

    createSubscription(sub: Omit<Subscription, 'id' | 'createdAt' | 'paymentHistory'>): Subscription {
        const subs = this.getSubscriptions();

        const newSub: Subscription = {
            ...sub,
            id: crypto.randomUUID(),
            paymentHistory: [],
            createdAt: new Date().toISOString()
        };

        subs.push(newSub);
        this.saveSubscriptions(subs);
        return newSub;
    }

    updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
        const subs = this.getSubscriptions();
        const index = subs.findIndex(s => s.id === id);
        if (index === -1) return null;

        subs[index] = { ...subs[index], ...updates };
        this.saveSubscriptions(subs);
        return subs[index];
    }

    renewSubscription(id: string, months: number = 1): Subscription | null {
        const sub = this.getSubscriptions().find(s => s.id === id);
        if (!sub) return null;

        const currentEnd = new Date(sub.endDate);
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + months);

        return this.updateSubscription(id, {
            endDate: newEnd.toISOString().split('T')[0],
            status: 'active'
        });
    }

    // الحصول على الاشتراكات المعلقة بانتظار الموافقة
    getPendingApprovalSubscriptions(): Subscription[] {
        return this.getSubscriptions().filter(s => s.approvalStatus === 'pending');
    }

    // موافقة المدير العام على الاشتراك
    approveSubscription(id: string, approvedBy: string): Subscription | null {
        const sub = this.getSubscriptions().find(s => s.id === id);
        if (!sub || sub.approvalStatus !== 'pending') return null;

        return this.updateSubscription(id, {
            status: 'active',
            approvalStatus: 'approved',
            approvedBy,
            approvedAt: new Date().toISOString()
        });
    }

    // رفض المدير العام للاشتراك
    rejectSubscription(id: string, rejectedBy: string, reason: string): Subscription | null {
        const sub = this.getSubscriptions().find(s => s.id === id);
        if (!sub || sub.approvalStatus !== 'pending') return null;

        return this.updateSubscription(id, {
            status: 'rejected',
            approvalStatus: 'rejected',
            approvedBy: rejectedBy,
            approvedAt: new Date().toISOString(),
            rejectionReason: reason
        });
    }

    // =================== المدفوعات ===================

    getPayments(): Payment[] {
        const data = localStorage.getItem(this.paymentsKey);
        return data ? JSON.parse(data) : [];
    }

    private savePayments(payments: Payment[]): void {
        localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
    }

    recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
        const payments = this.getPayments();

        const newPayment: Payment = {
            ...payment,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        payments.push(newPayment);
        this.savePayments(payments);

        // تحديث الفاتورة إذا وجدت
        if (payment.invoiceId && payment.status === 'completed') {
            this.markInvoiceAsPaid(payment.invoiceId);
        }

        // تحديث الاشتراك إذا وجد
        if (payment.subscriptionId && payment.status === 'completed') {
            const sub = this.getSubscriptions().find(s => s.id === payment.subscriptionId);
            if (sub) {
                this.updateSubscription(payment.subscriptionId, {
                    paymentHistory: [...sub.paymentHistory, newPayment.id]
                });
            }
        }

        // إضافة قيد مدين (استلام مبلغ)
        if (payment.status === 'completed') {
            this.addLedgerEntry({
                description: `دفعة من ${payment.customerName}`,
                type: 'debit',
                amount: payment.amount,
                reference: payment.transactionRef || newPayment.id,
                category: 'مدفوعات',
                createdBy: payment.createdBy
            });
        }

        return newPayment;
    }

    verifyPayment(id: string, verifiedBy: string): Payment | null {
        const payments = this.getPayments();
        const index = payments.findIndex(p => p.id === id);
        if (index === -1) return null;

        payments[index] = {
            ...payments[index],
            status: 'completed',
            verifiedBy,
            verifiedAt: new Date().toISOString()
        };

        this.savePayments(payments);

        // تحديث الفاتورة والقيود
        if (payments[index].invoiceId) {
            this.markInvoiceAsPaid(payments[index].invoiceId!);
        }

        return payments[index];
    }

    // =================== الإحصائيات ===================

    getFinancialStats(month?: string): {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        pendingInvoices: number;
        paidInvoices: number;
        overdueInvoices: number;
        activeSubscriptions: number;
        pendingPayments: number;
    } {
        const invoices = this.getInvoices();
        const ledger = this.getLedgerEntries();
        const subs = this.getSubscriptions();
        const payments = this.getPayments();

        const currentMonth = month || new Date().toISOString().slice(0, 7);
        const monthlyLedger = ledger.filter(e => e.date.startsWith(currentMonth));
        const monthlyInvoices = invoices.filter(i => i.issueDate.startsWith(currentMonth));

        const totalRevenue = monthlyLedger
            .filter(e => e.type === 'credit')
            .reduce((sum, e) => sum + e.amount, 0);

        const totalExpenses = monthlyLedger
            .filter(e => e.type === 'debit' && e.category === 'مصروفات')
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            pendingInvoices: invoices.filter(i => i.status === 'pending').length,
            paidInvoices: invoices.filter(i => i.status === 'paid').length,
            overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
            activeSubscriptions: subs.filter(s => s.status === 'active').length,
            pendingPayments: payments.filter(p => p.status === 'pending').length
        };
    }

    // =================== بيانات تجريبية ===================

    initializeSampleData(): void {
        // فواتير تجريبية
        if (this.getInvoices().length === 0) {
            const sampleInvoices: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>[] = [
                {
                    customerId: 'c1',
                    customerName: 'شركة التقنية المتقدمة',
                    customerEmail: 'info@tech-adv.com',
                    customerPhone: '0501234567',
                    items: [
                        { id: '1', description: 'اشتراك سنوي - باقة احترافية', quantity: 1, unitPrice: 3588, total: 3588 }
                    ],
                    subtotal: 3588,
                    tax: 538.2,
                    discount: 0,
                    total: 4126.2,
                    status: 'paid',
                    dueDate: '2025-01-15',
                    issueDate: '2024-12-15',
                    paidDate: '2024-12-20',
                    createdBy: 'النظام'
                },
                {
                    customerId: 'c2',
                    customerName: 'مؤسسة البناء الحديث',
                    customerEmail: 'contact@modern-build.sa',
                    customerPhone: '0559876543',
                    items: [
                        { id: '1', description: 'اشتراك شهري - باقة مؤسسية', quantity: 1, unitPrice: 999, total: 999 }
                    ],
                    subtotal: 999,
                    tax: 149.85,
                    discount: 0,
                    total: 1148.85,
                    status: 'pending',
                    dueDate: '2025-01-05',
                    issueDate: '2024-12-25',
                    createdBy: 'النظام'
                }
            ];

            sampleInvoices.forEach(inv => this.createInvoice(inv));
        }

        // اشتراكات تجريبية
        if (this.getSubscriptions().length === 0) {
            const sampleSubs: Omit<Subscription, 'id' | 'createdAt' | 'paymentHistory'>[] = [
                {
                    userId: 'u1',
                    userName: 'أحمد محمد',
                    userEmail: 'ahmed@example.com',
                    userType: 'individual',
                    plan: 'professional',
                    status: 'active',
                    startDate: '2024-12-01',
                    endDate: '2025-12-01',
                    amount: 3588,
                    autoRenew: true,
                    approvalStatus: 'approved',
                    approvedBy: 'المدير العام',
                    approvedAt: '2024-12-01'
                },
                {
                    userId: 'u2',
                    userName: 'فاطمة علي',
                    userEmail: 'fatima@example.com',
                    userType: 'company',
                    companyName: 'شركة التقنية',
                    plan: 'enterprise',
                    status: 'active',
                    startDate: '2024-11-15',
                    endDate: '2025-11-15',
                    amount: 11988,
                    autoRenew: false,
                    approvalStatus: 'approved',
                    approvedBy: 'المدير العام',
                    approvedAt: '2024-11-15'
                },
                {
                    userId: 'u3',
                    userName: 'خالد سعد',
                    userEmail: 'khaled@example.com',
                    userType: 'individual',
                    plan: 'free',
                    status: 'pending_approval',
                    startDate: '2024-12-20',
                    endDate: '2099-12-31',
                    amount: 0,
                    autoRenew: false,
                    approvalStatus: 'pending'
                },
                {
                    userId: 'u4',
                    userName: 'مؤسسة البناء الحديث',
                    userEmail: 'info@modern-build.sa',
                    userType: 'supplier',
                    companyName: 'مؤسسة البناء الحديث',
                    plan: 'professional',
                    status: 'pending_approval',
                    startDate: '2024-12-28',
                    endDate: '2025-12-28',
                    amount: 3588,
                    autoRenew: true,
                    approvalStatus: 'pending'
                }
            ];

            sampleSubs.forEach(sub => this.createSubscription(sub));
        }

        // مزامنة العملاء من الاشتراكات الموجودة
        this.syncClientsFromSubscriptions();
    }

    // =================== إدارة العملاء ===================

    private clientsKey = 'arba_clients';

    getClients(): Client[] {
        const data = localStorage.getItem(this.clientsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveClients(clients: Client[]): void {
        localStorage.setItem(this.clientsKey, JSON.stringify(clients));
    }

    getClientById(id: string): Client | null {
        return this.getClients().find(c => c.id === id) || null;
    }

    getClientByEmail(email: string): Client | null {
        return this.getClients().find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
    }

    // البحث في العملاء
    searchClients(query: string): Client[] {
        const lowerQuery = query.toLowerCase();
        return this.getClients().filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.email.toLowerCase().includes(lowerQuery) ||
            c.phone.includes(query) ||
            (c.companyName && c.companyName.toLowerCase().includes(lowerQuery))
        );
    }

    // إنشاء عميل جديد
    createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'totalPaid' | 'totalDue' | 'balance' | 'subscriptionIds' | 'invoiceIds' | 'paymentIds'>): Client {
        const clients = this.getClients();

        // التحقق من عدم وجود العميل
        if (clients.some(c => c.email.toLowerCase() === client.email.toLowerCase())) {
            // إعادة العميل الموجود
            return clients.find(c => c.email.toLowerCase() === client.email.toLowerCase())!;
        }

        const newClient: Client = {
            ...client,
            id: crypto.randomUUID(),
            totalPaid: 0,
            totalDue: 0,
            balance: 0,
            subscriptionIds: [],
            invoiceIds: [],
            paymentIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        clients.push(newClient);
        this.saveClients(clients);
        return newClient;
    }

    // تحديث بيانات العميل
    updateClient(id: string, updates: Partial<Client>): Client | null {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index === -1) return null;

        clients[index] = {
            ...clients[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveClients(clients);
        return clients[index];
    }

    // تحديث رصيد العميل
    updateClientBalance(clientId: string): Client | null {
        const client = this.getClientById(clientId);
        if (!client) return null;

        // حساب المدفوعات
        const payments = this.getPayments().filter(p => client.paymentIds.includes(p.id) && p.status === 'completed');
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        // حساب المستحق من الاشتراكات والفواتير
        const subscriptions = this.getSubscriptions().filter(s => client.subscriptionIds.includes(s.id));
        const invoices = this.getInvoices().filter(i => client.invoiceIds.includes(i.id));
        const subDue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
        const invDue = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.total, 0);
        const totalDue = subDue + invDue;

        const balance = totalPaid - totalDue;

        return this.updateClient(clientId, { totalPaid, totalDue, balance });
    }

    // الحصول على ملخص مالي للعميل
    getClientFinancialSummary(clientId: string): ClientFinancialSummary | null {
        const client = this.getClientById(clientId);
        if (!client) return null;

        const subscriptions = this.getSubscriptions().filter(s => client.subscriptionIds.includes(s.id));
        const invoices = this.getInvoices().filter(i => client.invoiceIds.includes(i.id));
        const payments = this.getPayments().filter(p => client.paymentIds.includes(p.id));

        const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
        const subDue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
        const invDue = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').reduce((sum, i) => sum + i.total, 0);
        const totalDue = subDue + invDue;
        const balance = totalPaid - totalDue;

        return {
            totalPaid,
            totalDue,
            balance,
            debit: balance < 0 ? Math.abs(balance) : 0,  // ما عليه
            credit: balance > 0 ? balance : 0,           // ما له
            subscriptions,
            invoices,
            payments
        };
    }

    // ربط اشتراك بالعميل
    linkSubscriptionToClient(clientId: string, subscriptionId: string): Client | null {
        const client = this.getClientById(clientId);
        if (!client) return null;

        if (!client.subscriptionIds.includes(subscriptionId)) {
            const updated = this.updateClient(clientId, {
                subscriptionIds: [...client.subscriptionIds, subscriptionId]
            });
            this.updateClientBalance(clientId);
            return updated;
        }
        return client;
    }

    // ربط فاتورة بالعميل
    linkInvoiceToClient(clientId: string, invoiceId: string): Client | null {
        const client = this.getClientById(clientId);
        if (!client) return null;

        if (!client.invoiceIds.includes(invoiceId)) {
            const updated = this.updateClient(clientId, {
                invoiceIds: [...client.invoiceIds, invoiceId]
            });
            this.updateClientBalance(clientId);
            return updated;
        }
        return client;
    }

    // ربط دفعة بالعميل
    linkPaymentToClient(clientId: string, paymentId: string): Client | null {
        const client = this.getClientById(clientId);
        if (!client) return null;

        if (!client.paymentIds.includes(paymentId)) {
            const updated = this.updateClient(clientId, {
                paymentIds: [...client.paymentIds, paymentId]
            });
            this.updateClientBalance(clientId);
            return updated;
        }
        return client;
    }

    // مزامنة العملاء من الاشتراكات الموجودة
    syncClientsFromSubscriptions(): void {
        const subscriptions = this.getSubscriptions();

        subscriptions.forEach(sub => {
            let client = this.getClientByEmail(sub.userEmail);

            if (!client) {
                // إنشاء عميل جديد من الاشتراك
                client = this.createClient({
                    name: sub.userName,
                    email: sub.userEmail,
                    phone: sub.userPhone || '',
                    type: sub.userType,
                    companyName: sub.companyName
                });
            }

            // ربط الاشتراك بالعميل
            this.linkSubscriptionToClient(client.id, sub.id);
        });

        // مزامنة الفواتير
        const invoices = this.getInvoices();
        invoices.forEach(inv => {
            if (inv.customerEmail) {
                let client = this.getClientByEmail(inv.customerEmail);
                if (client) {
                    this.linkInvoiceToClient(client.id, inv.id);
                }
            }
        });

        // مزامنة المدفوعات
        const payments = this.getPayments();
        payments.forEach(payment => {
            // البحث عن العميل بالاسم
            const client = this.getClients().find(c =>
                c.name === payment.customerName ||
                c.name.includes(payment.customerName) ||
                payment.customerName.includes(c.name)
            );
            if (client) {
                this.linkPaymentToClient(client.id, payment.id);
            }
        });
    }

    // الحصول على العميل من الاشتراك
    getClientFromSubscription(subscriptionId: string): Client | null {
        const clients = this.getClients();
        return clients.find(c => c.subscriptionIds.includes(subscriptionId)) || null;
    }
}

export const accountingService = new AccountingService();
export default accountingService;
