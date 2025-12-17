import React, { useState } from 'react';
import {
    Database, Search, Download, RefreshCw, BarChart3, PieChart, TrendingUp,
    Calendar, Filter, FileSpreadsheet, FileText, Clock, HardDrive,
    Users, Building2, FolderOpen, DollarSign, ArrowUp, ArrowDown
} from 'lucide-react';

interface DataPageProps {
    language: 'ar' | 'en';
}

const DataPage: React.FC<DataPageProps> = ({ language }) => {
    const isRtl = language === 'ar';
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
    const [isExporting, setIsExporting] = useState(false);

    const t = {
        title: { ar: 'البيانات والإحصائيات', en: 'Data & Statistics' },
        overview: { ar: 'نظرة عامة', en: 'Overview' },
        exportData: { ar: 'تصدير البيانات', en: 'Export Data' },
        refresh: { ar: 'تحديث', en: 'Refresh' },
        lastUpdated: { ar: 'آخر تحديث', en: 'Last Updated' },
        week: { ar: 'أسبوع', en: 'Week' },
        month: { ar: 'شهر', en: 'Month' },
        year: { ar: 'سنة', en: 'Year' },
        totalUsers: { ar: 'إجمالي المستخدمين', en: 'Total Users' },
        totalCompanies: { ar: 'إجمالي الشركات', en: 'Total Companies' },
        totalProjects: { ar: 'إجمالي المشاريع', en: 'Total Projects' },
        totalRevenue: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
        storageUsed: { ar: 'التخزين المستخدم', en: 'Storage Used' },
        activeSubscriptions: { ar: 'الاشتراكات النشطة', en: 'Active Subscriptions' },
        exportExcel: { ar: 'تصدير Excel', en: 'Export Excel' },
        exportPDF: { ar: 'تصدير PDF', en: 'Export PDF' },
        exportCSV: { ar: 'تصدير CSV', en: 'Export CSV' },
        usageStats: { ar: 'إحصائيات الاستخدام', en: 'Usage Statistics' },
        subscriptionBreakdown: { ar: 'توزيع الاشتراكات', en: 'Subscription Breakdown' },
        monthlyGrowth: { ar: 'النمو الشهري', en: 'Monthly Growth' },
        exporting: { ar: 'جاري التصدير...', en: 'Exporting...' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    // Mock statistics
    const stats = [
        { key: 'totalUsers', value: '1,234', change: '+12%', up: true, icon: Users, color: 'from-blue-400 to-blue-600' },
        { key: 'totalCompanies', value: '156', change: '+8%', up: true, icon: Building2, color: 'from-emerald-400 to-teal-500' },
        { key: 'totalProjects', value: '3,891', change: '+23%', up: true, icon: FolderOpen, color: 'from-purple-400 to-indigo-500' },
        { key: 'totalRevenue', value: '245,000', change: '+15%', up: true, icon: DollarSign, color: 'from-amber-400 to-orange-500' },
        { key: 'storageUsed', value: '1.2 TB', change: '+5%', up: true, icon: HardDrive, color: 'from-pink-400 to-rose-500' },
        { key: 'activeSubscriptions', value: '89', change: '-2%', up: false, icon: RefreshCw, color: 'from-cyan-400 to-sky-500' }
    ];

    const subscriptionData = [
        { plan: 'Free', count: 850, percentage: 69, color: 'bg-slate-400' },
        { plan: 'Professional', count: 320, percentage: 26, color: 'bg-emerald-500' },
        { plan: 'Enterprise', count: 64, percentage: 5, color: 'bg-purple-500' }
    ];

    const monthlyData = [
        { month: 'يناير', users: 45, projects: 120, revenue: 15000 },
        { month: 'فبراير', users: 62, projects: 145, revenue: 18500 },
        { month: 'مارس', users: 78, projects: 180, revenue: 22000 },
        { month: 'أبريل', users: 95, projects: 210, revenue: 28000 },
        { month: 'مايو', users: 112, projects: 250, revenue: 32000 },
        { month: 'يونيو', users: 134, projects: 290, revenue: 38000 }
    ];

    const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
        setIsExporting(true);
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsExporting(false);
        // In real app, trigger file download
    };

    return (
        <div className="p-8" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Database className="w-7 h-7 text-emerald-500" />
                        {getLabel('title')}
                    </h1>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {getLabel('lastUpdated')}: {new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        {(['week', 'month', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === range
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                {getLabel(range)}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                        {getLabel('refresh')}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.key} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate-500">{getLabel(stat.key as keyof typeof t)}</p>
                            <span className={`flex items-center text-xs font-medium ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Subscription Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-500" />
                        {getLabel('subscriptionBreakdown')}
                    </h2>
                    <div className="space-y-4">
                        {subscriptionData.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-600">{item.plan}</span>
                                    <span className="text-sm font-medium text-slate-800">{item.count} ({item.percentage}%)</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Growth Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        {getLabel('monthlyGrowth')}
                    </h2>
                    <div className="flex items-end justify-between h-48 gap-4">
                        {monthlyData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="flex-1 w-full flex flex-col justify-end gap-1">
                                    <div
                                        className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg"
                                        style={{ height: `${(data.users / 150) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 mt-2">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-500" />
                    {getLabel('exportData')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                        <FileSpreadsheet className="w-6 h-6" />
                        <span className="font-medium">{isExporting ? getLabel('exporting') : getLabel('exportExcel')}</span>
                    </button>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        <FileText className="w-6 h-6" />
                        <span className="font-medium">{isExporting ? getLabel('exporting') : getLabel('exportPDF')}</span>
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        <Database className="w-6 h-6" />
                        <span className="font-medium">{isExporting ? getLabel('exporting') : getLabel('exportCSV')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataPage;
