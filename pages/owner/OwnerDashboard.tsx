import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    TrendingUp,
    DollarSign,
    FileText,
    Eye,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    Globe,
    Palette,
    Image,
    Type,
    Link,
    Phone,
    Mail,
    MapPin,
    Save,
    RefreshCw,
    Download,
    Filter,
    Search,
    ChevronDown,
    Check,
    X,
    Plus,
    Edit3,
    Trash2,
    Clock,
    UserCheck,
    UserX,
    AlertCircle,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    Star,
    MessageSquare
} from 'lucide-react';
import { COMPANY_INFO } from '../../companyData';

interface OwnerDashboardProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ language, onNavigate, onLogout }) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'quotes' | 'website' | 'analytics' | 'settings'>('overview');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

    // إحصائيات
    const stats = {
        totalVisits: 15420,
        visitsChange: 12.5,
        totalCustomers: 342,
        customersChange: 8.3,
        totalQuotes: 156,
        quotesChange: 15.2,
        totalRevenue: 485600,
        revenueChange: 22.1,
        activeUsers: 28,
        conversionRate: 4.2,
        avgQuoteValue: 3113,
        pendingQuotes: 23
    };

    // بيانات العملاء
    const customers = [
        { id: 1, name: 'شركة البناء الحديث', email: 'info@modern-build.com', phone: '+966501234567', quotes: 12, totalSpent: 45000, status: 'active', lastVisit: '2024-12-17' },
        { id: 2, name: 'مؤسسة التعمير', email: 'contact@taamir.sa', phone: '+966502345678', quotes: 8, totalSpent: 32000, status: 'active', lastVisit: '2024-12-16' },
        { id: 3, name: 'مقاولات الرياض', email: 'riyadh@contractors.com', phone: '+966503456789', quotes: 5, totalSpent: 18500, status: 'inactive', lastVisit: '2024-12-10' },
        { id: 4, name: 'شركة الإنشاءات المتحدة', email: 'united@constructions.sa', phone: '+966504567890', quotes: 15, totalSpent: 67000, status: 'active', lastVisit: '2024-12-17' },
        { id: 5, name: 'مؤسسة الأمل للمقاولات', email: 'alamal@contractors.sa', phone: '+966505678901', quotes: 3, totalSpent: 12000, status: 'pending', lastVisit: '2024-12-15' },
    ];

    // بيانات عروض الأسعار
    const quotes = [
        { id: 'Q-2024-001', customer: 'شركة البناء الحديث', date: '2024-12-17', items: 24, total: 125000, status: 'pending' },
        { id: 'Q-2024-002', customer: 'مؤسسة التعمير', date: '2024-12-16', items: 18, total: 87500, status: 'accepted' },
        { id: 'Q-2024-003', customer: 'مقاولات الرياض', date: '2024-12-15', items: 32, total: 156000, status: 'sent' },
        { id: 'Q-2024-004', customer: 'شركة الإنشاءات المتحدة', date: '2024-12-14', items: 15, total: 62000, status: 'rejected' },
        { id: 'Q-2024-005', customer: 'مؤسسة الأمل للمقاولات', date: '2024-12-13', items: 8, total: 28000, status: 'accepted' },
    ];

    // بيانات الزيارات اليومية
    const visitData = [
        { day: 'السبت', visits: 245 },
        { day: 'الأحد', visits: 312 },
        { day: 'الإثنين', visits: 428 },
        { day: 'الثلاثاء', visits: 389 },
        { day: 'الأربعاء', visits: 456 },
        { day: 'الخميس', visits: 521 },
        { day: 'الجمعة', visits: 178 },
    ];

    // إعدادات الموقع
    const [websiteSettings, setWebsiteSettings] = useState({
        siteName: COMPANY_INFO.name[language],
        tagline: COMPANY_INFO.tagline[language],
        email: COMPANY_INFO.email,
        phone: COMPANY_INFO.phone,
        address: COMPANY_INFO.location[language],
        primaryColor: '#10b981',
        secondaryColor: '#0d9488',
        logoUrl: '',
        socialLinks: {
            twitter: '',
            linkedin: '',
            instagram: ''
        }
    });

    const t = {
        dashboard: { ar: 'لوحة تحكم المدير', en: 'Owner Dashboard' },
        overview: { ar: 'نظرة عامة', en: 'Overview' },
        customers: { ar: 'العملاء', en: 'Customers' },
        quotes: { ar: 'عروض الأسعار', en: 'Quotes' },
        website: { ar: 'إدارة الموقع', en: 'Website' },
        analytics: { ar: 'التحليلات', en: 'Analytics' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        logout: { ar: 'تسجيل الخروج', en: 'Logout' },
        totalVisits: { ar: 'إجمالي الزيارات', en: 'Total Visits' },
        totalCustomers: { ar: 'إجمالي العملاء', en: 'Total Customers' },
        totalQuotes: { ar: 'عروض الأسعار', en: 'Total Quotes' },
        totalRevenue: { ar: 'الإيرادات', en: 'Revenue' },
        today: { ar: 'اليوم', en: 'Today' },
        week: { ar: 'الأسبوع', en: 'Week' },
        month: { ar: 'الشهر', en: 'Month' },
        year: { ar: 'السنة', en: 'Year' },
        sar: { ar: 'ريال', en: 'SAR' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        pending: { ar: 'معلق', en: 'Pending' },
        accepted: { ar: 'مقبول', en: 'Accepted' },
        rejected: { ar: 'مرفوض', en: 'Rejected' },
        sent: { ar: 'مُرسل', en: 'Sent' },
        save: { ar: 'حفظ', en: 'Save' },
        cancel: { ar: 'إلغاء', en: 'Cancel' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'inactive': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    const maxVisits = Math.max(...visitData.map(d => d.visits));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">{getLabel('dashboard')}</h1>
                                <p className="text-xs text-slate-400">{COMPANY_INFO.name[language]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Date Range Selector */}
                            <div className="flex gap-1 bg-slate-700/50 rounded-lg p-1">
                                {(['today', 'week', 'month', 'year'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-3 py-1 text-xs rounded-md transition-all ${dateRange === range
                                                ? 'bg-emerald-500 text-white'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {getLabel(range)}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                {getLabel('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['overview', 'customers', 'quotes', 'website', 'analytics', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab === 'overview' && <LayoutDashboard className="w-4 h-4" />}
                            {tab === 'customers' && <Users className="w-4 h-4" />}
                            {tab === 'quotes' && <FileText className="w-4 h-4" />}
                            {tab === 'website' && <Globe className="w-4 h-4" />}
                            {tab === 'analytics' && <BarChart3 className="w-4 h-4" />}
                            {tab === 'settings' && <Settings className="w-4 h-4" />}
                            {getLabel(tab)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${stats.visitsChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stats.visitsChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {Math.abs(stats.visitsChange)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stats.totalVisits.toLocaleString()}</div>
                                <div className="text-slate-400 text-sm">{getLabel('totalVisits')}</div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${stats.customersChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stats.customersChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {Math.abs(stats.customersChange)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stats.totalCustomers}</div>
                                <div className="text-slate-400 text-sm">{getLabel('totalCustomers')}</div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${stats.quotesChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stats.quotesChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {Math.abs(stats.quotesChange)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stats.totalQuotes}</div>
                                <div className="text-slate-400 text-sm">{getLabel('totalQuotes')}</div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm ${stats.revenueChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {stats.revenueChange >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                        {Math.abs(stats.revenueChange)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stats.totalRevenue.toLocaleString()} <span className="text-lg font-normal">{getLabel('sar')}</span></div>
                                <div className="text-slate-400 text-sm">{getLabel('totalRevenue')}</div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Visits Chart */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'الزيارات اليومية' : 'Daily Visits'}
                                </h3>
                                <div className="flex items-end justify-between gap-2 h-48">
                                    {visitData.map((data, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:opacity-80"
                                                style={{ height: `${(data.visits / maxVisits) * 100}%` }}
                                            ></div>
                                            <span className="text-xs text-slate-400">{data.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <UserCheck className="w-5 h-5 text-emerald-400" />
                                            <span className="text-slate-300">{language === 'ar' ? 'المستخدمين النشطين' : 'Active Users'}</span>
                                        </div>
                                        <span className="text-white font-bold">{stats.activeUsers}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <TrendingUp className="w-5 h-5 text-blue-400" />
                                            <span className="text-slate-300">{language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}</span>
                                        </div>
                                        <span className="text-white font-bold">{stats.conversionRate}%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-amber-400" />
                                            <span className="text-slate-300">{language === 'ar' ? 'متوسط قيمة العرض' : 'Avg. Quote Value'}</span>
                                        </div>
                                        <span className="text-white font-bold">{stats.avgQuoteValue.toLocaleString()} {getLabel('sar')}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <span className="text-slate-300">{language === 'ar' ? 'عروض معلقة' : 'Pending Quotes'}</span>
                                        </div>
                                        <span className="text-white font-bold">{stats.pendingQuotes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Quotes */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">{language === 'ar' ? 'آخر عروض الأسعار' : 'Recent Quotes'}</h3>
                                <button
                                    onClick={() => setActiveTab('quotes')}
                                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                                >
                                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">#</th>
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'البنود' : 'Items'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                            <th className="px-4 py-3 text-end text-sm text-slate-400">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotes.slice(0, 5).map((quote) => (
                                            <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-slate-400 font-mono text-sm">{quote.id}</td>
                                                <td className="px-4 py-3 text-white font-medium">{quote.customer}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                        {getLabel(quote.status as keyof typeof t)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end text-white font-medium">{quote.total.toLocaleString()} {getLabel('sar')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'إدارة العملاء' : 'Customer Management'}</h2>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 ps-10 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
                                    <Plus className="w-5 h-5" />
                                    {language === 'ar' ? 'إضافة عميل' : 'Add Customer'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'البريد' : 'Email'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الجوال' : 'Phone'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'العروض' : 'Quotes'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                            <th className="px-4 py-3 text-end text-sm text-slate-400">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((customer) => (
                                            <tr key={customer.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-white">{customer.name}</div>
                                                    <div className="text-xs text-slate-400">{language === 'ar' ? 'آخر زيارة:' : 'Last visit:'} {customer.lastVisit}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-400">{customer.email}</td>
                                                <td className="px-4 py-3 text-center text-slate-400" dir="ltr">{customer.phone}</td>
                                                <td className="px-4 py-3 text-center text-white font-medium">{customer.quotes}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(customer.status)}`}>
                                                        {getLabel(customer.status as keyof typeof t)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end text-emerald-400 font-medium">{customer.totalSpent.toLocaleString()} {getLabel('sar')}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-red-400 transition-colors">
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

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'عروض الأسعار' : 'Price Quotes'}</h2>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors">
                                    <Download className="w-5 h-5" />
                                    {language === 'ar' ? 'تصدير' : 'Export'}
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <div className="text-2xl font-bold text-white">{quotes.length}</div>
                                <div className="text-sm text-slate-400">{language === 'ar' ? 'إجمالي العروض' : 'Total Quotes'}</div>
                            </div>
                            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                                <div className="text-2xl font-bold text-amber-400">{quotes.filter(q => q.status === 'pending').length}</div>
                                <div className="text-sm text-slate-400">{language === 'ar' ? 'معلقة' : 'Pending'}</div>
                            </div>
                            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                                <div className="text-2xl font-bold text-emerald-400">{quotes.filter(q => q.status === 'accepted').length}</div>
                                <div className="text-sm text-slate-400">{language === 'ar' ? 'مقبولة' : 'Accepted'}</div>
                            </div>
                            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                                <div className="text-2xl font-bold text-red-400">{quotes.filter(q => q.status === 'rejected').length}</div>
                                <div className="text-sm text-slate-400">{language === 'ar' ? 'مرفوضة' : 'Rejected'}</div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">#</th>
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'البنود' : 'Items'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                            <th className="px-4 py-3 text-end text-sm text-slate-400">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quotes.map((quote) => (
                                            <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-slate-400 font-mono text-sm">{quote.id}</td>
                                                <td className="px-4 py-3 text-white font-medium">{quote.customer}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                        {getLabel(quote.status as keyof typeof t)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-end text-white font-medium">{quote.total.toLocaleString()} {getLabel('sar')}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button className="px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-sm transition-colors">
                                                        {language === 'ar' ? 'عرض' : 'View'}
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

                {/* Website Tab */}
                {activeTab === 'website' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'إدارة الموقع' : 'Website Management'}</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* General Settings */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'اسم الموقع' : 'Site Name'}
                                        </label>
                                        <input
                                            type="text"
                                            value={websiteSettings.siteName}
                                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, siteName: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'الشعار' : 'Tagline'}
                                        </label>
                                        <input
                                            type="text"
                                            value={websiteSettings.tagline}
                                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, tagline: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'معلومات التواصل' : 'Contact Info'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                        </label>
                                        <input
                                            type="email"
                                            value={websiteSettings.email}
                                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, email: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'رقم الجوال' : 'Phone'}
                                        </label>
                                        <input
                                            type="tel"
                                            value={websiteSettings.phone}
                                            onChange={(e) => setWebsiteSettings({ ...websiteSettings, phone: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'الألوان' : 'Colors'}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={websiteSettings.primaryColor}
                                                onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryColor: e.target.value })}
                                                className="w-12 h-12 rounded-lg cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={websiteSettings.primaryColor}
                                                onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryColor: e.target.value })}
                                                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 text-sm font-medium mb-2">
                                            {language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={websiteSettings.secondaryColor}
                                                onChange={(e) => setWebsiteSettings({ ...websiteSettings, secondaryColor: e.target.value })}
                                                className="w-12 h-12 rounded-lg cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={websiteSettings.secondaryColor}
                                                onChange={(e) => setWebsiteSettings({ ...websiteSettings, secondaryColor: e.target.value })}
                                                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                    {language === 'ar' ? 'العنوان' : 'Address'}
                                </h3>
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'عنوان الشركة' : 'Company Address'}
                                    </label>
                                    <textarea
                                        value={websiteSettings.address}
                                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, address: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
                                {getLabel('cancel')}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
                                <Save className="w-5 h-5" />
                                {getLabel('save')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">{language === 'ar' ? 'مصادر الزيارات' : 'Traffic Sources'}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'بحث جوجل' : 'Google Search'}</span>
                                        <span className="text-white font-bold">45%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'مباشر' : 'Direct'}</span>
                                        <span className="text-white font-bold">30%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'السوشيال ميديا' : 'Social Media'}</span>
                                        <span className="text-white font-bold">15%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'إحالات' : 'Referrals'}</span>
                                        <span className="text-white font-bold">10%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">{language === 'ar' ? 'الأجهزة' : 'Devices'}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'الجوال' : 'Mobile'}</span>
                                        <span className="text-white font-bold">62%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'الكمبيوتر' : 'Desktop'}</span>
                                        <span className="text-white font-bold">32%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">{language === 'ar' ? 'التابلت' : 'Tablet'}</span>
                                        <span className="text-white font-bold">6%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">{language === 'ar' ? 'أهم الصفحات' : 'Top Pages'}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                        <span className="text-slate-300">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
                                        <span className="text-white font-bold">4,521</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                        <span className="text-slate-300">{language === 'ar' ? 'التسعير' : 'Pricing'}</span>
                                        <span className="text-white font-bold">2,847</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                        <span className="text-slate-300">{language === 'ar' ? 'التسجيل' : 'Register'}</span>
                                        <span className="text-white font-bold">1,923</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                                        <span className="text-slate-300">{language === 'ar' ? 'عن الشركة' : 'About'}</span>
                                        <span className="text-white font-bold">1,456</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-6">
                        <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</h2>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                                </label>
                                <input
                                    type="text"
                                    defaultValue="admin"
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <input
                                    type="email"
                                    defaultValue="admin@arba-sys.com"
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                                </label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
