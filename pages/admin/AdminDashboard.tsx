import React, { useState } from 'react';
import {
    LayoutDashboard, Users, Building2, Database, Settings, LogOut,
    TrendingUp, DollarSign, FolderOpen, Clock, Bell, Search,
    ArrowUp, ArrowDown, MoreVertical, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'companies' | 'data'>('overview');

    const t = {
        adminPanel: { ar: 'لوحة التحكم', en: 'Admin Panel' },
        overview: { ar: 'نظرة عامة', en: 'Overview' },
        users: { ar: 'المستخدمين', en: 'Users' },
        companies: { ar: 'الشركات', en: 'Companies' },
        data: { ar: 'البيانات', en: 'Data' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        logout: { ar: 'خروج', en: 'Logout' },
        totalUsers: { ar: 'إجمالي المستخدمين', en: 'Total Users' },
        activeCompanies: { ar: 'الشركات النشطة', en: 'Active Companies' },
        totalProjects: { ar: 'المشاريع', en: 'Projects' },
        monthlyRevenue: { ar: 'الإيرادات الشهرية', en: 'Monthly Revenue' },
        recentActivity: { ar: 'النشاط الأخير', en: 'Recent Activity' },
        quickActions: { ar: 'إجراءات سريعة', en: 'Quick Actions' },
        viewAll: { ar: 'عرض الكل', en: 'View All' },
        search: { ar: 'بحث...', en: 'Search...' },
        newUser: { ar: 'مستخدم جديد', en: 'New User' },
        newCompany: { ar: 'شركة جديدة', en: 'New Company' },
        exportData: { ar: 'تصدير البيانات', en: 'Export Data' },
        notifications: { ar: 'الإشعارات', en: 'Notifications' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

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

    const sidebarItems = [
        { key: 'overview', icon: LayoutDashboard, tab: 'overview' as const },
        { key: 'users', icon: Users, tab: 'users' as const },
        { key: 'companies', icon: Building2, tab: 'companies' as const },
        { key: 'data', icon: Database, tab: 'data' as const }
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
                            <h1 className="font-bold">{getLabel('adminPanel')}</h1>
                            <p className="text-xs text-slate-400">ARBA System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
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
                                    {getLabel(item.key as keyof typeof t)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-700 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                        {getLabel('settings')}
                    </button>
                    <button
                        onClick={() => onNavigate('landing')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        {getLabel('logout')}
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
                            placeholder={getLabel('search')}
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
                                <p className="text-sm text-slate-500">{getLabel(stat.key as keyof typeof t)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activity */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="font-bold text-slate-800">{getLabel('recentActivity')}</h2>
                                <button className="text-sm text-emerald-500 hover:underline">{getLabel('viewAll')}</button>
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
                                            <button className="p-1 hover:bg-slate-100 rounded">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="font-bold text-slate-800 mb-6">{getLabel('quickActions')}</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className="w-full p-4 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors flex items-center gap-3"
                                >
                                    <Users className="w-5 h-5" />
                                    {getLabel('newUser')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('companies')}
                                    className="w-full p-4 rounded-xl bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors flex items-center gap-3"
                                >
                                    <Building2 className="w-5 h-5" />
                                    {getLabel('newCompany')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('data')}
                                    className="w-full p-4 rounded-xl bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors flex items-center gap-3"
                                >
                                    <Database className="w-5 h-5" />
                                    {getLabel('exportData')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
