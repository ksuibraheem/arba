/**
 * صفحة المحاسب الشاملة
 * Comprehensive Accountant Page
 */

import React, { useState, useEffect } from 'react';
import {
    Calculator, DollarSign, FileText, TrendingUp, PieChart, Receipt,
    Plus, Search, Filter, Eye, Edit2, Trash2, X, Save, Check,
    CreditCard, Calendar, Users, AlertCircle, CheckCircle, Clock,
    Download, Printer, RefreshCw, ArrowUpRight, ArrowDownRight,
    UserPlus, Image, MessageSquare, XCircle, Building2, ExternalLink
} from 'lucide-react';
import { Employee } from '../../../services/employeeService';
import {
    Invoice, InvoiceItem, LedgerEntry, Subscription, Payment,
    InvoiceStatus, LedgerType, PaymentMethod, PaymentStatus, UserType,
    accountingService,
    INVOICE_STATUS_TRANSLATIONS, LEDGER_TYPE_TRANSLATIONS,
    SUBSCRIPTION_PLAN_TRANSLATIONS, SUBSCRIPTION_STATUS_TRANSLATIONS,
    PAYMENT_METHOD_TRANSLATIONS, PAYMENT_STATUS_TRANSLATIONS, USER_TYPE_TRANSLATIONS
} from '../../../services/accountingService';
import {
    registrationService,
    RegistrationRequest,
    REGISTRATION_STATUS_TRANSLATIONS,
    PAYMENT_STATUS_TRANSLATIONS as REG_PAYMENT_STATUS_TRANSLATIONS,
    USER_TYPE_TRANSLATIONS as REG_USER_TYPE_TRANSLATIONS,
    CR_VERIFICATION_URL
} from '../../../services/registrationService';

interface AccountantPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

type TabType = 'overview' | 'invoices' | 'payments' | 'ledger' | 'subscriptions' | 'registrations';

const AccountantPage: React.FC<AccountantPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    // States
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState(accountingService.getFinancialStats());
    const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    // Modal states
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    // Form states
    const [invoiceForm, setInvoiceForm] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
        discount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        invoiceId: '',
        amount: 0,
        method: 'bank_transfer' as PaymentMethod,
        customerName: '',
        transactionRef: '',
        notes: ''
    });

    const [ledgerForm, setLedgerForm] = useState({
        description: '',
        type: 'credit' as LedgerType,
        amount: 0,
        category: '',
        reference: ''
    });

    // Load data
    useEffect(() => {
        accountingService.initializeSampleData();
        registrationService.initializeSampleData();
        loadData();
    }, []);

    const loadData = () => {
        setInvoices(accountingService.getInvoices());
        setLedgerEntries(accountingService.getLedgerEntries());
        setSubscriptions(accountingService.getSubscriptions());
        setPayments(accountingService.getPayments());
        setStats(accountingService.getFinancialStats());
        setRegistrationRequests(registrationService.getPendingRegistrations());
    };

    // Calculate invoice totals
    const calculateInvoiceTotals = () => {
        const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax - invoiceForm.discount;
        return { subtotal, tax, total };
    };

    // Update item total
    const updateItemTotal = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
        const newItems = [...invoiceForm.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            total: field === 'quantity'
                ? value * newItems[index].unitPrice
                : newItems[index].quantity * value
        };
        setInvoiceForm({ ...invoiceForm, items: newItems });
    };

    // Add invoice item
    const addInvoiceItem = () => {
        setInvoiceForm({
            ...invoiceForm,
            items: [...invoiceForm.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, total: 0 }]
        });
    };

    // Remove invoice item
    const removeInvoiceItem = (index: number) => {
        const newItems = invoiceForm.items.filter((_, i) => i !== index);
        setInvoiceForm({ ...invoiceForm, items: newItems });
    };

    // Create invoice
    const handleCreateInvoice = () => {
        const { subtotal, tax, total } = calculateInvoiceTotals();

        accountingService.createInvoice({
            customerId: crypto.randomUUID(),
            customerName: invoiceForm.customerName,
            customerEmail: invoiceForm.customerEmail,
            customerPhone: invoiceForm.customerPhone,
            items: invoiceForm.items,
            subtotal,
            tax,
            discount: invoiceForm.discount,
            total,
            status: 'pending',
            dueDate: invoiceForm.dueDate,
            issueDate: new Date().toISOString().split('T')[0],
            notes: invoiceForm.notes,
            createdBy: employee.name
        });

        setShowInvoiceModal(false);
        resetInvoiceForm();
        loadData();
    };

    const resetInvoiceForm = () => {
        setInvoiceForm({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
            discount: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: ''
        });
    };

    // Record payment
    const handleRecordPayment = () => {
        accountingService.recordPayment({
            invoiceId: paymentForm.invoiceId || undefined,
            amount: paymentForm.amount,
            method: paymentForm.method,
            status: 'completed',
            customerName: paymentForm.customerName,
            transactionRef: paymentForm.transactionRef,
            notes: paymentForm.notes,
            date: new Date().toISOString(),
            createdBy: employee.name
        });

        setShowPaymentModal(false);
        setPaymentForm({
            invoiceId: '',
            amount: 0,
            method: 'bank_transfer',
            customerName: '',
            transactionRef: '',
            notes: ''
        });
        loadData();
    };

    // Add ledger entry
    const handleAddLedgerEntry = () => {
        accountingService.addLedgerEntry({
            description: ledgerForm.description,
            type: ledgerForm.type,
            amount: ledgerForm.amount,
            category: ledgerForm.category,
            reference: ledgerForm.reference,
            createdBy: employee.name
        });

        setShowLedgerModal(false);
        setLedgerForm({
            description: '',
            type: 'credit',
            amount: 0,
            category: '',
            reference: ''
        });
        loadData();
    };

    // Status colors
    const getInvoiceStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case 'paid': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'overdue': return 'bg-red-500/20 text-red-400';
            case 'draft': return 'bg-slate-500/20 text-slate-400';
            case 'cancelled': return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getPaymentStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'failed': return 'bg-red-500/20 text-red-400';
            case 'refunded': return 'bg-blue-500/20 text-blue-400';
        }
    };

    // Tabs
    const tabs = [
        { id: 'overview', label: t('نظرة عامة', 'Overview'), icon: <PieChart className="w-4 h-4" /> },
        { id: 'registrations', label: t('طلبات التسجيل', 'Registrations'), icon: <UserPlus className="w-4 h-4" />, badge: registrationRequests.length },
        { id: 'invoices', label: t('الفواتير', 'Invoices'), icon: <Receipt className="w-4 h-4" /> },
        { id: 'payments', label: t('المدفوعات', 'Payments'), icon: <CreditCard className="w-4 h-4" /> },
        { id: 'ledger', label: t('سجل القيود', 'Ledger'), icon: <FileText className="w-4 h-4" /> },
        { id: 'subscriptions', label: t('الاشتراكات', 'Subscriptions'), icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6" dir={dir}>
            {/* Welcome */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('نظام المحاسبة والفواتير', 'Accounting & Invoicing System')}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-800/50 p-2 rounded-xl overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${activeTab === tab.id
                            ? 'bg-green-500 text-white'
                            : 'text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {(tab as any).badge > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {(tab as any).badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">{t('الإيرادات', 'Revenue')}</p>
                                    <p className="text-xl font-bold text-white">{stats.totalRevenue.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">{t('المصروفات', 'Expenses')}</p>
                                    <p className="text-xl font-bold text-white">{stats.totalExpenses.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">{t('صافي الربح', 'Net Profit')}</p>
                                    <p className="text-xl font-bold text-white">{stats.netProfit.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">{t('اشتراكات نشطة', 'Active Subs')}</p>
                                    <p className="text-xl font-bold text-white">{stats.activeSubscriptions}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-400 text-sm">{t('فواتير معلقة', 'Pending Invoices')}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.pendingInvoices}</p>
                                </div>
                                <Clock className="w-10 h-10 text-yellow-400/50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-400 text-sm">{t('فواتير مدفوعة', 'Paid Invoices')}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.paidInvoices}</p>
                                </div>
                                <CheckCircle className="w-10 h-10 text-green-400/50" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-4 border border-red-500/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-400 text-sm">{t('فواتير متأخرة', 'Overdue')}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.overdueInvoices}</p>
                                </div>
                                <AlertCircle className="w-10 h-10 text-red-400/50" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => setShowInvoiceModal(true)}
                            className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl text-white hover:scale-105 transition-transform"
                        >
                            <Receipt className="w-8 h-8 mb-2" />
                            <p className="font-medium">{t('فاتورة جديدة', 'New Invoice')}</p>
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl text-white hover:scale-105 transition-transform"
                        >
                            <CreditCard className="w-8 h-8 mb-2" />
                            <p className="font-medium">{t('تسجيل دفعة', 'Record Payment')}</p>
                        </button>
                        <button
                            onClick={() => setShowLedgerModal(true)}
                            className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl text-white hover:scale-105 transition-transform"
                        >
                            <FileText className="w-8 h-8 mb-2" />
                            <p className="font-medium">{t('قيد جديد', 'New Entry')}</p>
                        </button>
                        <button
                            onClick={() => setActiveTab('subscriptions')}
                            className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-xl text-white hover:scale-105 transition-transform"
                        >
                            <Users className="w-8 h-8 mb-2" />
                            <p className="font-medium">{t('الاشتراكات', 'Subscriptions')}</p>
                        </button>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('آخر المعاملات', 'Recent Transactions')}</h3>
                        {ledgerEntries.length > 0 ? (
                            <div className="space-y-3">
                                {ledgerEntries.slice(-5).reverse().map(entry => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
                                                }`}>
                                                {entry.type === 'credit'
                                                    ? <ArrowUpRight className="w-5 h-5 text-green-400" />
                                                    : <ArrowDownRight className="w-5 h-5 text-red-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{entry.description}</p>
                                                <p className="text-slate-400 text-sm">{entry.date}</p>
                                            </div>
                                        </div>
                                        <p className={`font-bold ${entry.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                            {entry.type === 'credit' ? '+' : '-'}{entry.amount.toLocaleString()} {t('ر.س', 'SAR')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t('لا توجد معاملات حديثة', 'No recent transactions')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">{t('الفواتير', 'Invoices')}</h3>
                        <button
                            onClick={() => setShowInvoiceModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            <Plus className="w-4 h-4" />
                            {t('فاتورة جديدة', 'New Invoice')}
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm text-slate-300">{t('رقم الفاتورة', 'Invoice #')}</th>
                                    <th className="px-4 py-3 text-right text-sm text-slate-300">{t('العميل', 'Customer')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('المبلغ', 'Amount')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الحالة', 'Status')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('التاريخ', 'Date')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('إجراءات', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {invoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-white font-mono">{invoice.invoiceNumber}</td>
                                        <td className="px-4 py-3 text-white">{invoice.customerName}</td>
                                        <td className="px-4 py-3 text-center text-green-400 font-bold">
                                            {invoice.total.toLocaleString()} {t('ر.س', 'SAR')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getInvoiceStatusColor(invoice.status)}`}>
                                                {INVOICE_STATUS_TRANSLATIONS[invoice.status][language]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-400">{invoice.issueDate}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-1 hover:bg-slate-700 rounded text-blue-400">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 hover:bg-slate-700 rounded text-green-400">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                {invoice.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            accountingService.markInvoiceAsPaid(invoice.id);
                                                            loadData();
                                                        }}
                                                        className="p-1 hover:bg-slate-700 rounded text-emerald-400"
                                                        title={t('تأكيد الدفع', 'Confirm Payment')}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {invoices.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t('لا توجد فواتير', 'No invoices')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">{t('المدفوعات', 'Payments')}</h3>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            <Plus className="w-4 h-4" />
                            {t('تسجيل دفعة', 'Record Payment')}
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm text-slate-300">{t('العميل', 'Customer')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('المبلغ', 'Amount')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الطريقة', 'Method')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الحالة', 'Status')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('التاريخ', 'Date')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('إجراءات', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-white">{payment.customerName}</td>
                                        <td className="px-4 py-3 text-center text-green-400 font-bold">
                                            {payment.amount.toLocaleString()} {t('ر.س', 'SAR')}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-300">
                                            {PAYMENT_METHOD_TRANSLATIONS[payment.method][language]}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                                                {PAYMENT_STATUS_TRANSLATIONS[payment.status][language]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-400">
                                            {new Date(payment.date).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {payment.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            accountingService.verifyPayment(payment.id, employee.name);
                                                            loadData();
                                                        }}
                                                        className="p-1 hover:bg-slate-700 rounded text-green-400"
                                                        title={t('تأكيد الدفع', 'Verify Payment')}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t('لا توجد مدفوعات', 'No payments')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ledger Tab */}
            {activeTab === 'ledger' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{t('سجل القيود', 'Ledger')}</h3>
                            <p className="text-slate-400 text-sm">
                                {t('الرصيد الحالي:', 'Current Balance:')}
                                <span className="text-green-400 font-bold mr-2">
                                    {accountingService.getCurrentBalance().toLocaleString()} {t('ر.س', 'SAR')}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowLedgerModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                            <Plus className="w-4 h-4" />
                            {t('قيد جديد', 'New Entry')}
                        </button>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm text-slate-300">{t('التاريخ', 'Date')}</th>
                                    <th className="px-4 py-3 text-right text-sm text-slate-300">{t('الوصف', 'Description')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('النوع', 'Type')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('المبلغ', 'Amount')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-300">{t('الرصيد', 'Balance')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {ledgerEntries.slice().reverse().map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-slate-400">{entry.date}</td>
                                        <td className="px-4 py-3 text-white">{entry.description}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${entry.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {LEDGER_TYPE_TRANSLATIONS[entry.type][language]}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-center font-bold ${entry.type === 'credit' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {entry.type === 'credit' ? '+' : '-'}{entry.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center text-white font-mono">
                                            {entry.balance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {ledgerEntries.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t('لا توجد قيود', 'No entries')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">{t('الاشتراكات', 'Subscriptions')}</h3>

                    {/* طلبات بانتظار الموافقة */}
                    {accountingService.getPendingApprovalSubscriptions().length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-md font-medium text-yellow-400 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {t('طلبات بانتظار موافقة المدير العام', 'Pending Manager Approval')}
                                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                                    {accountingService.getPendingApprovalSubscriptions().length}
                                </span>
                            </h4>
                            <div className="grid gap-3">
                                {accountingService.getPendingApprovalSubscriptions().map(sub => (
                                    <div key={sub.id} className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-yellow-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">{sub.userName}</h4>
                                                    <p className="text-slate-400 text-sm">{sub.userEmail}</p>
                                                    <p className="text-slate-500 text-xs">
                                                        {USER_TYPE_TRANSLATIONS[sub.userType][language]}
                                                        {sub.companyName && ` - ${sub.companyName}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm ${sub.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                                                    sub.plan === 'professional' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {SUBSCRIPTION_PLAN_TRANSLATIONS[sub.plan][language]}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold">{sub.amount.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                                <p className="text-slate-400 text-sm">{t('طلب:', 'Request:')} {new Date(sub.createdAt).toLocaleDateString('ar-SA')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        accountingService.approveSubscription(sub.id, employee.name);
                                                        loadData();
                                                    }}
                                                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {t('موافقة', 'Approve')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt(t('سبب الرفض:', 'Rejection reason:'));
                                                        if (reason) {
                                                            accountingService.rejectSubscription(sub.id, employee.name, reason);
                                                            loadData();
                                                        }
                                                    }}
                                                    className="flex items-center gap-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                                                >
                                                    <X className="w-4 h-4" />
                                                    {t('رفض', 'Reject')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* قائمة الاشتراكات المفعّلة */}
                    <h4 className="text-md font-medium text-white mb-3">{t('الاشتراكات المفعّلة', 'Active Subscriptions')}</h4>
                    <div className="grid gap-4">
                        {subscriptions.filter(s => s.approvalStatus === 'approved').map(sub => (
                            <div key={sub.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sub.plan === 'enterprise' ? 'bg-purple-500/20' :
                                            sub.plan === 'professional' ? 'bg-blue-500/20' : 'bg-slate-500/20'
                                            }`}>
                                            <Users className={`w-6 h-6 ${sub.plan === 'enterprise' ? 'text-purple-400' :
                                                sub.plan === 'professional' ? 'text-blue-400' : 'text-slate-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{sub.userName}</h4>
                                            <p className="text-slate-400 text-sm">{sub.userEmail}</p>
                                            <p className="text-slate-500 text-xs">
                                                {USER_TYPE_TRANSLATIONS[sub.userType][language]}
                                                {sub.companyName && ` - ${sub.companyName}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className={`px-3 py-1 rounded-full text-sm ${sub.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                                            sub.plan === 'professional' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {SUBSCRIPTION_PLAN_TRANSLATIONS[sub.plan][language]}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                            sub.status === 'pending_approval' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                            {SUBSCRIPTION_STATUS_TRANSLATIONS[sub.status][language]}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{sub.amount.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                        <p className="text-slate-400 text-sm">{t('ينتهي:', 'Expires:')} {sub.endDate}</p>
                                        {sub.approvedBy && (
                                            <p className="text-green-400 text-xs">{t('وافق عليه:', 'Approved by:')} {sub.approvedBy}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            accountingService.renewSubscription(sub.id, 1);
                                            loadData();
                                        }}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        {t('تجديد', 'Renew')}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {subscriptions.filter(s => s.approvalStatus === 'approved').length === 0 && (
                            <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t('لا توجد اشتراكات مفعّلة', 'No active subscriptions')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Registration Requests Tab */}
            {activeTab === 'registrations' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            {t('طلبات التسجيل الجديدة', 'New Registration Requests')}
                        </h3>
                        <button
                            onClick={loadData}
                            className="flex items-center gap-2 px-3 py-1 text-slate-400 hover:text-white transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('تحديث', 'Refresh')}
                        </button>
                    </div>

                    {registrationRequests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
                            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('لا توجد طلبات تسجيل معلقة', 'No pending registration requests')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {registrationRequests.map(req => (
                                <div key={req.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                        {/* User Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium text-lg">{req.name}</h4>
                                                    <p className="text-slate-400 text-sm">{req.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-slate-500">{t('النوع:', 'Type:')}</span>
                                                    <span className={`mr-2 px-2 py-0.5 rounded text-xs ${req.userType === 'individual' ? 'bg-blue-500/20 text-blue-300' :
                                                        req.userType === 'company' ? 'bg-purple-500/20 text-purple-300' :
                                                            'bg-orange-500/20 text-orange-300'
                                                        }`}>
                                                        {REG_USER_TYPE_TRANSLATIONS[req.userType][language]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">{t('الجوال:', 'Phone:')}</span>
                                                    <span className="text-slate-300 mr-2" dir="ltr">{req.phone}</span>
                                                </div>
                                                {(req.userType === 'company' || req.userType === 'supplier') && (
                                                    <>
                                                        <div className="col-span-2">
                                                            <span className="text-slate-500">{t('اسم الشركة:', 'Company:')}</span>
                                                            <span className="text-white font-medium mr-2">{req.companyName}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-slate-500">{t('السجل التجاري:', 'CR:')}</span>
                                                            <span className="text-white font-mono mr-2" dir="ltr">{req.commercialRegister}</span>
                                                            {req.crVerified ? (
                                                                <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-300">
                                                                    <Check className="w-3 h-3 inline mr-1" />
                                                                    {t('مؤكد', 'Verified')}
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-300">
                                                                    {t('بانتظار التحقق', 'Pending')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                                <div>
                                                    <span className="text-slate-500">{t('الباقة:', 'Plan:')}</span>
                                                    <span className={`mr-2 px-2 py-0.5 rounded text-xs ${req.plan === 'free' ? 'bg-slate-500/20 text-slate-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                        {req.plan === 'free' ? t('مجانية', 'Free') : t('احترافية', 'Professional')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">{t('الحالة:', 'Status:')}</span>
                                                    <span className={`mr-2 px-2 py-0.5 rounded text-xs ${req.status === 'pending_cr_verification' ? 'bg-orange-500/20 text-orange-300' :
                                                        'bg-yellow-500/20 text-yellow-300'
                                                        }`}>
                                                        {REGISTRATION_STATUS_TRANSLATIONS[req.status][language]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">{t('تاريخ الطلب:', 'Date:')}</span>
                                                    <span className="text-slate-300 mr-2">
                                                        {new Date(req.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Commercial Register Verification (for companies/suppliers) */}
                                        {(req.userType === 'company' || req.userType === 'supplier') && req.status === 'pending_cr_verification' && (
                                            <div className="lg:w-72 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                                <h5 className="text-orange-300 font-medium mb-3 flex items-center gap-2">
                                                    <Building2 className="w-4 h-4" />
                                                    {t('تحقق من السجل التجاري', 'Verify Commercial Register')}
                                                </h5>
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <span className="text-slate-400 block">{t('رقم السجل:', 'CR Number:')}</span>
                                                        <span className="text-white font-mono text-lg" dir="ltr">{req.commercialRegister}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block">{t('اسم الشركة:', 'Company Name:')}</span>
                                                        <span className="text-white">{req.companyName}</span>
                                                    </div>
                                                    <a
                                                        href={CR_VERIFICATION_URL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full py-2 bg-blue-500/20 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 flex items-center justify-center gap-2"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        {t('التحقق من موقع وزارة التجارة', 'Verify on MC.gov.sa')}
                                                    </a>
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => {
                                                                registrationService.verifyCommercialRegister(req.id, employee.name);
                                                                loadData();
                                                            }}
                                                            className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center gap-1 text-xs"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {t('تأكيد', 'Confirm')}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const reason = prompt(t('سبب رفض السجل التجاري:', 'Reason for CR rejection:'));
                                                                if (reason) {
                                                                    registrationService.rejectCommercialRegister(req.id, employee.name, reason);
                                                                    loadData();
                                                                }
                                                            }}
                                                            className="flex-1 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 flex items-center justify-center gap-1 text-xs"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            {t('رفض', 'Reject')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Info (for paid plans) */}
                                        {req.plan !== 'free' && (
                                            <div className="lg:w-64 bg-slate-700/30 rounded-lg p-4">
                                                <h5 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    {t('معلومات الدفع', 'Payment Info')}
                                                </h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">{t('المبلغ:', 'Amount:')}</span>
                                                        <span className="text-emerald-400 font-bold">{req.amount} {t('ر.س', 'SAR')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">{t('الحالة:', 'Status:')}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${req.paymentStatus === 'verified' ? 'bg-green-500/20 text-green-300' :
                                                            req.paymentStatus === 'receipt_uploaded' || req.paymentStatus === 'under_review'
                                                                ? 'bg-orange-500/20 text-orange-300'
                                                                : 'bg-yellow-500/20 text-yellow-300'
                                                            }`}>
                                                            {REG_PAYMENT_STATUS_TRANSLATIONS[req.paymentStatus][language]}
                                                        </span>
                                                    </div>
                                                    {req.paymentReceipt && (
                                                        <button
                                                            onClick={() => setSelectedReceipt(req.paymentReceipt!)}
                                                            className="w-full mt-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30 flex items-center justify-center gap-1"
                                                        >
                                                            <Image className="w-3 h-3" />
                                                            {t('عرض الإيصال', 'View Receipt')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            {/* Payment Actions (for pending payment verification) */}
                                            {req.status === 'payment_under_review' && (req.paymentStatus === 'receipt_uploaded' || req.paymentStatus === 'under_review') && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            registrationService.verifyPayment(req.id, employee.name);
                                                            loadData();
                                                        }}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        {t('تأكيد الدفع', 'Verify Payment')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt(t('سبب طلب إيصال جديد:', 'Reason for new receipt:'));
                                                            if (reason) {
                                                                registrationService.requestNewPaymentReceipt(req.id, employee.name, reason);
                                                                loadData();
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 flex items-center gap-2"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                        {t('طلب إيصال جديد', 'Request New')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt(t('سبب رفض الدفع:', 'Reason for rejection:'));
                                                            if (reason) {
                                                                registrationService.rejectPayment(req.id, employee.name, reason);
                                                                loadData();
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 flex items-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        {t('رفض الدفع', 'Reject Payment')}
                                                    </button>
                                                </>
                                            )}

                                            {/* Approval Actions (for pending approval) */}
                                            {req.status === 'pending_approval' && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            registrationService.approveRegistration(req.id, employee.name);
                                                            loadData();
                                                        }}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        {t('موافقة', 'Approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt(t('سبب الرفض:', 'Rejection reason:'));
                                                            if (reason) {
                                                                registrationService.rejectRegistration(req.id, employee.name, reason);
                                                                loadData();
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        {t('رفض', 'Reject')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">{t('فاتورة جديدة', 'New Invoice')}</h3>
                            <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('اسم العميل', 'Customer Name')} *</label>
                                    <input
                                        type="text"
                                        value={invoiceForm.customerName}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('البريد الإلكتروني', 'Email')}</label>
                                    <input
                                        type="email"
                                        value={invoiceForm.customerEmail}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('الهاتف', 'Phone')}</label>
                                    <input
                                        type="tel"
                                        value={invoiceForm.customerPhone}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerPhone: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('تاريخ الاستحقاق', 'Due Date')}</label>
                                    <input
                                        type="date"
                                        value={invoiceForm.dueDate}
                                        onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">{t('البنود', 'Items')}</label>
                                {invoiceForm.items.map((item, index) => (
                                    <div key={item.id} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder={t('الوصف', 'Description')}
                                            value={item.description}
                                            onChange={(e) => {
                                                const newItems = [...invoiceForm.items];
                                                newItems[index].description = e.target.value;
                                                setInvoiceForm({ ...invoiceForm, items: newItems });
                                            }}
                                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder={t('الكمية', 'Qty')}
                                            value={item.quantity}
                                            onChange={(e) => updateItemTotal(index, 'quantity', Number(e.target.value))}
                                            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder={t('السعر', 'Price')}
                                            value={item.unitPrice}
                                            onChange={(e) => updateItemTotal(index, 'unitPrice', Number(e.target.value))}
                                            className="w-28 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                        />
                                        <button
                                            onClick={() => removeInvoiceItem(index)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addInvoiceItem}
                                    className="flex items-center gap-1 text-green-400 text-sm hover:text-green-300"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('إضافة بند', 'Add Item')}
                                </button>
                            </div>

                            {/* Totals */}
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <div className="flex justify-between text-slate-300 mb-2">
                                    <span>{t('المجموع الفرعي', 'Subtotal')}</span>
                                    <span>{calculateInvoiceTotals().subtotal.toLocaleString()} {t('ر.س', 'SAR')}</span>
                                </div>
                                <div className="flex justify-between text-slate-300 mb-2">
                                    <span>{t('الضريبة (15%)', 'VAT (15%)')}</span>
                                    <span>{calculateInvoiceTotals().tax.toLocaleString()} {t('ر.س', 'SAR')}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-lg border-t border-slate-600 pt-2">
                                    <span>{t('الإجمالي', 'Total')}</span>
                                    <span className="text-green-400">{calculateInvoiceTotals().total.toLocaleString()} {t('ر.س', 'SAR')}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCreateInvoice}
                                disabled={!invoiceForm.customerName || invoiceForm.items.length === 0}
                                className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                            >
                                {t('إنشاء الفاتورة', 'Create Invoice')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">{t('تسجيل دفعة', 'Record Payment')}</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('اسم العميل', 'Customer Name')} *</label>
                                <input
                                    type="text"
                                    value={paymentForm.customerName}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, customerName: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('المبلغ', 'Amount')} *</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('طريقة الدفع', 'Payment Method')}</label>
                                <select
                                    value={paymentForm.method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                >
                                    {Object.entries(PAYMENT_METHOD_TRANSLATIONS).map(([key, val]) => (
                                        <option key={key} value={key}>{language === 'ar' ? val.ar : val.en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('رقم المرجع', 'Reference #')}</label>
                                <input
                                    type="text"
                                    value={paymentForm.transactionRef}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                />
                            </div>

                            <button
                                onClick={handleRecordPayment}
                                disabled={!paymentForm.customerName || paymentForm.amount <= 0}
                                className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                            >
                                {t('تسجيل الدفعة', 'Record Payment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ledger Entry Modal */}
            {showLedgerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">{t('قيد جديد', 'New Ledger Entry')}</h3>
                            <button onClick={() => setShowLedgerModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('الوصف', 'Description')} *</label>
                                <input
                                    type="text"
                                    value={ledgerForm.description}
                                    onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('النوع', 'Type')}</label>
                                    <select
                                        value={ledgerForm.type}
                                        onChange={(e) => setLedgerForm({ ...ledgerForm, type: e.target.value as LedgerType })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="credit">{t('دائن', 'Credit')}</option>
                                        <option value="debit">{t('مدين', 'Debit')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('المبلغ', 'Amount')} *</label>
                                    <input
                                        type="number"
                                        value={ledgerForm.amount}
                                        onChange={(e) => setLedgerForm({ ...ledgerForm, amount: Number(e.target.value) })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('التصنيف', 'Category')}</label>
                                <input
                                    type="text"
                                    value={ledgerForm.category}
                                    onChange={(e) => setLedgerForm({ ...ledgerForm, category: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                    placeholder={t('مبيعات، مصروفات، رواتب...', 'Sales, Expenses, Salaries...')}
                                />
                            </div>

                            <button
                                onClick={handleAddLedgerEntry}
                                disabled={!ledgerForm.description || ledgerForm.amount <= 0}
                                className="w-full py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50"
                            >
                                {t('إضافة القيد', 'Add Entry')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Viewer Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="relative max-w-4xl w-full mx-4">
                        <button
                            onClick={() => setSelectedReceipt(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="bg-white rounded-2xl p-4 overflow-auto max-h-[90vh]">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Image className="w-5 h-5" />
                                {t('إيصال الدفع', 'Payment Receipt')}
                            </h3>
                            <img
                                src={selectedReceipt}
                                alt="Payment Receipt"
                                className="max-w-full h-auto rounded-lg border border-slate-200"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountantPage;
