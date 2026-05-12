import React, { useState } from 'react';
import { Language } from '../../types';
import {
    ArrowLeft,
    ArrowRight,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Pause,
    Ban,
    Trash2,
    Check,
    X,
    AlertTriangle,
    Calendar,
    FileText,
    Mail,
    Clock,
    Building2,
    Shield,
    Settings,
    Users,
    RefreshCw,
    Download,
    ChevronDown,
    Star
} from 'lucide-react';
import {
    SupplierProfile,
    SupplierStatus,
    CRStatus,
    SUPPLIER_STATUS_TRANSLATIONS,
    CR_STATUS_TRANSLATIONS,
    calculateCRStatus,
    getDaysUntilExpiry,
    CRAlertSettings
} from '../../services/supplierManagementService';

interface SuppliersManagementPageProps {
    language: Language;
    onNavigate: (page: string) => void;
}

// Demo Data
const demoSuppliers: SupplierProfile[] = [
    {
        id: 'sup1',
        companyName: { ar: 'شركة الحديد العربية', en: 'Arabian Steel Co.' },
        email: 'info@arabiansteel.com',
        phone: '0501234567',
        status: 'active',
        commercialRegistration: {
            number: '1234567890',
            expiryDate: '2026-12-15',
            status: 'valid'
        },
        employees: [],
        services: { delivery: [], installation: [], operators: [], maintenance: [], consulting: [], training: [], inspection: [], emergency: [], project_management: [] },
        terms: { isEnabled: true, enabledAt: '2025-01-15' },
        createdAt: '2024-01-15',
        lastActiveAt: '2026-01-20'
    },
    {
        id: 'sup2',
        companyName: { ar: 'مؤسسة المعدات الثقيلة', en: 'Heavy Equipment Est.' },
        email: 'support@heavyequip.sa',
        phone: '0559876543',
        status: 'active',
        commercialRegistration: {
            number: '0987654321',
            expiryDate: '2026-02-15',
            status: 'expiring'
        },
        employees: [],
        services: { delivery: [], installation: [], operators: [], maintenance: [], consulting: [], training: [], inspection: [], emergency: [], project_management: [] },
        terms: { isEnabled: false },
        createdAt: '2024-03-20',
        lastActiveAt: '2026-01-19'
    },
    {
        id: 'sup3',
        companyName: { ar: 'شركة البناء الحديث', en: 'Modern Construction Co.' },
        email: 'contact@modernconstruction.sa',
        phone: '0512223344',
        status: 'suspended',
        suspendedAt: '2026-01-10',
        suspendReason: 'انتهاء السجل التجاري',
        commercialRegistration: {
            number: '1122334455',
            expiryDate: '2026-01-01',
            status: 'expired'
        },
        employees: [],
        services: { delivery: [], installation: [], operators: [], maintenance: [], consulting: [], training: [], inspection: [], emergency: [], project_management: [] },
        terms: { isEnabled: false },
        createdAt: '2024-06-10',
        lastActiveAt: '2026-01-01'
    },
    {
        id: 'sup4',
        companyName: { ar: 'مؤسسة التوريدات العامة', en: 'General Supplies Est.' },
        email: 'info@generalsupplies.sa',
        phone: '0533445566',
        status: 'banned',
        bannedAt: '2025-12-20',
        banReason: 'شكاوى متعددة من العملاء',
        commercialRegistration: {
            number: '5566778899',
            expiryDate: '2026-06-30',
            status: 'valid'
        },
        employees: [],
        services: { delivery: [], installation: [], operators: [], maintenance: [], consulting: [], training: [], inspection: [], emergency: [], project_management: [] },
        terms: { isEnabled: false },
        createdAt: '2023-09-15',
        lastActiveAt: '2025-12-20'
    },
    {
        id: 'sup5',
        companyName: { ar: 'شركة الإنشاءات المتحدة', en: 'United Construction Co.' },
        email: 'sales@unitedconstruction.sa',
        phone: '0544556677',
        status: 'active',
        commercialRegistration: {
            number: '9988776655',
            expiryDate: '2026-03-10',
            status: 'expiring'
        },
        employees: [],
        services: { delivery: [], installation: [], operators: [], maintenance: [], consulting: [], training: [], inspection: [], emergency: [], project_management: [] },
        terms: { isEnabled: true, enabledAt: '2025-11-01' },
        createdAt: '2024-02-28',
        lastActiveAt: '2026-01-18'
    }
];

const SuppliersManagementPage: React.FC<SuppliersManagementPageProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    const [activeTab, setActiveTab] = useState<'suppliers' | 'cr_verification' | 'terms' | 'settings'>('suppliers');
    const [suppliers, setSuppliers] = useState<SupplierProfile[]>(demoSuppliers);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<SupplierStatus | 'all'>('all');
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierProfile | null>(null);
    const [actionType, setActionType] = useState<'suspend' | 'ban' | 'delete' | 'unsuspend' | 'unban' | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [actionNotes, setActionNotes] = useState('');
    const [sendEmailNotification, setSendEmailNotification] = useState(true);

    // CR Alert Settings
    const [crSettings, setCRSettings] = useState<CRAlertSettings>({
        firstAlertDays: 60,
        secondAlertDays: 30,
        finalAlertDays: 7,
        autoSuspendOnExpiry: true,
        notifyAdminOnExpiry: true,
        requireAdminReview: true
    });

    const pageTranslations = {
        title: { ar: 'إدارة الموردين', en: 'Supplier Management' },
        suppliers: { ar: 'الموردين', en: 'Suppliers' },
        crVerification: { ar: 'التحقق من السجل التجاري', en: 'CR Verification' },
        terms: { ar: 'الشروط والأحكام', en: 'Terms & Conditions' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        search: { ar: 'بحث عن مورد...', en: 'Search supplier...' },
        all: { ar: 'الجميع', en: 'All' },
        active: { ar: 'نشط', en: 'Active' },
        suspended: { ar: 'موقوف', en: 'Suspended' },
        banned: { ar: 'محظور', en: 'Banned' },
        suspend: { ar: 'إيقاف مؤقت', en: 'Suspend' },
        unsuspend: { ar: 'إلغاء الإيقاف', en: 'Unsuspend' },
        ban: { ar: 'حظر', en: 'Ban' },
        unban: { ar: 'إلغاء الحظر', en: 'Unban' },
        delete: { ar: 'حذف', en: 'Delete' },
        view: { ar: 'عرض', en: 'View' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        companyName: { ar: 'المورد', en: 'Supplier' },
        crNumber: { ar: 'السجل التجاري', en: 'CR Number' },
        status: { ar: 'الحالة', en: 'Status' },
        crStatus: { ar: 'حالة السجل', en: 'CR Status' },
        lastActive: { ar: 'آخر نشاط', en: 'Last Active' },
        termsEnabled: { ar: 'الشروط', en: 'Terms' },
        confirm: { ar: 'تأكيد', en: 'Confirm' },
        cancel: { ar: 'إلغاء', en: 'Cancel' },
        reason: { ar: 'السبب', en: 'Reason' },
        notes: { ar: 'ملاحظات', en: 'Notes' },
        sendEmail: { ar: 'إرسال إشعار بريد', en: 'Send Email Notification' },
        backToAdmin: { ar: 'العودة للوحة المدير', en: 'Back to Admin' },
        valid: { ar: 'ساري', en: 'Valid' },
        expiring: { ar: 'قارب', en: 'Expiring' },
        expired: { ar: 'منتهي', en: 'Expired' },
        daysLeft: { ar: 'يوم متبقي', en: 'days left' },
        daysAgo: { ar: 'يوم', en: 'days ago' },
        today: { ar: 'اليوم', en: 'Today' },
        yesterday: { ar: 'أمس', en: 'Yesterday' },
        enabled: { ar: 'مفعل', en: 'Enabled' },
        disabled: { ar: 'غير مفعل', en: 'Disabled' },
        enableTerms: { ar: 'تفعيل الشروط', en: 'Enable Terms' },
        disableTerms: { ar: 'إيقاف الشروط', en: 'Disable Terms' },
        // CR Verification Tab
        crStats: { ar: 'إحصائيات السجلات التجارية', en: 'CR Statistics' },
        validCR: { ar: 'سجلات سارية', en: 'Valid CRs' },
        expiringCR: { ar: 'قاربة على الانتهاء', en: 'Expiring Soon' },
        expiredCR: { ar: 'منتهية', en: 'Expired CRs' },
        pendingReview: { ar: 'بانتظار المراجعة', en: 'Pending Review' },
        sendReminder: { ar: 'إرسال تذكير', en: 'Send Reminder' },
        approveCR: { ar: 'موافقة', en: 'Approve' },
        rejectCR: { ar: 'رفض', en: 'Reject' },
        // Settings
        alertSettings: { ar: 'إعدادات التنبيهات', en: 'Alert Settings' },
        firstAlert: { ar: 'التنبيه الأول قبل', en: 'First alert before' },
        secondAlert: { ar: 'التنبيه الثاني قبل', en: 'Second alert before' },
        finalAlert: { ar: 'التنبيه الأخير قبل', en: 'Final alert before' },
        days: { ar: 'يوم', en: 'days' },
        autoSuspend: { ar: 'إيقاف تلقائي عند الانتهاء', en: 'Auto-suspend on expiry' },
        notifyAdmin: { ar: 'إشعار المدير عند الانتهاء', en: 'Notify admin on expiry' },
        requireReview: { ar: 'يتطلب مراجعة المدير', en: 'Require admin review' },
        saveSettings: { ar: 'حفظ الإعدادات', en: 'Save Settings' }
    };

    const getLabel = (key: keyof typeof pageTranslations) => pageTranslations[key][language];
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.companyName[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.commercialRegistration.number.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: SupplierStatus) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'suspended': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'banned': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'deleted': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const getCRStatusColor = (status: CRStatus) => {
        switch (status) {
            case 'valid': return 'bg-emerald-500/10 text-emerald-400';
            case 'expiring': return 'bg-amber-500/10 text-amber-400';
            case 'expired': return 'bg-red-500/10 text-red-400';
            case 'pending_review': return 'bg-blue-500/10 text-blue-400';
        }
    };

    const getLastActiveText = (date: string) => {
        const today = new Date();
        const lastActive = new Date(date);
        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return getLabel('today');
        if (diffDays === 1) return getLabel('yesterday');
        return `${diffDays} ${getLabel('daysAgo')}`;
    };

    const handleAction = (supplier: SupplierProfile, action: 'suspend' | 'ban' | 'delete' | 'unsuspend' | 'unban') => {
        setSelectedSupplier(supplier);
        setActionType(action);
        setActionReason('');
        setActionNotes('');
        setShowActionModal(true);
    };

    const confirmAction = () => {
        if (!selectedSupplier || !actionType) return;

        setSuppliers(prev => prev.map(s => {
            if (s.id !== selectedSupplier.id) return s;

            switch (actionType) {
                case 'suspend':
                    return { ...s, status: 'suspended' as SupplierStatus, suspendedAt: new Date().toISOString(), suspendReason: actionReason };
                case 'unsuspend':
                    return { ...s, status: 'active' as SupplierStatus, suspendedAt: undefined, suspendReason: undefined };
                case 'ban':
                    return { ...s, status: 'banned' as SupplierStatus, bannedAt: new Date().toISOString(), banReason: actionReason };
                case 'unban':
                    return { ...s, status: 'active' as SupplierStatus, bannedAt: undefined, banReason: undefined };
                case 'delete':
                    return { ...s, status: 'deleted' as SupplierStatus };
                default:
                    return s;
            }
        }));

        setShowActionModal(false);
        setSelectedSupplier(null);
        setActionType(null);
    };

    const toggleTerms = (supplier: SupplierProfile) => {
        setSuppliers(prev => prev.map(s => {
            if (s.id !== supplier.id) return s;
            return {
                ...s,
                terms: {
                    ...s.terms,
                    isEnabled: !s.terms.isEnabled,
                    enabledAt: !s.terms.isEnabled ? new Date().toISOString() : undefined
                }
            };
        }));
    };

    const crStats = {
        valid: suppliers.filter(s => s.commercialRegistration.status === 'valid').length,
        expiring: suppliers.filter(s => s.commercialRegistration.status === 'expiring').length,
        expired: suppliers.filter(s => s.commercialRegistration.status === 'expired').length,
        pending: suppliers.filter(s => s.commercialRegistration.status === 'pending_review').length
    };

    const suspendReasons = [
        { ar: 'مخالفة شروط الاستخدام', en: 'Violation of terms of use' },
        { ar: 'منتجات غير مطابقة للمواصفات', en: 'Non-compliant products' },
        { ar: 'شكاوى متعددة من العملاء', en: 'Multiple customer complaints' },
        { ar: 'عدم تجديد السجل التجاري', en: 'CR not renewed' },
        { ar: 'أخرى', en: 'Other' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('admin')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Arrow className="w-5 h-5" />
                                <span className="hidden sm:inline">{getLabel('backToAdmin')}</span>
                            </button>
                            <div className="h-6 w-px bg-slate-600"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-lg font-bold text-white">{getLabel('title')}</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['suppliers', 'cr_verification', 'terms', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab === 'suppliers' && <Users className="w-4 h-4" />}
                            {tab === 'cr_verification' && <FileText className="w-4 h-4" />}
                            {tab === 'terms' && <Shield className="w-4 h-4" />}
                            {tab === 'settings' && <Settings className="w-4 h-4" />}
                            {tab === 'suppliers' && getLabel('suppliers')}
                            {tab === 'cr_verification' && getLabel('crVerification')}
                            {tab === 'terms' && getLabel('terms')}
                            {tab === 'settings' && getLabel('settings')}
                        </button>
                    ))}
                </div>

                {/* Suppliers Tab */}
                {activeTab === 'suppliers' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[250px]">
                                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={getLabel('search')}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 ps-10 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as SupplierStatus | 'all')}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">{getLabel('all')}</option>
                                <option value="active">{getLabel('active')}</option>
                                <option value="suspended">{getLabel('suspended')}</option>
                                <option value="banned">{getLabel('banned')}</option>
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="text-slate-400 text-sm mb-1">{t('إجمالي الموردين', 'Total Suppliers')}</div>
                                <div className="text-2xl font-bold text-white">{suppliers.length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30">
                                <div className="text-emerald-400 text-sm mb-1">{getLabel('active')}</div>
                                <div className="text-2xl font-bold text-white">{suppliers.filter(s => s.status === 'active').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30">
                                <div className="text-amber-400 text-sm mb-1">{getLabel('suspended')}</div>
                                <div className="text-2xl font-bold text-white">{suppliers.filter(s => s.status === 'suspended').length}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30">
                                <div className="text-red-400 text-sm mb-1">{getLabel('banned')}</div>
                                <div className="text-2xl font-bold text-white">{suppliers.filter(s => s.status === 'banned').length}</div>
                            </div>
                        </div>

                        {/* Suppliers Table */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('companyName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('crNumber')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('crStatus')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('lastActive')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('termsEnabled')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSuppliers.map((supplier) => (
                                            <tr key={supplier.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                            {supplier.companyName[language].charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{supplier.companyName[language]}</div>
                                                            <div className="text-slate-400 text-sm">{supplier.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-300 font-mono text-sm">
                                                    {supplier.commercialRegistration.number}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getCRStatusColor(supplier.commercialRegistration.status)}`}>
                                                        {supplier.commercialRegistration.status === 'valid' && '✅'}
                                                        {supplier.commercialRegistration.status === 'expiring' && '⚠️'}
                                                        {supplier.commercialRegistration.status === 'expired' && '❌'}
                                                        {CR_STATUS_TRANSLATIONS[supplier.commercialRegistration.status][language]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(supplier.status)}`}>
                                                        {supplier.status === 'active' && <Check className="w-3 h-3" />}
                                                        {supplier.status === 'suspended' && <Pause className="w-3 h-3" />}
                                                        {supplier.status === 'banned' && <Ban className="w-3 h-3" />}
                                                        {SUPPLIER_STATUS_TRANSLATIONS[supplier.status][language]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                                    {getLastActiveText(supplier.lastActiveAt)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => toggleTerms(supplier)}
                                                        className={`px-2 py-1 rounded-full text-xs ${supplier.terms.isEnabled
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'bg-slate-500/10 text-slate-400'
                                                            }`}
                                                    >
                                                        {supplier.terms.isEnabled ? getLabel('enabled') : getLabel('disabled')}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                            title={getLabel('view')}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {supplier.status === 'active' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction(supplier, 'suspend')}
                                                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                                    title={getLabel('suspend')}
                                                                >
                                                                    <Pause className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(supplier, 'ban')}
                                                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                                    title={getLabel('ban')}
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {supplier.status === 'suspended' && (
                                                            <button
                                                                onClick={() => handleAction(supplier, 'unsuspend')}
                                                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                                title={getLabel('unsuspend')}
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {supplier.status === 'banned' && (
                                                            <button
                                                                onClick={() => handleAction(supplier, 'unban')}
                                                                className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                                title={getLabel('unban')}
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleAction(supplier, 'delete')}
                                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                            title={getLabel('delete')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CR Verification Tab */}
                {activeTab === 'cr_verification' && (
                    <div className="space-y-6">
                        {/* CR Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-emerald-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm">{getLabel('validCR')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{crStats.valid}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    <span className="text-amber-400 text-sm">{getLabel('expiringCR')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{crStats.expiring}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <X className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400 text-sm">{getLabel('expiredCR')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{crStats.expired}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-blue-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span className="text-blue-400 text-sm">{getLabel('pendingReview')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{crStats.pending}</div>
                            </div>
                        </div>

                        {/* Expiring/Expired CRs */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    {t('الموردون الذين يحتاجون تجديد السجل التجاري', 'Suppliers Needing CR Renewal')}
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('companyName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('crNumber')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{t('تاريخ الانتهاء', 'Expiry Date')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('crStatus')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers
                                            .filter(s => s.commercialRegistration.status === 'expiring' || s.commercialRegistration.status === 'expired')
                                            .map((supplier) => {
                                                const daysLeft = getDaysUntilExpiry(supplier.commercialRegistration.expiryDate);
                                                return (
                                                    <tr key={supplier.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                        <td className="px-4 py-3 text-white font-medium">{supplier.companyName[language]}</td>
                                                        <td className="px-4 py-3 text-center text-slate-300 font-mono text-sm">
                                                            {supplier.commercialRegistration.number}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-slate-300">
                                                            {supplier.commercialRegistration.expiryDate}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${daysLeft < 0 ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                                                }`}>
                                                                {daysLeft < 0
                                                                    ? `❌ ${t('منتهي', 'Expired')}`
                                                                    : `⚠️ ${daysLeft} ${getLabel('daysLeft')}`
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {getLabel('sendReminder')}
                                                                </button>
                                                                {supplier.status === 'active' && (
                                                                    <button
                                                                        onClick={() => handleAction(supplier, 'suspend')}
                                                                        className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Pause className="w-3 h-3" />
                                                                        {getLabel('suspend')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Terms Tab */}
                {activeTab === 'terms' && (
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                {t('إدارة ميزة الشروط والأحكام للموردين', 'Supplier Terms & Conditions Management')}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {language === 'ar'
                                    ? '💡 هذه الميزة مخفية عن الموردين - المدير يقرر تفعيلها لمن يستحق'
                                    : '💡 This feature is hidden from suppliers - Admin decides who gets access'
                                }
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('companyName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{t('التقييم', 'Rating')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suppliers.filter(s => s.status === 'active').map((supplier) => (
                                            <tr key={supplier.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{supplier.companyName[language]}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-amber-400">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        4.{Math.floor(Math.random() * 5) + 5}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${supplier.terms.isEnabled
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {supplier.terms.isEnabled ? '🟢 ' : '🔴 '}
                                                        {supplier.terms.isEnabled ? getLabel('enabled') : getLabel('disabled')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => toggleTerms(supplier)}
                                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${supplier.terms.isEnabled
                                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                            }`}
                                                    >
                                                        {supplier.terms.isEnabled ? getLabel('disableTerms') : getLabel('enableTerms')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                {getLabel('alertSettings')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">{getLabel('firstAlert')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={crSettings.firstAlertDays}
                                            onChange={(e) => setCRSettings({ ...crSettings, firstAlertDays: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <span className="text-slate-400">{getLabel('days')}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">{getLabel('secondAlert')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={crSettings.secondAlertDays}
                                            onChange={(e) => setCRSettings({ ...crSettings, secondAlertDays: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <span className="text-slate-400">{getLabel('days')}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">{getLabel('finalAlert')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={crSettings.finalAlertDays}
                                            onChange={(e) => setCRSettings({ ...crSettings, finalAlertDays: parseInt(e.target.value) })}
                                            className="w-20 bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <span className="text-slate-400">{getLabel('days')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-700/50 pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={crSettings.autoSuspendOnExpiry}
                                        onChange={(e) => setCRSettings({ ...crSettings, autoSuspendOnExpiry: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-white">{getLabel('autoSuspend')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={crSettings.notifyAdminOnExpiry}
                                        onChange={(e) => setCRSettings({ ...crSettings, notifyAdminOnExpiry: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-white">{getLabel('notifyAdmin')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={crSettings.requireAdminReview}
                                        onChange={(e) => setCRSettings({ ...crSettings, requireAdminReview: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-white">{getLabel('requireReview')}</span>
                                </label>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {getLabel('saveSettings')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showActionModal && selectedSupplier && actionType && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {actionType === 'suspend' && <><Pause className="w-5 h-5 text-amber-400" /> {getLabel('suspend')}</>}
                                {actionType === 'unsuspend' && <><Check className="w-5 h-5 text-emerald-400" /> {getLabel('unsuspend')}</>}
                                {actionType === 'ban' && <><Ban className="w-5 h-5 text-red-400" /> {getLabel('ban')}</>}
                                {actionType === 'unban' && <><RefreshCw className="w-5 h-5 text-emerald-400" /> {getLabel('unban')}</>}
                                {actionType === 'delete' && <><Trash2 className="w-5 h-5 text-red-400" /> {getLabel('delete')}</>}
                            </h3>
                            <button onClick={() => setShowActionModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="text-slate-300">
                                {t('المورد:', 'Supplier:')} <span className="text-white font-medium">{selectedSupplier.companyName[language]}</span>
                            </div>

                            {(actionType === 'suspend' || actionType === 'ban' || actionType === 'delete') && (
                                <>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('reason')} *</label>
                                        <select
                                            value={actionReason}
                                            onChange={(e) => setActionReason(e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">{t('-- اختر السبب --', '-- Select Reason --')}</option>
                                            {suspendReasons.map((reason, i) => (
                                                <option key={i} value={reason[language]}>{reason[language]}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('notes')}</label>
                                        <textarea
                                            value={actionNotes}
                                            onChange={(e) => setActionNotes(e.target.value)}
                                            rows={3}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={sendEmailNotification}
                                            onChange={(e) => setSendEmailNotification(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500"
                                        />
                                        <span className="text-slate-300 text-sm">{getLabel('sendEmail')}</span>
                                    </label>
                                </>
                            )}

                            {actionType === 'delete' && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                                    ⚠️ {language === 'ar'
                                        ? 'سيتم حذف جميع بيانات المورد نهائياً. هذا الإجراء لا يمكن التراجع عنه.'
                                        : 'All supplier data will be permanently deleted. This action cannot be undone.'
                                    }
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                {getLabel('cancel')}
                            </button>
                            <button
                                onClick={confirmAction}
                                disabled={(actionType === 'suspend' || actionType === 'ban' || actionType === 'delete') && !actionReason}
                                className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${actionType === 'delete' || actionType === 'ban'
                                    ? 'bg-red-500 hover:bg-red-400 text-white disabled:opacity-50'
                                    : actionType === 'suspend'
                                        ? 'bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50'
                                        : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                                    }`}
                            >
                                {actionType === 'suspend' && <Pause className="w-4 h-4" />}
                                {actionType === 'ban' && <Ban className="w-4 h-4" />}
                                {actionType === 'delete' && <Trash2 className="w-4 h-4" />}
                                {(actionType === 'unsuspend' || actionType === 'unban') && <Check className="w-4 h-4" />}
                                {getLabel('confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersManagementPage;
