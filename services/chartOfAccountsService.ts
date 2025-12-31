/**
 * خدمة شجرة الحسابات والقيود المحاسبية
 * Chart of Accounts & Journal Entries Service
 */

// ====================== أنواع البيانات ======================

// نوع الحساب
export type AccountType = 'asset' | 'liability' | 'revenue' | 'expense' | 'equity';

// مصدر القيد
export type JournalSourceType = 'subscription' | 'sale' | 'purchase' | 'payroll' | 'collection' | 'payment' | 'manual';

// الحساب المحاسبي
export interface Account {
    code: string;              // كود الحساب (1101, 110201, etc.)
    name: string;              // اسم الحساب بالعربية
    nameEn: string;            // اسم الحساب بالإنجليزية
    type: AccountType;         // نوع الحساب
    parentCode?: string;       // كود الحساب الأب
    balance: number;           // الرصيد الحالي
    isSubLedger: boolean;      // هل يرتبط بحسابات فرعية؟
    linkedEntityType?: 'client' | 'supplier' | 'employee';
    isActive: boolean;
    createdAt: string;
}

// سطر القيد المحاسبي
export interface JournalLine {
    accountCode: string;       // كود الحساب
    accountName?: string;      // اسم الحساب (للعرض)
    debit: number;             // مدين
    credit: number;            // دائن
    entityId?: string;         // معرف الطرف المرتبط (عميل/مورد/موظف)
    entityName?: string;       // اسم الطرف
}

// القيد المحاسبي
export interface JournalEntry {
    id: string;
    entryNumber: string;       // رقم القيد (JE-2025-00001)
    date: string;              // التاريخ
    description: string;       // الوصف
    lines: JournalLine[];      // أسطر القيد
    totalDebit: number;        // إجمالي المدين
    totalCredit: number;       // إجمالي الدائن
    isBalanced: boolean;       // هل القيد متوازن؟
    reference?: string;        // المرجع (رقم فاتورة/اشتراك)
    sourceType: JournalSourceType;
    sourceId?: string;         // معرف المصدر
    linkedSupplierId?: string; // معرف المورد المرتبط (للوساطة)
    createdBy: string;
    createdAt: string;
    isPosted: boolean;         // هل تم ترحيله؟
    postedAt?: string;
}

// طلب إنشاء قيد تلقائي
export interface AutoJournalRequest {
    type: JournalSourceType;
    amount: number;
    amountBeforeTax?: number;  // المبلغ قبل الضريبة
    taxAmount?: number;        // قيمة الضريبة
    entityId?: string;
    entityName?: string;
    description: string;
    reference?: string;
    sourceId?: string;
    linkedSupplierId?: string;
    linkedSupplierName?: string;
    supplierAmount?: number;   // مبلغ المورد (للوساطة)
    createdBy: string;
}

// كشف حساب
export interface AccountStatement {
    account: Account;
    entries: {
        date: string;
        description: string;
        reference?: string;
        debit: number;
        credit: number;
        balance: number;
    }[];
    openingBalance: number;
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
}

// ميزان المراجعة
export interface TrialBalance {
    date: string;
    accounts: {
        code: string;
        name: string;
        type: AccountType;
        debit: number;
        credit: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
}

// قائمة الدخل
export interface IncomeStatement {
    period: { from: string; to: string };
    subscriptionRevenue: number;      // إيراد الاشتراكات
    salesRevenue: number;             // إيراد المبيعات
    totalRevenue: number;
    costOfGoodsSold: number;          // تكلفة البضاعة المباعة
    salaryExpense: number;            // مصروف الرواتب
    otherExpenses: number;            // مصروفات أخرى
    totalExpenses: number;
    grossProfit: number;              // مجمل الربح (المبيعات - التكلفة)
    netProfit: number;                // صافي الربح
    subscriptionProfit: number;       // ربح قطاع الاشتراكات
    mediationProfit: number;          // ربح قطاع الوساطة
}

// ====================== الترجمات ======================

export const ACCOUNT_TYPE_TRANSLATIONS: Record<AccountType, { ar: string; en: string }> = {
    asset: { ar: 'أصول', en: 'Assets' },
    liability: { ar: 'التزامات', en: 'Liabilities' },
    revenue: { ar: 'إيرادات', en: 'Revenue' },
    expense: { ar: 'مصروفات', en: 'Expenses' },
    equity: { ar: 'حقوق ملكية', en: 'Equity' }
};

export const JOURNAL_SOURCE_TRANSLATIONS: Record<JournalSourceType, { ar: string; en: string }> = {
    subscription: { ar: 'اشتراك', en: 'Subscription' },
    sale: { ar: 'مبيعات', en: 'Sale' },
    purchase: { ar: 'مشتريات', en: 'Purchase' },
    payroll: { ar: 'رواتب', en: 'Payroll' },
    collection: { ar: 'تحصيل', en: 'Collection' },
    payment: { ar: 'صرف', en: 'Payment' },
    manual: { ar: 'يدوي', en: 'Manual' }
};

// ====================== أكواد الحسابات ======================

export const ACCOUNT_CODES = {
    // الأصول
    BANK: '1101',
    SUBSCRIPTION_RECEIVABLES: '110201',
    SALES_RECEIVABLES: '110202',
    INPUT_VAT: '1103',

    // الالتزامات
    SUPPLIERS_PAYABLE: '2101',
    OUTPUT_VAT: '2102',
    EMPLOYEE_LIABILITIES: '2103',

    // الإيرادات
    SUBSCRIPTION_REVENUE: '4101',
    SALES_REVENUE: '4201',

    // المصروفات
    COST_OF_GOODS_SOLD: '5101',
    SALARY_EXPENSE: '5201'
};

// نسبة الضريبة
export const VAT_RATE = 0.15;

// ====================== خدمة شجرة الحسابات ======================

class ChartOfAccountsService {
    private accountsKey = 'arba_chart_of_accounts';
    private journalKey = 'arba_journal_entries';

    // =================== الحسابات ===================

    getAccounts(): Account[] {
        const data = localStorage.getItem(this.accountsKey);
        return data ? JSON.parse(data) : [];
    }

    private saveAccounts(accounts: Account[]): void {
        localStorage.setItem(this.accountsKey, JSON.stringify(accounts));
    }

    getAccountByCode(code: string): Account | null {
        return this.getAccounts().find(a => a.code === code) || null;
    }

    getAccountsByType(type: AccountType): Account[] {
        return this.getAccounts().filter(a => a.type === type);
    }

    getChildAccounts(parentCode: string): Account[] {
        return this.getAccounts().filter(a => a.parentCode === parentCode);
    }

    createAccount(account: Omit<Account, 'balance' | 'isActive' | 'createdAt'>): Account {
        const accounts = this.getAccounts();

        // التحقق من عدم وجود الكود
        if (accounts.some(a => a.code === account.code)) {
            throw new Error(`الحساب ${account.code} موجود بالفعل`);
        }

        const newAccount: Account = {
            ...account,
            balance: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        accounts.push(newAccount);
        this.saveAccounts(accounts);
        return newAccount;
    }

    updateAccountBalance(code: string, amount: number, isDebit: boolean): Account | null {
        const accounts = this.getAccounts();
        const index = accounts.findIndex(a => a.code === code);
        if (index === -1) return null;

        const account = accounts[index];

        // قواعد الخصم والإضافة حسب نوع الحساب
        // الأصول والمصروفات: المدين يزيد، الدائن ينقص
        // الالتزامات والإيرادات وحقوق الملكية: الدائن يزيد، المدين ينقص
        if (account.type === 'asset' || account.type === 'expense') {
            account.balance += isDebit ? amount : -amount;
        } else {
            account.balance += isDebit ? -amount : amount;
        }

        accounts[index] = account;
        this.saveAccounts(accounts);
        return account;
    }

    // =================== القيود المحاسبية ===================

    getJournalEntries(): JournalEntry[] {
        const data = localStorage.getItem(this.journalKey);
        return data ? JSON.parse(data) : [];
    }

    private saveJournalEntries(entries: JournalEntry[]): void {
        localStorage.setItem(this.journalKey, JSON.stringify(entries));
    }

    generateEntryNumber(): string {
        const year = new Date().getFullYear();
        const entries = this.getJournalEntries();
        const count = entries.filter(e => e.entryNumber.startsWith(`JE-${year}`)).length + 1;
        return `JE-${year}-${count.toString().padStart(5, '0')}`;
    }

    createJournalEntry(entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'isBalanced' | 'createdAt' | 'isPosted'>): JournalEntry {
        const entries = this.getJournalEntries();

        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

        // إضافة أسماء الحسابات
        const enrichedLines = entry.lines.map(line => ({
            ...line,
            accountName: this.getAccountByCode(line.accountCode)?.name || line.accountCode
        }));

        const newEntry: JournalEntry = {
            ...entry,
            lines: enrichedLines,
            id: crypto.randomUUID(),
            entryNumber: this.generateEntryNumber(),
            totalDebit,
            totalCredit,
            isBalanced,
            createdAt: new Date().toISOString(),
            isPosted: false
        };

        entries.push(newEntry);
        this.saveJournalEntries(entries);
        return newEntry;
    }

    postJournalEntry(id: string): JournalEntry | null {
        const entries = this.getJournalEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index === -1) return null;

        const entry = entries[index];
        if (!entry.isBalanced) {
            throw new Error('لا يمكن ترحيل قيد غير متوازن');
        }

        // تحديث أرصدة الحسابات
        for (const line of entry.lines) {
            if (line.debit > 0) {
                this.updateAccountBalance(line.accountCode, line.debit, true);
            }
            if (line.credit > 0) {
                this.updateAccountBalance(line.accountCode, line.credit, false);
            }
        }

        entries[index] = {
            ...entry,
            isPosted: true,
            postedAt: new Date().toISOString()
        };

        this.saveJournalEntries(entries);
        return entries[index];
    }

    // =================== القيود التلقائية ===================

    /**
     * إنشاء قيد تفعيل اشتراك
     * مدين: مدينو الاشتراكات
     * دائن: إيراد اشتراكات + ضريبة المخرجات
     */
    createSubscriptionActivationEntry(request: AutoJournalRequest): JournalEntry {
        const amountBeforeTax = request.amount / (1 + VAT_RATE);
        const taxAmount = request.amount - amountBeforeTax;

        const entry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: request.description,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.SUBSCRIPTION_RECEIVABLES,
                    debit: request.amount,
                    credit: 0,
                    entityId: request.entityId,
                    entityName: request.entityName
                },
                {
                    accountCode: ACCOUNT_CODES.SUBSCRIPTION_REVENUE,
                    debit: 0,
                    credit: amountBeforeTax,
                },
                {
                    accountCode: ACCOUNT_CODES.OUTPUT_VAT,
                    debit: 0,
                    credit: taxAmount,
                }
            ],
            reference: request.reference,
            sourceType: 'subscription',
            sourceId: request.sourceId,
            createdBy: request.createdBy
        });

        // ترحيل فوري
        this.postJournalEntry(entry.id);
        return entry;
    }

    /**
     * إنشاء قيد تحصيل اشتراك
     * مدين: البنك
     * دائن: مدينو الاشتراكات
     */
    createSubscriptionCollectionEntry(request: AutoJournalRequest): JournalEntry {
        const entry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: request.description,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.BANK,
                    debit: request.amount,
                    credit: 0,
                },
                {
                    accountCode: ACCOUNT_CODES.SUBSCRIPTION_RECEIVABLES,
                    debit: 0,
                    credit: request.amount,
                    entityId: request.entityId,
                    entityName: request.entityName
                }
            ],
            reference: request.reference,
            sourceType: 'collection',
            sourceId: request.sourceId,
            createdBy: request.createdBy
        });

        this.postJournalEntry(entry.id);
        return entry;
    }

    /**
     * إنشاء قيود عملية الوساطة (فاتورة مبيعات + فاتورة مشتريات)
     * يُحسب الربح الصافي تلقائياً
     */
    createMediationEntries(request: AutoJournalRequest): { saleEntry: JournalEntry; purchaseEntry: JournalEntry; profit: number } {
        const saleAmountBeforeTax = request.amount / (1 + VAT_RATE);
        const saleTax = request.amount - saleAmountBeforeTax;

        // قيد فاتورة المبيعات للمشتري
        const saleEntry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `فاتورة مبيعات - ${request.entityName}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.SALES_RECEIVABLES,
                    debit: request.amount,
                    credit: 0,
                    entityId: request.entityId,
                    entityName: request.entityName
                },
                {
                    accountCode: ACCOUNT_CODES.SALES_REVENUE,
                    debit: 0,
                    credit: saleAmountBeforeTax,
                },
                {
                    accountCode: ACCOUNT_CODES.OUTPUT_VAT,
                    debit: 0,
                    credit: saleTax,
                }
            ],
            reference: request.reference,
            sourceType: 'sale',
            sourceId: request.sourceId,
            linkedSupplierId: request.linkedSupplierId,
            createdBy: request.createdBy
        });

        // قيد فاتورة المشتريات من المورد
        const purchaseAmount = request.supplierAmount || 0;
        const purchaseAmountBeforeTax = purchaseAmount / (1 + VAT_RATE);
        const purchaseTax = purchaseAmount - purchaseAmountBeforeTax;

        const purchaseEntry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `فاتورة مشتريات - ${request.linkedSupplierName}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.COST_OF_GOODS_SOLD,
                    debit: purchaseAmountBeforeTax,
                    credit: 0,
                },
                {
                    accountCode: ACCOUNT_CODES.INPUT_VAT,
                    debit: purchaseTax,
                    credit: 0,
                },
                {
                    accountCode: ACCOUNT_CODES.SUPPLIERS_PAYABLE,
                    debit: 0,
                    credit: purchaseAmount,
                    entityId: request.linkedSupplierId,
                    entityName: request.linkedSupplierName
                }
            ],
            reference: request.reference,
            sourceType: 'purchase',
            sourceId: request.sourceId,
            createdBy: request.createdBy
        });

        // ترحيل فوري
        this.postJournalEntry(saleEntry.id);
        this.postJournalEntry(purchaseEntry.id);

        // حساب الربح
        const profit = saleAmountBeforeTax - purchaseAmountBeforeTax;

        return { saleEntry, purchaseEntry, profit };
    }

    /**
     * إنشاء قيد استحقاق رواتب
     * مدين: مصروف الرواتب
     * دائن: مستحقات الموظفين
     */
    createPayrollAccrualEntry(employees: { id: string; name: string; salary: number }[], createdBy: string): JournalEntry {
        const totalSalaries = employees.reduce((sum, emp) => sum + emp.salary, 0);

        const lines: JournalLine[] = [
            {
                accountCode: ACCOUNT_CODES.SALARY_EXPENSE,
                debit: totalSalaries,
                credit: 0,
            }
        ];

        // إضافة سطر لكل موظف
        for (const emp of employees) {
            lines.push({
                accountCode: ACCOUNT_CODES.EMPLOYEE_LIABILITIES,
                debit: 0,
                credit: emp.salary,
                entityId: emp.id,
                entityName: emp.name
            });
        }

        const entry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `استحقاق رواتب شهر ${new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`,
            lines,
            sourceType: 'payroll',
            createdBy
        });

        this.postJournalEntry(entry.id);
        return entry;
    }

    /**
     * إنشاء قيد صرف راتب موظف
     * مدين: مستحقات الموظف
     * دائن: البنك
     */
    createPayrollPaymentEntry(employeeId: string, employeeName: string, amount: number, createdBy: string): JournalEntry {
        const entry = this.createJournalEntry({
            date: new Date().toISOString().split('T')[0],
            description: `صرف راتب - ${employeeName}`,
            lines: [
                {
                    accountCode: ACCOUNT_CODES.EMPLOYEE_LIABILITIES,
                    debit: amount,
                    credit: 0,
                    entityId: employeeId,
                    entityName: employeeName
                },
                {
                    accountCode: ACCOUNT_CODES.BANK,
                    debit: 0,
                    credit: amount,
                }
            ],
            sourceType: 'payment',
            createdBy
        });

        this.postJournalEntry(entry.id);
        return entry;
    }

    // =================== التقارير ===================

    /**
     * ميزان المراجعة
     */
    getTrialBalance(): TrialBalance {
        const accounts = this.getAccounts().filter(a => a.balance !== 0);

        const balanceItems = accounts.map(account => {
            const isDebitNature = account.type === 'asset' || account.type === 'expense';
            return {
                code: account.code,
                name: account.name,
                type: account.type,
                debit: account.balance > 0 && isDebitNature ? account.balance :
                    account.balance < 0 && !isDebitNature ? Math.abs(account.balance) : 0,
                credit: account.balance > 0 && !isDebitNature ? account.balance :
                    account.balance < 0 && isDebitNature ? Math.abs(account.balance) : 0
            };
        });

        const totalDebit = balanceItems.reduce((sum, item) => sum + item.debit, 0);
        const totalCredit = balanceItems.reduce((sum, item) => sum + item.credit, 0);

        return {
            date: new Date().toISOString().split('T')[0],
            accounts: balanceItems,
            totalDebit,
            totalCredit,
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
        };
    }

    /**
     * كشف حساب
     */
    getAccountStatement(accountCode: string, fromDate?: string, toDate?: string): AccountStatement | null {
        const account = this.getAccountByCode(accountCode);
        if (!account) return null;

        let entries = this.getJournalEntries()
            .filter(e => e.isPosted)
            .filter(e => !fromDate || e.date >= fromDate)
            .filter(e => !toDate || e.date <= toDate);

        let balance = 0;
        const statementEntries: AccountStatement['entries'] = [];

        for (const entry of entries) {
            for (const line of entry.lines) {
                if (line.accountCode === accountCode) {
                    const isDebitNature = account.type === 'asset' || account.type === 'expense';
                    if (isDebitNature) {
                        balance += line.debit - line.credit;
                    } else {
                        balance += line.credit - line.debit;
                    }

                    statementEntries.push({
                        date: entry.date,
                        description: entry.description,
                        reference: entry.reference,
                        debit: line.debit,
                        credit: line.credit,
                        balance
                    });
                }
            }
        }

        const totalDebit = statementEntries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = statementEntries.reduce((sum, e) => sum + e.credit, 0);

        return {
            account,
            entries: statementEntries,
            openingBalance: 0,
            closingBalance: balance,
            totalDebit,
            totalCredit
        };
    }

    /**
     * قائمة الدخل
     */
    getIncomeStatement(fromDate: string, toDate: string): IncomeStatement {
        const subscriptionRevenue = this.getAccountByCode(ACCOUNT_CODES.SUBSCRIPTION_REVENUE)?.balance || 0;
        const salesRevenue = this.getAccountByCode(ACCOUNT_CODES.SALES_REVENUE)?.balance || 0;
        const costOfGoodsSold = this.getAccountByCode(ACCOUNT_CODES.COST_OF_GOODS_SOLD)?.balance || 0;
        const salaryExpense = this.getAccountByCode(ACCOUNT_CODES.SALARY_EXPENSE)?.balance || 0;

        const totalRevenue = subscriptionRevenue + salesRevenue;
        const totalExpenses = costOfGoodsSold + salaryExpense;
        const grossProfit = salesRevenue - costOfGoodsSold;
        const netProfit = totalRevenue - totalExpenses;

        return {
            period: { from: fromDate, to: toDate },
            subscriptionRevenue,
            salesRevenue,
            totalRevenue,
            costOfGoodsSold,
            salaryExpense,
            otherExpenses: 0,
            totalExpenses,
            grossProfit,
            netProfit,
            subscriptionProfit: subscriptionRevenue,
            mediationProfit: grossProfit
        };
    }

    // =================== بيانات تجريبية ===================

    initializeDefaultAccounts(): void {
        if (this.getAccounts().length > 0) return;

        const defaultAccounts: Omit<Account, 'balance' | 'isActive' | 'createdAt'>[] = [
            // الأصول
            { code: '1101', name: 'البنك/الصندوق', nameEn: 'Bank/Cash', type: 'asset', isSubLedger: false },
            { code: '110201', name: 'مدينو الاشتراكات', nameEn: 'Subscription Receivables', type: 'asset', parentCode: '1102', isSubLedger: true, linkedEntityType: 'client' },
            { code: '110202', name: 'مدينو المبيعات', nameEn: 'Sales Receivables', type: 'asset', parentCode: '1102', isSubLedger: true, linkedEntityType: 'client' },
            { code: '1103', name: 'ضريبة المدخلات', nameEn: 'Input VAT (15%)', type: 'asset', isSubLedger: false },

            // الالتزامات
            { code: '2101', name: 'الدائنون (الموردون)', nameEn: 'Suppliers Payable', type: 'liability', isSubLedger: true, linkedEntityType: 'supplier' },
            { code: '2102', name: 'ضريبة المخرجات', nameEn: 'Output VAT (15%)', type: 'liability', isSubLedger: false },
            { code: '2103', name: 'مستحقات الموظفين', nameEn: 'Employee Liabilities', type: 'liability', isSubLedger: true, linkedEntityType: 'employee' },

            // الإيرادات
            { code: '4101', name: 'إيراد اشتراكات', nameEn: 'Subscription Revenue', type: 'revenue', isSubLedger: false },
            { code: '4201', name: 'إيراد مبيعات بضاعة', nameEn: 'Sales Revenue', type: 'revenue', isSubLedger: false },

            // المصروفات
            { code: '5101', name: 'تكلفة البضاعة المباعة', nameEn: 'Cost of Goods Sold', type: 'expense', isSubLedger: false },
            { code: '5201', name: 'مصروف الرواتب', nameEn: 'Salary Expense', type: 'expense', isSubLedger: false }
        ];

        for (const account of defaultAccounts) {
            this.createAccount(account);
        }
    }
}

export const chartOfAccountsService = new ChartOfAccountsService();
