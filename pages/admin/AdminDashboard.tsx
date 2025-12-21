import React, { useState } from 'react';
import {
    LayoutDashboard, Users, Building2, Database, Settings, LogOut,
    TrendingUp, DollarSign, FolderOpen, Clock, Bell, Search,
    ArrowUp, ArrowDown, MoreVertical, Eye, ChevronLeft, ChevronRight,
    Package, Calculator, Truck, Star, FileText
} from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../../companyData';

interface AdminDashboardProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'operations' | 'browse' | 'users' | 'companies' | 'employees' | 'requests' | 'settings' | 'data' | 'audit'>('overview');
    const [browseSection, setBrowseSection] = useState<'materials' | 'pricing' | 'suppliers'>('materials');

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;

    // Mock data
    const stats = [
        { key: 'totalUsers', value: '1,234', change: '+12%', up: true, icon: Users, color: 'from-blue-400 to-blue-600' },
        { key: 'activeCompanies', value: '156', change: '+8%', up: true, icon: Building2, color: 'from-emerald-400 to-teal-500' },
        { key: 'totalProjects', value: '3,891', change: '+23%', up: true, icon: FolderOpen, color: 'from-purple-400 to-indigo-500' },
        { key: 'monthlyRevenue', value: '45,200', change: '-3%', up: false, icon: DollarSign, color: 'from-amber-400 to-orange-500' }
    ];

    const recentActivities = [
        { user: 'أحمد محمد', action: 'سجل حساب جديد', time: '5 دقائق', type: 'user' },
        { user: 'شركة المقاولات', action: 'أنشأ مشروع جديد', time: '15 دقيقة', type: 'project' },
        { user: 'سارة أحمد', action: 'ترقية للباقة الاحترافية', time: '1 ساعة', type: 'upgrade' },
        { user: 'محمد علي', action: 'تصدير تقرير PDF', time: '2 ساعة', type: 'export' }
    ];

    // طلبات الحسابات
    const accountRequests = [
        { id: 1, type: 'register', name: 'محمد الأحمد', email: 'mahmed@company.sa', date: '2024-12-18', status: 'pending' },
        { id: 2, type: 'register', name: 'شركة النور للمقاولات', email: 'info@alnoor.sa', date: '2024-12-17', status: 'pending' },
        { id: 3, type: 'delete', name: 'سعيد العمري', email: 'somari@gmail.com', date: '2024-12-16', status: 'pending' },
        { id: 4, type: 'recovery', name: 'فاطمة الزهراء', email: 'fatima@company.sa', date: '2024-12-15', status: 'approved' },
    ];

    // تحديثات الأسعار
    const priceUpdates = [
        { id: 1, item: 'حديد تسليح', oldPrice: 3200, newPrice: 3500, date: '2024-12-18', source: 'المصنع الوطني' },
        { id: 2, item: 'إسمنت بورتلاندي', oldPrice: 20, newPrice: 22, date: '2024-12-17', source: 'مصنع الإسمنت' },
        { id: 3, item: 'رمل ناعم', oldPrice: 80, newPrice: 85, date: '2024-12-15', source: 'السوق المحلي' },
    ];

    // الربط مع الأنظمة
    const integrations = [
        { id: 1, name: 'نظام الفوترة الإلكترونية (فاتورة)', status: 'connected', lastSync: '2024-12-18 10:30' },
        { id: 2, name: 'منصة مدد للموارد البشرية', status: 'connected', lastSync: '2024-12-18 09:15' },
        { id: 3, name: 'نظام الزكاة والدخل', status: 'pending', lastSync: null },
        { id: 4, name: 'بوابة الدفع (مدى)', status: 'connected', lastSync: '2024-12-18 11:00' },
    ];

    // بيانات الموظفين
    const employees = [
        { id: 1, name: 'أحمد محمد الشهري', role: 'مهندس تسعير', department: 'التسعير', status: 'present', clockIn: '08:00', clockOut: '-', hoursToday: 4.5, tasksCompleted: 12, rating: 4.8 },
        { id: 2, name: 'سارة أحمد العتيبي', role: 'محاسبة', department: 'المالية', status: 'present', clockIn: '07:45', clockOut: '-', hoursToday: 5, tasksCompleted: 8, rating: 4.5 },
        { id: 3, name: 'خالد محمد القحطاني', role: 'مدير مشاريع', department: 'العمليات', status: 'absent', clockIn: '-', clockOut: '-', hoursToday: 0, tasksCompleted: 0, rating: 4.2 },
        { id: 4, name: 'فاطمة علي الزهراني', role: 'مطورة', department: 'التقنية', status: 'present', clockIn: '09:00', clockOut: '-', hoursToday: 3.5, tasksCompleted: 5, rating: 4.9 },
        { id: 5, name: 'محمد سعيد الغامدي', role: 'دعم فني', department: 'الدعم', status: 'leave', clockIn: '-', clockOut: '-', hoursToday: 0, tasksCompleted: 0, rating: 4.0 },
    ];

    // سجل الحضور الأسبوعي
    const weeklyAttendance = [
        { day: 'الأحد', present: 45, absent: 3, leave: 2 },
        { day: 'الإثنين', present: 47, absent: 2, leave: 1 },
        { day: 'الثلاثاء', present: 44, absent: 4, leave: 2 },
        { day: 'الأربعاء', present: 46, absent: 2, leave: 2 },
        { day: 'الخميس', present: 43, absent: 5, leave: 2 },
    ];

    // إنجازات الموظفين
    const achievements = [
        { id: 1, employee: 'أحمد محمد', achievement: 'أنجز 50 تسعيرة في شهر', date: '2024-12-15', type: 'gold' },
        { id: 2, employee: 'سارة أحمد', achievement: 'دقة 99% في الحسابات', date: '2024-12-14', type: 'silver' },
        { id: 3, employee: 'فاطمة علي', achievement: 'إطلاق ميزة جديدة', date: '2024-12-10', type: 'gold' },
    ];

    const sidebarItems = [
        { key: 'overview', icon: LayoutDashboard, tab: 'overview' as const },
        { key: 'finance', icon: DollarSign, tab: 'finance' as const },
        { key: 'operations', icon: FolderOpen, tab: 'operations' as const },
        { key: 'browse', icon: Eye, tab: 'browse' as const },
        { key: 'users', icon: Users, tab: 'users' as const },
        { key: 'companies', icon: Building2, tab: 'companies' as const },
        { key: 'employees', icon: Clock, tab: 'employees' as const },
        { key: 'requests', icon: Bell, tab: 'requests' as const },
        { key: 'settings', icon: Settings, tab: 'settings' as const },
        { key: 'data', icon: Database, tab: 'data' as const },
        { key: 'audit', icon: FileText, tab: 'audit' as const }
    ];

    return (
        <div className={`flex h-screen bg-slate-100 ${isRtl ? '' : 'flex-row-reverse'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold">{t('admin_panel')}</h1>
                            <p className="text-xs text-slate-400">ARBA System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => (
                            <li key={item.key}>
                                <button
                                    onClick={() => setActiveTab(item.tab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.tab
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {t(`admin_${item.key}`)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {t('admin_logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                            className="w-80 pr-10 pl-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">Admin</p>
                                <p className="text-xs text-slate-400">admin@arba-sys.com</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8">
                    {/* Overview */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat) => (
                                    <div key={stat.key} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <span className={`flex items-center text-sm font-medium ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {stat.up ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                                {stat.change}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</p>
                                        <p className="text-sm text-slate-500">{t(`admin_${stat.key}`)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="font-bold text-slate-800">{t('admin_recent_activity')}</h2>
                                        <button className="text-sm text-emerald-500 hover:underline">{t('admin_view_all')}</button>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {recentActivities.map((activity, index) => (
                                            <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{activity.user}</p>
                                                        <p className="text-sm text-slate-500">{activity.action}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {activity.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h2 className="font-bold text-slate-800 mb-6">{t('admin_quick_actions')}</h2>
                                    <div className="space-y-3">
                                        <button onClick={() => setActiveTab('users')} className="w-full p-4 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors flex items-center gap-3">
                                            <Users className="w-5 h-5" />
                                            {t('admin_new_user')}
                                        </button>
                                        <button onClick={() => setActiveTab('companies')} className="w-full p-4 rounded-xl bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors flex items-center gap-3">
                                            <Building2 className="w-5 h-5" />
                                            {t('admin_new_company')}
                                        </button>
                                        <button onClick={() => setActiveTab('settings')} className="w-full p-4 rounded-xl bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors flex items-center gap-3">
                                            <Settings className="w-5 h-5" />
                                            {t('admin_settings')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Requests Section */}
                    {activeTab === 'requests' && (
                        <div className="space-y-6">
                            {/* Request Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{accountRequests.filter(r => r.type === 'register').length}</div>
                                    <div className="text-blue-100">{language === 'ar' ? 'طلبات تسجيل' : 'Registration'}</div>
                                </div>
                                <div className="bg-red-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{accountRequests.filter(r => r.type === 'delete').length}</div>
                                    <div className="text-red-100">{language === 'ar' ? 'طلبات حذف' : 'Deletion'}</div>
                                </div>
                                <div className="bg-amber-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{accountRequests.filter(r => r.type === 'recovery').length}</div>
                                    <div className="text-amber-100">{language === 'ar' ? 'طلبات استرداد' : 'Recovery'}</div>
                                </div>
                            </div>

                            {/* Requests Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'طلبات الحسابات' : 'Account Requests'}</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'النوع' : 'Type'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'البريد' : 'Email'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {accountRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${req.type === 'register' ? 'bg-blue-100 text-blue-700' : req.type === 'delete' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {req.type === 'register' ? (language === 'ar' ? 'تسجيل' : 'Register') : req.type === 'delete' ? (language === 'ar' ? 'حذف' : 'Delete') : (language === 'ar' ? 'استرداد' : 'Recovery')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">{req.name}</td>
                                                    <td className="px-6 py-4 text-slate-600" dir="ltr">{req.email}</td>
                                                    <td className="px-6 py-4 text-slate-500">{req.date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <button className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">{language === 'ar' ? 'قبول' : 'Approve'}</button>
                                                            <button className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">{language === 'ar' ? 'رفض' : 'Reject'}</button>
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

                    {/* Settings Section */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            {/* General Settings */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</label>
                                            <input type="text" defaultValue="شركة آربا المطور" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                                            <input type="email" defaultValue="info@arba-dev.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{language === 'ar' ? 'نسبة ضريبة القيمة المضافة' : 'VAT Rate'}</label>
                                            <input type="number" defaultValue="15" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">{language === 'ar' ? 'العملة الافتراضية' : 'Default Currency'}</label>
                                            <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                                <option value="SAR">{language === 'ar' ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)'}</option>
                                                <option value="USD">{language === 'ar' ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                                        {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            {/* Price Updates */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{language === 'ar' ? 'تحديثات الأسعار' : 'Price Updates'}</h3>
                                        <p className="text-sm text-slate-500">{language === 'ar' ? 'آخر تحديثات أسعار المواد' : 'Recent material price updates'}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">{language === 'ar' ? 'تحديث الأسعار' : 'Update Prices'}</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الصنف' : 'Item'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'السعر القديم' : 'Old Price'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'السعر الجديد' : 'New Price'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'التغير' : 'Change'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {priceUpdates.map((update) => (
                                                <tr key={update.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-medium">{update.item}</td>
                                                    <td className="px-6 py-4 text-slate-500 line-through" dir="ltr">{update.oldPrice} SAR</td>
                                                    <td className="px-6 py-4 text-emerald-600 font-bold" dir="ltr">{update.newPrice} SAR</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs ${update.newPrice > update.oldPrice ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`} dir="ltr">
                                                            {update.newPrice > update.oldPrice ? '+' : ''}{((update.newPrice - update.oldPrice) / update.oldPrice * 100).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{update.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* System Integrations */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'الربط مع الأنظمة' : 'System Integrations'}</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {integrations.map((int) => (
                                        <div key={int.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${int.status === 'connected' ? 'bg-emerald-100' : int.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'}`}>
                                                    <Database className={`w-6 h-6 ${int.status === 'connected' ? 'text-emerald-600' : int.status === 'pending' ? 'text-amber-600' : 'text-red-600'}`} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{int.name}</div>
                                                    <div className="text-sm text-slate-500">{int.lastSync ? (language === 'ar' ? `آخر مزامنة: ${int.lastSync}` : `Last sync: ${int.lastSync}`) : (language === 'ar' ? 'لم يتم الربط بعد' : 'Not connected yet')}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs ${int.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : int.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                    {int.status === 'connected' ? (language === 'ar' ? 'متصل' : 'Connected') : int.status === 'pending' ? (language === 'ar' ? 'قيد التفعيل' : 'Pending') : (language === 'ar' ? 'غير متصل' : 'Disconnected')}
                                                </span>
                                                <button className={`px-4 py-2 rounded-lg text-sm font-medium ${int.status === 'connected' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                                                    {int.status === 'connected' ? (language === 'ar' ? 'مزامنة' : 'Sync') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Backup */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'النسخ الاحتياطي' : 'Backup & Restore'}</h3>
                                </div>
                                <div className="p-6 grid md:grid-cols-2 gap-4">
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                                        <Database className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                                        <h4 className="font-bold text-slate-800 mb-1">{language === 'ar' ? 'إنشاء نسخة احتياطية' : 'Create Backup'}</h4>
                                        <p className="text-sm text-slate-500 mb-4">{language === 'ar' ? 'آخر نسخة: 2024-12-17' : 'Last backup: 2024-12-17'}</p>
                                        <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">{language === 'ar' ? 'نسخ الآن' : 'Backup Now'}</button>
                                    </div>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                        <ArrowDown className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                                        <h4 className="font-bold text-slate-800 mb-1">{language === 'ar' ? 'استعادة نسخة' : 'Restore Backup'}</h4>
                                        <p className="text-sm text-slate-500 mb-4">{language === 'ar' ? 'استعادة البيانات' : 'Restore data'}</p>
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{language === 'ar' ? 'استعادة' : 'Restore'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Employees Tracking Section */}
                    {activeTab === 'employees' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-emerald-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{employees.filter(e => e.status === 'present').length}</div>
                                    <div className="text-emerald-100">{language === 'ar' ? 'حاضر' : 'Present'}</div>
                                </div>
                                <div className="bg-red-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{employees.filter(e => e.status === 'absent').length}</div>
                                    <div className="text-red-100">{language === 'ar' ? 'غائب' : 'Absent'}</div>
                                </div>
                                <div className="bg-amber-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{employees.filter(e => e.status === 'leave').length}</div>
                                    <div className="text-amber-100">{language === 'ar' ? 'إجازة' : 'On Leave'}</div>
                                </div>
                                <div className="bg-blue-500 text-white rounded-2xl p-6">
                                    <div className="text-3xl font-bold">{employees.reduce((sum, e) => sum + e.hoursToday, 0).toFixed(1)}</div>
                                    <div className="text-blue-100">{language === 'ar' ? 'ساعات اليوم' : 'Hours Today'}</div>
                                </div>
                            </div>

                            {/* Employees Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">{language === 'ar' ? 'سجل حضور الموظفين' : 'Employee Attendance'}</h3>
                                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                                        {language === 'ar' ? 'تصدير التقرير' : 'Export Report'}
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الموظف' : 'Employee'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'القسم' : 'Department'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'دخول' : 'Clock In'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'خروج' : 'Clock Out'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'الساعات' : 'Hours'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'المهام' : 'Tasks'}</th>
                                                <th className="text-start px-6 py-3 text-slate-600 text-sm">{language === 'ar' ? 'التقييم' : 'Rating'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {employees.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{emp.name}</div>
                                                                <div className="text-sm text-slate-500">{emp.role}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'present' ? 'bg-emerald-100 text-emerald-700' : emp.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {emp.status === 'present' ? (language === 'ar' ? 'حاضر' : 'Present') : emp.status === 'absent' ? (language === 'ar' ? 'غائب' : 'Absent') : (language === 'ar' ? 'إجازة' : 'Leave')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600" dir="ltr">{emp.clockIn}</td>
                                                    <td className="px-6 py-4 text-slate-600" dir="ltr">{emp.clockOut}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-blue-600" dir="ltr">{emp.hoursToday}h</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{emp.tasksCompleted}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                            <span className="font-medium">{emp.rating}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Weekly Attendance Chart */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-800">{language === 'ar' ? 'الحضور الأسبوعي' : 'Weekly Attendance'}</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {weeklyAttendance.map((day, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-20 text-sm font-medium text-slate-600">{day.day}</div>
                                                    <div className="flex-1 flex gap-1 h-6">
                                                        <div className="bg-emerald-500 rounded-s" style={{ width: `${(day.present / 50) * 100}%` }}></div>
                                                        <div className="bg-red-500" style={{ width: `${(day.absent / 50) * 100}%` }}></div>
                                                        <div className="bg-amber-500 rounded-e" style={{ width: `${(day.leave / 50) * 100}%` }}></div>
                                                    </div>
                                                    <div className="text-sm text-slate-500 w-20 text-end">{day.present}/{day.present + day.absent + day.leave}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-4 justify-center text-sm">
                                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> {language === 'ar' ? 'حاضر' : 'Present'}</span>
                                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> {language === 'ar' ? 'غائب' : 'Absent'}</span>
                                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded"></span> {language === 'ar' ? 'إجازة' : 'Leave'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <div className="p-6 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-800">{language === 'ar' ? 'إنجازات الموظفين' : 'Employee Achievements'}</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {achievements.map((ach) => (
                                            <div key={ach.id} className="p-4 flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${ach.type === 'gold' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                                    <Star className={`w-6 h-6 ${ach.type === 'gold' ? 'text-amber-500 fill-amber-500' : 'text-slate-400 fill-slate-400'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-800">{ach.employee}</div>
                                                    <div className="text-sm text-slate-500">{ach.achievement}</div>
                                                </div>
                                                <div className="text-xs text-slate-400">{ach.date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Other tabs placeholder */}
                    {(activeTab === 'finance' || activeTab === 'operations' || activeTab === 'browse' || activeTab === 'users' || activeTab === 'companies' || activeTab === 'data' || activeTab === 'audit') && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">{t(`admin_${activeTab}`)}</h2>
                            <p className="text-slate-500">{language === 'ar' ? 'قريباً - جاري التطوير' : 'Coming Soon - Under Development'}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
