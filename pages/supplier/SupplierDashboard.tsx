import React, { useState } from 'react';
import {
    Truck,
    Package,
    DollarSign,
    BarChart3,
    Bell,
    Settings,
    Plus,
    Edit3,
    Trash2,
    Eye,
    Search,
    Filter,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Users,
    ShoppingCart
} from 'lucide-react';
import { COMPANY_INFO } from '../../companyData';

interface SupplierDashboardProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

interface Product {
    id: string;
    name: { ar: string; en: string };
    category: string;
    price: number;
    unit: string;
    stock: number;
    status: 'active' | 'inactive';
}

interface QuoteRequest {
    id: string;
    customerName: string;
    date: string;
    items: number;
    status: 'pending' | 'responded' | 'accepted' | 'rejected';
    total: number;
}

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ language, onNavigate, onLogout }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;
    const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'quotes' | 'settings'>('overview');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Product Categories
    const productCategories = [
        { id: 'structure', icon: '🏗️', name: { ar: 'الهيكل الإنشائي', en: 'Structure' }, count: 12, color: 'from-blue-500 to-blue-600' },
        { id: 'concrete', icon: '🧱', name: { ar: 'الخرسانة والأسمنت', en: 'Concrete & Cement' }, count: 8, color: 'from-gray-500 to-gray-600' },
        { id: 'steel', icon: '🔩', name: { ar: 'الحديد والصلب', en: 'Steel & Iron' }, count: 15, color: 'from-slate-500 to-slate-600' },
        { id: 'wood', icon: '🪵', name: { ar: 'الأخشاب', en: 'Wood & Timber' }, count: 10, color: 'from-amber-600 to-amber-700' },
        { id: 'electrical', icon: '⚡', name: { ar: 'الكهرباء', en: 'Electrical' }, count: 25, color: 'from-yellow-500 to-yellow-600' },
        { id: 'plumbing', icon: '🚿', name: { ar: 'السباكة', en: 'Plumbing' }, count: 18, color: 'from-cyan-500 to-cyan-600' },
        { id: 'hvac', icon: '❄️', name: { ar: 'التكييف والتبريد', en: 'HVAC' }, count: 14, color: 'from-sky-500 to-sky-600' },
        { id: 'tiles', icon: '🔲', name: { ar: 'البلاط والسيراميك', en: 'Tiles & Ceramics' }, count: 22, color: 'from-indigo-500 to-indigo-600' },
        { id: 'paint', icon: '🎨', name: { ar: 'الدهانات', en: 'Paints & Coatings' }, count: 16, color: 'from-purple-500 to-purple-600' },
        { id: 'insulation', icon: '🧊', name: { ar: 'العزل', en: 'Insulation' }, count: 9, color: 'from-teal-500 to-teal-600' },
        { id: 'doors', icon: '🚪', name: { ar: 'الأبواب والنوافذ', en: 'Doors & Windows' }, count: 20, color: 'from-orange-500 to-orange-600' },
        { id: 'lighting', icon: '💡', name: { ar: 'الإضاءة', en: 'Lighting' }, count: 30, color: 'from-amber-400 to-amber-500' },
        { id: 'flooring', icon: '🪨', name: { ar: 'الأرضيات', en: 'Flooring' }, count: 11, color: 'from-stone-500 to-stone-600' },
        { id: 'kitchen', icon: '🍳', name: { ar: 'المطابخ', en: 'Kitchen' }, count: 18, color: 'from-red-500 to-red-600' },
        { id: 'bathroom', icon: '🛁', name: { ar: 'الحمامات', en: 'Bathroom' }, count: 24, color: 'from-blue-400 to-blue-500' },
        { id: 'glass', icon: '🪟', name: { ar: 'الزجاج', en: 'Glass' }, count: 7, color: 'from-cyan-400 to-cyan-500' },
        { id: 'safety', icon: '🦺', name: { ar: 'السلامة', en: 'Safety Equipment' }, count: 13, color: 'from-green-500 to-green-600' },
        { id: 'tools', icon: '🔧', name: { ar: 'الأدوات', en: 'Tools & Equipment' }, count: 35, color: 'from-zinc-500 to-zinc-600' },
        { id: 'landscaping', icon: '🌳', name: { ar: 'تنسيق الحدائق', en: 'Landscaping' }, count: 8, color: 'from-emerald-500 to-emerald-600' },
        { id: 'waterproofing', icon: '💧', name: { ar: 'العزل المائي', en: 'Waterproofing' }, count: 6, color: 'from-blue-600 to-blue-700' },
    ];

    // Sample data
    const stats = {
        totalProducts: 45,
        activeProducts: 38,
        pendingQuotes: 12,
        monthlyViews: 1250,
        monthlyOrders: 28,
        revenue: 45600
    };

    const products: Product[] = [
        { id: '1', name: { ar: 'حديد تسليح 12مم', en: 'Rebar 12mm' }, category: 'structure', price: 3200, unit: 'طن', stock: 150, status: 'active' },
        { id: '2', name: { ar: 'اسمنت بورتلاندي', en: 'Portland Cement' }, category: 'structure', price: 18, unit: 'كيس', stock: 5000, status: 'active' },
        { id: '3', name: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tiles 60x60' }, category: 'finishing', price: 45, unit: 'م²', stock: 800, status: 'active' },
        { id: '4', name: { ar: 'دهان زيتي أبيض', en: 'White Oil Paint' }, category: 'finishing', price: 85, unit: 'جالون', stock: 0, status: 'inactive' },
    ];

    const quoteRequests: QuoteRequest[] = [
        { id: 'Q001', customerName: 'شركة البناء الحديث', date: '2024-12-15', items: 5, status: 'pending', total: 25000 },
        { id: 'Q002', customerName: 'مؤسسة التعمير', date: '2024-12-14', items: 3, status: 'responded', total: 18500 },
        { id: 'Q003', customerName: 'مقاولات الرياض', date: '2024-12-13', items: 8, status: 'accepted', total: 42000 },
        { id: 'Q004', customerName: 'شركة الإنشاءات المتحدة', date: '2024-12-12', items: 2, status: 'rejected', total: 8000 },
    ];

    const t = {
        dashboard: { ar: 'لوحة تحكم المورد', en: 'Supplier Dashboard' },
        overview: { ar: 'نظرة عامة', en: 'Overview' },
        categories: { ar: 'أنواع المنتجات', en: 'Product Categories' },
        products: { ar: 'المنتجات', en: 'Products' },
        quotes: { ar: 'طلبات التسعير', en: 'Quote Requests' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        totalProducts: { ar: 'إجمالي المنتجات', en: 'Total Products' },
        activeProducts: { ar: 'المنتجات النشطة', en: 'Active Products' },
        pendingQuotes: { ar: 'طلبات معلقة', en: 'Pending Quotes' },
        monthlyViews: { ar: 'المشاهدات الشهرية', en: 'Monthly Views' },
        monthlyOrders: { ar: 'الطلبات الشهرية', en: 'Monthly Orders' },
        revenue: { ar: 'الإيرادات', en: 'Revenue' },
        addProduct: { ar: 'إضافة منتج', en: 'Add Product' },
        productName: { ar: 'اسم المنتج', en: 'Product Name' },
        category: { ar: 'التصنيف', en: 'Category' },
        price: { ar: 'السعر', en: 'Price' },
        unit: { ar: 'الوحدة', en: 'Unit' },
        stock: { ar: 'المخزون', en: 'Stock' },
        status: { ar: 'الحالة', en: 'Status' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        pending: { ar: 'معلق', en: 'Pending' },
        responded: { ar: 'تم الرد', en: 'Responded' },
        accepted: { ar: 'مقبول', en: 'Accepted' },
        rejected: { ar: 'مرفوض', en: 'Rejected' },
        customer: { ar: 'العميل', en: 'Customer' },
        date: { ar: 'التاريخ', en: 'Date' },
        items: { ar: 'البنود', en: 'Items' },
        total: { ar: 'الإجمالي', en: 'Total' },
        sar: { ar: 'ريال', en: 'SAR' },
        logout: { ar: 'تسجيل الخروج', en: 'Logout' },
        backHome: { ar: 'العودة للرئيسية', en: 'Back to Home' },
        freeAccount: { ar: 'حساب مجاني', en: 'Free Account' },
        noFees: { ar: 'بدون رسوم اشتراك', en: 'No subscription fees' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    const getStatusIcon = (status: QuoteRequest['status']) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-amber-400" />;
            case 'responded': return <CheckCircle className="w-4 h-4 text-blue-400" />;
            case 'accepted': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
        }
    };

    const getStatusColor = (status: QuoteRequest['status']) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'responded': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onNavigate('landing')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Arrow className="w-5 h-5" />
                                <span className="hidden sm:inline">{getLabel('backHome')}</span>
                            </button>
                            <div className="h-6 w-px bg-slate-600"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">{getLabel('dashboard')}</h1>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                                            {getLabel('freeAccount')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 end-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors text-sm"
                            >
                                {getLabel('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {(['overview', 'categories', 'products', 'quotes', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {getLabel(tab)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Package className="w-5 h-5 text-blue-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('totalProducts')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('activeProducts')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.activeProducts}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5 text-amber-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('pendingQuotes')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.pendingQuotes}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <Eye className="w-5 h-5 text-purple-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('monthlyViews')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.monthlyViews.toLocaleString()}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <ShoppingCart className="w-5 h-5 text-teal-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('monthlyOrders')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.monthlyOrders}</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <DollarSign className="w-5 h-5 text-green-400" />
                                    <span className="text-slate-400 text-sm">{getLabel('revenue')}</span>
                                </div>
                                <div className="text-2xl font-bold text-white">{stats.revenue.toLocaleString()} <span className="text-sm font-normal">{getLabel('sar')}</span></div>
                            </div>
                        </div>

                        {/* Recent Quote Requests */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">{getLabel('quotes')}</h3>
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
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('customer')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('date')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('items')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-end text-sm text-slate-400">{getLabel('total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quoteRequests.slice(0, 3).map((quote) => (
                                            <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white">{quote.customerName}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                        {getStatusIcon(quote.status)}
                                                        {getLabel(quote.status)}
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

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {language === 'ar' ? 'أنواع المنتجات' : 'Product Categories'}
                            </h2>
                            <div className="text-slate-400">
                                {language === 'ar'
                                    ? `${productCategories.length} تصنيف • ${productCategories.reduce((sum, c) => sum + c.count, 0)} منتج`
                                    : `${productCategories.length} categories • ${productCategories.reduce((sum, c) => sum + c.count, 0)} products`
                                }
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {productCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setActiveTab('products');
                                    }}
                                    className={`group relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105 hover:shadow-xl`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>
                                    <div className="text-4xl mb-3">{category.icon}</div>
                                    <div className="font-bold text-white mb-1">{category.name[language]}</div>
                                    <div className="text-sm text-slate-400">
                                        {category.count} {language === 'ar' ? 'منتج' : 'products'}
                                    </div>
                                    <div className={`absolute top-3 end-3 w-2 h-2 rounded-full bg-gradient-to-br ${category.color}`}></div>
                                </button>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">
                                {language === 'ar' ? 'ملخص التصنيفات' : 'Categories Summary'}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-white">{productCategories.length}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'تصنيف' : 'Categories'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-emerald-400">{productCategories.reduce((sum, c) => sum + c.count, 0)}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-blue-400">{Math.max(...productCategories.map(c => c.count))}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'أكبر تصنيف' : 'Largest Category'}</div>
                                </div>
                                <div className="bg-slate-700/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-amber-400">{Math.round(productCategories.reduce((sum, c) => sum + c.count, 0) / productCategories.length)}</div>
                                    <div className="text-sm text-slate-400">{language === 'ar' ? 'متوسط المنتجات' : 'Avg. Products'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder={language === 'ar' ? 'بحث عن منتج...' : 'Search products...'}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl py-2 ps-10 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
                                    />
                                </div>
                                <button className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors">
                                <Plus className="w-5 h-5" />
                                {getLabel('addProduct')}
                            </button>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-700/30">
                                            <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('productName')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('category')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('price')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('stock')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                            <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                                <td className="px-4 py-3 text-white font-medium">{product.name[language]}</td>
                                                <td className="px-4 py-3 text-center text-slate-400">{product.category}</td>
                                                <td className="px-4 py-3 text-center text-white">{product.price} / {product.unit}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={product.stock > 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {getLabel(product.status)}
                                                    </span>
                                                </td>
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
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-700/30">
                                        <th className="px-4 py-3 text-start text-sm text-slate-400">#</th>
                                        <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('customer')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('date')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('items')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                        <th className="px-4 py-3 text-end text-sm text-slate-400">{getLabel('total')}</th>
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quoteRequests.map((quote) => (
                                        <tr key={quote.id} className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                            <td className="px-4 py-3 text-slate-400">{quote.id}</td>
                                            <td className="px-4 py-3 text-white font-medium">{quote.customerName}</td>
                                            <td className="px-4 py-3 text-center text-slate-400">{quote.date}</td>
                                            <td className="px-4 py-3 text-center text-slate-400">{quote.items}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(quote.status)}`}>
                                                    {getStatusIcon(quote.status)}
                                                    {getLabel(quote.status)}
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
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-400" />
                                {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'اسم المنشأة' : 'Business Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue={language === 'ar' ? 'شركة التوريدات المتحدة' : 'United Supplies Co.'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue="supplier@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'رقم الجوال' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500"
                                        defaultValue="+966501234567"
                                    />
                                </div>
                                <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors">
                                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierDashboard;
